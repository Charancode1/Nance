import {
  Transaction,
  Budget,
  WeeklyCalculation,
  MonthlyCalculation,
  CategorySpend,
} from '../types';

/**
 * Eligible spending categories from the schema.
 * Represents consumption purchases.
 */
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

/**
 * Excluded money movements from the schema.
 * Prevents double-counting credit card purchases, internal transfers, and cash movements.
 */
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
 * Determines whether a transaction is an eligible spending debit.
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
 * Returns a human-readable explanation for why a transaction was included or excluded.
 */
export function getExclusionReason(txn: Transaction): string | null {
  if (txn.transaction_type !== 'debit') {
    return 'Excluded: Credit transaction (Income/Inflow), not an expense';
  }
  if (txn.main_category === 'Credit Card Payments' || txn.main_category === 'Credit Card Settlements') {
    return 'Excluded: Credit card bill settlement (prevents double-counting earlier card purchases)';
  }
  if (txn.main_category === 'Self Transfers') {
    return 'Excluded: Internal transfer between accounts or wallet load (not spending)';
  }
  if (txn.main_category === 'Cash Withdrawals') {
    return 'Excluded: ATM cash withdrawal (spending is tracked when cash is spent on purchases)';
  }
  if (txn.main_category === 'Investments (Outflow)') {
    return 'Excluded: Investment outflow (SIP / Mutual Funds / Stocks), not consumption spending';
  }
  if (txn.main_category === 'Lend' || txn.main_category === 'Borrow') {
    return 'Excluded: Temporary peer split/loan, not consumption spending';
  }
  if (txn.main_category === 'Friends & Family') {
    return 'Excluded: Peer money movement, not a merchant purchase';
  }
  if (!ELIGIBLE_CATEGORIES_SET.has(txn.main_category)) {
    return `Excluded: Unrecognized category "${txn.main_category}" outside eligible expense taxonomy`;
  }
  return null;
}

/**
 * Aggregates eligible transactions into category-wise totals.
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

  // Sort by highest amount spent
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculates metrics for a specific week.
 *
 * Formulas:
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
  // Filter transactions using txn_date strictly (not arrived_at)
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

  // Spending percentage of limit
  const spendingPercentage =
    budgetAmount > 0 ? Math.round((actualSpending / budgetAmount) * 1000) / 10 : 0;

  // Percentage variance under or over budget
  const diffPct =
    budgetAmount > 0 ? Math.round((Math.abs(remainingBudget) / budgetAmount) * 100) : 0;

  let resultStatus: 'win' | 'over' | 'pending' = 'pending';
  let resultBadgeLabel = 'Pending';
  let resultMessage = 'Week in progress. Add expenses or click Finish Week to lock your result.';

  if (isCompleted) {
    if (isUnderBudget) {
      resultStatus = 'win';
      resultBadgeLabel = `${diffPct}% Under Budget`;
      resultMessage = `You stayed ${diffPct}% under budget! You kept ₹${remainingBudget.toLocaleString('en-IN')} unspent.`;
    } else {
      resultStatus = 'over';
      resultBadgeLabel = `${diffPct}% Above Budget`;
      resultMessage = `You went ${diffPct}% over this week's budget. That's okay. You can start fresh next week.`;
    }
  } else {
    // Current in-progress status preview
    if (actualSpending === 0) {
      resultBadgeLabel = 'In Progress';
      resultMessage = `₹${budgetAmount.toLocaleString('en-IN')} planned for this week. No expenses recorded yet.`;
    } else if (isUnderBudget) {
      resultBadgeLabel = `${diffPct}% Under (Live)`;
      resultMessage = `Currently ₹${remainingBudget.toLocaleString('en-IN')} under budget (${spendingPercentage}% spent).`;
    } else {
      resultBadgeLabel = `${diffPct}% Over (Live)`;
      resultMessage = `Currently ₹${Math.abs(remainingBudget).toLocaleString('en-IN')} over budget. Pace remaining days.`;
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
    resultBadgeLabel,
    resultMessage,
    categoryBreakdown,
    transactions: weekTxns,
  };
}

/**
 * Calculates overall monthly results from actual transactions across the month.
 *
 * Formulas:
 * Monthly Difference = Monthly Budget - Total Monthly Eligible Spending
 * Monthly Percentage = (Monthly Difference / Monthly Budget) * 100
 */
export function calculateMonthly(
  monthlyBudget: number,
  weeklyBudgets: Budget[],
  transactions: Transaction[],
  completedWeeksSet: Set<number> = new Set()
): MonthlyCalculation {
  // Sort weekly budgets by week index or start date
  const sortedWeeklyBudgets = [...weeklyBudgets].sort((a, b) => {
    if (a.week_index && b.week_index) return a.week_index - b.week_index;
    return a.from_date.localeCompare(b.from_date);
  });

  const weeks: WeeklyCalculation[] = [];
  let totalWeeklyBudgets = 0;
  let weeklyWinsCount = 0;
  let completedWeeksCount = 0;

  for (let i = 0; i < sortedWeeklyBudgets.length; i++) {
    const b = sortedWeeklyBudgets[i];
    const weekIdx = b.week_index || i + 1;
    const isCompleted = b.is_completed ?? completedWeeksSet.has(weekIdx);

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
    totalWeeklyBudgets += b.amount;

    if (isCompleted) {
      completedWeeksCount += 1;
      if (weekCalc.isUnderBudget) {
        weeklyWinsCount += 1;
      }
    }
  }

  // Calculate actual total eligible spending across ALL transactions belonging to the budget dates
  let totalEligibleSpending = 0;
  let totalExcludedSpending = 0;

  for (const t of transactions) {
    if (isEligibleTransaction(t)) {
      totalEligibleSpending += t.amount;
    } else if (t.transaction_type === 'debit') {
      totalExcludedSpending += t.amount;
    }
  }

  totalEligibleSpending = Math.round(totalEligibleSpending * 100) / 100;
  totalExcludedSpending = Math.round(totalExcludedSpending * 100) / 100;

  // Monthly Difference = Monthly Budget - Total Monthly Eligible Spending
  const monthlyDifference = Math.round((monthlyBudget - totalEligibleSpending) * 100) / 100;
  const isUnderBudget = monthlyDifference >= 0;

  // Monthly Percentage = (Monthly Difference / Monthly Budget) * 100
  const monthlyPercentage =
    monthlyBudget > 0 ? Math.round((Math.abs(monthlyDifference) / monthlyBudget) * 100) : 0;

  const unallocatedMonthlyBudget = Math.max(0, monthlyBudget - totalWeeklyBudgets);
  const allWeeksCompleted = completedWeeksCount === sortedWeeklyBudgets.length && sortedWeeklyBudgets.length > 0;

  let statusLabel = '';
  let headlineMessage = '';
  let resultMessage = '';

  if (allWeeksCompleted) {
    statusLabel = 'Final Monthly Result';
    if (isUnderBudget) {
      headlineMessage = `You finished the month ${monthlyPercentage}% under budget!`;
      resultMessage = `All ${completedWeeksCount} weeks completed with ${weeklyWinsCount} weekly wins. Total unspent budget: ₹${monthlyDifference.toLocaleString('en-IN')}.`;
    } else {
      const overAmt = Math.abs(monthlyDifference);
      headlineMessage = `You finished the month ${monthlyPercentage}% above budget`;
      resultMessage = `All ${completedWeeksCount} weeks completed with ${weeklyWinsCount} weekly wins. Total overspending: ₹${overAmt.toLocaleString('en-IN')}.`;
    }
  } else {
    statusLabel = 'Month-to-Date (Provisional)';
    if (isUnderBudget) {
      headlineMessage = `Currently ${monthlyPercentage}% under budget month-to-date`;
      resultMessage = `${completedWeeksCount} of ${sortedWeeklyBudgets.length} weeks finished (${weeklyWinsCount} wins). Current unspent budget: ₹${monthlyDifference.toLocaleString('en-IN')}.`;
    } else {
      const overAmt = Math.abs(monthlyDifference);
      headlineMessage = `Currently ${monthlyPercentage}% above budget month-to-date`;
      resultMessage = `${completedWeeksCount} of ${sortedWeeklyBudgets.length} weeks finished. Current overage: ₹${overAmt.toLocaleString('en-IN')}.`;
    }
  }

  const categoryBreakdown = calculateCategoryBreakdown(transactions);

  return {
    monthlyBudget,
    totalWeeklyBudgets,
    unallocatedMonthlyBudget,
    totalEligibleSpending,
    totalExcludedSpending,
    monthlyDifference,
    monthlyPercentage,
    isUnderBudget,
    allWeeksCompleted,
    completedWeeksCount,
    weeklyWinsCount,
    statusLabel,
    headlineMessage,
    resultMessage,
    weeks,
    categoryBreakdown,
  };
}
