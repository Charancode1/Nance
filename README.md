# Nance Weekly Wins – User-Controlled Budgeting Habit Demo

> **"Small weekly wins. Better money habits."**

A simple, user-controlled financial discipline demo for **Nance**.

Rather than hardcoding student allowances, PG rent, or fixed lifestyle assumptions, this feature works for **any user** who wants to set an overall monthly budget, allocate weekly spending limits, track expenses by category, finish each week to claim weekly wins, and see their cumulative monthly performance.

---

## 1. Core User Flow

The entire experience centers around one intuitive habit loop:

```
1. Set Monthly Budget
       │
       ▼
2. Allocate Weekly Budgets (Weeks 1 to 4)
       │
       ▼
3. Add Expenses during the Week (Auto Category-wise Aggregation)
       │
       ▼
4. Click "Finish Week" ──► Calculates % Under/Over & Awards Weekly Win
       │
       ▼
5. Repeat for Next Week
       │
       ▼
6. View Final Monthly Results across all Completed Weeks
```

---

## 2. Key Features

### A. Monthly Budget Setup & Overview
- **User-Controlled Limits**: Set any monthly budget (e.g. ₹10,000) and divide it across 4 weeks (e.g. ₹2,000, ₹2,500, ₹2,000, ₹2,500).
- **Auto-Split Utility**: Quickly split unallocated monthly budget evenly across weeks.
- **Allocation Health Indicator**: Clear visual feedback showing allocated weekly totals versus monthly budget ceiling and unallocated buffer.
- **Provisional vs Final Indicator**: Clearly flags whether current progress is **Month-to-Date (Provisional)** or **Final Monthly Result** once all 4 weeks are finished.

### B. Weekly Wins Overview Strip
- Compact 4-week overview card strip showing:
  - Week code & date range.
  - Weekly budget limit.
  - Total eligible amount spent.
  - Result status:
    - **Green badge**: `+20% Win` (completed under budget).
    - **Amber badge**: `-8% Over` (completed over budget).
    - **Grey badge**: `In Progress` (unfinished week).
- Click any week to immediately switch context and inspect its category breakdown and transactions.

### C. Weekly Expense Tracker (The Core Interaction)
For the selected active week, the app displays:
- Weekly budget, total spent, remaining budget, and spending percentage.
- **Finish Week Action**:
  - Prominent **Finish Week** button.
  - Calculates weekly difference: `Weekly Budget - Total Eligible Weekly Spending`.
  - Calculates weekly percentage: `(Weekly Difference / Weekly Budget) * 100`.
  - **Weekly Win (Under Budget)**: Green badge and positive feedback:
    > *"You stayed 20% under budget! You kept ₹400 unspent."*
  - **Above Budget (Overspending)**: Warm amber badge with zero-guilt encouragement:
    > *"You went 10% over this week's budget. That's okay. You can start fresh next week."*
  - Locks the week as completed and preserves its result without duplicate triggers. Includes a **Reopen** option if the user needs to adjust.

### D. Category-Wise Spending Breakdown
Expenses are automatically grouped from eligible debit transactions belonging to the selected week:
- Food & Dining
- Groceries
- Transportation
- Shopping
- Bills
- Entertainment
- Personal Care
- Other categories from the official taxonomy.

Each category displays the amount spent, percentage of week's total spending, and transaction count with visual bars.

### E. Add Demo Expenses (Interactive Simulator)
- **Add Custom Expense Form**: Enter Amount, Category, Date, Payment Mode (UPI, Card, Cash, Net Banking), and Merchant Name.
- **1-Click Sample Expense Buttons**: Instantly add common expenses (`+ ₹40 Food & Dining`, `+ ₹250 Groceries`, `+ ₹60 Transportation`, `+ ₹180 Shopping`) to watch category totals, remaining budget, and weekly results recalculate in real time.

### F. Overall Monthly Results
- Calculated from **actual transactions** across the month, not by averaging weekly percentages.
- Displays:
  - Monthly budget.
  - Total eligible spending.
  - Unspent planned budget (or overspending).
  - Monthly percentage under/over budget.
  - Number of weekly wins claimed (e.g. 3 of 4 weeks).
  - Full week-by-week audit table.
- **Accurate Terminology**: Called **"Unspent Planned Budget"** or **"Under Budget"** (never "confirmed savings", as bank savings cannot be established purely from debit transaction logs).

---

## 3. Mathematical Formulas

### Weekly Formulas
$$\text{Weekly Difference} = \text{Weekly Budget} - \text{Total Eligible Weekly Spending}$$

$$\text{Weekly Percentage} = \left(\frac{\text{Weekly Difference}}{\text{Weekly Budget}}\right) \times 100$$

### Monthly Formulas
$$\text{Monthly Difference} = \text{Monthly Budget} - \text{Total Monthly Eligible Spending}$$

$$\text{Monthly Percentage} = \left(\frac{\text{Monthly Difference}}{\text{Monthly Budget}}\right) \times 100$$

---

## 4. Transaction Eligibility & Accounting Rules

To prevent distorted spending numbers and double-counting:

### Included Eligible Spending
Debits from legitimate expense categories:
- Food & Dining, Groceries, Shopping, Bills, Travel, Transportation, Fuel / EV Charging, Entertainment, Subscriptions, Housing & Utilities, Personal Care, Hospitals & Pharmacy, Fitness & Wellness, Education, Gifts & Donations, Electronics, Insurance Premiums, EMIs & Loans.

### Excluded Money Movements
Filtered out automatically to avoid double-counting:
- **Credit Card Settlements & Payments**: Prevents double-counting card purchases already accounted for at transaction time.
- **Self Transfers**: Internal transfers between accounts or digital wallet top-ups.
- **Cash Withdrawals (ATM)**: Outflow counted when spent on actual purchases.
- **Investments (Outflow)**: SIPs / Mutual funds / Stock investments (capital allocations, not consumption).
- **Lend & Borrow**: Temporary peer splits and repayments.
- **Friends & Family**: Peer-to-peer money transfers.

### Attribution Rule
Transactions are strictly filtered using **`txn_date`** (the actual purchase date) rather than `arrived_at` (feed parsing arrival).

---

## 5. Database Schema

Built directly on the assignment schema in SQLite (`nance_weekly_wins.db`):

```sql
-- 1. Users
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    joined_on TEXT NOT NULL
);

-- 2. Budgets (Used for both monthly ceiling and weekly targets)
CREATE TABLE budgets (
    budget_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    main_category TEXT NOT NULL,
    period_type TEXT NOT NULL,       -- 'monthly' or 'weekly'
    week_index INTEGER,              -- 1, 2, 3, 4 for weekly records
    amount REAL NOT NULL,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,  -- 1 when user clicks "Finish Week"
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. Transactions
CREATE TABLE transactions (
    txn_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    txn_date TEXT NOT NULL,
    txn_time TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_type TEXT NOT NULL,  -- 'debit' or 'credit'
    payment_mode TEXT NOT NULL,      -- 'UPI', 'Card', 'Net Banking', 'Cash'
    main_category TEXT NOT NULL,
    sub_category TEXT,
    merchant_name TEXT,
    person_name TEXT,
    source TEXT,
    arrived_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. App Activity
CREATE TABLE app_activity (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 6. Verification & Automated Test Suite

The test suite validates all 10 required behaviors:
1. Weekly spending calculation.
2. Category-wise aggregation.
3. Under-budget percentage (`₹2,000` budget, `₹1,600` spent $\to$ `20% under budget`).
4. Overspending percentage (`₹2,000` budget, `₹2,200` spent $\to$ `10% above budget`).
5. Monthly calculation across multiple weeks (`₹10,000` budget, `₹8,000` spent $\to$ `20% under budget`).
6. Transactions excluded from eligible spending (Transfers, Cash, Settlements, Investments).
7. Credit card settlement double-counting prevention.
8. Week completion and duplicate completion prevention.
9. Expenses added after a week is completed.
10. Incomplete weeks and provisional month-to-date calculations.

### Run Python Verification
```bash
python scripts/verify_calculations.py
```

### Run Vitest Unit Tests
```bash
npm test
```

### Build Check
```bash
npm run build
```

---

## 7. How to Run the Demo

```bash
# Start live development server
npm run dev
```

Visit `http://localhost:5173`:
1. Check or customize your **Monthly & Weekly Budgets** via the **"Set Budgets"** button.
2. Review the **4-Week Strip**; Week 1 is already finished (20% Win) and Week 2 is in-progress.
3. Click any **"+ Add Demo Expense"** button or add a custom expense to watch category bars and remaining budget update instantly.
4. Click **"Finish Week"** on Week 2 to calculate its result and award a Weekly Win or Above Budget badge.
5. Check the **Overall Monthly Results** card at the bottom to see your updated month-to-date and completed weeks summary.
6. Click **"Reset Demo"** at any time to start fresh.
