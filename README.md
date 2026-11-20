# Nance Weekly Wins – Mobile-First Weekly Habit Tracker

> **"Small weekly wins. Better money habits."**

A minimal, mobile-first weekly habit tracker for **Nance**.

Rather than looking like an overwhelming banking or financial analytics dashboard, **Weekly Wins** is designed around a simple, rewarding habit loop:

$$\text{4 Weekly Boxes} \longrightarrow \text{Monthly Progress (Percentage First)} \longrightarrow \text{Track Expenses} \longrightarrow \text{Finish Week} \longrightarrow \text{Final Monthly Celebration}$$

---

## 1. Mobile-First Habit Tracker Design

- **Pure Mobile-First Experience**: Built exclusively as a clean, centered mobile application screen (`max-w-[420px]`). Centered on desktop, full-width on mobile phones.
- **No Unnecessary UI**:
  - Removed desktop dashboard layouts, large analytics cards, student profile banners, login contribution calendars, and separate dashboards.
  - Focused strictly on building a weekly budgeting habit.

---

## 2. Core Screen Structure

### 1. Four Weekly Boxes at the Top (Primary Section)
At the very top of the app, four compact weekly boxes sit in a clean row:
- **Week 1**: `+20% Saved` (Green • Completed under budget)
- **Week 2**: `8% Over` (Amber • Completed over budget)
- **Week 3**: `+15% Saved` (Green • Completed under budget)
- **Week 4**: `Not Started` / `In Progress` (Grey • Upcoming)
- **Interactive**: Tapping any box selects that week and shows its details below. Active week is highlighted with a clear outline.

### 2. Monthly Progress: Percentage First
Immediately below the four boxes, displaying the progress **as a percentage first**:
```
MONTHLY PROGRESS
7.7% SAVED SO FAR
You are doing great! Keep your momentum going.
3 of 4 weeks completed
```
- **Calculation Rule**: Uses **ONLY completed weeks**:
  $$\text{Completed Weekly Budget} = \sum \text{budgets for completed weeks}$$
  $$\text{Completed Weekly Spending} = \sum \text{eligible spending in completed weeks}$$
  $$\text{Monthly Progress \%} = \left(\frac{\text{Completed Weekly Budget} - \text{Completed Weekly Spending}}{\text{Completed Weekly Budget}}\right) \times 100$$
- **Example**:
  - Week 1: Budget ₹2,000, spent ₹1,600
  - Week 2: Budget ₹2,500, spent ₹2,700
  - Week 3: Budget ₹2,000, spent ₹1,700
  - Completed Weekly Budget = ₹6,500
  - Completed Weekly Spending = ₹6,000
  - Monthly Progress = **7.7% Saved So Far** (3 of 4 weeks completed).
- **If 0 weeks completed**: Displays *"START YOUR FIRST WEEK"* and *"Your first weekly win starts here!"*

### 3. Selected Week: Simple Expense Tracker
Displays only the selected week's essentials:
- Week number and date range (e.g. `Week 2` • `Oct 8 – Oct 14`)
- Weekly budget (₹2,500), Spent (₹1,300), Remaining (₹1,200)
- **Category-Wise Breakdown**: Compact horizontal progress bars with amounts for Food & Dining, Groceries, Transportation, Shopping, Bills, etc.
- **+ Add Expense**: Form to add custom expenses, plus 1-tap quick demo chips (`+ ₹40 Food`, `+ ₹250 Groceries`, `+ ₹60 Auto`, `+ ₹180 Shopping`).
- Recent transactions list for the selected week.

### 4. Finish Week: The Main Interaction
Prominent button at the bottom of the active week:
- **`Finish Week`**:
  1. Calculates eligible spending vs budget.
  2. Calculates the percentage under or over budget.
  3. Saves the completed weekly result and updates the top box.
  4. Recalculates monthly-to-date progress.
  5. Displays the weekly result modal:
     - **Under Budget**: `20% UNDER BUDGET!` • *"You completed this week's money goal. Great work!"* with a button to advance to the next week.
     - **Over Budget**: `A little over budget this week.` • *"Don't worry! Every week is a fresh opportunity. You can get back on track next week. Keep going!"*
     - Never shames the user or erases past progress.

### 5. Monthly Completion: Final Celebration
When Week 4 is finished, the app calculates the final monthly percentage across all 4 weeks:
- **Formula**:
  $$\text{Final Monthly \%} = \left(\frac{₹9,000 - ₹8,000}{₹9,000}\right) \times 100 = 11.1\%$$
- **Celebration Modal**:
  - **`You saved 11.1% of your planned budget this month!`**
  - *"Congratulations! Four weeks of mindful money decisions. Keep building this habit."*
  - Shows all 4 weekly results chips and number of weekly wins (e.g. `3 of 4 Weekly Wins`).
  - Button to **Start a New Month** or review details.

### 6. Dynamic Recovery Logic
An overspending week never destroys cumulative progress:
- After Week 1 (+₹400 under) $\to$ Running net: **+₹400**
- After Week 2 (-₹200 over) $\to$ Running net: **+₹200** (reduced, not erased!)
- After Week 3 (+₹300 under) $\to$ Running net: **+₹500** (recovered!)
- After Week 4 (+₹200 under) $\to$ Running net: **+₹700**

---

## 3. Transaction Eligibility & Accounting Rules

1. **Included Spending Categories**:
   - Food & Dining, Groceries, Shopping, Bills, Travel, Transportation, Fuel / EV Charging, Entertainment, Subscriptions, Housing & Utilities, Personal Care, Hospitals & Pharmacy, Fitness & Wellness, Education, Gifts & Donations, Electronics, Insurance Premiums, EMIs & Loans.
2. **Excluded Money Movements**:
   - Credit Card Settlements (prevents double-counting card purchases).
   - Self Transfers (internal wallet/account movements).
   - Cash Withdrawals (spending tracked when cash is spent).
   - Investments (capital allocation, not consumption).
   - Lend / Borrow / Friends & Family peer transfers.
3. **Date Attribution**:
   - Filtered strictly using `txn_date` rather than `arrived_at`.

---

## 4. Verification & Testing

### Automated Unit Tests (Vitest)
```bash
npm test
# Output: ✓ src/services/budgetCalculator.test.ts (9 tests passed in 23ms)
```

### Python SQLite Verification
```bash
python scripts/verify_calculations.py
# Output: ALL SIMPLIFIED CALCULATIONS VERIFIED AGAINST SQLITE DATABASE SUCCESSFULLY!
```

### Production Build
```bash
npm run build
# Output: ✓ built in 4.30s (zero TypeScript errors)
```

---

## 5. How to Run the Demo

```bash
# Start live development server
npm run dev
```

Visit `http://localhost:5173`:
1. Look at the **4 Weekly Boxes** at the top. Week 1 is finished (+20% Saved).
2. Look at the **Monthly Progress** section (`7.7% SAVED SO FAR` • `3 of 4 weeks completed`).
3. Select **Week 2** to inspect its categories and transactions.
4. Tap any **Quick Demo Expense** (e.g. `+ ₹40 Food`, `+ ₹250 Groceries`) or tap **+ Add Expense**.
5. Tap **Finish Week 2** $\to$ triggers the weekly result modal with percentage saved/over and prompt to move to Week 3.
6. When all 4 weeks are finished, the **Monthly Celebration Screen** awards your final monthly savings percentage.
