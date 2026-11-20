# Nance Weekly Wins – Mobile-First Weekly Habit Tracker

> **"Small weekly wins. Better money habits."**

A minimal, mobile-first weekly habit tracker for **Nance**.

Designed around an intuitive, scannable weekly habit loop:

$$\text{4 Weekly Boxes} \longrightarrow \text{Selected Week Tracker} \longrightarrow \text{Category Percentage Cards} \longrightarrow \text{Finish Week} \longrightarrow \text{Weekly Completion Celebration} \longrightarrow \text{Month-End Celebration}$$

---

## 1. Weekly Completion Modal Scenarios

Whenever the user taps **Finish Week**, the app calculates the weekly difference and percentage, updates the top box, recalculates cumulative progress, and triggers an immediate feedback experience:

### Scenario A: User Finishes Under Budget (Emerald Green Celebration)
- **Trophy Icon 🏆** with `WEEKLY WIN!` badge.
- **Headline**: *You saved 20% of your planned budget this week!*
- **Subheading**: *Congratulations! 🎉*
- **Mindful Habit Message**:
  - *"You stayed within your spending limit and made mindful money decisions."*
  - *"Keep this momentum going. Another week, another opportunity to build a better money habit!"*
- **Weekly Summary Card**: Budget, Spent, and Under Budget amount.
- **Subtle Celebration Animation**: Triggers gentle celebratory particle effects (`fireWinConfetti()`).
- **Button**: `[ Continue to Week X+1 → ]` (advances view to next week).

### Scenario B: User Finishes Above Budget (Soft Amber Encouragement)
- **Supportive Heart Icon 💚** with `THIS WEEK IS COMPLETE!` badge.
- **Headline**: *You went 10% over your budget this week.*
- **Zero-Guilt Encouraging Copy**:
  - *"Don't worry! One difficult week doesn't define your progress."*
  - *"Come on, you can get back on track! Next week is a fresh opportunity to spend mindfully and stay within your budget."*
- **Weekly Summary Card**: Budget, Spent, and Above Budget amount.
- **Button**: `[ Continue to Week X+1 → ]`

### Scenario C: Week 4 Completion (Final Monthly Celebration)
- When Week 4 is completed, the app persists the Week 4 result and immediately opens the **Final Monthly Completion Modal** without overlapping dialogs.
- Displays:
  - Week 4 Result Highlight (e.g. `Week 4 Result: +20% Saved`).
  - Total percentage saved across all four completed weeks (e.g. `You saved 11.1% of your planned budget this month!`).
  - 4-week summary chips (`W1`, `W2`, `W3`, `W4`).
  - Number of weekly wins claimed (e.g. `3 of 4 Weekly Wins`).
  - Total Unspent Planned Budget amount.
  - Option to `[ Start a New Month ]`.

---

## 2. Mobile Screen Structure

1. **Header**: Nance Weekly Wins with rules/info and reset demo controls.
2. **Four Weekly Boxes (W1, W2, W3, W4)**:
   - Compact row at the top displaying each week's percentage and status dot.
   - States: Green (`+20% Saved`), Amber (`8% Over`), Grey (`Not Started` / `In Progress`).
   - Tapping any box selects that week.
3. **Selected Week Tracker**:
   - Week number & date range (e.g. `Week 2` • `Oct 8 – Oct 14`).
4. **Weekly Budget Summary**:
   - 3-column compact summary: **Budget**, **Spent**, and **Remaining** / **Exceeded**.
5. **Category Spending (Compact Two-Column Percentage Cards)**:
   - Each card displays Category Name, Amount Spent, Percentage of Total Weekly Spend, and visual mini progress bar:
     $$\text{Category Percentage} = \left(\frac{\text{Category Spending}}{\text{Total Eligible Weekly Spending}}\right) \times 100$$
6. **Quick Demo Expenses**:
   - 1-tap quick buttons (`+ ₹40 Food`, `+ ₹250 Groceries`, `+ ₹60 Auto`, `+ ₹180 Shopping`).
7. **Add Expense**:
   - Button and modal form for custom expense entries (Amount, Category, Date, Payment Mode, Merchant Name).
8. **Finish Week Action**:
   - Prominent **Finish Week** button at the bottom of the active week.

---

## 3. Persistence Across Page Refreshes

All state (`monthlyBudget`, `weeklyBudgets`, `transactions`, `selectedWeekIndex`, completion flags) is synchronized with `localStorage`.
- Completed weeks, added expenses, and weekly win results remain preserved on page reload.
- Tapping **Reset Demo** clears storage and restores the default initial state cleanly.

---

## 4. Verification & Testing

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
# Output: ✓ built in 4.08s (zero TypeScript errors)
```

---

## 5. How to Test the New Modal Experience

```bash
npm run dev
```

Visit `http://localhost:5173`:
1. Tap **Week 2** (currently in progress with ₹1,400 spent on ₹2,500 budget).
2. Tap **Finish Week 2** $\to$ immediately triggers the **Weekly Win Modal** (`You saved 44% of your planned budget this week!`, Congratulations 🏆, and confetti).
3. Tap **Continue to Week 3** $\to$ automatically advances to Week 3.
4. Add quick expenses (e.g. tap `+ ₹250 Groceries` multiple times or add custom expenses) until it exceeds the ₹2,000 budget $\to$ tap **Finish Week 3** $\to$ triggers the **Supportive Over-Budget Modal** (`You went 10% over your budget this week`, 💚 friendly message, *"You can recover next week. Keep going!"*).
5. Complete **Week 4** $\to$ triggers the **Final Monthly Completion Modal** displaying all 4 weekly outcomes and your final monthly savings percentage.
