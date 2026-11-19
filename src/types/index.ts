export type TransactionType = 'debit' | 'credit';
export type PaymentMode = 'UPI' | 'Card' | 'Net Banking' | 'Cash';

export interface User {
  user_id: string;
  name: string;
  email?: string;
  joined_on: string;
}

export interface Budget {
  budget_id: string;
  user_id: string;
  period_type: 'monthly' | 'weekly';
  week_index?: number; // 1, 2, 3, 4 for weekly budgets
  amount: number;
  from_date: string;
  to_date: string;
  is_completed?: boolean;
  completed_at?: string;
}

export interface Transaction {
  txn_id: string;
  user_id: string;
  txn_date: string;
  txn_time: string;
  amount: number;
  transaction_type: TransactionType;
  payment_mode: PaymentMode;
  main_category: string;
  sub_category?: string;
  merchant_name?: string;
  person_name?: string | null;
  source?: string;
  arrived_at?: string;
  is_eligible?: boolean;
  exclusion_reason?: string;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentageOfTotal: number;
  transactionCount: number;
}

export interface WeeklyCalculation {
  weekIndex: number;
  weekCode: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  actualSpending: number;
  remainingBudget: number; // positive = under budget, negative = over budget
  spendingPercentage: number; // (actual / budget) * 100
  differencePercentage: number; // (abs(remaining) / budget) * 100
  isUnderBudget: boolean;
  isCompleted: boolean;
  completedAt?: string;
  resultStatus: 'win' | 'over' | 'pending';
  resultBadgeLabel: string;
  resultMessage: string;
  categoryBreakdown: CategorySpend[];
  transactions: Transaction[];
}

export interface MonthlyCalculation {
  monthlyBudget: number;
  totalWeeklyBudgets: number;
  unallocatedMonthlyBudget: number;
  totalEligibleSpending: number;
  totalExcludedSpending: number;
  monthlyDifference: number; // monthlyBudget - totalEligibleSpending
  monthlyPercentage: number; // (monthlyDifference / monthlyBudget) * 100
  isUnderBudget: boolean;
  allWeeksCompleted: boolean;
  completedWeeksCount: number;
  weeklyWinsCount: number;
  statusLabel: string;
  headlineMessage: string;
  resultMessage: string;
  weeks: WeeklyCalculation[];
  categoryBreakdown: CategorySpend[];
}
