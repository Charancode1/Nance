import { Transaction } from '../types';
import {
  WeeklySavingsBudget,
  WeeklySavingsCalculation,
  MonthlySavingsCalculation,
} from '../types/saveFirst';
import {
  isEligibleTransaction,
  calculateCategoryBreakdown,
} from './budgetCalculator';

/**
 * Calculates savings progress and spending for a single week in Save First.
 *
 * Formulas:
 * Spending Limit = max(0, Weekly Budget - Weekly Savings Goal)
 * Amount Saved = max(0, Weekly Budget - Actual Eligible Spending)
 */
export function calculateWeeklySavings(
  weekIndex: number,
  startDate: string,
  endDate: string,
  budgetAmount: number,
  savingsGoal: number,
  isCompleted: boolean,
  completedAt: string | undefined,
  allTransactions: Transaction[]
): WeeklySavingsCalculation {
  // 1. Spending Limit
  const spendingLimit = Math.max(0, Math.round((budgetAmount - savingsGoal) * 100) / 100);

  // 2. Consumption Spending (Eligible Debits within this week's date range)
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

  // 3. Amount Saved / Potential Savings: max(0, Weekly Budget - Actual Eligible Spending)
  // When budgetAmount is 0, savings must be 0 (no false savings wins)
  const rawDiff = budgetAmount - actualSpending;
  const potentialSavings = budgetAmount > 0 ? Math.max(0, Math.round(rawDiff * 100) / 100) : 0;
  const amountSaved = potentialSavings;

  // 4. Extra Saved / Shortfall / Overspent
  const extraSaved =
    savingsGoal > 0 ? Math.max(0, Math.round((amountSaved - savingsGoal) * 100) / 100) : 0;
  const shortfall =
    savingsGoal > 0 ? Math.max(0, Math.round((savingsGoal - amountSaved) * 100) / 100) : 0;
  const overspentAmount = Math.max(0, Math.round((actualSpending - budgetAmount) * 100) / 100);

  // 5. Savings Percentage towards Goal (Zero-safe: never divide by zero)
  const savingsPercentage =
    savingsGoal > 0
      ? Math.round((amountSaved / savingsGoal) * 1000) / 10
      : 0;

  // 6. Achievement checks
  const isGoalAchieved = budgetAmount > 0 && savingsGoal > 0 && amountSaved >= savingsGoal;
  const isPartiallyAchieved =
    budgetAmount > 0 && savingsGoal > 0 && amountSaved > 0 && amountSaved < savingsGoal;
  const isOverspent = budgetAmount > 0 && actualSpending > budgetAmount;

  let resultStatus: 'achieved' | 'partial' | 'missed' | 'pending' = 'pending';
  let boxLabel = 'Not Set';
  let resultMessage = 'Set your weekly budget and savings goal to start.';

  if (budgetAmount === 0 || savingsGoal === 0) {
    if (isCompleted) {
      boxLabel = actualSpending > 0 ? '₹0 Saved' : 'No Goal';
      resultMessage = 'Completed week with ₹0 budget or savings goal.';
    } else {
      boxLabel = 'Not Set';
      resultMessage = 'Set your weekly budget and savings goal to start.';
    }
  } else {
    // Both budgetAmount > 0 and savingsGoal > 0
    if (isCompleted) {
      if (isGoalAchieved) {
        resultStatus = 'achieved';
        boxLabel = extraSaved > 0 ? `+₹${extraSaved} Extra!` : `Goal Met!`;
        resultMessage =
          extraSaved > 0
            ? `Congratulations! 🎉 You set aside ₹${amountSaved} this week. Your savings goal is achieved! (₹${extraSaved} extra saved!)`
            : `Congratulations! 🎉 You set aside ₹${amountSaved} this week. Your savings goal is achieved!`;
      } else if (isPartiallyAchieved) {
        resultStatus = 'partial';
        boxLabel = `₹${amountSaved} / ₹${savingsGoal} Saved`;
        resultMessage = `You're getting there! You managed to keep ₹${amountSaved} aside this week. You were ₹${shortfall} short of your goal. You can try again next week. Keep going!`;
      } else {
        resultStatus = 'missed';
        boxLabel = `₹0 / ₹${savingsGoal} Saved`;
        resultMessage =
          "Don't worry! This week didn't go as planned. Every new week is another opportunity to save. Keep going!";
      }
    } else {
      // In progress (Before clicking Finish Week)
      if (actualSpending === 0) {
        boxLabel = 'Not Started';
        resultMessage = `Stay within your spending limit to reach your ₹${savingsGoal} savings goal!`;
      } else if (isOverspent) {
        boxLabel = 'Over Budget';
        resultMessage = `Spending exceeded your budget by ₹${overspentAmount}. Keep mindful for remaining days.`;
      } else {
        boxLabel = 'In Progress';
        resultMessage = "You're on track! Keep spending mindfully to reach your savings goal.";
      }
    }
  }

  // 7. Category breakdown for consumption spending
  const categoryBreakdown = calculateCategoryBreakdown(weekTxns);

  return {
    weekIndex,
    weekCode: `W${weekIndex}`,
    weekLabel: `Week ${weekIndex}`,
    startDate,
    endDate,
    budgetAmount,
    savingsGoal,
    spendingLimit,
    actualSpending,
    potentialSavings,
    amountSaved,
    extraSaved,
    shortfall,
    overspentAmount,
    savingsPercentage,
    isGoalAchieved,
    isPartiallyAchieved,
    isOverspent,
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
 * Calculates monthly savings summary in Save First.
 *
 * Rules:
 * Only count completed weeks in the monthly summary. Do not count future or unfinished weeks.
 * Total Amount Kept Aside = Sum of amountSaved across COMPLETED weeks.
 */
export function calculateMonthlySavings(
  monthlyBudget: number,
  monthlySavingsGoal: number,
  weeklyBudgets: WeeklySavingsBudget[],
  allTransactions: Transaction[]
): MonthlySavingsCalculation {
  const sorted = [...weeklyBudgets].sort((a, b) => a.week_index - b.week_index);

  const weeks: WeeklySavingsCalculation[] = [];
  let totalAmountKeptAside = 0;
  let totalCompletedBudget = 0;
  let totalCompletedSavingsGoal = 0;
  let completedWeeksCount = 0;
  let weeksAchievedCount = 0;

  for (const b of sorted) {
    const isCompleted = Boolean(b.is_completed);
    const weekCalc = calculateWeeklySavings(
      b.week_index,
      b.from_date,
      b.to_date,
      b.budget_amount,
      b.savings_target,
      isCompleted,
      b.completed_at,
      allTransactions
    );

    weeks.push(weekCalc);

    // ONLY count COMPLETED weeks in the monthly summary
    if (isCompleted) {
      completedWeeksCount += 1;
      totalAmountKeptAside += weekCalc.amountSaved;
      totalCompletedBudget += weekCalc.budgetAmount;
      totalCompletedSavingsGoal += weekCalc.savingsGoal;

      if (weekCalc.isGoalAchieved) {
        weeksAchievedCount += 1;
      }
    }
  }

  totalAmountKeptAside = Math.round(totalAmountKeptAside * 100) / 100;
  totalCompletedBudget = Math.round(totalCompletedBudget * 100) / 100;
  totalCompletedSavingsGoal = Math.round(totalCompletedSavingsGoal * 100) / 100;

  // Percentage of total monthly budget kept aside
  const denominatorBudget = totalCompletedBudget > 0 ? totalCompletedBudget : monthlyBudget;
  const percentOfBudgetKeptAside =
    denominatorBudget > 0
      ? Math.round((totalAmountKeptAside / denominatorBudget) * 1000) / 10
      : 0;

  // Monthly savings percentage against monthly savings goal
  const denominatorGoal =
    monthlySavingsGoal > 0 ? monthlySavingsGoal : totalCompletedSavingsGoal;
  const monthlySavingsPercentage =
    denominatorGoal > 0
      ? Math.round((totalAmountKeptAside / denominatorGoal) * 1000) / 10
      : 0;

  const allWeeksCompleted = completedWeeksCount === sorted.length && sorted.length > 0;

  let headlineMessage = '';
  let subMessage = '';

  if (completedWeeksCount === 0) {
    if (monthlySavingsGoal === 0) {
      headlineMessage = 'SET YOUR SAVINGS GOAL';
      subMessage = 'Set your monthly and weekly savings goals to start.';
    } else {
      headlineMessage = 'START YOUR FIRST WEEK';
      subMessage = 'Save a little first. Build a better tomorrow.';
    }
  } else if (allWeeksCompleted) {
    headlineMessage = `CONGRATULATIONS! YOU KEPT ₹${totalAmountKeptAside.toLocaleString('en-IN')} ASIDE THIS MONTH!`;
    subMessage = `That's ${percentOfBudgetKeptAside}% of your total budget kept aside! Every amount you put aside is progress.`;
  } else {
    // 1 to 3 completed weeks
    headlineMessage = `₹${totalAmountKeptAside.toLocaleString('en-IN')} KEPT ASIDE SO FAR`;
    subMessage = `Across ${completedWeeksCount} completed week${
      completedWeeksCount > 1 ? 's' : ''
    } (${percentOfBudgetKeptAside}% of budget saved). Keep going!`;
  }

  return {
    monthlyBudget,
    monthlySavingsGoal,
    totalAmountKeptAside,
    totalCompletedBudget,
    totalCompletedSavingsGoal,
    percentOfBudgetKeptAside,
    monthlySavingsPercentage,
    allWeeksCompleted,
    completedWeeksCount,
    totalWeeksCount: sorted.length,
    weeksAchievedCount,
    headlineMessage,
    subMessage,
    weeks,
  };
}
