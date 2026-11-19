export type TransactionType = 'debit' | 'credit';
export type PaymentMode = 'UPI' | 'Card' | 'Net Banking' | 'Cash';

export interface User {
  user_id: string;
  name: string;
  city: string;
  joined_on: string;
  profile: UserFinancialProfile;
  budgets: Budget[];
  transactions: Transaction[];
  weekly_progress: WeeklyBudgetProgress[];
  app_activity: string[];
}

export interface UserFinancialProfile {
  life_stage: string;
  living_arrangement: string;
  monthly_allowance: number;
  fixed_rent: number;
  monthly_savings_target: number;
  avatar?: string;
  tagline?: string;
}

export interface Budget {
  budget_id: string;
  main_category: string;
  period_type: string;
  amount: number;
  from_date: string;
  to_date: string;
}

export interface Transaction {
  txn_id: string;
  txn_date: string;
  txn_time: string;
  amount: number;
  transaction_type: TransactionType;
  payment_mode: PaymentMode;
  main_category: string;
  sub_category: string;
  merchant_name: string;
  person_name?: string | null;
  source: string;
  arrived_at: string;
  is_eligible?: boolean;
}

export interface WeeklyBudgetProgress {
  progress_id: string;
  week_start: string;
  week_end: string;
  budget_amount: number;
  actual_spending: number;
  under_budget_amount: number;
  status: 'within_budget' | 'above_budget' | 'upcoming';
}

export interface WeeklyCalculation {
  weekIndex: number;
  weekCode: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  actualSpending: number;
  underBudgetAmount: number;
  percentageUnderOrOver: number;
  status: 'within_budget' | 'above_budget' | 'upcoming';
  achievementStatus: string;
  encouragingMessage: string;
  transactions: Transaction[];
  dailyBreakdown: { [date: string]: number };
}

export interface CumulativePoint {
  weekIndex: number;
  weekCode: string;
  weekLabel: string;
  cumulativeBudget: number;
  cumulativeSpent: number;
  cumulativeUnderBudget: number;
  cumulativePerformancePct: number;
  recoveredThisWeek: boolean;
  status: 'within_budget' | 'above_budget';
}

export interface MonthlyCalculation {
  monthlyAllowance: number;
  fixedRent: number;
  flexibleMonthlyPool: number;
  totalPlannedWeeklyBudget: number;
  monthlySavingsTarget: number;
  unallocatedPool: number;
  totalActualEligibleSpending: number;
  totalExcludedSpending: number;
  monthlyUnderBudgetAmount: number;
  monthlyPerformancePercentage: number;
  weeklyWinsCount: number;
  totalWeeks: number;
  headlineMessage: string;
  encouragingMessage: string;
  recoveryOccurred: boolean;
  cumulativeTimeline: CumulativePoint[];
  weeklyCalculations: WeeklyCalculation[];
}
