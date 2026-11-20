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
  week_index?: number; // 1, 2, 3, 4
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
  boxLabel: string; // e.g. "+20% Saved", "8% Over", "Not Started", "In Progress"
  resultMessage: string;
  categoryBreakdown: CategorySpend[];
  transactions: Transaction[];
}

export interface RecoveryPoint {
  weekIndex: number;
  weekLabel: string;
  weekDiff: number; // positive = under, negative = over
  runningCumulativeNet: number;
  isRecovered: boolean;
}

export interface MonthlyCalculation {
  monthlyBudget: number;
  completedWeeklyBudget: number;
  completedWeeklySpending: number;
  completedDifference: number; // completedWeeklyBudget - completedWeeklySpending
  monthlyProgressPercentage: number; // ((completedBudget - completedSpending) / completedBudget) * 100
  isUnderBudget: boolean;
  allWeeksCompleted: boolean;
  completedWeeksCount: number;
  totalWeeksCount: number;
  weeklyWinsCount: number;
  headlineMessage: string; // e.g. "20% SAVED", "7.7% SAVED SO FAR"
  subMessage: string; // e.g. "You are doing great! Keep your momentum going."
  weeks: WeeklyCalculation[];
  recoveryPoints: RecoveryPoint[];
}
