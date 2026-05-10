# Implementation Roadmap — All 20 Improvements

This is a multi-day overhaul. I'll deliver in 5 batches, each shippable on its own. After you approve this plan I'll start **Batch 1** immediately and report back when it's ready to test before moving to Batch 2.

---

## Batch 1 — Real Auth + Data Migration (foundation)
*Items #1, #4, #17 — biggest change, unblocks everything else*

- Create Supabase tables: `profiles`, `wallets`, `holdings`, `transactions`, `sip_plans`, `spin_history`, `referrals`, `gifts`, `redemptions`
- RLS policies tied to `auth.uid()` (proper per-user isolation)
- `user_roles` table + `has_role()` function for admin
- Seed `admin@test.com` and `user@test.com` as real auth users with their existing mock data migrated
- Replace `AuthContext` localStorage logic with Supabase auth (`onAuthStateChange` + `getSession`)
- Email/password + Google sign-in on `/auth`, password reset at `/reset-password`
- Rewrite `WalletContext`, holdings hooks, SIP store, transactions store to read/write Supabase
- Single source of truth for prices: remove all hardcoded fallbacks, always read from `metal_prices` table
- KYC status badge on Dashboard header

## Batch 2 — Trust & Correctness
*Items #2, #3, #18*

- GST (3%) line item on Swipe-to-Invest quick chips, confirmation toasts, transaction details dialog
- Live price "updated Xs ago" indicator on Dashboard + Invest screen
- 30-second price lock during checkout flows (snapshot price at swipe start)
- Error boundaries per route so one broken screen doesn't blank the app

## Batch 3 — UX Polish
*Items #5, #6, #7, #8, #9, #10*

- Gold locker bars: same grid layout as silver, capped count
- Banner carousel: preload first image with `<link rel="preload">`
- Bottom nav: stronger active state (gold pill bg) + haptic feedback on tap
- Transactions screen: filter by type + date range
- SIP screen: pause/skip-month controls per plan
- Wallet auto-refresh after spin reward (event-based, no nav required)

## Batch 4 — Growth Features
*Items #11, #12, #13, #14, #15*

- Price alerts: user sets threshold, notification when crossed (toast on next visit; cron-ready)
- Goal-based investing: target gms + deadline, progress card on Dashboard
- Family vault: shared locker tied to nominees
- Referral leaderboard: top 10 referrers by count
- Festival theming: Akshaya Tritiya / Diwali auto-promo banners with date logic

## Batch 5 — Tech Hygiene & Delight
*Items #16, #19, #20*

- Dark mode toggle in Profile (jewellery on dark looks premium)
- Image optimization: convert banners to WebP, add `srcset`, lazy-load below fold
- Analytics events: track invest funnel (viewed → amount → swiped → paid), SIP signups, redemptions

---

## Technical notes
- Auth flow uses Lovable Cloud managed Google OAuth via `lovable.auth.signInWithOAuth`
- All RLS policies use `auth.uid() = user_id` pattern; admin checks via `has_role(auth.uid(), 'admin')`
- Memory will be updated after Batch 1 (auth model, persistence strategy, test credentials)
- Seed migration will preserve admin/user test accounts so you can keep testing with the same logins
- Database changes require your approval per migration — I'll batch them tightly

## What I need from you
Approve this plan and I'll kick off Batch 1. Each batch ends with a test checkpoint so you can validate before I move on.
