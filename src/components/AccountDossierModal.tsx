import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  Clock,
  Cloud,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  FINISH_OPTIONS,
  FINISH_ORDER,
  FinishId,
  ORDER_STATUS_STEPS,
  PRODUCT_CATALOG,
  Product3DItem,
  TrackedOrder,
  filterTrackedOrders,
  getNextOrderStatus,
  getOrderProgressPercent,
  getOrderStatusMeta,
} from '../store/catalog';

interface AccountDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignInGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  orders: TrackedOrder[];
  isLoadingOrders: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  cloudSyncMessage: string;
  onRefreshOrdersFromFirestore: () => Promise<void>;
  onAdvanceOrderStatus: (order: TrackedOrder) => Promise<void>;
  onInspectOrderIn3D: (productId: string, finishId: FinishId) => void;
  wishlist: string[];
  onSelectProductForStudio: (product: Product3DItem) => void;
  onRemoveFromWishlist: (productId: string) => void;
  clientDisplayName: string;
  preferredFinish: FinishId;
  onSaveClientPreferences: (name: string, finish: FinishId) => Promise<void>;
  onOpenBagForNewOrder: () => void;
}

const PACK_SHORT_LABELS: Record<FinishId, string> = {
  brass: '৫০০ গ্রাম প্যাক (500g)',
  titanium: '১ কেজি জার (1kg)',
  obsidian: '২ কেজি প্যাক (2kg)',
  sage: 'হাদিয়া বক্স (Gift Box)',
};

export const AccountDossierModal: React.FC<AccountDossierModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInGoogle,
  onSignOut,
  orders,
  isLoadingOrders,
  cloudSyncStatus,
  cloudSyncMessage,
  onRefreshOrdersFromFirestore,
  onAdvanceOrderStatus,
  onInspectOrderIn3D,
  wishlist,
  onSelectProductForStudio,
  onRemoveFromWishlist,
  clientDisplayName,
  preferredFinish,
  onSaveClientPreferences,
  onOpenBagForNewOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'dossier'>('orders');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'dispatched' | 'delivered'
  >('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>(clientDisplayName);
  const [finishInput, setFinishInput] = useState<FinishId>(preferredFinish);
  const [savedPrefsToast, setSavedPrefsToast] = useState<boolean>(false);

  React.useEffect(() => {
    setNameInput(clientDisplayName);
  }, [clientDisplayName]);

  React.useEffect(() => {
    setFinishInput(preferredFinish);
  }, [preferredFinish]);

  const filteredOrders = useMemo(
    () => filterTrackedOrders(orders, statusFilter, orderSearchQuery),
    [orders, statusFilter, orderSearchQuery]
  );

  const orderMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const activeCount = orders.filter((o) => o.status !== 'delivered').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const totalValue = orders.reduce((sum, o) => sum + o.total, 0);
    return { totalOrders, activeCount, deliveredCount, totalValue };
  }, [orders]);

  if (!isOpen) return null;

  const handleAdvanceClick = async (order: TrackedOrder) => {
    setAdvancingOrderId(order.id);
    try {
      await onAdvanceOrderStatus(order);
    } finally {
      setAdvancingOrderId(null);
    }
  };

  const handleSavePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveClientPreferences(nameInput, finishInput);
    setSavedPrefsToast(true);
    setTimeout(() => setSavedPrefsToast(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-dossier-title"
      data-testid="account-modal"
    >
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl border border-[#DCE6DF] bg-[#F6FAF7] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-5 border-b border-[#DCE6DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#14532D] text-white flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5 text-[#FDE68A]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#4A6154]">
                <span>বারাকাহ সুন্নাহ ফুডস · গ্রাহক অ্যাকাউন্ট</span>
                <span>·</span>
                <span data-testid="account-sync-badge">
                  {currentUser
                    ? 'ক্লাউড সিঙ্ক সক্রিয় (Firestore Connected)'
                    : 'অর্ডার ট্র্যাকিং সেশন'}
                </span>
              </div>
              <h2
                id="account-dossier-title"
                className="font-display text-lg sm:text-xl font-semibold text-[#0F2419]"
              >
                {currentUser
                  ? `${currentUser.displayName || clientDisplayName} (${currentUser.email || 'Verified'})`
                  : `${clientDisplayName} · অর্ডার ট্র্যাকিং ও বাজারের ইতিহাস`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={onRefreshOrdersFromFirestore}
                  data-testid="refresh-firestore-orders-btn"
                  disabled={isLoadingOrders}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE6DF] bg-white text-xs font-medium text-[#0F2419] hover:border-[#14532D] transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`}
                  />
                  <span>রিফ্রেশ (Sync)</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  data-testid="account-signout-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE6DF] bg-white text-xs font-medium text-[#4A6154] hover:text-[#0F2419] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onSignInGoogle}
                data-testid="account-google-signin-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#14532D] text-white text-xs font-medium hover:bg-[#0F3F22] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Google দিয়ে লগইন করুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              data-testid="close-account-modal-btn"
              aria-label="Close Account Modal"
              className="p-2 rounded-lg border border-[#DCE6DF] bg-white text-[#4A6154] hover:text-[#0F2419] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Order Tracking vs Saved Wishlist & Profile */}
        <div className="px-5 sm:px-7 pt-3 border-b border-[#DCE6DF] bg-white flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              data-testid="account-tab-orders"
              className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-[#14532D] text-[#0F2419]'
                  : 'border-transparent text-[#4A6154] hover:text-[#0F2419]'
              }`}
            >
              <Package className="w-4 h-4 text-[#14532D]" />
              <span>অর্ডার ট্র্যাকিং · Order Tracking ({orders.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dossier'}
              onClick={() => setActiveTab('dossier')}
              data-testid="account-tab-wishlist"
              className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dossier'
                  ? 'border-[#14532D] text-[#0F2419]'
                  : 'border-transparent text-[#4A6154] hover:text-[#0F2419]'
              }`}
            >
              <Heart className="w-4 h-4 text-[#14532D]" />
              <span>পছন্দের খাবার ও প্রোফাইল ({wishlist.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#4A6154] pb-2">
            <Cloud className="w-3.5 h-3.5 text-[#14532D]" />
            <span data-testid="firestore-status-readout">{cloudSyncMessage}</span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'orders' ? (
            <div className="space-y-6" data-testid="order-tracking-section">
              {/* Order Summary KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-[#DCE6DF] bg-white">
                  <span className="text-xs text-[#4A6154] block">
                    মোট অর্ডার (Total Orders)
                  </span>
                  <span
                    className="mt-1 font-mono text-xl font-semibold text-[#0F2419] tabular-nums block"
                    data-testid="order-kpi-total"
                  >
                    {orderMetrics.totalOrders}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#DCE6DF] bg-white">
                  <span className="text-xs text-[#4A6154] block">
                    চলমান অর্ডার (In Progress)
                  </span>
                  <span
                    className="mt-1 font-mono text-xl font-semibold text-[#B45309] tabular-nums block"
                    data-testid="order-kpi-active"
                  >
                    {orderMetrics.activeCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#DCE6DF] bg-white">
                  <span className="text-xs text-[#4A6154] block">
                    ডেলিভারি সম্পন্ন (Delivered)
                  </span>
                  <span
                    className="mt-1 font-mono text-xl font-semibold text-[#14532D] tabular-nums block"
                    data-testid="order-kpi-delivered"
                  >
                    {orderMetrics.deliveredCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#DCE6DF] bg-white">
                  <span className="text-xs text-[#4A6154] block">
                    মোট বাজার মূল্য (Total Spent)
                  </span>
                  <span className="mt-1 font-mono text-xl font-semibold text-[#0F2419] tabular-nums block">
                    ৳{orderMetrics.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Filter & Search Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE6DF]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'সব অর্ডার (All)' },
                      { id: 'active', label: 'প্রসেসিং (Active)' },
                      { id: 'dispatched', label: 'ডেলিভারি পথে (In Transit)' },
                      { id: 'delivered', label: 'ডেলিভারি সম্পন্ন (Delivered)' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      data-testid={`order-filter-${tab.id}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        statusFilter === tab.id
                          ? 'bg-[#14532D] text-white'
                          : 'bg-white border border-[#DCE6DF] text-[#4A6154] hover:text-[#0F2419]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#4A6154] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="অর্ডার #AF-..., খেজুর, ঘি, ঢাকা..."
                    aria-label="Search tracked orders"
                    data-testid="order-tracking-search"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#DCE6DF] bg-white text-xs text-[#0F2419] placeholder:text-[#4A6154] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>

              {/* Order Cards List */}
              {isLoadingOrders ? (
                <div className="py-12 text-center space-y-2 border border-[#DCE6DF] rounded-xl bg-white">
                  <RefreshCw className="w-5 h-5 text-[#14532D] animate-spin mx-auto" />
                  <p className="text-xs text-[#4A6154]">
                    আপনার অর্ডারের তথ্য লোড হচ্ছে...
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div
                  className="py-12 px-4 text-center space-y-3 border border-[#DCE6DF] rounded-xl bg-white"
                  data-testid="empty-orders-state"
                >
                  <Package className="w-6 h-6 text-[#4A6154] mx-auto" />
                  <p className="text-sm font-medium text-[#0F2419]">
                    এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।
                  </p>
                  <p className="text-xs text-[#4A6154] max-w-md mx-auto">
                    সব অর্ডার দেখতে ফিল্টার রিসেট করুন অথবা নতুন সুন্নাহ খাবার অর্ডার করুন।
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setOrderSearchQuery('');
                      }}
                      className="px-3.5 py-2 rounded-lg border border-[#DCE6DF] bg-white text-xs font-medium text-[#0F2419]"
                    >
                      সব অর্ডার দেখুন
                    </button>
                    <button
                      type="button"
                      onClick={onOpenBagForNewOrder}
                      className="px-3.5 py-2 rounded-lg bg-[#14532D] text-white text-xs font-medium"
                    >
                      বাজারের ব্যাগ খুলুন
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const statusMeta = getOrderStatusMeta(order.status);
                    const nextStatus = getNextOrderStatus(order.status);
                    const nextStatusMeta = nextStatus
                      ? getOrderStatusMeta(nextStatus)
                      : null;
                    const progressPct = getOrderProgressPercent(order.status);
                    const isDelivered = order.status === 'delivered';

                    return (
                      <article
                        key={order.id}
                        data-testid={`tracked-order-card-${order.orderNumber}`}
                        className="rounded-xl border border-[#DCE6DF] bg-white p-5 space-y-4 transition-colors hover:border-[#14532D]/40"
                      >
                        {/* Top Row: Order Number, Date, Status & Total */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE6DF]">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap text-xs text-[#4A6154]">
                              <span
                                className="font-mono text-sm font-semibold text-[#0F2419]"
                                data-testid={`order-number-${order.orderNumber}`}
                              >
                                অর্ডার #{order.orderNumber}
                              </span>
                              <span>·</span>
                              <span>তারিখ: {order.createdAtLabel}</span>
                              <span>·</span>
                              <span className="text-[#14532D] font-medium">
                                {order.source === 'firestore'
                                  ? 'Firestore Verified'
                                  : 'লাইভ অর্ডার রেকর্ড'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-[#0F2419]">
                              {order.itemsSummary}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isDelivered ? 'text-[#14532D]' : 'text-[#B45309]'
                              }`}
                              data-testid={`order-status-label-${order.orderNumber}`}
                            >
                              {statusMeta.label} ({progressPct}%)
                            </span>
                            <span className="font-mono text-sm font-semibold text-[#0F2419] tabular-nums">
                              ৳{order.total.toLocaleString()} ({order.itemCount}টি প্যাক)
                            </span>
                          </div>
                        </div>

                        {/* 5-Stage Fulfillment Progress Bar & Milestones */}
                        <div className="space-y-2.5">
                          <div className="w-full h-2 rounded-full bg-[#E6F0EA] overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isDelivered ? 'bg-[#14532D]' : 'bg-[#D97706]'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {ORDER_STATUS_STEPS.map((step) => {
                              const isCompleted = step.stepIndex <= statusMeta.stepIndex;
                              const isCurrent = step.id === order.status;
                              return (
                                <div
                                  key={step.id}
                                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                                    isCurrent
                                      ? 'border-[#14532D] bg-[#F2F9F4]'
                                      : isCompleted
                                      ? 'border-[#DCE6DF] bg-[#FAFDFB]'
                                      : 'border-transparent bg-transparent opacity-55'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[11px] font-mono">
                                    <span
                                      className={
                                        isCompleted ? 'text-[#14532D] font-semibold' : 'text-[#4A6154]'
                                      }
                                    >
                                      0{step.stepIndex}
                                    </span>
                                    {isCompleted && (
                                      <Check
                                        className={`w-3.5 h-3.5 ${
                                          isDelivered ? 'text-[#14532D]' : 'text-[#D97706]'
                                        }`}
                                      />
                                    )}
                                  </div>
                                  <div className="mt-0.5 text-xs font-semibold text-[#0F2419] truncate">
                                    {step.shortLabel}
                                  </div>
                                  <div className="text-[11px] text-[#4A6154] truncate">
                                    {step.facility}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Logistics Metadata & Telemetry Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs bg-[#F6FAF7] p-3.5 rounded-lg border border-[#DCE6DF]">
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-[#14532D] mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] text-[#4A6154] block">
                                কুরিয়ার ও ট্র্যাকিং কোড
                              </span>
                              <span className="font-mono font-semibold text-[#0F2419]">
                                {order.trackingCode}
                              </span>
                              <span className="block text-[11px] text-[#4A6154]">
                                {order.courier}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[#14532D] mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] text-[#4A6154] block">
                                ডেলিভারি ঠিকানা
                              </span>
                              <span className="font-semibold text-[#0F2419]">
                                {order.destinationCity}, {order.postalCode}
                              </span>
                              <span className="block text-[11px] text-[#4A6154]">
                                প্রাপক: {order.recipientName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-[#14532D] mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] text-[#4A6154] block">
                                সম্ভাব্য ডেলিভারি সময়
                              </span>
                              <span className="font-semibold text-[#0F2419]">
                                {order.estimatedDelivery}
                              </span>
                              <span className="block text-[11px] text-[#4A6154]">
                                {statusMeta.description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Order Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              onInspectOrderIn3D(
                                order.primaryProductId,
                                order.primaryFinish
                              )
                            }
                            data-testid={`order-inspect-3d-${order.orderNumber}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#14532D] hover:text-[#0F3F22] transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>
                              পণ্য ও পুষ্টিগুণ দেখুন ({PACK_SHORT_LABELS[order.primaryFinish]})
                            </span>
                          </button>

                          {nextStatusMeta ? (
                            <button
                              type="button"
                              disabled={advancingOrderId === order.id}
                              onClick={() => handleAdvanceClick(order)}
                              data-testid={`advance-order-status-${order.orderNumber}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#14532D] text-white text-xs font-medium hover:bg-[#0F3F22] transition-colors disabled:opacity-50"
                            >
                              <span>
                                {advancingOrderId === order.id
                                  ? 'আপডেট হচ্ছে...'
                                  : `পরবর্তী ধাপ: ${nextStatusMeta.shortLabel}`}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14532D]/10 text-[#14532D] text-xs font-medium"
                              data-testid={`order-terminal-badge-${order.orderNumber}`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ডেলিভারি সম্পন্ন · হালাল ও বিএসটিআই ভেরিফাইড</span>
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: Saved Wishlist & Client Profile Preferences */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6" data-testid="account-dossier-tab">
              {/* Saved Wishlist Column */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[#0F2419]">
                    পছন্দের সুন্নাহ খাবারের তালিকা ({wishlist.length})
                  </h3>
                  <span className="text-xs text-[#4A6154]">
                    সর্বোচ্চ ১০টি খাবার
                  </span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="p-8 rounded-xl border border-[#DCE6DF] bg-white text-center space-y-2">
                    <Box className="w-5 h-5 text-[#4A6154] mx-auto" />
                    <p className="text-xs text-[#4A6154]">
                      আপনার পছন্দের তালিকায় এখনো কোনো খাবার যোগ করা হয়নি।
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {wishlist.map((id) => {
                      const item = PRODUCT_CATALOG.find((p) => p.id === id);
                      if (!item) return null;
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#DCE6DF] gap-3"
                        >
                          <div>
                            <span className="text-xs text-[#4A6154] block">
                              {item.categoryLabel} · {item.origin}
                            </span>
                            <span className="font-display text-sm font-semibold text-[#0F2419]">
                              {item.banglaTitle} · ৳{item.price.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectProductForStudio(item);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#14532D] text-white text-xs font-medium hover:bg-[#0F3F22]"
                            >
                              বিস্তারিত দেখুন
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveFromWishlist(item.id)}
                              aria-label={`Remove ${item.name} from wishlist`}
                              className="p-1.5 rounded-lg border border-[#DCE6DF] text-[#4A6154] hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Client Preferences Form */}
              <div className="md:col-span-5">
                <form
                  onSubmit={handleSavePreferencesSubmit}
                  className="p-5 rounded-xl border border-[#DCE6DF] bg-white space-y-4"
                >
                  <h3 className="font-display text-base font-semibold text-[#0F2419]">
                    গ্রাহক প্রোফাইল ও ডিফল্ট প্যাক সাইজ
                  </h3>

                  <div>
                    <label
                      htmlFor="client-dossier-name"
                      className="block text-xs font-medium text-[#4A6154] mb-1"
                    >
                      আপনার নাম (Recipient Name)
                    </label>
                    <input
                      id="client-dossier-name"
                      type="text"
                      maxLength={60}
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      data-testid="dossier-name-input"
                      className="w-full px-3 py-2 rounded-lg border border-[#DCE6DF] bg-[#F6FAF7] text-xs text-[#0F2419] focus:outline-none focus:border-[#14532D]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[#4A6154] mb-1.5">
                      পছন্দের প্যাক সাইজ (Default Pack Size)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {FINISH_ORDER.map((fid) => {
                        const opt = FINISH_OPTIONS[fid];
                        const active = finishInput === fid;
                        return (
                          <button
                            key={fid}
                            type="button"
                            onClick={() => setFinishInput(fid)}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                              active
                                ? 'border-[#14532D] bg-[#14532D] text-white'
                                : 'border-[#DCE6DF] bg-[#F6FAF7] text-[#0F2419]'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: opt.hex }}
                            />
                            <span className="truncate">{opt.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    data-testid="save-dossier-prefs-btn"
                    className="w-full py-2.5 rounded-lg bg-[#14532D] text-white text-xs font-medium hover:bg-[#0F3F22] transition-colors"
                  >
                    {savedPrefsToast
                      ? 'প্রোফাইল সংরক্ষিত হয়েছে!'
                      : 'প্রোফাইল সংরক্ষণ করুন'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-[#DCE6DF] bg-white flex items-center justify-between gap-4">
          <div className="text-xs text-[#4A6154]">
            {cloudSyncStatus === 'syncing'
              ? 'ক্লাউডে সিঙ্ক হচ্ছে...'
              : `চলমান অর্ডার: ${orderMetrics.activeCount} · সম্পন্ন: ${orderMetrics.deliveredCount}`}
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="footer-close-dossier-btn"
            className="px-4 py-2 rounded-lg bg-[#0F2419] text-white text-xs font-medium hover:bg-[#14532D] transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
