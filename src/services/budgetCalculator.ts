import {
  Transaction,
  Budget,
  UserFinancialProfile,
  WeeklyCalculation,
  MonthlyCalculation,
  CumulativePoint,
} from '../types';

export const ELIGIBLE_CATEGORIES = new Set<string>([
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Personal Care',
]);

export const EXCLUDED_CATEGORIES = new Set<string>([
  'Rent',
  'Self Transfers',
  'Credit Card Payments',
  'Credit Card Settlements',
  'Investments (Outflow)',
  'Cash Withdrawals',
  'Lend',
  'Borrow',
]);

/**
 * Checks whether a given transaction counts towards flexible weekly spending.
 *
 * Rules:
 * - Must be transaction_type === 'debit'
 * - Main category must be in ELIGIBLE_CATEGORIES
 * - Must NOT be in EXCLUDED_CATEGORIES
 * - Fixed rent is handled as a separate fixed commitment outside the flexible budget.
 * - Avoids double-counting credit card settlements, ATM withdrawals, and self-transfers.
 */
export function isEligibleTransaction(txn: Transaction): boolean {
  if (txn.transaction_type !== 'debit') {
    return false;
  }
  if (EXCLUDED_CATEGORIES.has(txn.main_category)) {
    return false;
  }
  return ELIGIBLE_CATEGORIES.has(txn.main_category);
}

/**
 * Calculates spending and progress for a single week.
 */
export function calculateWeek(
  weekIndex: number,
  weekCode: string,
  startDate: string,
  endDate: string,
  budgetAmount: number,
  allTransactions: Transaction[],
  previousCumulativeUnderBudget: number = 0
): WeeklyCalculation {
  // Filter transactions strictly using txn_date (not arrived_at)
  const weekTxns = allTransactions.filter(
    (t) => t.txn_date >= startDate && t.txn_date <= endDate
  );

  let eligibleSpending = 0;
  const dailyBreakdown: { [date: string]: number } = {};

  for (const t of weekTxns) {
    if (isEligibleTransaction(t)) {
      eligibleSpending += t.amount;
      dailyBreakdown[t.txn_date] = (dailyBreakdown[t.txn_date] || 0) + t.amount;
    }
  }

  // Round to 2 decimal places to avoid floating point anomalies
  const actualSpending = Math.round(eligibleSpending * 100) / 100;
  const underBudgetAmount = Math.round((budgetAmount - actualSpending) * 100) / 100;
  const isWithinBudget = underBudgetAmount >= 0;

  const percentageUnderOrOver =
    budgetAmount > 0
      ? Math.round((Math.abs(underBudgetAmount) / budgetAmount) * 1000) / 10
      : 0;

  let achievementStatus = '';
  let encouragingMessage = '';

  if (isWithinBudget) {
    achievementStatus = `${percentageUnderOrOver}% under budget`;
    if (previousCumulativeUnderBudget < 0 && previousCumulativeUnderBudget + underBudgetAmount >= 0) {
      encouragingMessage = `You recovered your budget progress this week! Kept ₹${underBudgetAmount.toLocaleString('en-IN')} unspent.`;
    } else if (underBudgetAmount > 0) {
      encouragingMessage = `You stayed ₹${underBudgetAmount.toLocaleString('en-IN')} under budget this week! Fantastic discipline.`;
    } else {
      encouragingMessage = `Spot on! You stayed exactly within your ₹${budgetAmount.toLocaleString('en-IN')} limit.`;
    }
  } else {
    const overAmount = Math.abs(underBudgetAmount);
    achievementStatus = `Above budget (+₹${overAmount.toLocaleString('en-IN')})`;
    encouragingMessage = `Exceeded by ₹${overAmount.toLocaleString('en-IN')}. No stress—your progress isn't wiped out! Adjust your next week to balance out.`;
  }

  return {
    weekIndex,
    weekCode,
    weekLabel: `Week ${weekIndex}`,
    startDate,
    endDate,
    budgetAmount,
    actualSpending,
    underBudgetAmount,
    percentageUnderOrOver,
    status: isWithinBudget ? 'within_budget' : 'above_budget',
    achievementStatus,
    encouragingMessage,
    transactions: weekTxns,
    dailyBreakdown,
  };
}

/**
 * Calculates complete monthly progress, cumulative tracking, and recovery milestones.
 */
export function calculateMonthlyProgress(
  profile: UserFinancialProfile,
  budgets: Budget[],
  transactions: Transaction[]
): MonthlyCalculation {
  const monthlyAllowance = profile.monthly_allowance;
  const fixedRent = profile.fixed_rent;
  const monthlySavingsTarget = profile.monthly_savings_target;
  const flexibleMonthlyPool = monthlyAllowance - fixedRent;

  // Sort budgets by date
  const sortedBudgets = [...budgets].sort((a, b) => a.from_date.localeCompare(b.from_date));

  // Sort transactions by date and time
  const sortedTxns = [...transactions].sort((a, b) => {
    const dComp = a.txn_date.localeCompare(b.txn_date);
    return dComp !== 0 ? dComp : a.txn_time.localeCompare(b.txn_time);
  });

  const weeklyCalculations: WeeklyCalculation[] = [];
  const cumulativeTimeline: CumulativePoint[] = [];

  let runningCumulativeBudget = 0;
  let runningCumulativeSpent = 0;
  let weeklyWinsCount = 0;
  let hadPriorOverspend = false;
  let recoveryOccurred = false;

  for (let i = 0; i < sortedBudgets.length; i++) {
    const b = sortedBudgets[i];
    const prevCumulativeUnderBudget = runningCumulativeBudget - runningCumulativeSpent;

    const weekCalc = calculateWeek(
      i + 1,
      `W${i + 1}`,
      b.from_date,
      b.to_date,
      b.amount,
      sortedTxns,
      prevCumulativeUnderBudget
    );

    weeklyCalculations.push(weekCalc);

    if (weekCalc.status === 'within_budget') {
      weeklyWinsCount += 1;
    } else {
      hadPriorOverspend = true;
    }

    runningCumulativeBudget += weekCalc.budgetAmount;
    runningCumulativeSpent += weekCalc.actualSpending;

    const currentCumulativeUnderBudget =
      Math.round((runningCumulativeBudget - runningCumulativeSpent) * 100) / 100;

    const cumulativePerfPct =
      runningCumulativeBudget > 0
        ? Math.round((currentCumulativeUnderBudget / runningCumulativeBudget) * 1000) / 10
        : 0;

    let recoveredThisWeek = false;
    // If there was an overspend in a previous week and this week is within budget, recovery happened
    if (hadPriorOverspend && weekCalc.status === 'within_budget' && i > 0) {
      recoveredThisWeek = true;
      recoveryOccurred = true;
    }

    cumulativeTimeline.push({
      weekIndex: i + 1,
      weekCode: `W${i + 1}`,
      weekLabel: `Week ${i + 1}`,
      cumulativeBudget: runningCumulativeBudget,
      cumulativeSpent: runningCumulativeSpent,
      cumulativeUnderBudget: currentCumulativeUnderBudget,
      cumulativePerformancePct: cumulativePerfPct,
      recoveredThisWeek,
      status: currentCumulativeUnderBudget >= 0 ? 'within_budget' : 'above_budget',
    });
  }

  const totalPlannedWeeklyBudget = runningCumulativeBudget;
  const totalActualEligibleSpending = runningCumulativeSpent;

  // Calculate excluded spending (Rent, settlements, etc.)
  let totalExcludedSpending = 0;
  for (const t of sortedTxns) {
    if (!isEligibleTransaction(t) && t.transaction_type === 'debit') {
      totalExcludedSpending += t.amount;
    }
  }

  // Monthly under-budget amount = Total planned budget - Total actual eligible spending
  const monthlyUnderBudgetAmount =
    Math.round((totalPlannedWeeklyBudget - totalActualEligibleSpending) * 100) / 100;

  // Monthly performance percentage = (Monthly under-budget amount / Total planned budget) * 100
  const monthlyPerformancePercentage =
    totalPlannedWeeklyBudget > 0
      ? Math.round((monthlyUnderBudgetAmount / totalPlannedWeeklyBudget) * 1000) / 10
      : 0;

  const unallocatedPool = Math.max(
    0,
    flexibleMonthlyPool - totalPlannedWeeklyBudget - monthlySavingsTarget
  );

  // Dynamic empathetic headline & messages
  let headlineMessage = '';
  let encouragingMessage = '';

  if (weeklyWinsCount === sortedBudgets.length) {
    headlineMessage = `Flawless Month! ${weeklyWinsCount} out of ${sortedBudgets.length} Weekly Wins`;
    encouragingMessage = `You finished the month ₹${monthlyUnderBudgetAmount.toLocaleString('en-IN')} under budget! Phenomenal financial discipline.`;
  } else if (recoveryOccurred && monthlyUnderBudgetAmount >= 0) {
    headlineMessage = `Great Recovery! Finished ₹${monthlyUnderBudgetAmount.toLocaleString('en-IN')} Under Budget`;
    encouragingMessage = `You recovered your budget progress after week 2 and protected your month! Total unspent planned budget: ₹${monthlyUnderBudgetAmount.toLocaleString('en-IN')}.`;
  } else if (monthlyUnderBudgetAmount >= 0) {
    headlineMessage = `${weeklyWinsCount} Weeks of Mindful Spending`;
    encouragingMessage = `You finished the month ₹${monthlyUnderBudgetAmount.toLocaleString('en-IN')} under budget (${monthlyPerformancePercentage}% under planned limit).`;
  } else {
    const overAmt = Math.abs(monthlyUnderBudgetAmount);
    headlineMessage = `Month Complete: ₹${overAmt.toLocaleString('en-IN')} Above Planned Budget`;
    encouragingMessage = `College life happens! Reflect on the unexpected spikes and use next month's fresh flexible pool to rebalance.`;
  }

  return {
    monthlyAllowance,
    fixedRent,
    flexibleMonthlyPool,
    totalPlannedWeeklyBudget,
    monthlySavingsTarget,
    unallocatedPool,
    totalActualEligibleSpending,
    totalExcludedSpending,
    monthlyUnderBudgetAmount,
    monthlyPerformancePercentage,
    weeklyWinsCount,
    totalWeeks: sortedBudgets.length,
    headlineMessage,
    encouragingMessage,
    recoveryOccurred,
    cumulativeTimeline,
    weeklyCalculations,
  };
}
