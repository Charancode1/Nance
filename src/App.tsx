import React, { useState, useMemo } from 'react';
import initialData from './data/mockData.json';
import { User, Transaction, Budget, UserFinancialProfile } from './types';
import { calculateMonthlyProgress } from './services/budgetCalculator';
import { Navbar } from './components/Navbar';
import { MonthlyMoneyPlan } from './components/MonthlyMoneyPlan';
import { WeeklyWinsCalendar } from './components/WeeklyWinsCalendar';
import { WeeklyTracker } from './components/WeeklyTracker';
import { MonthlyProgress } from './components/MonthlyProgress';
import { TransactionBreakdown } from './components/TransactionBreakdown';
import { AddTransactionModal } from './components/AddTransactionModal';
import { EditPlanModal } from './components/EditPlanModal';
import { RulesExplainerModal } from './components/RulesExplainerModal';

export const App: React.FC = () => {
  // State for all users and their editable transactions and profiles
  const [usersState, setUsersState] = useState<User[]>(initialData.users as unknown as User[]);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_aarav_01');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  // View state
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Modals state
  const [isAddTxnOpen, setIsAddTxnOpen] = useState<boolean>(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Find active user
  const currentUser = useMemo(() => {
    return usersState.find((u) => u.user_id === currentUserId) || usersState[0];
  }, [usersState, currentUserId]);

  // Dynamic monthly calculation engine execution
  const monthlyCalc = useMemo(() => {
    return calculateMonthlyProgress(
      currentUser.profile,
      currentUser.budgets,
      currentUser.transactions
    );
  }, [currentUser]);

  // Handlers
  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
    setSelectedWeekIndex(null);
  };

  const handleAddTransaction = (newTxn: Transaction) => {
    setUsersState((prev) =>
      prev.map((u) => {
        if (u.user_id === currentUserId) {
          return {
            ...u,
            transactions: [newTxn, ...u.transactions],
          };
        }
        return u;
      })
    );
  };

  const handleSavePlan = (
    updatedProfile: UserFinancialProfile,
    updatedBudgets: Budget[]
  ) => {
    setUsersState((prev) =>
      prev.map((u) => {
        if (u.user_id === currentUserId) {
          return {
            ...u,
            profile: updatedProfile,
            budgets: updatedBudgets,
          };
        }
        return u;
      })
    );
  };

  const handleResetData = () => {
    setUsersState(initialData.users as unknown as User[]);
    setSelectedWeekIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        users={usersState}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenAddTxn={() => setIsAddTxnOpen(true)}
        onOpenEditPlan={() => setIsEditPlanOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* If Mobile Frame Mode is enabled */}
        {isMobileFrame ? (
          <div className="flex flex-col items-center justify-center my-4">
            <div className="mb-3 text-xs text-slate-500 font-medium">
              📱 Mobile Device Simulation Mode (390px × 844px)
            </div>
            {/* Phone Frame */}
            <div className="w-[395px] min-h-[820px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-8 ring-slate-800/80 relative">
              {/* Dynamic Island Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Inner Phone Screen */}
              <div className="w-full h-full bg-[#F8FAFC] rounded-[40px] pt-10 pb-6 px-3.5 overflow-y-auto max-h-[790px] space-y-4">
                <MonthlyMoneyPlan
                  profile={currentUser.profile}
                  monthlyCalc={monthlyCalc}
                  onEditPlan={() => setIsEditPlanOpen(true)}
                />

                <WeeklyWinsCalendar
                  weeks={monthlyCalc.weeklyCalculations}
                  selectedWeekIndex={selectedWeekIndex}
                  onSelectWeek={setSelectedWeekIndex}
                  appActivityDates={currentUser.app_activity}
                />

                <MonthlyProgress
                  monthlyCalc={monthlyCalc}
                  onOpenRules={() => setIsRulesOpen(true)}
                />

                <WeeklyTracker
                  weeks={monthlyCalc.weeklyCalculations}
                  selectedWeekIndex={selectedWeekIndex}
                  onSelectWeek={setSelectedWeekIndex}
                />

                <TransactionBreakdown
                  transactions={currentUser.transactions}
                  weeks={monthlyCalc.weeklyCalculations}
                  selectedWeekIndex={selectedWeekIndex}
                  onSelectWeek={setSelectedWeekIndex}
                  onOpenAddTxn={() => setIsAddTxnOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Desktop & Tablet Dashboard Layout */
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Persona Hero Callout */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-200 border-2 border-emerald-400 flex items-center justify-center text-sm font-extrabold text-emerald-900 shadow-sm flex-shrink-0">
                  {currentUser.profile.avatar ? (
                    <img
                      src={currentUser.profile.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name[0]
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black text-slate-900">
                      {currentUser.name}
                    </h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {currentUser.city}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {currentUser.profile.tagline || currentUser.profile.living_arrangement}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span>Monthly Allowance: ₹{currentUser.profile.monthly_allowance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* 1. Monthly Money Plan (Section A) */}
            <MonthlyMoneyPlan
              profile={currentUser.profile}
              monthlyCalc={monthlyCalc}
              onEditPlan={() => setIsEditPlanOpen(true)}
            />

            {/* 2. Monthly Cumulative Progress (Section D - The Most Important Feature) */}
            <MonthlyProgress
              monthlyCalc={monthlyCalc}
              onOpenRules={() => setIsRulesOpen(true)}
            />

            {/* Two-Column Grid: Weekly Wins Calendar & Weekly Spending Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Weekly Wins Calendar (Section C) */}
              <div className="lg:col-span-12 xl:col-span-5">
                <WeeklyWinsCalendar
                  weeks={monthlyCalc.weeklyCalculations}
                  selectedWeekIndex={selectedWeekIndex}
                  onSelectWeek={setSelectedWeekIndex}
                  appActivityDates={currentUser.app_activity}
                />
              </div>

              {/* Right Column: Weekly Spending Tracker (Section B) */}
              <div className="lg:col-span-12 xl:col-span-7">
                <WeeklyTracker
                  weeks={monthlyCalc.weeklyCalculations}
                  selectedWeekIndex={selectedWeekIndex}
                  onSelectWeek={setSelectedWeekIndex}
                />
              </div>
            </div>

            {/* 5. Transaction Breakdown (Section 4) */}
            <TransactionBreakdown
              transactions={currentUser.transactions}
              weeks={monthlyCalc.weeklyCalculations}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              onOpenAddTxn={() => setIsAddTxnOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Nance</span>
            <span>•</span>
            <span>Weekly Wins for Indian College Students</span>
          </div>
          <div>
            Small weekly wins. Better money habits.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxnOpen}
        onClose={() => setIsAddTxnOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <EditPlanModal
        isOpen={isEditPlanOpen}
        onClose={() => setIsEditPlanOpen(false)}
        profile={currentUser.profile}
        budgets={currentUser.budgets}
        onSavePlan={handleSavePlan}
      />

      <RulesExplainerModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};

export default App;
