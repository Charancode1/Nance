# Nance Weekly Wins – Mobile-First Weekly Habit Tracker

> **"Small weekly wins. Better money habits."**

A minimal, refined mobile-first weekly habit tracker for **Nance**.

Designed around an intuitive, scannable weekly habit loop:

$$\text{4 Weekly Boxes} \longrightarrow \text{Selected Week Tracker} \longrightarrow \text{Category Percentage Cards} \longrightarrow \text{Finish Week} \longrightarrow \text{Month-End Celebration}$$

---

## 1. Mobile Screen Structure

The interface is structured in the exact required order without visual clutter:

1. **Header**: Nance Weekly Wins with quick rules/audit info and reset demo controls.
2. **Four Weekly Boxes (W1, W2, W3, W4)**:
   - Compact row at the top displaying each week's percentage and status dot.
   - Dynamic states:
     - **Green**: Completed under budget (`+20% Saved`).
     - **Amber**: Completed over budget (`8% Over`).
     - **Grey**: Upcoming or not completed (`Not Started` / `In Progress`).
     - **Highlight Ring**: Currently active/selected week.
   - Tapping any box selects that week and immediately loads its tracker below.
3. **Selected Week Tracker**:
   - Week number & date range (e.g. `Week 2` • `Oct 8 – Oct 14`).
4. **Weekly Budget Summary**:
   - 3-column compact summary: **Budget**, **Spent**, and **Remaining** / **Exceeded**.
5. **Category Spending (Compact Two-Column Percentage Cards)**:
   - Replaces long vertical rows with a neat **two-column card grid**.
   - Each card contains:
     - Category name (e.g. `Groceries`, `Food & Dining`, `Transportation`, `Shopping`).
     - Amount spent (`₹500`, `₹450`, etc.).
     - Percentage of total eligible weekly spending:
       $$\text{Category Percentage} = \left(\frac{\text{Category Spending}}{\text{Total Eligible Weekly Spending}}\right) \times 100$$
     - Subtle visual progress bar.
   - Only displays categories that have actual spending, sorted by highest spending first.
6. **Quick Demo Expenses**:
   - 1-tap quick buttons (`+ ₹40 Food`, `+ ₹250 Groceries`, `+ ₹60 Auto`, `+ ₹180 Shopping`) for instant test recalculation.
7. **Add Expense**:
   - Button and modal form for custom expense entries (Amount, Category, Date, Payment Mode, Merchant Name).
8. **Finish Week Action**:
   - Prominent **Finish Week** button at the bottom of the active week.
   - Calculates weekly spending vs budget and triggers the positive celebration or supportive over-budget dialog with prompt to advance to the next week.

---

## 2. Preserved Calculation & Habit Logic

- **Completed-Weeks Cumulative Progress**:
  $$\text{Completed Weekly Budget} = \sum \text{budgets for completed weeks}$$
  $$\text{Completed Weekly Spending} = \sum \text{eligible spending in completed weeks}$$
  $$\text{Monthly Progress \%} = \left(\frac{\text{Completed Weekly Budget} - \text{Completed Weekly Spending}}{\text{Completed Weekly Budget}}\right) \times 100$$
- **Final Monthly Celebration**: Triggers when all 4 weeks are finished, celebrating the cumulative savings percentage across all 4 weeks (e.g. `You saved 11.1% of your planned budget this month!`).
- **Dynamic Overspending Recovery**: An overspending week never destroys cumulative progress; past wins and subsequent mindful weeks protect the habit.
- **Transaction Eligibility**: Filters consumption debits and excludes money movements (Credit Card settlements, ATM cash withdrawals, self transfers, friend loans).
- Strictly uses `txn_date` rather than `arrived_at`.

---

## 3. Verification & Testing

### Automated Unit Tests (Vitest)
```bash
npm test
# Output: ✓ src/services/budgetCalculator.test.ts (9 tests passed in 22ms)
```

### Python SQLite Verification
```bash
python scripts/verify_calculations.py
# Output: ALL SIMPLIFIED CALCULATIONS VERIFIED AGAINST SQLITE DATABASE SUCCESSFULLY!
```

### Production Build
```bash
npm run build
# Output: ✓ built in 3.98s (zero TypeScript errors)
```

---

## 4. How to Run the Demo

```bash
npm run dev
```

Visit `http://localhost:5173`:
- See the **Four Weekly Boxes** at the top. Week 1 is finished (`+20% Saved`).
- Week 2 tracker is open with its **3-column summary** (Budget, Spent, Remaining).
- Inspect the **Two-Column Category Percentage Cards** (e.g. Groceries ₹520 • 37.1%, Shopping ₹350 • 25.0%, etc.).
- Tap any **Quick Demo Expense** to watch the category cards and remaining budget recalculate in real time.
- Tap **Finish Week 2** $\to$ locks the week, updates the top box to green or amber, and offers to advance to Week 3.
- When Week 4 finishes, the **Final Monthly Celebration Screen** displays your total percentage saved this month.
