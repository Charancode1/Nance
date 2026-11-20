import React, { useState, useMemo } from 'react';
import initialData from './data/mockData.json';
import { Budget, Transaction, WeeklyCalculation } from './types';
import { calculateMonthly } from './services/budgetCalculator';
import { MobileTopBoxes } from './components/MobileTopBoxes';
import { MobileMonthlyProgress } from './components/MobileMonthlyProgress';
import { MobileWeeklyTracker } from './components/MobileWeeklyTracker';
import { AddExpenseModal } from './components/AddExpenseModal';
import { WeekResultModal } from './components/WeekResultModal';
import { MonthCompletionModal } from './components/MonthCompletionModal';
import { RulesModal } from './components/RulesModal';
import { RotateCcw, HelpCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // State: User-controlled budgets and transactions
  const [monthlyBudget, setMonthlyBudget] = useState<number>(initialData.monthly_budget);
  const [weeklyBudgets, setWeeklyBudgets] = useState<Budget[]>(
    initialData.weekly_budgets as unknown as Budget[]
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialData.transactions as unknown as Transaction[]
  );

  // Active selected week (1..4)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(2);

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

  // Finish Week Handler (Section 5)
  const handleFinishWeek = (weekIndex: number) => {
    let completedWeekObj: WeeklyCalculation | null = null;

    setWeeklyBudgets((prev) => {
      const nextBudgets = prev.map((b) => {
        if (b.week_index === weekIndex) {
          return {
            ...b,
            is_completed: true,
            completed_at: new Date().toISOString(),
          };
        }
        return b;
      });

      // Recalculate with updated budgets to get exact result
      const updatedMonthly = calculateMonthly(monthlyBudget, nextBudgets, transactions);
      const finished = updatedMonthly.weeks.find((w) => w.weekIndex === weekIndex) || null;
      completedWeekObj = finished;

      // Check if all 4 weeks are now completed
      if (updatedMonthly.allWeeksCompleted) {
        setTimeout(() => setShowMonthCompletion(true), 600);
      }

      return nextBudgets;
    });

    if (completedWeekObj) {
      setJustFinishedWeek(completedWeekObj);
    }
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
    setMonthlyBudget(initialData.monthly_budget);
    setWeeklyBudgets(initialData.weekly_budgets as unknown as Budget[]);
    setTransactions(initialData.transactions as unknown as Transaction[]);
    setSelectedWeekIndex(2);
    setJustFinishedWeek(null);
    setShowMonthCompletion(false);
  };

  const handleStartNewMonth = () => {
    // Starts a fresh month with uncompleted weeks
    setWeeklyBudgets((prev) =>
      prev.map((b) => ({
        ...b,
        is_completed: false,
        completed_at: undefined,
      }))
    );
    setTransactions([]);
    setSelectedWeekIndex(1);
    setShowMonthCompletion(false);
  };

  return (
    <div className="min-h-screen bg-slate-900/10 flex justify-center py-0 sm:py-6 px-0 sm:px-4 font-sans antialiased">
      {/* Mobile-First Centered Container */}
      <div className="w-full max-w-[420px] bg-white min-h-screen sm:min-h-[820px] sm:rounded-[36px] shadow-2xl border-x sm:border border-slate-200/90 flex flex-col overflow-hidden relative">
        {/* Top App Bar */}
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="How calculations work"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetDemo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Main Body */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5 overflow-y-auto">
          {/* 1. Four Weekly Boxes at the Top (Section 2) */}
          <MobileTopBoxes
            weeks={monthlyCalc.weeks}
            selectedWeekIndex={selectedWeekIndex}
            onSelectWeek={setSelectedWeekIndex}
          />

          {/* 2. Monthly Progress: Percentage First (Section 3) */}
          <MobileMonthlyProgress monthlyCalc={monthlyCalc} />

          {/* 3. Selected Week: Simple Expense Tracker & Finish Week (Section 4 & 5) */}
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

      {justFinishedWeek && (
        <WeekResultModal
          isOpen={Boolean(justFinishedWeek)}
          onClose={() => setJustFinishedWeek(null)}
          week={justFinishedWeek}
          hasNextWeek={justFinishedWeek.weekIndex < 4}
          onNextWeek={() => {
            setSelectedWeekIndex(justFinishedWeek.weekIndex + 1);
            setJustFinishedWeek(null);
          }}
        />
      )}

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
