# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched under `/players/{playerId}`, `/players/{playerId}/matches/{matchId}`, `/clients/{clientId}`, `/clients/{clientId}/orders/{orderId}`, and `/catalog_telemetry/{productId}` is unconditionally denied (`allow read, write: if false;`).
2. **Zero Raw PII & Strict Owner Isolation (Pillar 6)**:
   - `ClientProfile` and `AtelierOrder` never store raw street addresses, phone numbers, or email addresses. `AtelierOrder` stores only non-PII `recipientName` (1..60), `destinationCity` (1..60), and `postalCode` (1..20).
   - Access to `/clients/{clientId}` and `/clients/{clientId}/orders/{orderId}` is restricted strictly to the authenticated owner (`request.auth.uid == clientId`) with verified email (`request.auth.token.email_verified == true` for all writes).
3. **Master Gate Relational Sync (Pillar 1)**:
   - A `MatchLog` document in `/players/{playerId}/matches/{matchId}` can only be created if `/players/{playerId}` exists and its `uid == request.auth.uid`.
   - An `AtelierOrder` document in `/clients/{clientId}/orders/{orderId}` can only be created or updated if the parent `/clients/{clientId}` document exists and its `uid == request.auth.uid` (`isParentClientOwner(clientId)`).
4. **Strict Blueprint Validation & Anti-Update-Gap (Pillar 2)**:
   - `isValidClientProfile(data)` enforces exact key sets (`hasAll` and `hasOnly`), string length bounds (`displayName` 1..60, `uid` 1..128 matching `^[a-zA-Z0-9_\-]+$`), enum bounds (`preferredFinish`), bounded array `wishlistIds` (`size() <= 10` with element 0 type/length guard), bounded `orderCount` (`0 <= orderCount <= 10000`), and `data.uid == request.auth.uid`.
   - `isValidAtelierOrder(data)` enforces exact key sets (`hasAll` and `hasOnly`), `orderNumber` regex `^AF-[0-9]{6}$`, `status` enum (`placed`, `milling`, `calibration`, `dispatched`, `delivered`), `trackingCode` regex `^[A-Z0-9\-]+$`, valid `primaryProductId` and `primaryFinish` enums, bounded `itemsSummary` (1..240), `itemCount` (1..99), `total` (1..1000000), `paymentMethod` (`card` | `cod`), and `data.uid == request.auth.uid`.
   - `isValidProductTelemetry(data)` enforces exact key sets, valid `productId` enum, bounded `stockCount` (0..500), `editionNumber` (1..5000), `leadTimeDays` (1..60), `lastCommissionedCity` (1..60), and `data.updatedByUid == request.auth.uid`.
5. **Action-Based Updates, Immortal Fields & Terminal State Locking (Pillars 4, 6, 12, 13)**:
   - On `/clients/{clientId}`, `uid` and `createdAt` are immutable, `updatedAt == request.time`, and updates are partitioned into explicit actions (`isUpdateClientDossierAction` modifying `['displayName', 'preferredFinish', 'wishlistIds', 'updatedAt']` or `isRecordClientOrderAction` incrementing `orderCount` by 1).
   - On `/clients/{clientId}/orders/{orderId}`, `uid`, `orderNumber`, `recipientName`, `destinationCity`, `postalCode`, `courier`, `primaryProductId`, `primaryFinish`, `itemsSummary`, `itemCount`, `total`, `paymentMethod`, and `createdAt` are strictly immutable after creation.
   - **Terminal State Locking**: Once `existing().status == 'delivered'`, all further updates to `/clients/{clientId}/orders/{orderId}` are rejected (`existing().status != 'delivered'`). Status transitions via `isAdvanceOrderStatusAction` may only modify `['status', 'trackingCode', 'estimatedDelivery', 'updatedAt']` with `updatedAt == request.time`.
6. **Secure List Queries (Pillar 8)**:
   - `allow list` on `/clients/{clientId}/orders/{orderId}` and `/players/{playerId}/matches/{matchId}` explicitly checks `isSignedIn() && isValidId(clientId) && clientId == request.auth.uid && resource.data.uid == request.auth.uid` with zero `get()` or `exists()` calls inside `list`.
   - `allow list` is `false` on `/players/{playerId}`, `/clients/{clientId}`, and `/catalog_telemetry/{productId}`.

---

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Identity Spoofing on Client Dossier Create)**: Authenticated user `user_A` attempts to create `/clients/user_B` or sets `uid: "user_B"`. -> `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Email Write Spoof)**: Authenticated user `user_A` with `email_verified: false` attempts to create an order in `/clients/user_A/orders/ord_1`. -> `PERMISSION_DENIED`.
3. **Payload 3 (Shadow / Ghost Field Injection on Order Create)**: User sends valid `AtelierOrder` payload plus `"isPriorityFree": true`. -> Rejected by `data.keys().hasOnly(...)` -> `PERMISSION_DENIED`.
4. **Payload 4 (Shadow Field Injection on Order Update)**: User updates `status` plus an undeclared field `"discountOverride": 999`. -> Rejected by `affectedKeys().hasOnly(...)` and `isValidAtelierOrder(incoming())` -> `PERMISSION_DENIED`.
5. **Payload 5 (Value Poisoning on Update)**: User updates whitelisted key `estimatedDelivery` with a 1,000-character string or integer `12345`. -> Rejected by `isValidAtelierOrder(incoming())` size & type guard -> `PERMISSION_DENIED`.
6. **Payload 6 (Immortal Field Tampering on Order)**: User attempts to modify `total`, `orderNumber`, or `createdAt` during an update to `/clients/user_A/orders/ord_1`. -> Rejected by immutable field equality checks and `affectedKeys().hasOnly(['status', 'trackingCode', 'estimatedDelivery', 'updatedAt'])` -> `PERMISSION_DENIED`.
7. **Payload 7 (Terminal State Mutation)**: User attempts to update an order whose `existing().status == 'delivered'` back to `'placed'`. -> Rejected by terminal lock `existing().status != 'delivered'` -> `PERMISSION_DENIED`.
8. **Payload 8 (Orphaned Subcollection Order Write)**: User attempts to create `/clients/user_A/orders/ord_1` when `/clients/user_A` does not exist. -> Rejected by Master Gate `isParentClientOwner(clientId)` -> `PERMISSION_DENIED`.
9. **Payload 9 (Cross-Tenant Order Read/List)**: User `user_B` attempts to `get` or `list` `/clients/user_A/orders`. -> Rejected by `clientId == request.auth.uid && resource.data.uid == request.auth.uid` -> `PERMISSION_DENIED`.
10. **Payload 10 (Client Timestamp Forgery)**: User supplies a forged past or future `createdAt` or `updatedAt` timestamp (`!= request.time`). -> `PERMISSION_DENIED`.
11. **Payload 11 (Path Variable ID Poisoning)**: User attempts to create an order document with a 200-character or special-character ID (`order$@#`). -> Rejected by `isValidId(orderId)` -> `PERMISSION_DENIED`.
12. **Payload 12 (Unbounded Wishlist Array Poisoning)**: User attempts to write 50 items into `wishlistIds` on `/clients/user_A`. -> Rejected by `data.wishlistIds.size() <= 10` -> `PERMISSION_DENIED`.
