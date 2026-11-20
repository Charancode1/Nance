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

## 2. Simple Monthly & Weekly Budget Settings

A compact, subtle **Set Budget** sheet accessible right above the four weekly boxes or via the header:

- **Starts Clean at ₹0**:
  - For a new user, all budgets start at ₹0 (Monthly: ₹0, Week 1: ₹0, Week 2: ₹0, Week 3: ₹0, Week 4: ₹0).
  - No hardcoded demo budgets are prefilled.
  - Users decide and configure their own monthly budget and 4 independent weekly budgets.
- **Week 1 is Fully Editable**:
  - Week 1 is not locked by default.
  - Users can configure and edit Week 1's budget before finishing the week.
  - Upcoming weeks also remain editable.
  - Completed weeks preserve their historical budget and recorded result.
- **Section A: Overall Monthly Spending Budget**:
  - Sets the planned monthly ceiling (e.g. ₹10,000).
- **Section B: Independent Weekly Budgets**:
  - Users can assign different amounts to different weeks (e.g. Week 1: ₹4,000 for rent/deposits, Week 2: ₹2,000, Week 3: ₹2,000, Week 4: ₹2,000).
  - **No forced equal division**: Flexible for real-life monthly cash flows.
  - **"Distribute Remainder"** one-tap helper to easily spread unallocated funds across upcoming weeks.
- **Section C: Allocation Breakdown & Gentle Warnings**:
  - Real-time indicator comparing total allocated weekly budgets with total monthly budget.
  - Emerald badge if exactly 100% is planned; info badge if buffer remains unallocated; gentle amber note if allocations exceed monthly ceiling (saving is always permitted).
- **Zero-Budget Calculation Safety**:
  - Zero budgets never produce `NaN`, `Infinity`, or false 100% savings.
  - Clean neutral state: *"Set your weekly budget to start."*
  - Add Expense functionality and all schema categories remain completely accessible at ₹0 budget.

---

## 3. Mobile Screen Structure

1. **Header**: Nance Weekly Wins with quick Set Budget, rules/info, and reset demo controls.
2. **Budget Status Bar**: Subtle indicator (`Plan: ₹0 / mo • [Set Budget]`) right above the 4 boxes.
3. **Four Weekly Boxes (W1, W2, W3, W4)**:
   - Compact row at the top displaying each week's percentage and status dot.
   - States: Green (`+20% Saved`), Amber (`8% Over`), Neutral Slate (`Not Set` / `In Progress`).
   - Tapping any box selects that week.
4. **Selected Week Tracker**:
   - Week number & date range (e.g. `Week 1` • `Oct 1 – Oct 7`).
5. **Weekly Budget Summary**:
   - 3-column compact summary: **Budget**, **Spent**, and **Remaining / Exceeded / Balance**.
6. **Category Spending (Compact Two-Column Percentage Cards)**:
   - Each card displays Category Name, Amount Spent, Percentage of Total Weekly Spend, and visual mini progress bar:
     $$\text{Category Percentage} = \left(\frac{\text{Category Spending}}{\text{Total Eligible Weekly Spending}}\right) \times 100$$
7. **Quick Demo Expenses**:
   - 1-tap quick buttons (`+ ₹40 Food`, `+ ₹250 Groceries`, `+ ₹60 Auto`, `+ ₹180 Shopping`).
8. **Add Expense**:
   - Button and modal form for custom expense entries (Amount, Category, Date, Payment Mode, Merchant Name).
9. **Finish Week Action**:
   - Prominent **Finish Week** button at the bottom of the active week.

---

## 4. Persistence Across Page Refreshes

All state (`monthlyBudget`, `weeklyBudgets`, `transactions`, `selectedWeekIndex`, completion flags) is synchronized with `localStorage`.
- Custom monthly & weekly budget configurations, completed weeks, added expenses, and weekly win results remain preserved on page reload.
- Tapping **Reset Demo** clears storage and restores clean ₹0 default budgets and empty state.

---

## 5. Verification & Testing

### Automated Unit Tests (Vitest)
```bash
npm test
```

### Python SQLite Verification
```bash
python scripts/verify_calculations.py
```

### Production Build
```bash
npm run build
```

---

## 6. How to Test the 10 User Scenarios

```bash
npm run dev
```

Visit `http://localhost:5173`:
1. **First Launch**: All budgets start at ₹0. Boxes show `Not Set`. Tracker shows `Set your weekly budget to start.`
2. **Set Week 1 Budget**: Tap **Set Budget**, enter Monthly: `₹10,000`, Week 1: `₹2,500`, Weeks 2–4: `₹2,500`. Tap **Save Budget** $\to$ Week 1 reflects `₹2,500` budget.
3. **Edit Week 1 Budget**: Tap **Set Budget** again, change Week 1 to `₹3,000`. Save $\to$ Week 1 updates to `₹3,000`.
4. **Set Different Budgets**: Set Week 1 to `₹4,000` (rent), Week 2 to `₹2,000`, Week 3 to `₹2,000`, Week 4 to `₹2,000`.
5. **Add Expenses Without Budget**: Even with ₹0 budget, tap **+ Add Expense** or Quick Demo buttons $\to$ transactions recorded and category breakdown updates with zero calculation errors.
6. **Refresh the Page**: Press `F5` / reload $\to$ all configured budgets, transactions, and selected week remain completely intact.
7. **Complete Week 1**: Tap **Finish Week 1** $\to$ shows celebration modal (or neutral completion if ₹0). Its win/over result is locked and preserved after refresh.
8. **Week 2 Remains Editable**: After Week 1 is completed, open **Set Budget** $\to$ Week 1 is locked (`Finished 🔒`), while Week 2, 3, 4 remain fully editable.
9. **Zero-Budget Safety**: Zero budget weeks never divide by zero, show `NaN`, or produce false wins.
10. **Reset Demo**: Tap the reset button in the header $\to$ returns all budgets to ₹0, clears transactions, and resets progress cleanly.

---

## 7. Habit Feature 2: SAVE FIRST

> **"Save a little first. Build a better tomorrow."**

A dedicated, separate second habit feature designed for Indian students and young professionals who want to develop a consistent savings habit by reserving savings **before** spending.

### Core Architecture & Independence
- **Weekly Wins**: Build discipline by controlling weekly spending within budget limits.
- **Save First**: Build discipline by setting aside a specific savings target first.
- **Complete Independence**:
  - Independent storage keys (`nance_weekly_wins_data` vs `nance_save_first_data`).
  - Independent state, calculations, and data persistence.
  - Resetting Save First never affects Weekly Wins.
  - Top navigation bar allows seamless page navigation between `/weekly-wins` and `/save-first` with HTML5 History API and full page identity.

### Core Concept: Save Before You Spend
$$\text{Weekly Spending Limit} = \text{Weekly Budget} - \text{Weekly Savings Goal}$$

Example:
- Weekly Budget: ₹1,000
- Weekly Savings Goal: ₹100
- Weekly Spending Limit: ₹900
The user reserves ₹100 for savings and manages their daily expenses within the ₹900 limit.

### Automatic Savings Calculation Engine
No manual savings entry or separate savings transaction tracking:
$$\text{Amount Saved} = \max(0, \text{Weekly Budget} - \text{Actual Eligible Spending})$$

| Weekly Budget | Savings Goal | Actual Spending | Amount Saved | Status | Result Copy |
|:---|:---|:---|:---|:---|:---|
| ₹1,000 | ₹100 | ₹900 | **₹100** | Goal Met! | *Congratulations! 🎉 You set aside ₹100 this week. Your savings goal is achieved!* |
| ₹1,000 | ₹100 | ₹850 | **₹150** | +₹50 Extra! | *Congratulations! 🎉 You set aside ₹150 this week. Your savings goal is achieved! (₹50 extra saved!)* |
| ₹1,000 | ₹100 | ₹950 | **₹50** | ₹50 / ₹100 Saved | *You're getting there! You managed to keep ₹50 aside this week. You were ₹50 short of your goal. You can try again next week. Keep going!* |
| ₹1,000 | ₹100 | ₹1,050 | **₹0** | Over Budget | *Don't worry! This week didn't go as planned. Every new week is another opportunity to save. Keep going!* |

### Pre-Completion vs. Post-Completion Savings Display
- **Before Clicking Finish Week (`!isCompleted`)**:
  - Displays neutral **POTENTIAL SAVINGS** card:
    $$\text{Potential Savings} = \max(0, \text{Weekly Budget} - \text{Actual Eligible Spending})$$
  - Message when spending is ₹0: *"Stay within your spending limit to reach your ₹250 savings goal!"*
  - Message when spending is ₹530: *"You're on track! Keep spending mindfully to reach your savings goal."*
  - Does NOT show premature "Amount Saved", "Savings Goal Achieved", savings percentages (no "400%"), or celebration badges.
  - Category spending features horizontal progress bars scaled by share of total spending with top category highlighting.
  - Supporting caption: *"See where your money goes and find opportunities to save more next week."*
- **After Clicking Finish Week (`isCompleted`)**:
  - Finalizes actual amount saved, goal achievement percentage, celebration badges, and triggers completion modal.

### Weekly Completion Feedback Scenarios
Whenever the user taps **Finish Week**, the app calculates savings and opens a dedicated weekly result modal:
- **Scenario A (Goal Achieved)**: Emerald green celebration with trophy, congratulations message, and optional extra savings callout.
- **Scenario B (Below Goal)**: Supportive encouragement noting the exact amount kept aside and the shortfall.
- **Scenario C (Overspent / Missed Goal)**: Zero-guilt encouraging message reminding that every new week is another opportunity to save.
- **Zero-Budget Neutral**: Explains that budget and savings goal were not configured.

### Monthly Savings Summary
- Sums `amountSaved` across **completed weeks only** (unfinished weeks do not contribute).
- Displays:
  - *"Congratulations! You kept ₹{totalAmountKeptAside} aside this month!"*
  - *"That's {percentOfBudgetKeptAside}% of your total monthly budget kept aside."*
  - 4 weekly chips showing each week's saved amount.
  - Confetti burst on celebration.
