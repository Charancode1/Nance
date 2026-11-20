import { Transaction, CategorySpend } from './index';

export interface WeeklySavingsBudget {
  budget_id: string;
  week_index: number;
  from_date: string;
  to_date: string;
  budget_amount: number;
  savings_target: number; // Weekly Savings Goal
  is_completed?: boolean;
  completed_at?: string;
}

export interface WeeklySavingsCalculation {
  weekIndex: number;
  weekCode: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  savingsGoal: number;
  spendingLimit: number; // budgetAmount - savingsGoal
  actualSpending: number;
  potentialSavings: number; // max(0, budgetAmount - actualSpending) during progress
  amountSaved: number; // max(0, budgetAmount - actualSpending)
  extraSaved: number; // max(0, amountSaved - savingsGoal)
  shortfall: number; // max(0, savingsGoal - amountSaved)
  overspentAmount: number; // max(0, actualSpending - budgetAmount)
  savingsPercentage: number; // (amountSaved / savingsGoal) * 100
  isGoalAchieved: boolean; // amountSaved >= savingsGoal (if goal > 0)
  isPartiallyAchieved: boolean; // amountSaved > 0 && amountSaved < savingsGoal
  isOverspent: boolean; // actualSpending > budgetAmount
  isCompleted: boolean;
  completedAt?: string;
  resultStatus: 'achieved' | 'partial' | 'missed' | 'pending';
  boxLabel: string;
  resultMessage: string;
  categoryBreakdown: CategorySpend[];
  transactions: Transaction[];
}

export interface MonthlySavingsCalculation {
  monthlyBudget: number;
  monthlySavingsGoal: number;
  totalAmountKeptAside: number; // Sum of amountSaved across COMPLETED weeks
  totalCompletedBudget: number; // Sum of budgetAmount across COMPLETED weeks
  totalCompletedSavingsGoal: number; // Sum of savingsGoal across COMPLETED weeks
  percentOfBudgetKeptAside: number; // (totalAmountKeptAside / totalCompletedBudget) * 100
  monthlySavingsPercentage: number; // (totalAmountKeptAside / monthlySavingsGoal) * 100
  allWeeksCompleted: boolean;
  completedWeeksCount: number;
  totalWeeksCount: number;
  weeksAchievedCount: number;
  headlineMessage: string;
  subMessage: string;
  weeks: WeeklySavingsCalculation[];
}
