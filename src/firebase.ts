import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PenId, InkColor } from './game/penAssets';
import { ArenaLayoutId } from './game/rules';
import { PlayMode, PlayerRecord } from './components/PenFightMenu';
import {
  DEFAULT_PRODUCT_TELEMETRY,
  FINISH_ORDER,
  FinishId,
  INITIAL_DEMO_ORDERS,
  OrderStatus,
  PRODUCT_CATALOG,
  ProductLiveTelemetry,
  TrackedOrder,
  getNextOrderStatus,
  getOrderStatusMeta,
  sanitizeOrderFields,
} from './store/catalog';

// Silence internal @firebase/firestore connection retry noise when operating in offline/fallback mode
setLogLevel('silent');

// Initialize Firebase SDK using provisioned configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let isCloudTokenServiceAvailable = true;

export function isCloudTokenServiceReady(): boolean {
  return isCloudTokenServiceAvailable;
}

export function isOfflineOrAuthTokenError(error: unknown): boolean {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';
  const combined = `${raw} ${code}`.toLowerCase();
  return (
    combined.includes('the client is offline') ||
    combined.includes('client is offline') ||
    combined.includes('unavailable') ||
    combined.includes('fetching auth token failed') ||
    combined.includes('token-service-api-has-not-been-used') ||
    combined.includes('securetoken.googleapis.com') ||
    combined.includes('network-request-failed') ||
    combined.includes('failed to get document because the client is offline')
  );
}

export async function verifyAuthTokenReady(user: User | null): Promise<boolean> {
  if (!user) {
    return true;
  }
  try {
    await user.getIdToken(false);
    isCloudTokenServiceAvailable = true;
    return true;
  } catch (error) {
    if (isOfflineOrAuthTokenError(error)) {
      isCloudTokenServiceAvailable = false;
      return false;
    }
    return false;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  if (isOfflineOrAuthTokenError(error)) {
    isCloudTokenServiceAvailable = false;
    throw new Error('FIRESTORE_OFFLINE_FALLBACK');
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }
    if (auth.currentUser) {
      const tokenOk = await verifyAuthTokenReady(auth.currentUser);
      if (!tokenOk) {
        return;
      }
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (isOfflineOrAuthTokenError(error)) {
      isCloudTokenServiceAvailable = false;
      return;
    }
    if (
      error instanceof Error &&
      error.message.includes('the client is offline') &&
      !firebaseConfig?.projectId
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface CloudPlayerProfile {
  uid: string;
  callsign: string;
  avatarColor: string;
  favoritePen: PenId;
  favoriteInk: InkColor;
  played: number;
  won: number;
  lost: number;
  draws: number;
  streak: number;
  bestStreak: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CloudMatchLog {
  id: string;
  uid: string;
  playerPen: PenId;
  opponentPen: PenId;
  mode: PlayMode;
  arenaLayout: ArenaLayoutId;
  outcome: 'win' | 'loss' | 'draw';
  shots: number;
  createdAt?: Timestamp;
}

export interface CloudClientProfile {
  uid: string;
  displayName: string;
  preferredFinish: FinishId;
  wishlistIds: string[];
  orderCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CloudAtelierOrderDoc {
  uid: string;
  orderNumber: string;
  status: OrderStatus;
  recipientName: string;
  destinationCity: string;
  postalCode: string;
  trackingCode: string;
  courier: string;
  estimatedDelivery: string;
  primaryProductId: string;
  primaryFinish: FinishId;
  itemsSummary: string;
  itemCount: number;
  total: number;
  paymentMethod: 'card' | 'cod';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const AVATAR_COLORS = [
  '#e5a93c',
  '#38bdf8',
  '#34d399',
  '#f472b6',
  '#a78bfa',
  '#fb923c',
];

function sanitizeCallsign(raw: string | null | undefined): string {
  const cleaned = (raw || 'Draftsman')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 28);
  return cleaned.length >= 1 ? cleaned : 'Draftsman';
}

function sanitizeDisplayName(raw: string | null | undefined): string {
  const cleaned = (raw || 'Atelier Member')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 60);
  return cleaned.length >= 1 ? cleaned : 'Atelier Member';
}

function sanitizeWishlist(ids: string[]): string[] {
  const validSet = new Set(PRODUCT_CATALOG.map((p) => p.id));
  const filtered = ids.filter((id) => typeof id === 'string' && validSet.has(id));
  return Array.from(new Set(filtered)).slice(0, 10);
}

function formatTimestampLabel(ts?: Timestamp): string {
  if (!ts || typeof ts.toDate !== 'function') {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return ts.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Local storage cache helpers for resilient persistence when offline or while Token Service API propagates
const LOCAL_DOSSIER_PREFIX = 'barakah_client_dossier_v2_';
const LOCAL_ORDERS_PREFIX = 'barakah_client_orders_v2_';
const LOCAL_TELEMETRY_KEY = 'barakah_catalog_telemetry_v2';

function readLocalDossier(uid: string): CloudClientProfile | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_DOSSIER_PREFIX}${uid}`);
    if (!raw) return null;
    return JSON.parse(raw) as CloudClientProfile;
  } catch {
    return null;
  }
}

function writeLocalDossier(uid: string, profile: CloudClientProfile): void {
  try {
    localStorage.setItem(`${LOCAL_DOSSIER_PREFIX}${uid}`, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

function readLocalOrders(uid: string): TrackedOrder[] | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_ORDERS_PREFIX}${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as TrackedOrder[]) : null;
  } catch {
    return null;
  }
}

function writeLocalOrders(uid: string, orders: TrackedOrder[]): void {
  try {
    localStorage.setItem(`${LOCAL_ORDERS_PREFIX}${uid}`, JSON.stringify(orders));
  } catch {
    // Ignore storage quota errors
  }
}

function buildSeededLocalOrders(uid: string, displayName?: string | null): TrackedOrder[] {
  const existing = readLocalOrders(uid);
  if (existing && existing.length > 0) {
    return existing;
  }
  const seeded: TrackedOrder[] = INITIAL_DEMO_ORDERS.map((sample, idx) => ({
    ...sample,
    id: `ord_${uid.slice(0, 6)}_${idx + 1}`,
    uid,
    recipientName: sanitizeDisplayName(displayName || sample.recipientName),
    source: 'firestore',
  }));
  writeLocalOrders(uid, seeded);
  return seeded;
}

function mapDocToTrackedOrder(docId: string, data: CloudAtelierOrderDoc): TrackedOrder {
  const createdMs = data.createdAt?.toMillis?.() ?? Date.now();
  return {
    id: docId,
    uid: data.uid,
    orderNumber: data.orderNumber,
    status: data.status,
    recipientName: data.recipientName,
    destinationCity: data.destinationCity,
    postalCode: data.postalCode,
    trackingCode: data.trackingCode,
    courier: data.courier,
    estimatedDelivery: data.estimatedDelivery,
    primaryProductId: data.primaryProductId,
    primaryFinish: data.primaryFinish,
    itemsSummary: data.itemsSummary,
    itemCount: data.itemCount,
    total: data.total,
    paymentMethod: data.paymentMethod,
    createdAtLabel: formatTimestampLabel(data.createdAt),
    updatedAtLabel: formatTimestampLabel(data.updatedAt),
    createdAtMs: createdMs,
    source: 'firestore',
  };
}

export async function signInWithGoogle(): Promise<User | null> {
  const cred = await signInWithPopup(auth, googleProvider);
  await verifyAuthTokenReady(cred.user);
  return cred.user;
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };

// ============================================================================
// BARAKAH SUNNAH FOODS: CLIENT DOSSIER, ORDER TRACKING & DYNAMIC TELEMETRY
// ============================================================================

export async function fetchOrCreateClientDossier(
  user: User,
  preferredFinish: FinishId = 'brass',
  initialWishlist: string[] = ['food-ajwa-01', 'food-honey-02']
): Promise<CloudClientProfile> {
  const safeProfile: CloudClientProfile = readLocalDossier(user.uid) ?? {
    uid: user.uid,
    displayName: sanitizeDisplayName(
      user.displayName || user.email?.split('@')[0] || 'রাফসান জানি (Rafsan Jani)'
    ),
    preferredFinish: FINISH_ORDER.includes(preferredFinish)
      ? preferredFinish
      : 'brass',
    wishlistIds: sanitizeWishlist(initialWishlist),
    orderCount: INITIAL_DEMO_ORDERS.length,
  };

  const tokenOk = await verifyAuthTokenReady(user);
  if (!tokenOk || !isCloudTokenServiceAvailable) {
    writeLocalDossier(user.uid, safeProfile);
    return safeProfile;
  }

  const path = `clients/${user.uid}`;
  const ref = doc(db, 'clients', user.uid);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as CloudClientProfile;
      writeLocalDossier(user.uid, data);
      return data;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      writeLocalDossier(user.uid, safeProfile);
      return safeProfile;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }

  try {
    await setDoc(ref, {
      ...safeProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    writeLocalDossier(user.uid, safeProfile);
    return safeProfile;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      writeLocalDossier(user.uid, safeProfile);
      return safeProfile;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateClientDossierPreferences(
  uid: string,
  patch: {
    displayName: string;
    preferredFinish: FinishId;
    wishlistIds: string[];
  }
): Promise<CloudClientProfile> {
  const safeName = sanitizeDisplayName(patch.displayName);
  const safeFinish: FinishId = FINISH_ORDER.includes(patch.preferredFinish)
    ? patch.preferredFinish
    : 'titanium';
  const safeWishlist = sanitizeWishlist(patch.wishlistIds);

  const cached = readLocalDossier(uid);
  const fallbackUpdated: CloudClientProfile = {
    uid,
    displayName: safeName,
    preferredFinish: safeFinish,
    wishlistIds: safeWishlist,
    orderCount: cached?.orderCount ?? INITIAL_DEMO_ORDERS.length,
  };
  writeLocalDossier(uid, fallbackUpdated);

  if (!isCloudTokenServiceAvailable) {
    return fallbackUpdated;
  }

  const path = `clients/${uid}`;
  const ref = doc(db, 'clients', uid);

  let existingProfile: CloudClientProfile | null = null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      existingProfile = snap.data() as CloudClientProfile;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return fallbackUpdated;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }

  if (!existingProfile) {
    try {
      await setDoc(ref, {
        ...fallbackUpdated,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return fallbackUpdated;
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return fallbackUpdated;
      }
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  try {
    await updateDoc(ref, {
      displayName: safeName,
      preferredFinish: safeFinish,
      wishlistIds: safeWishlist,
      updatedAt: serverTimestamp(),
    });
    const merged: CloudClientProfile = {
      ...existingProfile,
      displayName: safeName,
      preferredFinish: safeFinish,
      wishlistIds: safeWishlist,
    };
    writeLocalDossier(uid, merged);
    return merged;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return fallbackUpdated;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function fetchClientOrdersFromFirestore(
  uid: string
): Promise<TrackedOrder[]> {
  if (!isCloudTokenServiceAvailable) {
    return buildSeededLocalOrders(uid, auth.currentUser?.displayName);
  }

  const path = `clients/${uid}/orders`;
  const colRef = collection(db, 'clients', uid, 'orders');
  const q = query(colRef, where('uid', '==', uid), limit(30));

  try {
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) =>
      mapDocToTrackedOrder(d.id, d.data() as CloudAtelierOrderDoc)
    );
    orders.sort((a, b) => b.createdAtMs - a.createdAtMs);
    if (orders.length > 0) {
      writeLocalOrders(uid, orders);
    }
    return orders;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return buildSeededLocalOrders(uid, auth.currentUser?.displayName);
    }
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToClientOrders(
  uid: string,
  onOrders: (orders: TrackedOrder[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!isCloudTokenServiceAvailable) {
    const localOrders = buildSeededLocalOrders(uid, auth.currentUser?.displayName);
    onOrders(localOrders);
    return () => {};
  }

  const path = `clients/${uid}/orders`;
  const colRef = collection(db, 'clients', uid, 'orders');
  const q = query(colRef, where('uid', '==', uid), limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) =>
        mapDocToTrackedOrder(d.id, d.data() as CloudAtelierOrderDoc)
      );
      orders.sort((a, b) => b.createdAtMs - a.createdAtMs);
      if (orders.length > 0) {
        writeLocalOrders(uid, orders);
      }
      onOrders(orders);
    },
    (error) => {
      if (isOfflineOrAuthTokenError(error)) {
        isCloudTokenServiceAvailable = false;
        const localOrders = buildSeededLocalOrders(uid, auth.currentUser?.displayName);
        onOrders(localOrders);
        return;
      }
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createOrderInFirestore(
  user: User,
  rawOrder: {
    orderNumber: string;
    status?: OrderStatus;
    recipientName: string;
    destinationCity: string;
    postalCode: string;
    trackingCode: string;
    courier: string;
    estimatedDelivery: string;
    primaryProductId: string;
    primaryFinish: FinishId;
    itemsSummary: string;
    itemCount: number;
    total: number;
    paymentMethod: 'card' | 'cod';
  },
  wishlistIds: string[] = []
): Promise<TrackedOrder> {
  const uid = user.uid;
  const sanitized = sanitizeOrderFields(rawOrder);
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const initialStatus: OrderStatus = rawOrder.status || 'placed';
  const nowStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const orderPayload: CloudAtelierOrderDoc = {
    uid,
    orderNumber: sanitized.orderNumber,
    status: initialStatus,
    recipientName: sanitized.recipientName,
    destinationCity: sanitized.destinationCity,
    postalCode: sanitized.postalCode,
    trackingCode: sanitized.trackingCode,
    courier: sanitized.courier,
    estimatedDelivery: sanitized.estimatedDelivery,
    primaryProductId: sanitized.primaryProductId,
    primaryFinish: sanitized.primaryFinish,
    itemsSummary: sanitized.itemsSummary,
    itemCount: sanitized.itemCount,
    total: sanitized.total,
    paymentMethod: sanitized.paymentMethod,
  };

  const trackedResult: TrackedOrder = {
    id: orderId,
    ...orderPayload,
    createdAtLabel: nowStr,
    updatedAtLabel: 'Just now',
    createdAtMs: Date.now(),
    source: 'firestore',
  };

  // Always update local cache first for immediate resilience
  const existingLocal = buildSeededLocalOrders(uid, user.displayName);
  const nextLocal = [
    trackedResult,
    ...existingLocal.filter((o) => o.orderNumber !== trackedResult.orderNumber),
  ];
  writeLocalOrders(uid, nextLocal);

  if (!isCloudTokenServiceAvailable) {
    return trackedResult;
  }

  const clientPath = `clients/${uid}`;
  const clientRef = doc(db, 'clients', uid);

  let clientDoc: CloudClientProfile | null = null;
  try {
    const snap = await getDoc(clientRef);
    if (snap.exists()) {
      clientDoc = snap.data() as CloudClientProfile;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return trackedResult;
    }
    handleFirestoreError(err, OperationType.GET, clientPath);
  }

  if (!clientDoc) {
    const initialClient: CloudClientProfile = {
      uid,
      displayName: sanitizeDisplayName(
        sanitized.recipientName || user.displayName || 'Atelier Member'
      ),
      preferredFinish: sanitized.primaryFinish,
      wishlistIds: sanitizeWishlist(wishlistIds),
      orderCount: 1,
    };
    try {
      await setDoc(clientRef, {
        ...initialClient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      writeLocalDossier(uid, initialClient);
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return trackedResult;
      }
      handleFirestoreError(err, OperationType.CREATE, clientPath);
    }
  } else {
    const nextOrderCount = Math.min(
      10000,
      Math.max(0, Math.round(clientDoc.orderCount || 0)) + 1
    );
    try {
      await updateDoc(clientRef, {
        displayName: sanitizeDisplayName(
          sanitized.recipientName || clientDoc.displayName
        ),
        preferredFinish: sanitized.primaryFinish,
        wishlistIds: sanitizeWishlist(
          wishlistIds.length > 0 ? wishlistIds : clientDoc.wishlistIds
        ),
        orderCount: nextOrderCount,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return trackedResult;
      }
      handleFirestoreError(err, OperationType.UPDATE, clientPath);
    }
  }

  const orderPath = `clients/${uid}/orders/${orderId}`;
  const orderRef = doc(db, 'clients', uid, 'orders', orderId);

  try {
    await setDoc(orderRef, {
      ...orderPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return trackedResult;
    }
    handleFirestoreError(err, OperationType.CREATE, orderPath);
  }

  await recordProductCommissionTelemetry(
    uid,
    sanitized.primaryProductId,
    sanitized.destinationCity
  );

  return trackedResult;
}

export async function advanceOrderStatusInFirestore(
  uid: string,
  order: TrackedOrder
): Promise<TrackedOrder> {
  const nextStatus = getNextOrderStatus(order.status);
  if (!nextStatus) {
    return order;
  }

  const nextMeta = getOrderStatusMeta(nextStatus);
  const nextEst = `${nextMeta.estimatedWindow} · ${nextMeta.facility}`.slice(0, 40);
  const updatedOrder: TrackedOrder = {
    ...order,
    status: nextStatus,
    estimatedDelivery: nextEst,
    updatedAtLabel: 'Just now',
  };

  // Persist to local orders cache immediately
  const localOrders = buildSeededLocalOrders(uid, auth.currentUser?.displayName);
  writeLocalOrders(
    uid,
    localOrders.map((item) =>
      item.id === order.id || item.orderNumber === order.orderNumber
        ? updatedOrder
        : item
    )
  );

  if (!isCloudTokenServiceAvailable) {
    return updatedOrder;
  }

  const path = `clients/${uid}/orders/${order.id}`;
  const ref = doc(db, 'clients', uid, 'orders', order.id);

  try {
    await updateDoc(ref, {
      status: nextStatus,
      trackingCode: order.trackingCode,
      estimatedDelivery: nextEst,
      updatedAt: serverTimestamp(),
    });
    return updatedOrder;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return updatedOrder;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function seedSampleOrdersToFirestore(
  user: User
): Promise<TrackedOrder[]> {
  await fetchOrCreateClientDossier(user);
  if (!isCloudTokenServiceAvailable) {
    return buildSeededLocalOrders(user.uid, user.displayName);
  }

  const existing = await fetchClientOrdersFromFirestore(user.uid);
  if (existing.length > 0) {
    return existing;
  }

  const seeded: TrackedOrder[] = [];
  for (const sample of INITIAL_DEMO_ORDERS) {
    const created = await createOrderInFirestore(user, {
      orderNumber: sample.orderNumber,
      status: sample.status,
      recipientName: user.displayName || sample.recipientName,
      destinationCity: sample.destinationCity,
      postalCode: sample.postalCode,
      trackingCode: sample.trackingCode,
      courier: sample.courier,
      estimatedDelivery: sample.estimatedDelivery,
      primaryProductId: sample.primaryProductId,
      primaryFinish: sample.primaryFinish,
      itemsSummary: sample.itemsSummary,
      itemCount: sample.itemCount,
      total: sample.total,
      paymentMethod: sample.paymentMethod,
    });
    seeded.push(created);
  }
  return seeded;
}

export async function fetchDynamicCatalogTelemetry(): Promise<
  Record<string, ProductLiveTelemetry>
> {
  const result: Record<string, ProductLiveTelemetry> = {
    ...DEFAULT_PRODUCT_TELEMETRY,
  };
  try {
    const cachedRaw = localStorage.getItem(LOCAL_TELEMETRY_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw) as Record<string, ProductLiveTelemetry>;
      Object.assign(result, parsed);
    }
  } catch {
    // Ignore storage read issues
  }

  if (!auth.currentUser || !isCloudTokenServiceAvailable) {
    return result;
  }

  for (const product of PRODUCT_CATALOG) {
    const path = `catalog_telemetry/${product.id}`;
    const ref = doc(db, 'catalog_telemetry', product.id);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        result[product.id] = {
          productId: product.id,
          stockCount:
            typeof d.stockCount === 'number'
              ? d.stockCount
              : result[product.id].stockCount,
          editionNumber:
            typeof d.editionNumber === 'number'
              ? d.editionNumber
              : result[product.id].editionNumber,
          leadTimeDays:
            typeof d.leadTimeDays === 'number'
              ? d.leadTimeDays
              : result[product.id].leadTimeDays,
          lastCommissionedCity:
            typeof d.lastCommissionedCity === 'string'
              ? d.lastCommissionedCity
              : result[product.id].lastCommissionedCity,
          updatedAtLabel: formatTimestampLabel(d.updatedAt),
        };
      }
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return result;
      }
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  try {
    localStorage.setItem(LOCAL_TELEMETRY_KEY, JSON.stringify(result));
  } catch {
    // Ignore quota errors
  }

  return result;
}

export async function recordProductCommissionTelemetry(
  uid: string,
  productId: string,
  city: string
): Promise<ProductLiveTelemetry> {
  const fallback =
    DEFAULT_PRODUCT_TELEMETRY[productId] ||
    DEFAULT_PRODUCT_TELEMETRY['food-ajwa-01'];
  const safeCity = (city || 'ঢাকা').trim().slice(0, 60) || 'ঢাকা';

  const nextTelemetry: ProductLiveTelemetry = {
    productId,
    stockCount: Math.max(1, fallback.stockCount - 1),
    editionNumber: fallback.editionNumber + 1,
    leadTimeDays: fallback.leadTimeDays,
    lastCommissionedCity: safeCity,
    updatedAtLabel: 'Just now',
  };

  if (!isCloudTokenServiceAvailable) {
    return nextTelemetry;
  }

  const path = `catalog_telemetry/${productId}`;
  const ref = doc(db, 'catalog_telemetry', productId);

  let existingDoc: Record<string, unknown> | null = null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      existingDoc = snap.data() as Record<string, unknown>;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return nextTelemetry;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }

  const nextStock = Math.max(
    1,
    Math.min(
      500,
      (typeof existingDoc?.stockCount === 'number'
        ? existingDoc.stockCount
        : fallback.stockCount) - 1
    )
  );
  const nextEdition = Math.max(
    1,
    Math.min(
      5000,
      (typeof existingDoc?.editionNumber === 'number'
        ? existingDoc.editionNumber
        : fallback.editionNumber) + 1
    )
  );
  const leadTime =
    typeof existingDoc?.leadTimeDays === 'number'
      ? existingDoc.leadTimeDays
      : fallback.leadTimeDays;

  if (!existingDoc) {
    try {
      await setDoc(ref, {
        productId,
        stockCount: nextStock,
        editionNumber: nextEdition,
        leadTimeDays: leadTime,
        lastCommissionedCity: safeCity,
        updatedByUid: uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return nextTelemetry;
      }
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(ref, {
        stockCount: nextStock,
        editionNumber: nextEdition,
        leadTimeDays: leadTime,
        lastCommissionedCity: safeCity,
        updatedByUid: uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return nextTelemetry;
      }
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  return {
    productId,
    stockCount: nextStock,
    editionNumber: nextEdition,
    leadTimeDays: leadTime,
    lastCommissionedCity: safeCity,
    updatedAtLabel: 'Just now',
  };
}

// ============================================================================
// LEGACY PEN FIGHT HELPERS (Preserved for compatibility)
// ============================================================================

export async function fetchOrCreatePlayerProfile(
  user: User,
  localRecord: PlayerRecord,
  favoritePen: PenId,
  favoriteInk: InkColor
): Promise<CloudPlayerProfile> {
  const defaultCallsign = sanitizeCallsign(
    user.displayName || user.email?.split('@')[0] || 'Master Draftsman'
  );
  const played = Math.max(0, Math.round(localRecord.played || 0));
  const won = Math.max(0, Math.round(localRecord.won || 0));
  const lost = Math.max(0, Math.round(localRecord.lost || 0));
  const draws = Math.max(0, Math.round(localRecord.draws || 0));
  const streak = Math.max(0, Math.round(localRecord.streak || 0));
  const bestStreak = Math.max(
    0,
    streak,
    Math.round(localRecord.bestStreak || 0)
  );

  const newProfile: CloudPlayerProfile = {
    uid: user.uid,
    callsign: defaultCallsign,
    avatarColor: '#e5a93c',
    favoritePen,
    favoriteInk,
    played,
    won,
    lost,
    draws,
    streak,
    bestStreak,
  };

  if (!isCloudTokenServiceAvailable) {
    return newProfile;
  }

  const path = `players/${user.uid}`;
  const ref = doc(db, 'players', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as CloudPlayerProfile;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return newProfile;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }

  try {
    await setDoc(ref, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newProfile;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return newProfile;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updatePlayerProfileCustomization(
  uid: string,
  patch: {
    callsign: string;
    avatarColor: string;
    favoritePen: PenId;
    favoriteInk: InkColor;
  },
  fallbackRecord?: PlayerRecord
): Promise<CloudPlayerProfile> {
  const safeCallsign = sanitizeCallsign(patch.callsign);
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(patch.avatarColor)
    ? patch.avatarColor
    : '#e5a93c';
  const streak = Math.max(0, Math.round(fallbackRecord?.streak || 0));
  const createdProfile: CloudPlayerProfile = {
    uid,
    callsign: safeCallsign,
    avatarColor: safeColor,
    favoritePen: patch.favoritePen,
    favoriteInk: patch.favoriteInk,
    played: Math.max(0, Math.round(fallbackRecord?.played || 0)),
    won: Math.max(0, Math.round(fallbackRecord?.won || 0)),
    lost: Math.max(0, Math.round(fallbackRecord?.lost || 0)),
    draws: Math.max(0, Math.round(fallbackRecord?.draws || 0)),
    streak,
    bestStreak: Math.max(
      0,
      streak,
      Math.round(fallbackRecord?.bestStreak || 0)
    ),
  };

  if (!isCloudTokenServiceAvailable) {
    return createdProfile;
  }

  const path = `players/${uid}`;
  const ref = doc(db, 'players', uid);

  let existingData: CloudPlayerProfile | null = null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      existingData = snap.data() as CloudPlayerProfile;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return createdProfile;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }

  if (!existingData) {
    try {
      await setDoc(ref, {
        ...createdProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return createdProfile;
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return createdProfile;
      }
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  try {
    await updateDoc(ref, {
      callsign: safeCallsign,
      avatarColor: safeColor,
      favoritePen: patch.favoritePen,
      favoriteInk: patch.favoriteInk,
      updatedAt: serverTimestamp(),
    });
    return {
      ...existingData,
      callsign: safeCallsign,
      avatarColor: safeColor,
      favoritePen: patch.favoritePen,
      favoriteInk: patch.favoriteInk,
    };
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return createdProfile;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recordMatchAndSyncStats(
  uid: string,
  nextRecord: PlayerRecord,
  favoritePen: PenId,
  favoriteInk: InkColor,
  matchDetails: {
    playerPen: PenId;
    opponentPen: PenId;
    mode: PlayMode;
    arenaLayout: ArenaLayoutId;
    outcome: 'win' | 'loss' | 'draw';
    shots: number;
  }
): Promise<CloudMatchLog> {
  const matchId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const safeShots = Math.max(
    1,
    Math.min(500, Math.round(matchDetails.shots || 1))
  );
  const fallbackLog: CloudMatchLog = {
    id: matchId,
    uid,
    ...matchDetails,
    shots: safeShots,
  };

  if (!isCloudTokenServiceAvailable) {
    return fallbackLog;
  }

  const playerPath = `players/${uid}`;
  const playerRef = doc(db, 'players', uid);

  let existingProfile: CloudPlayerProfile | null = null;
  try {
    const snap = await getDoc(playerRef);
    if (snap.exists()) {
      existingProfile = snap.data() as CloudPlayerProfile;
    }
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return fallbackLog;
    }
    handleFirestoreError(err, OperationType.GET, playerPath);
  }

  if (!existingProfile) {
    const streak = Math.max(0, Math.round(nextRecord.streak || 0));
    const initialProfile: CloudPlayerProfile = {
      uid,
      callsign: sanitizeCallsign(auth.currentUser?.displayName || 'Draftsman'),
      avatarColor: '#e5a93c',
      favoritePen,
      favoriteInk,
      played: Math.max(1, Math.round(nextRecord.played || 1)),
      won: Math.max(0, Math.round(nextRecord.won || 0)),
      lost: Math.max(0, Math.round(nextRecord.lost || 0)),
      draws: Math.max(0, Math.round(nextRecord.draws || 0)),
      streak,
      bestStreak: Math.max(0, streak, Math.round(nextRecord.bestStreak || 0)),
    };
    try {
      await setDoc(playerRef, {
        ...initialProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return fallbackLog;
      }
      handleFirestoreError(err, OperationType.CREATE, playerPath);
    }
  } else {
    const nextPlayed = Math.round((existingProfile.played || 0) + 1);
    const nextWon =
      Math.round(existingProfile.won || 0) +
      (matchDetails.outcome === 'win' ? 1 : 0);
    const nextLost =
      Math.round(existingProfile.lost || 0) +
      (matchDetails.outcome === 'loss' ? 1 : 0);
    const nextDraws =
      Math.round(existingProfile.draws || 0) +
      (matchDetails.outcome === 'draw' ? 1 : 0);
    const nextStreak =
      matchDetails.outcome === 'win'
        ? Math.round(existingProfile.streak || 0) + 1
        : matchDetails.outcome === 'loss'
        ? 0
        : Math.round(existingProfile.streak || 0);
    const nextBestStreak = Math.max(
      Math.round(existingProfile.bestStreak || 0),
      nextStreak
    );

    try {
      await updateDoc(playerRef, {
        played: nextPlayed,
        won: nextWon,
        lost: nextLost,
        draws: nextDraws,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        favoritePen,
        favoriteInk,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      if (isOfflineOrAuthTokenError(err)) {
        isCloudTokenServiceAvailable = false;
        return fallbackLog;
      }
      handleFirestoreError(err, OperationType.UPDATE, playerPath);
    }
  }

  const matchPath = `players/${uid}/matches/${matchId}`;
  const matchRef = doc(db, 'players', uid, 'matches', matchId);

  try {
    await setDoc(matchRef, {
      uid,
      playerPen: matchDetails.playerPen,
      opponentPen: matchDetails.opponentPen,
      mode: matchDetails.mode,
      arenaLayout: matchDetails.arenaLayout,
      outcome: matchDetails.outcome,
      shots: safeShots,
      createdAt: serverTimestamp(),
    });
    return fallbackLog;
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return fallbackLog;
    }
    handleFirestoreError(err, OperationType.CREATE, matchPath);
  }
}

export async function fetchRecentMatchLogs(
  uid: string,
  maxItems = 10
): Promise<CloudMatchLog[]> {
  if (!isCloudTokenServiceAvailable) {
    return [];
  }

  const path = `players/${uid}/matches`;
  const colRef = collection(db, 'players', uid, 'matches');
  const q = query(colRef, limit(25));

  try {
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CloudMatchLog, 'id'>),
    }));
    items.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    return items.slice(0, maxItems);
  } catch (err) {
    if (isOfflineOrAuthTokenError(err)) {
      isCloudTokenServiceAvailable = false;
      return [];
    }
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
