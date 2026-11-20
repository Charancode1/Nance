import React, { useState, useMemo, useEffect } from 'react';
import initialData from './data/mockData.json';
import { Budget, Transaction, WeeklyCalculation } from './types';
import { calculateMonthly } from './services/budgetCalculator';
import { MobileTopBoxes } from './components/MobileTopBoxes';
import { MobileWeeklyTracker } from './components/MobileWeeklyTracker';
import { AddExpenseModal } from './components/AddExpenseModal';
import { WeekResultModal } from './components/WeekResultModal';
import { MonthCompletionModal } from './components/MonthCompletionModal';
import { RulesModal } from './components/RulesModal';
import { RotateCcw, HelpCircle, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'nance_weekly_wins_data';

export const App: React.FC = () => {
  // State with localStorage persistence across page refreshes
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.monthlyBudget === 'number') return parsed.monthlyBudget;
      }
    } catch {
      // Ignore storage errors
    }
    return initialData.monthly_budget;
  });

  const [weeklyBudgets, setWeeklyBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.weeklyBudgets)) return parsed.weeklyBudgets;
      }
    } catch {
      // Ignore storage errors
    }
    return initialData.weekly_budgets as unknown as Budget[];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions)) return parsed.transactions;
      }
    } catch {
      // Ignore storage errors
    }
    return initialData.transactions as unknown as Transaction[];
  });

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedWeekIndex === 'number') return parsed.selectedWeekIndex;
      }
    } catch {
      // Ignore storage errors
    }
    return 2;
  });

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
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [justFinishedWeek, setJustFinishedWeek] = useState<WeeklyCalculation | null>(null);
  const [showMonthCompletion, setShowMonthCompletion] = useState<boolean>(false);

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
    setMonthlyBudget(initialData.monthly_budget);
    setWeeklyBudgets(initialData.weekly_budgets as unknown as Budget[]);
    setTransactions(initialData.transactions as unknown as Transaction[]);
    setSelectedWeekIndex(2);
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
    <div className="min-h-screen bg-slate-900/10 flex justify-center py-0 sm:py-6 px-0 sm:px-4 font-sans antialiased">
      {/* Mobile-First Centered Container */}
      <div className="w-full max-w-[420px] bg-white min-h-screen sm:min-h-[800px] sm:rounded-[36px] shadow-2xl border-x sm:border border-slate-200/90 flex flex-col overflow-hidden relative">
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
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5 overflow-y-auto">
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
      </div>

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
    </div>
  );
};

export default App;
