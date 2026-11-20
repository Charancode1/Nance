import React, { useMemo } from 'react';
import { WeeklySavingsCalculation } from '../../types/saveFirst';
import { formatINR, formatDateLabel } from '../../utils/formatters';
import {
  CheckCircle,
  PlusCircle,
  PiggyBank,
  CheckCircle2,
  Tag,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface SaveFirstTrackerProps {
  activeWeek: WeeklySavingsCalculation;
  onFinishWeek: (weekIndex: number) => void;
  onReopenWeek: (weekIndex: number) => void;
  onOpenAddExpense: () => void;
  onAddQuickExpense: (sample: { amount: number; category: string; merchant: string }) => void;
}

export const SaveFirstTracker: React.FC<SaveFirstTrackerProps> = ({
  activeWeek,
  onFinishWeek,
  onReopenWeek,
  onOpenAddExpense,
  onAddQuickExpense,
}) => {
  const {
    weekIndex,
    weekLabel,
    startDate,
    endDate,
    budgetAmount,
    savingsGoal,
    spendingLimit,
    actualSpending,
    potentialSavings,
    amountSaved,
    extraSaved,
    shortfall,
    overspentAmount,
    savingsPercentage,
    isGoalAchieved,
    isPartiallyAchieved,
    isOverspent,
    isCompleted,
    resultMessage,
    categoryBreakdown,
  } = activeWeek;

  // Sort categories from highest spending to lowest
  const sortedCategories = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
  }, [categoryBreakdown]);

  const quickSamples = [
    { label: '+ ₹40 Food', amount: 40, category: 'Food & Dining', merchant: 'Tea & Snacks' },
    { label: '+ ₹250 Groceries', amount: 250, category: 'Groceries', merchant: 'Zepto' },
    { label: '+ ₹60 Transport', amount: 60, category: 'Transportation', merchant: 'Auto Ride' },
    { label: '+ ₹180 Shopping', amount: 180, category: 'Shopping', merchant: 'Stationery' },
  ];

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-subtle text-left space-y-4">
      {/* 1. Header: Week Title & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900">{weekLabel} Savings Tracker</h3>
          <span className="text-xs text-slate-500 font-medium">
            {formatDateLabel(startDate)} – {formatDateLabel(endDate)}
          </span>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Finished</span>
            </span>
            <button
              type="button"
              onClick={() => onReopenWeek(weekIndex)}
              className="text-[11px] text-slate-400 hover:text-slate-700 underline p-1 flex items-center gap-0.5"
              title="Reopen week to adjust"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. SAVINGS PROGRESS HERO CARD */}
      {!isCompleted ? (
        /* BEFORE CLICKING FINISH WEEK: Neutral, encouraging POTENTIAL SAVINGS card */
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Potential Savings
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              In Progress
            </span>
          </div>

          {/* Potential Savings Amount */}
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatINR(potentialSavings)}{' '}
              {savingsGoal > 0 && (
                <span className="text-sm sm:text-base font-bold text-slate-500">
                  / {formatINR(savingsGoal)} Goal
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-800 mt-1 leading-snug">
              {resultMessage}
            </p>
          </div>

          {/* Visual Track: Spending within limit */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    spendingLimit > 0
                      ? Math.round((actualSpending / spendingLimit) * 100)
                      : 0
                  )}%`,
                }}
                className={`h-full rounded-full transition-all duration-500 ${
                  actualSpending > spendingLimit ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Spent: {formatINR(actualSpending)}</span>
              <span>Spending Limit: {formatINR(spendingLimit)}</span>
            </div>
          </div>
        </div>
      ) : (
        /* AFTER CLICKING FINISH WEEK: Confirmed Savings Achievements card */
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Amount Saved This Week
              </span>
            </div>
            {savingsGoal > 0 && isGoalAchieved && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                {extraSaved > 0 ? `+${formatINR(extraSaved)} Extra! 🎉` : 'Goal Met! 🎉'}
              </span>
            )}
            {savingsGoal > 0 && isPartiallyAchieved && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                Partially Saved
              </span>
            )}
            {isOverspent && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                Over Budget
              </span>
            )}
          </div>

          {/* Confirmed Amount Saved / Goal */}
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatINR(amountSaved)}{' '}
              <span className="text-base sm:text-lg font-bold text-slate-400">
                / {formatINR(savingsGoal)} Goal
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              {savingsGoal === 0
                ? 'Completed with ₹0 savings goal.'
                : isGoalAchieved
                ? `${savingsPercentage}% of savings goal achieved! (${formatINR(amountSaved)} kept aside)`
                : isPartiallyAchieved
                ? `${savingsPercentage}% achieved (${formatINR(shortfall)} short of goal)`
                : `Overspent by ${formatINR(overspentAmount)} (₹0 kept aside)`}
            </p>
          </div>

          {/* Green Confirmed Savings Progress Bar */}
          <div className="w-full bg-emerald-200/70 h-3 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${Math.min(100, savingsPercentage)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalAchieved
                  ? 'bg-emerald-600 shadow-xs'
                  : amountSaved > 0
                  ? 'bg-emerald-500'
                  : 'bg-transparent'
              }`}
            />
          </div>

          <p className="text-[10px] text-slate-500 pt-0.5 border-t border-emerald-100/80">
            ✅ <strong>Confirmed Savings</strong>: {resultMessage}
          </p>
        </div>
      )}

      {/* 3. Weekly Allocation & Spending Summary (4-item grid) */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
            Budget
          </span>
          <span className="text-xs font-bold text-slate-800">
            {formatINR(budgetAmount)}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-emerald-700 block mb-0.5">
            Savings Goal
          </span>
          <span className="text-xs font-bold text-emerald-800">
            {formatINR(savingsGoal)}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
            Spend Limit
          </span>
          <span className="text-xs font-bold text-slate-900">
            {formatINR(spendingLimit)}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
            Actual Spent
          </span>
          <span
            className={`text-xs font-bold ${
              actualSpending > spendingLimit && spendingLimit > 0
                ? 'text-amber-600'
                : 'text-slate-800'
            }`}
          >
            {formatINR(actualSpending)}
          </span>
        </div>
      </div>

      {/* 4. Spending Categories: Improved Two-Column Cards Grid with Progress Bars */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Category Spending</span>
          </span>
          <span className="text-slate-400 font-normal text-[11px]">
            {sortedCategories.length} {sortedCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            No expenses recorded for this week yet.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {sortedCategories.map((cat, idx) => {
                const isTopSpender = idx === 0 && sortedCategories.length > 1;

                return (
                  <div
                    key={cat.category}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                      isTopSpender
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/90 border-slate-200/80'
                    }`}
                  >
                    {/* Category Title & Top Tag */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="text-[11px] font-bold text-slate-700 truncate block"
                        title={cat.category}
                      >
                        {cat.category}
                      </span>
                      {isTopSpender && (
                        <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-emerald-600 text-white shrink-0">
                          Top
                        </span>
                      )}
                    </div>

                    {/* Amount & Percentage */}
                    <div className="flex items-baseline justify-between text-xs my-0.5">
                      <span className="font-extrabold text-slate-900">
                        {formatINR(cat.amount)}
                      </span>
                      <span className="font-bold text-[10px] text-emerald-800">
                        {cat.percentageOfTotal}%
                      </span>
                    </div>

                    {/* Horizontal Progress Bar representing share of total spending */}
                    <div className="mt-1.5 pt-1 border-t border-slate-200/50">
                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(2, cat.percentageOfTotal))}%`,
                          }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTopSpender ? 'bg-emerald-600' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supporting Caption */}
            <p className="text-[10px] text-slate-500 text-center sm:text-left italic pt-0.5">
              See where your money goes and find opportunities to save more next week.
            </p>
          </div>
        )}
      </div>

      {/* 5. Demo Expenses Controls */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Quick Demo Expenses</span>
          </span>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {quickSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAddQuickExpense(sample)}
              className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 border border-slate-200 font-medium transition-colors truncate cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. FINISH WEEK Button */}
      <div className="pt-2">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => onFinishWeek(weekIndex)}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finish {weekLabel}</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs text-center border border-slate-200">
            {activeWeek.resultMessage}
          </div>
        )}
      </div>
    </section>
  );
};
