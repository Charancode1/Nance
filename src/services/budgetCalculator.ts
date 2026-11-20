import {
  Transaction,
  Budget,
  WeeklyCalculation,
  MonthlyCalculation,
  CategorySpend,
  RecoveryPoint,
} from '../types';

export const ELIGIBLE_SPENDING_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Bills',
  'Travel',
  'Transportation',
  'Fuel / EV Charging',
  'Entertainment',
  'Subscriptions',
  'Housing & Utilities',
  'Personal Care',
  'Hospitals & Pharmacy',
  'Fitness & Wellness',
  'Education',
  'Gifts & Donations',
  'Electronics',
  'Insurance Premiums',
  'EMIs & Loans',
  'General Merchandise',
] as const;

export const ELIGIBLE_CATEGORIES_SET = new Set<string>(ELIGIBLE_SPENDING_CATEGORIES);

export const EXCLUDED_CATEGORIES = [
  'Self Transfers',
  'Credit Card Payments',
  'Credit Card Settlements',
  'Investments (Outflow)',
  'Cash Withdrawals',
  'Lend',
  'Borrow',
  'Friends & Family',
] as const;

export const EXCLUDED_CATEGORIES_SET = new Set<string>(EXCLUDED_CATEGORIES);

/**
 * Determines whether a transaction is an eligible consumption spending debit.
 */
export function isEligibleTransaction(txn: Transaction): boolean {
  if (txn.transaction_type !== 'debit') {
    return false;
  }
  if (EXCLUDED_CATEGORIES_SET.has(txn.main_category)) {
    return false;
  }
  return ELIGIBLE_CATEGORIES_SET.has(txn.main_category);
}

/**
 * Returns human-readable explanation of why a transaction is excluded.
 */
export function getExclusionReason(txn: Transaction): string | null {
  if (txn.transaction_type !== 'debit') {
    return 'Excluded: Credit transaction (Income/Inflow), not an expense';
  }
  if (txn.main_category === 'Credit Card Payments' || txn.main_category === 'Credit Card Settlements') {
    return 'Excluded: Credit card bill settlement (prevents double-counting earlier card purchases)';
  }
  if (txn.main_category === 'Self Transfers') {
    return 'Excluded: Internal transfer between accounts or wallet load';
  }
  if (txn.main_category === 'Cash Withdrawals') {
    return 'Excluded: ATM cash withdrawal (spending tracked at purchase)';
  }
  if (txn.main_category === 'Investments (Outflow)') {
    return 'Excluded: Investment outflow (SIP / Mutual Funds / Stocks)';
  }
  if (txn.main_category === 'Lend' || txn.main_category === 'Borrow' || txn.main_category === 'Friends & Family') {
    return 'Excluded: Peer money movement, not a merchant expense';
  }
  if (!ELIGIBLE_CATEGORIES_SET.has(txn.main_category)) {
    return `Excluded: Category "${txn.main_category}" outside expense taxonomy`;
  }
  return null;
}

/**
 * Aggregates eligible transactions into category breakdown with percentages.
 */
export function calculateCategoryBreakdown(transactions: Transaction[]): CategorySpend[] {
  const map = new Map<string, { amount: number; count: number }>();
  let totalAmount = 0;

  for (const t of transactions) {
    if (isEligibleTransaction(t)) {
      const existing = map.get(t.main_category) || { amount: 0, count: 0 };
      existing.amount += t.amount;
      existing.count += 1;
      map.set(t.main_category, existing);
      totalAmount += t.amount;
    }
  }

  const breakdown: CategorySpend[] = [];
  for (const [category, val] of map.entries()) {
    const roundedAmt = Math.round(val.amount * 100) / 100;
    const pct = totalAmount > 0 ? Math.round((roundedAmt / totalAmount) * 1000) / 10 : 0;
    breakdown.push({
      category,
      amount: roundedAmt,
      percentageOfTotal: pct,
      transactionCount: val.count,
    });
  }

  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculates spending and status for a single week.
 *
 * Weekly Difference = Weekly Budget - Total Eligible Weekly Spending
 * Weekly Percentage = (Weekly Difference / Weekly Budget) * 100
 */
export function calculateWeek(
  weekIndex: number,
  startDate: string,
  endDate: string,
  budgetAmount: number,
  isCompleted: boolean,
  completedAt: string | undefined,
  allTransactions: Transaction[]
): WeeklyCalculation {
  const weekTxns = allTransactions.filter(
    (t) => t.txn_date >= startDate && t.txn_date <= endDate
  );

  let eligibleSpending = 0;
  for (const t of weekTxns) {
    if (isEligibleTransaction(t)) {
      eligibleSpending += t.amount;
    }
  }

  const actualSpending = Math.round(eligibleSpending * 100) / 100;
  const remainingBudget = Math.round((budgetAmount - actualSpending) * 100) / 100;
  const isUnderBudget = remainingBudget >= 0;

  const spendingPercentage =
    budgetAmount > 0 ? Math.round((actualSpending / budgetAmount) * 1000) / 10 : 0;

  const diffPct =
    budgetAmount > 0 ? Math.round((Math.abs(remainingBudget) / budgetAmount) * 100) : 0;

  let resultStatus: 'win' | 'over' | 'pending' = 'pending';
  let boxLabel = 'Not Started';
  let resultMessage = 'Week in progress. Add your expenses and tap Finish Week.';

  if (isCompleted) {
    if (isUnderBudget) {
      resultStatus = 'win';
      boxLabel = `+${diffPct}% Saved`;
      resultMessage = `You completed this week's money goal. Great work! Kept ₹${remainingBudget.toLocaleString('en-IN')} unspent.`;
    } else {
      resultStatus = 'over';
      boxLabel = `${diffPct}% Over`;
      resultMessage = `A little over budget this week. Don't worry! Every week is a fresh opportunity. You can get back on track next week. Keep going!`;
    }
  } else {
    if (actualSpending > 0) {
      boxLabel = 'In Progress';
      resultMessage = `Currently ₹${Math.abs(remainingBudget).toLocaleString('en-IN')} ${
        isUnderBudget ? 'left to spend' : 'over budget'
      }.`;
    } else {
      boxLabel = 'Not Started';
      resultMessage = `₹${budgetAmount.toLocaleString('en-IN')} budget set for this week. No expenses recorded yet.`;
    }
  }

  const categoryBreakdown = calculateCategoryBreakdown(weekTxns);

  return {
    weekIndex,
    weekCode: `W${weekIndex}`,
    weekLabel: `Week ${weekIndex}`,
    startDate,
    endDate,
    budgetAmount,
    actualSpending,
    remainingBudget,
    spendingPercentage,
    differencePercentage: diffPct,
    isUnderBudget,
    isCompleted,
    completedAt,
    resultStatus,
    boxLabel,
    resultMessage,
    categoryBreakdown,
    transactions: weekTxns,
  };
}

/**
 * Calculates monthly-to-date and final monthly progress using ONLY completed weeks.
 *
 * Formulas:
 * Completed Weekly Budget = Sum of budgets for completed weeks
 * Completed Weekly Spending = Sum of eligible spending in completed weeks
 * Monthly Progress % = ((Completed Weekly Budget - Completed Weekly Spending) / Completed Weekly Budget) * 100
 */
export function calculateMonthly(
  monthlyBudget: number,
  weeklyBudgets: Budget[],
  transactions: Transaction[]
): MonthlyCalculation {
  const sortedWeeklyBudgets = [...weeklyBudgets].sort((a, b) => {
    if (a.week_index && b.week_index) return a.week_index - b.week_index;
    return a.from_date.localeCompare(b.from_date);
  });

  const weeks: WeeklyCalculation[] = [];
  let completedWeeklyBudget = 0;
  let completedWeeklySpending = 0;
  let completedWeeksCount = 0;
  let weeklyWinsCount = 0;

  for (let i = 0; i < sortedWeeklyBudgets.length; i++) {
    const b = sortedWeeklyBudgets[i];
    const weekIdx = b.week_index || i + 1;
    const isCompleted = Boolean(b.is_completed);

    const weekCalc = calculateWeek(
      weekIdx,
      b.from_date,
      b.to_date,
      b.amount,
      isCompleted,
      b.completed_at,
      transactions
    );

    weeks.push(weekCalc);

    if (isCompleted) {
      completedWeeksCount += 1;
      completedWeeklyBudget += weekCalc.budgetAmount;
      completedWeeklySpending += weekCalc.actualSpending;
      if (weekCalc.isUnderBudget) {
        weeklyWinsCount += 1;
      }
    }
  }

  completedWeeklyBudget = Math.round(completedWeeklyBudget * 100) / 100;
  completedWeeklySpending = Math.round(completedWeeklySpending * 100) / 100;

  const completedDifference = Math.round((completedWeeklyBudget - completedWeeklySpending) * 100) / 100;
  const isUnderBudget = completedDifference >= 0;

  let monthlyProgressPercentage = 0;
  if (completedWeeklyBudget > 0) {
    const rawPct = (completedDifference / completedWeeklyBudget) * 100;
    // Format to 1 decimal place (e.g. 7.7%, 11.1%)
    monthlyProgressPercentage = Math.round(Math.abs(rawPct) * 10) / 10;
  }

  const allWeeksCompleted = completedWeeksCount === sortedWeeklyBudgets.length && sortedWeeklyBudgets.length > 0;

  // Running recovery points across completed weeks
  const recoveryPoints: RecoveryPoint[] = [];
  let runningNet = 0;
  let hadPriorOverspend = false;

  for (const w of weeks) {
    if (w.isCompleted) {
      const diff = w.budgetAmount - w.actualSpending;
      runningNet += diff;
      const isRecovered = hadPriorOverspend && diff > 0;
      if (diff < 0) hadPriorOverspend = true;

      recoveryPoints.push({
        weekIndex: w.weekIndex,
        weekLabel: w.weekLabel,
        weekDiff: diff,
        runningCumulativeNet: runningNet,
        isRecovered,
      });
    }
  }

  let headlineMessage = '';
  let subMessage = '';

  if (completedWeeksCount === 0) {
    headlineMessage = 'START YOUR FIRST WEEK';
    subMessage = 'Your first weekly win starts here!';
  } else if (allWeeksCompleted) {
    if (isUnderBudget) {
      headlineMessage = `${monthlyProgressPercentage}% BUDGET SAVED THIS MONTH!`;
      subMessage = 'Congratulations! Four weeks of mindful money decisions. Keep building this habit.';
    } else {
      headlineMessage = `${monthlyProgressPercentage}% OVER PLANNED BUDGET`;
      subMessage = 'Good effort! Every month brings a fresh chance to build better money habits.';
    }
  } else {
    // In-progress: 1 to 3 completed weeks
    if (isUnderBudget) {
      headlineMessage = `${monthlyProgressPercentage}% SAVED SO FAR`;
      subMessage = 'You are doing great! Keep your momentum going.';
    } else {
      headlineMessage = `${monthlyProgressPercentage}% OVER BUDGET SO FAR`;
      subMessage = "Don't worry! Every week is a fresh opportunity. You can recover next week.";
    }
  }

  return {
    monthlyBudget,
    completedWeeklyBudget,
    completedWeeklySpending,
    completedDifference,
    monthlyProgressPercentage,
    isUnderBudget,
    allWeeksCompleted,
    completedWeeksCount,
    totalWeeksCount: sortedWeeklyBudgets.length,
    weeklyWinsCount,
    headlineMessage,
    subMessage,
    weeks,
    recoveryPoints,
  };
}
