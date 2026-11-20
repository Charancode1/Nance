import React, { useState, useMemo, useEffect } from 'react';
import {
  WeeklySavingsBudget,
  WeeklySavingsCalculation,
} from '../types/saveFirst';
import { Transaction } from '../types';
import { calculateMonthlySavings } from '../services/saveFirstCalculator';
import { formatINR } from '../utils/formatters';
import { SaveFirstTopBoxes } from '../components/saveFirst/SaveFirstTopBoxes';
import { SaveFirstTracker } from '../components/saveFirst/SaveFirstTracker';
import { SaveFirstBudgetModal } from '../components/saveFirst/SaveFirstBudgetModal';
import { SaveFirstWeekModal } from '../components/saveFirst/SaveFirstWeekModal';
import { SaveFirstMonthModal } from '../components/saveFirst/SaveFirstMonthModal';
import { SaveFirstRulesModal } from '../components/saveFirst/SaveFirstRulesModal';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { RotateCcw, HelpCircle, PiggyBank, SlidersHorizontal } from 'lucide-react';

const SAVE_FIRST_STORAGE_KEY = 'nance_save_first_data';

const DEFAULT_SAVE_FIRST_WEEKLY_BUDGETS: WeeklySavingsBudget[] = [
  {
    budget_id: 'sf_w1',
    week_index: 1,
    from_date: '2026-10-01',
    to_date: '2026-10-07',
    budget_amount: 0,
    savings_target: 0,
    is_completed: false,
  },
  {
    budget_id: 'sf_w2',
    week_index: 2,
    from_date: '2026-10-08',
    to_date: '2026-10-14',
    budget_amount: 0,
    savings_target: 0,
    is_completed: false,
  },
  {
    budget_id: 'sf_w3',
    week_index: 3,
    from_date: '2026-10-15',
    to_date: '2026-10-21',
    budget_amount: 0,
    savings_target: 0,
    is_completed: false,
  },
  {
    budget_id: 'sf_w4',
    week_index: 4,
    from_date: '2026-10-22',
    to_date: '2026-10-28',
    budget_amount: 0,
    savings_target: 0,
    is_completed: false,
  },
];

function loadSaveFirstState(): {
  monthlyBudget: number;
  monthlySavingsGoal: number;
  weeklyBudgets: WeeklySavingsBudget[];
  transactions: Transaction[];
  selectedWeekIndex: number;
} {
  try {
    const saved = localStorage.getItem(SAVE_FIRST_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          monthlyBudget: typeof parsed.monthlyBudget === 'number' ? parsed.monthlyBudget : 0,
          monthlySavingsGoal: typeof parsed.monthlySavingsGoal === 'number' ? parsed.monthlySavingsGoal : 0,
          weeklyBudgets:
            Array.isArray(parsed.weeklyBudgets) && parsed.weeklyBudgets.length === 4
              ? parsed.weeklyBudgets
              : DEFAULT_SAVE_FIRST_WEEKLY_BUDGETS,
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
    // Ignore storage parse errors
  }

  return {
    monthlyBudget: 0,
    monthlySavingsGoal: 0,
    weeklyBudgets: DEFAULT_SAVE_FIRST_WEEKLY_BUDGETS,
    transactions: [],
    selectedWeekIndex: 1,
  };
}

export const SaveFirstPage: React.FC = () => {
  const initial = useMemo(() => loadSaveFirstState(), []);

  const [monthlyBudget, setMonthlyBudget] = useState<number>(initial.monthlyBudget);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState<number>(initial.monthlySavingsGoal);
  const [weeklyBudgets, setWeeklyBudgets] = useState<WeeklySavingsBudget[]>(initial.weeklyBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(initial.selectedWeekIndex);

  // Sync to separate localStorage key
  useEffect(() => {
    try {
      localStorage.setItem(
        SAVE_FIRST_STORAGE_KEY,
        JSON.stringify({
          monthlyBudget,
          monthlySavingsGoal,
          weeklyBudgets,
          transactions,
          selectedWeekIndex,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [monthlyBudget, monthlySavingsGoal, weeklyBudgets, transactions, selectedWeekIndex]);

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [justFinishedWeek, setJustFinishedWeek] = useState<WeeklySavingsCalculation | null>(null);
  const [showMonthCompletion, setShowMonthCompletion] = useState<boolean>(false);

  // Calculation engine execution
  const monthlyCalc = useMemo(() => {
    return calculateMonthlySavings(
      monthlyBudget,
      monthlySavingsGoal,
      weeklyBudgets,
      transactions
    );
  }, [monthlyBudget, monthlySavingsGoal, weeklyBudgets, transactions]);

  // Active week calculation
  const activeWeek = useMemo(() => {
    return (
      monthlyCalc.weeks.find((w) => w.weekIndex === selectedWeekIndex) ||
      monthlyCalc.weeks[0]
    );
  }, [monthlyCalc.weeks, selectedWeekIndex]);

  const handleSaveBudgets = (
    newMonthlyBudget: number,
    newMonthlySavingsGoal: number,
    newWeeklyBudgets: WeeklySavingsBudget[]
  ) => {
    setMonthlyBudget(newMonthlyBudget);
    setMonthlySavingsGoal(newMonthlySavingsGoal);
    setWeeklyBudgets(newWeeklyBudgets);
  };

  const handleAddTransaction = (newTxn: Transaction) => {
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleAddQuickExpense = (sample: { amount: number; category: string; merchant: string }) => {
    const newTxn: Transaction = {
      txn_id: `sf_quick_${Date.now()}`,
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

  const handleFinishWeek = (weekIndex: number) => {
    const nextBudgets = weeklyBudgets.map((b) => {
      if (b.week_index === weekIndex) {
        if (b.is_completed) return b;
        return {
          ...b,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setWeeklyBudgets(nextBudgets);

    const updatedMonthly = calculateMonthlySavings(
      monthlyBudget,
      monthlySavingsGoal,
      nextBudgets,
      transactions
    );
    const finishedWeekCalc = updatedMonthly.weeks.find((w) => w.weekIndex === weekIndex);

    if (weekIndex === 4 || updatedMonthly.allWeeksCompleted) {
      setJustFinishedWeek(null);
      setShowMonthCompletion(true);
    } else if (finishedWeekCalc) {
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

  const handleResetDemo = () => {
    try {
      localStorage.removeItem(SAVE_FIRST_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setMonthlyBudget(0);
    setMonthlySavingsGoal(0);
    setWeeklyBudgets(DEFAULT_SAVE_FIRST_WEEKLY_BUDGETS);
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
      {/* 1. Header: Nance Save First */}
      <header className="px-4 py-3 bg-white/95 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
              Save First
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">
              Save a little first. Build a better tomorrow.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Set Monthly & Weekly Savings Targets"
            aria-label="Set Budget"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="How Save First works"
            aria-label="How Save First works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset Save First Demo"
            aria-label="Reset Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-3.5 sm:p-4 space-y-3 overflow-y-auto">
        {/* 2. Monthly Plan & Savings Goal Bar */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan:</span>
            <span className="text-xs font-black text-slate-800">{formatINR(monthlyBudget)}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Goal:</span>
            <span className="text-xs font-black text-emerald-700">{formatINR(monthlySavingsGoal)}</span>
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

        {/* 3. Four Weekly Cards: W1, W2, W3, W4 */}
        <SaveFirstTopBoxes
          weeks={monthlyCalc.weeks}
          selectedWeekIndex={selectedWeekIndex}
          onSelectWeek={setSelectedWeekIndex}
        />

        {/* 4. Selected Week Savings Tracker */}
        <SaveFirstTracker
          activeWeek={activeWeek}
          onFinishWeek={handleFinishWeek}
          onReopenWeek={handleReopenWeek}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onAddQuickExpense={handleAddQuickExpense}
        />
      </main>

      {/* Modals */}
      <SaveFirstBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        monthlyBudget={monthlyBudget}
        monthlySavingsGoal={monthlySavingsGoal}
        weeklyBudgets={weeklyBudgets}
        onSaveBudgets={handleSaveBudgets}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultDate={activeWeek.startDate}
        onAddTransaction={handleAddTransaction}
      />

      {justFinishedWeek && (
        <SaveFirstWeekModal
          isOpen={Boolean(justFinishedWeek)}
          onClose={() => setJustFinishedWeek(null)}
          week={justFinishedWeek}
          hasNextWeek={justFinishedWeek.weekIndex < 4}
          onNextWeek={handleNextWeek}
        />
      )}

      <SaveFirstMonthModal
        isOpen={showMonthCompletion}
        onClose={() => setShowMonthCompletion(false)}
        monthlyCalc={monthlyCalc}
        onStartNewMonth={handleStartNewMonth}
      />

      <SaveFirstRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};
