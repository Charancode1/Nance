# Nance Weekly Wins – Student Financial Discipline Feature

> **"Small weekly wins. Better money habits."**

Interactive web demo and financial calculation engine for **Nance**, an Indian personal finance app designed for college students living in hostels and PGs who manage a fixed monthly allowance from their parents.

---

## 1. Product Context & Philosophy

College students receiving a monthly allowance often face the **"month-end crunch"**: spending freely in the first two weeks and struggling on Maggi and borrowed money in the final week.

### Example User Persona
- **Monthly Allowance**: ₹10,000 (from parents)
- **Fixed PG Rent**: ₹5,000 (fixed commitment, isolated outside weekly spending)
- **Flexible Monthly Budget**: ₹5,000 (₹10,000 – ₹5,000)
- **Planned Weekly Spending**: ₹1,000 / week (4-week total: ₹4,000)
- **Monthly Savings Target**: ₹500
- **Unallocated Buffer**: ₹500

### The Core Habit Loop: Weekly Wins
Instead of intimidating students with complex monthly budgeting, **Weekly Wins** breaks the month into bite-sized weekly limits:
1. **Pace**: Spend within ₹1,000 each week.
2. **Win**: Celebrate staying within budget with satisfying visual badges and contribution heatmap blocks.
3. **Recover**: If an off-week happens (e.g. ₹1,050 in Week 2), **cumulative progress is never destroyed or reset**. Spending less in Week 3 (e.g. ₹800) recovers cumulative performance and protects the monthly goal!

---

## 2. Feature Walkthrough

### A. Monthly Money Plan
- Visual blueprint displaying Monthly Allowance (₹10,000), Fixed PG Rent (₹5,000), Flexible Pool (₹5,000), 4-Week Planned Spending (₹4,000), and Savings Target (₹500).
- **Fixed Commitment Isolation**: Rent is categorized as a fixed obligation and never counts against flexible weekly spending.
- **Interactive Plan Customizer**: Allows students to adjust allowance, rent, weekly budgets, and savings target with instant recalculations.

### B. Weekly Spending Tracker
- Four dedicated week cards (Week 1 to Week 4) showing:
  - Weekly spending limit.
  - Actual eligible spending.
  - Remaining budget (Under budget) or Overspending.
  - Percentage variance under/over budget.
  - Weekly achievement status badge.
- Interactive category expense breakdown for each week (Food & Dining, Groceries, Transportation, Shopping, Entertainment, Personal Care).

### C. Weekly Wins Calendar
- **GitHub Contribution Calendar Visualization**:
  - **Emerald Green**: Within budget (Weekly Win!).
  - **Warm Amber**: Above budget (Empathetic note).
  - **Slate Grey**: Upcoming / Rest days.
- **28-Day Heatmap Grid**: Daily spend density indicator showing mindful vs heavy spending days.
- **Interactive Micro-interactions**: Clicking any week card filters the view and fires confetti for claimed weekly wins!

### D. Cumulative Monthly Progress (Core Feature)
- **Mathematical Formula**:
  $$\text{Monthly Planned Flexible Budget} = \sum_{i=1}^{4} \text{Weekly Budget}_i = ₹4,000$$
  $$\text{Monthly Under-Budget Amount} = \text{Total Planned Budget} - \text{Total Actual Eligible Spending} = ₹4,000 - ₹3,600 = +₹400$$
  $$\text{Monthly Performance \%} = \left(\frac{\text{Monthly Under-Budget Amount}}{\text{Total Planned Budget}}\right) \times 100 = 10\% \text{ under budget}$$
- **The Non-Punitive Recovery Stepper**:
  - Displays the 4-week cumulative trajectory: Week 1 (+₹100) $\to$ Week 2 (+₹50 net) $\to$ Week 3 (+₹250 net, **Recovered!**) $\to$ Week 4 (+₹400 net, **Finished Strong!**).
  - Demonstrates that one overspending week does **not** wipe out student progress.
- **Accurate Financial Terminology**: Termed **"unspent planned budget"** or **"under-budget amount"** (not "confirmed savings", as bank savings cannot be established purely from debit transaction logs).

### E. Transaction Breakdown & Audit Log
- Interactive expense ledger with search, category filtering, and week isolation.
- **Eligibility Badges**: Clearly flags whether an expense is an *Eligible Flexible Debit* (counts against weekly budget) or an *Excluded Outflow* (Rent, Credit Card Settlements, ATM Cash, Self Transfers, Friend Loans).

---

## 3. Database Schema

The implementation builds on the supplied database schema:

```sql
-- Existing Tables
users (user_id, name, city, joined_on)
transactions (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, main_category, sub_category, merchant_name, person_name, source, arrived_at)
budgets (budget_id, user_id, main_category, period_type, amount, from_date, to_date)
app_activity (activity_id, user_id, date)

-- Additional Table: user_financial_profile
-- Reason: Captures student life stage, hostel/PG living arrangement, monthly allowance,
-- fixed rent, and savings targets required to personalize weekly budgets.
user_financial_profile (user_id, life_stage, living_arrangement, monthly_allowance, fixed_rent, monthly_savings_target)

-- Additional Table: weekly_budget_progress
-- Reason: Persists computed weekly achievement history for fast retrieval and contribution calendar rendering.
weekly_budget_progress (progress_id, user_id, week_start, week_end, budget_amount, actual_spending, under_budget_amount, status)
```

---

## 4. Transaction Calculation & Accounting Rules

1. **Eligible Debits Included in Weekly Flexible Spending**:
   - `Groceries` (Blinkit, Zepto, Local Kirana, Nature's Basket)
   - `Food & Dining` (Swiggy, Zomato, Campus Canteen, Mess Extras, Chai Point)
   - `Transportation` (Auto QR, Namma Yatri, Metro card recharge, Uber)
   - `Shopping` (Stationery, College notes, Books, Apparel)
   - `Entertainment` (BookMyShow student tickets, Spotify, Steam)
   - `Personal Care` (Apollo Pharmacy, Grooming, Toiletries)

2. **Excluded Transactions**:
   - `Rent`: Handled as a fixed commitment outside flexible weekly budgets.
   - `Self Transfers`: Wallet loads (Paytm/PhonePe) or transfers between own accounts.
   - `Credit Card Payments & Settlements`: Excluded to avoid double-counting card purchases.
   - `Investments (Outflow)`: Mutual fund SIPs, Groww/Zerodha.
   - `Cash Withdrawals`: ATM cash withdrawals (spending is tracked at transaction time).
   - `Lend & Borrow`: Hostel splits and repayments to friends.

3. **Date & Type Rules**:
   - Strictly filter on `txn_date` (the actual transaction date) rather than `arrived_at` (SMS parsing/feed arrival).
   - Only count `transaction_type = 'debit'`.

4. **Ethical Health & Essentials Policy**:
   - The app explicitly states: **"Never skip essential purchases such as groceries, medicine, doctor visits, or rent just to protect a streak."** Physical and mental health always take precedence over a gamified badge.

---

## 5. Synthetic Personas

The database comes pre-seeded with 4 realistic Indian student profiles:
1. **Aarav Sharma (Bengaluru)** – *The Canonical Recovery Story*:
   - Allowance: ₹10,000 | Rent: ₹5,000 | Weekly Budget: ₹1,000 | Savings Target: ₹500
   - W1: ₹900 spent (Win, 10% under)
   - W2: ₹1,050 spent (Above budget by ₹50)
   - W3: ₹800 spent (Win, Recovered!)
   - W4: ₹850 spent (Win, Finished strong!)
   - **Month Total**: ₹3,600 spent of ₹4,000 budget $\to$ **₹400 unspent planned budget (10% under budget)**.
2. **Sneha Patel (Pune)** – *The Disciplined Saver*: 4 out of 4 Weekly Wins achieved.
3. **Rohan Verma (Delhi)** – *The Fest Spender*: High Week 2 blowout, recovered by cooking in room in Week 3 & 4.
4. **Ananya Iyer (Chennai)** – *Essential Care Case*: Emergency pharmacy & doctor consultation handled gracefully without shame.

---

## 6. How to Run & Test

### Prerequisites
- Node.js (v18+) & npm
- Python (3.9+)

### 1. Regenerate Synthetic Data
```bash
python scripts/generate_synthetic_data.py
```
*Generates the SQLite database `nance_weekly_wins.db` and exports `src/data/mockData.json`.*

### 2. Run Python Calculation Verification
```bash
python scripts/verify_calculations.py
```

### 3. Run Automated Unit Tests (Vitest)
```bash
npm test
```

### 4. Build and Preview the Web App
```bash
npm run build
npm run preview
```
Or start live development server:
```bash
npm run dev
```

---

## 7. Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti.
- **Backend / Data**: SQLite3, Python 3.10, JSON data pipeline.
- **Testing**: Vitest, Python Assertions.
- **Build**: Vite 6.
