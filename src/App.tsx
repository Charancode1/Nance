import React, { useState, useMemo } from 'react';
import initialData from './data/mockData.json';
import { Budget, Transaction } from './types';
import { calculateMonthly } from './services/budgetCalculator';
import { Header } from './components/Header';
import { MonthlyOverview } from './components/MonthlyOverview';
import { WeeklyWinsStrip } from './components/WeeklyWinsStrip';
import { WeeklyTracker } from './components/WeeklyTracker';
import { MonthlyResultCard } from './components/MonthlyResultCard';
import { BudgetSetupModal } from './components/BudgetSetupModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { RulesModal } from './components/RulesModal';

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
  const [isBudgetSetupOpen, setIsBudgetSetupOpen] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

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

  // Handlers
  const handleFinishWeek = (weekIndex: number) => {
    setWeeklyBudgets((prev) =>
      prev.map((b) => {
        if (b.week_index === weekIndex) {
          if (b.is_completed) return b; // Prevent duplicate clicks
          return {
            ...b,
            is_completed: true,
            completed_at: new Date().toISOString(),
          };
        }
        return b;
      })
    );
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

  const handleSaveBudgets = (newMonthly: number, newWeekly: Budget[]) => {
    setMonthlyBudget(newMonthly);
    setWeeklyBudgets(newWeekly);
  };

  const handleResetDemo = () => {
    setMonthlyBudget(initialData.monthly_budget);
    setWeeklyBudgets(initialData.weekly_budgets as unknown as Budget[]);
    setTransactions(initialData.transactions as unknown as Transaction[]);
    setSelectedWeekIndex(2);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Experience: Set Budget -> Track Expenses -> Finish Week -> See Result */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 1. Monthly Budget & Progress Overview */}
        <MonthlyOverview
          monthlyCalc={monthlyCalc}
          onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)}
        />

        {/* 2. Compact 4-Week Wins Strip */}
        <WeeklyWinsStrip
          weeks={monthlyCalc.weeks}
          selectedWeekIndex={selectedWeekIndex}
          onSelectWeek={setSelectedWeekIndex}
        />

        {/* 3. The Core Feature: Weekly Tracker with Category Spending, Finish Week Button & Expenses */}
        <WeeklyTracker
          activeWeek={activeWeek}
          onFinishWeek={handleFinishWeek}
          onReopenWeek={handleReopenWeek}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onAddQuickExpense={handleAddQuickExpense}
        />

        {/* 4. Overall Monthly Results & Week-by-Week Audit Table */}
        <MonthlyResultCard
          monthlyCalc={monthlyCalc}
          onSelectWeek={setSelectedWeekIndex}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Nance</span>
            <span>•</span>
            <span>Weekly Wins Budgeting Habit Demo</span>
          </div>
          <div>Small weekly wins. Better money habits.</div>
        </div>
      </footer>

      {/* Modals */}
      <BudgetSetupModal
        isOpen={isBudgetSetupOpen}
        onClose={() => setIsBudgetSetupOpen(false)}
        monthlyBudget={monthlyBudget}
        weeklyBudgets={weeklyBudgets}
        onSaveBudgets={handleSaveBudgets}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultDate={activeWeek.startDate}
        onAddTransaction={handleAddTransaction}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};

export default App;
