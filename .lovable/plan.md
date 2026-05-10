## Continuing the multi-batch rebuild

Batch 1 (real auth + data migration) is functionally complete. This plan covers the **Batch 1 tail** + **Batch 2 (Trust & Correctness)**, executed back-to-back.

---

### Batch 1 — Tail (finish auth migration)

1. **Razorpay edge functions** — add `user_id` to `payment_transactions` inserts in `create-razorpay-order` and `verify-razorpay-payment` (currently only `user_email`). Pull `user_id` from JWT.
2. **KYC status badge on Dashboard** — small pill near the greeting: "KYC Verified ✓" / "Complete KYC →" linking to `/kyc`.
3. **Admin route guard** — `AdminDashboard` currently checks email. Switch to `has_role(user.id, 'admin')` via `user_roles`.
4. **Cleanup** — remove residual `localStorage` reads keyed by email in: `RewardsPage`, `GiftScreen`, `RedemptionScreen`, `WalletPage` history, `SpinWheel`. Migrate spin/gift/redemption writes to their new Supabase tables (`spin_history`, `gifts`, `redemptions`).

---

### Batch 2 — Trust & Correctness

1. **GST transparency everywhere**
   - Buy/SIP/Swipe-to-Invest: show line items → *Metal value*, *3% GST*, *Total debit*.
   - Confirmation screens + wallet transaction descriptions store both amounts.
   - Persist `gst_amount` on every `investment_transactions` row (column already exists).

2. **Live price staleness indicator**
   - `useMetalPrices` hook returns `updated_at`.
   - If older than 15 min → show amber dot + tooltip "Prices updated Xm ago". Older than 1 hr → red + disable Buy CTA with toast.

3. **Realtime price updates** — subscribe to `metal_prices` table changes so admin updates propagate instantly to all open clients.

4. **Sell-back / redemption math fix** — currently uses live buy rate. Apply standard 2% sell-side spread (configurable constant) and show breakdown.

5. **Error boundaries**
   - Top-level `<ErrorBoundary>` in `App.tsx` with branded fallback + "Reload" CTA.
   - Per-route boundaries on Dashboard, Invest, Wallet so one screen failing doesn't blank the app.

6. **Toast consistency** — replace remaining `alert()` / inconsistent toasts with shadcn `toast` (success/error variants), and add loading states on all Buy/Sell/SIP CTAs (disable + spinner) to prevent double-submits.

7. **Number/currency formatting** — central `formatINR()` and `formatGrams()` helpers; replace ad-hoc `toFixed` calls. Indian digit grouping (₹1,23,456).

---

### Technical notes

- No new tables needed; all schema is in place from Batch 1.
- Edge functions touched: `create-razorpay-order`, `verify-razorpay-payment` (redeploy automatic).
- New files: `src/lib/format.ts`, `src/components/ErrorBoundary.tsx`, `src/hooks/usePriceFreshness.ts`.
- Realtime requires `ALTER PUBLICATION supabase_realtime ADD TABLE metal_prices;` — included as a small migration.

After this, **Batch 3** = Admin dashboard upgrades, **Batch 4** = Performance/SEO, **Batch 5** = Polish/animations.
