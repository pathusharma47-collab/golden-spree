## Problem
The Locker "Invested" tile sums `amount_inr` (gross, ₹100) but the user wants the net amount actually converted to metal after the 3% GST (₹97). They saw ₹107 because elsewhere it shows current market value (grams × today's rate); we'll keep "Invested" strictly as net cash invested.

DB confirms only one tx: amount_inr=100, gst_amount=3 → net = 97. Today's rate ≈ ₹15,500/g → current value ≈ ₹107.

## Change
**`src/hooks/useHoldings.ts`** — compute invested net of GST:
- Also select `gst_amount` from `investment_transactions`.
- `gi += (amount_inr - gst_amount)` instead of `gi += amount_inr`.
- Same for silver.
- Cached values will reflect net.

No UI changes needed; `goldInvested` / `silverInvested` consumers (LockerScreen, ProfilePage, SIPScreen) will automatically show the net invested amount.
