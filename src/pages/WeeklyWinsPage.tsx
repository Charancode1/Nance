import React, { useState, useMemo, useEffect } from 'react';
import initialData from '../data/mockData.json';
import { Budget, Transaction, WeeklyCalculation } from '../types';
import { calculateMonthly } from '../services/budgetCalculator';
import { formatINR } from '../utils/formatters';
import { MobileTopBoxes } from '../components/MobileTopBoxes';
import { MobileWeeklyTracker } from '../components/MobileWeeklyTracker';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { WeekResultModal } from '../components/WeekResultModal';
import { MonthCompletionModal } from '../components/MonthCompletionModal';
import { RulesModal } from '../components/RulesModal';
import { BudgetSettingsModal } from '../components/BudgetSettingsModal';
import { RotateCcw, HelpCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'nance_weekly_wins_data';

const DEFAULT_WEEKLY_BUDGETS: Budget[] = [
  {
    budget_id: 'bgt_w1',
    user_id: 'user_demo',
    period_type: 'weekly',
    week_index: 1,
    amount: 0,
    from_date: '2026-10-01',
    to_date: '2026-10-07',
    is_completed: false,
  },
  {
    budget_id: 'bgt_w2',
    user_id: 'user_demo',
    period_type: 'weekly',
    week_index: 2,
    amount: 0,
    from_date: '2026-10-08',
    to_date: '2026-10-14',
    is_completed: false,
  },
  {
    budget_id: 'bgt_w3',
    user_id: 'user_demo',
    period_type: 'weekly',
    week_index: 3,
    amount: 0,
    from_date: '2026-10-15',
    to_date: '2026-10-21',
    is_completed: false,
  },
  {
    budget_id: 'bgt_w4',
    user_id: 'user_demo',
    period_type: 'weekly',
    week_index: 4,
    amount: 0,
    from_date: '2026-10-22',
    to_date: '2026-10-28',
    is_completed: false,
  },
];

function loadSavedData(): {
  monthlyBudget: number;
  weeklyBudgets: Budget[];
  transactions: Transaction[];
  selectedWeekIndex: number;
} {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Guard against obsolete legacy demo mock data that had Week 1 locked
      const isLegacyMockData =
        parsed?.weeklyBudgets?.[0]?.completed_at === '2026-10-07T21:30:00' &&
        parsed?.monthlyBudget === 10000;

      if (!isLegacyMockData && typeof parsed === 'object' && parsed !== null) {
        return {
          monthlyBudget: typeof parsed.monthlyBudget === 'number' ? parsed.monthlyBudget : 0,
          weeklyBudgets:
            Array.isArray(parsed.weeklyBudgets) && parsed.weeklyBudgets.length === 4
              ? parsed.weeklyBudgets
              : DEFAULT_WEEKLY_BUDGETS,
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          selectedWeekIndex:
            typeof parsed.selectedWeekIndex === 'number' &&
            parsed.selectedWeekIndex >= 1 &&
            parsed.selectedWeekIndex <= 4
              ? parsed.selectedWeekIndex
              : 1,
        };
      }
    }
  } catch {
    // Ignore storage errors
  }

  return {
    monthlyBudget: initialData.monthly_budget ?? 0,
    weeklyBudgets: (initialData.weekly_budgets as unknown as Budget[]) ?? DEFAULT_WEEKLY_BUDGETS,
    transactions: (initialData.transactions as unknown as Transaction[]) ?? [],
    selectedWeekIndex: 1,
  };
}

export const WeeklyWinsPage: React.FC = () => {
  // State with localStorage persistence across page refreshes
  const initial = useMemo(() => loadSavedData(), []);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(initial.monthlyBudget);
  const [weeklyBudgets, setWeeklyBudgets] = useState<Budget[]>(initial.weeklyBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(initial.selectedWeekIndex);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ monthlyBudget, weeklyBudgets, transactions, selectedWeekIndex })
      );
    } catch {
      // Ignore storage errors
    }
  }, [monthlyBudget, weeklyBudgets, transactions, selectedWeekIndex]);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [justFinishedWeek, setJustFinishedWeek] = useState<WeeklyCalculation | null>(null);
  const [showMonthCompletion, setShowMonthCompletion] = useState<boolean>(false);

  const handleSaveBudgets = (newMonthlyBudget: number, newWeeklyBudgets: Budget[]) => {
    setMonthlyBudget(newMonthlyBudget);
    setWeeklyBudgets(newWeeklyBudgets);
  };

  // Monthly calculation engine execution
  const monthlyCalc = useMemo(() => {
    return calculateMonthly(monthlyBudget, weeklyBudgets, transactions);
  }, [monthlyBudget, weeklyBudgets, transactions]);

  // Active week object
  const activeWeek = useMemo(() => {
    return (
      monthlyCalc.weeks.find((w) => w.weekIndex === selectedWeekIndex) ||
      monthlyCalc.weeks[0]
    );
  }, [monthlyCalc.weeks, selectedWeekIndex]);

  // Finish Week Handler (Section 1, 2, 3, 4)
  const handleFinishWeek = (weekIndex: number) => {
    const nextBudgets = weeklyBudgets.map((b) => {
      if (b.week_index === weekIndex) {
        if (b.is_completed) return b; // Prevent duplicate clicks
        return {
          ...b,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setWeeklyBudgets(nextBudgets);

    // Calculate updated week and monthly results
    const updatedMonthly = calculateMonthly(monthlyBudget, nextBudgets, transactions);
    const finishedWeekCalc = updatedMonthly.weeks.find((w) => w.weekIndex === weekIndex);

    // Scenario C: If Week 4 completed (or all 4 weeks completed), show final monthly completion directly
    if (weekIndex === 4 || updatedMonthly.allWeeksCompleted) {
      setJustFinishedWeek(null);
      setShowMonthCompletion(true);
    } else if (finishedWeekCalc) {
      // Scenario A & B: For Week 1, 2, 3, show the weekly result modal immediately!
      setJustFinishedWeek(finishedWeekCalc);
      setShowMonthCompletion(false);
    }
  };

  const handleNextWeek = () => {
    if (justFinishedWeek && justFinishedWeek.weekIndex < 4) {
      setSelectedWeekIndex(justFinishedWeek.weekIndex + 1);
    }
    setJustFinishedWeek(null);
  };

  const handleReopenWeek = (weekIndex: number) => {
    setWeeklyBudgets((prev) =>
      prev.map((b) => {
        if (b.week_index === weekIndex) {
          return {
            ...b,
            is_completed: false,
            completed_at: undefined,
          };
        }
        return b;
      })
    );
  };

  const handleAddTransaction = (newTxn: Transaction) => {
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleAddQuickExpense = (sample: { amount: number; category: string; merchant: string }) => {
    const newTxn: Transaction = {
      txn_id: `quick_${Date.now()}`,
      user_id: 'user_demo',
      txn_date: activeWeek.startDate,
      txn_time: new Date().toTimeString().split(' ')[0],
      amount: sample.amount,
      transaction_type: 'debit',
      payment_mode: 'UPI',
      main_category: sample.category,
      merchant_name: sample.merchant,
      source: 'Quick Sample',
      arrived_at: new Date().toISOString(),
    };
    handleAddTransaction(newTxn);
  };

  const handleResetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setMonthlyBudget(0);
    setWeeklyBudgets(DEFAULT_WEEKLY_BUDGETS);
    setTransactions([]);
    setSelectedWeekIndex(1);
    setJustFinishedWeek(null);
    setShowMonthCompletion(false);
  };

  const handleStartNewMonth = () => {
    const freshBudgets = weeklyBudgets.map((b) => ({
      ...b,
      is_completed: false,
      completed_at: undefined,
    }));
    setWeeklyBudgets(freshBudgets);
    setTransactions([]);
    setSelectedWeekIndex(1);
    setShowMonthCompletion(false);
  };

  return (
    <div className="w-full flex flex-col flex-1">
      {/* 1. Header: Nance Weekly Wins */}
      <header className="px-4 py-3 bg-white/95 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
              Weekly Wins
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">
              Small weekly wins. Better money habits.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Set Monthly & Weekly Budgets"
            aria-label="Set Budgets"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="How calculations work"
            aria-label="How calculations work"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset Demo"
            aria-label="Reset Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Main Body */}
      <main className="flex-1 p-3.5 sm:p-4 space-y-3 overflow-y-auto">
        {/* Subtle Budget Setting bar directly above four weekly boxes */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan:</span>
            <span className="text-xs font-black text-slate-800">{formatINR(monthlyBudget)}</span>
            <span className="text-[10px] text-slate-400">/ mo</span>
          </div>
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-600" />
            <span>Set Budget</span>
          </button>
        </div>

        {/* 2. Four Weekly Boxes at the Top: W1, W2, W3, W4 */}
        <MobileTopBoxes
          weeks={monthlyCalc.weeks}
          selectedWeekIndex={selectedWeekIndex}
          onSelectWeek={setSelectedWeekIndex}
        />

        {/* 3 to 8. Selected Week Tracker:
            - Week number and date range
            - Weekly budget summary (budget, spent, remaining)
            - Category spending two-column percentage cards
            - Quick demo expenses
            - Add expense button
            - Finish week prominent button */}
        <MobileWeeklyTracker
          activeWeek={activeWeek}
          onFinishWeek={handleFinishWeek}
          onReopenWeek={handleReopenWeek}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onAddQuickExpense={handleAddQuickExpense}
        />
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultDate={activeWeek.startDate}
        onAddTransaction={handleAddTransaction}
      />

      {/* Weekly Completion Result Modal (Scenario A & B: Weeks 1, 2, 3) */}
      {justFinishedWeek && (
        <WeekResultModal
          isOpen={Boolean(justFinishedWeek)}
          onClose={() => setJustFinishedWeek(null)}
          week={justFinishedWeek}
          hasNextWeek={justFinishedWeek.weekIndex < 4}
          onNextWeek={handleNextWeek}
        />
      )}

      {/* Monthly Completion Celebration Modal (Scenario C: Week 4 / All 4 Weeks Finished) */}
      <MonthCompletionModal
        isOpen={showMonthCompletion}
        onClose={() => setShowMonthCompletion(false)}
        monthlyCalc={monthlyCalc}
        onStartNewMonth={handleStartNewMonth}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        monthlyBudget={monthlyBudget}
        weeklyBudgets={weeklyBudgets}
        onSaveBudgets={handleSaveBudgets}
      />
    </div>
  );
};
