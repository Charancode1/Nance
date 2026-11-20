import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import {
  CheckCircle,
  PlusCircle,
  CheckCircle2,
  RotateCcw,
  Tag,
  Zap,
} from 'lucide-react';

interface MobileWeeklyTrackerProps {
  activeWeek: WeeklyCalculation;
  onFinishWeek: (weekIndex: number) => void;
  onReopenWeek: (weekIndex: number) => void;
  onOpenAddExpense: () => void;
  onAddQuickExpense: (sample: { amount: number; category: string; merchant: string }) => void;
}

export const MobileWeeklyTracker: React.FC<MobileWeeklyTrackerProps> = ({
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
    actualSpending,
    remainingBudget,
    isUnderBudget,
    isCompleted,
    categoryBreakdown,
  } = activeWeek;

  const quickSamples = [
    { label: '+ ₹40 Food', amount: 40, category: 'Food & Dining', merchant: 'Chai & Snacks' },
    { label: '+ ₹250 Groceries', amount: 250, category: 'Groceries', merchant: 'Blinkit' },
    { label: '+ ₹60 Auto/Metro', amount: 60, category: 'Transportation', merchant: 'Namma Metro' },
    { label: '+ ₹180 Shopping', amount: 180, category: 'Shopping', merchant: 'Stationery' },
  ];

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-subtle text-left space-y-4">
      {/* 3. Selected Week Tracker: Week Number & Date Range */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900">{weekLabel} Tracker</h3>
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

      {/* 4. Weekly Budget Summary: Budget, Spent, Remaining */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Budget
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-800">
            {formatINR(budgetAmount)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Spent
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900">
            {formatINR(actualSpending)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            {isUnderBudget ? 'Remaining' : 'Exceeded'}
          </span>
          <span
            className={`text-sm sm:text-base font-black ${
              isUnderBudget ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isUnderBudget
              ? `+${formatINR(remainingBudget)}`
              : `-${formatINR(Math.abs(remainingBudget))}`}
          </span>
        </div>
      </div>

      {/* 5. Category Spending: Compact Two-Column Percentage Cards Grid */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Category Spending</span>
          </span>
          <span className="text-slate-400 font-normal text-[11px]">
            {categoryBreakdown.length} active
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            No expenses recorded for this week yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.category}
                className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between text-left"
              >
                <div>
                  <span
                    className="text-[11px] font-semibold text-slate-600 block truncate"
                    title={cat.category}
                  >
                    {cat.category}
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {formatINR(cat.amount)}
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold text-emerald-700">{cat.percentageOfTotal}%</span>
                    <span className="text-slate-400 text-[9px]">{cat.transactionCount} txn</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(5, cat.percentageOfTotal))}%`,
                      }}
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Quick Demo Expenses & 7. Add Expense Button */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Quick Demo Expenses</span>
          </span>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>
        </div>

        {/* 1-Tap Quick Demo Expense Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {quickSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAddQuickExpense(sample)}
              className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 text-slate-700 border border-slate-200 font-medium transition-colors truncate"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8. Prominent FINISH WEEK Button */}
      <div className="pt-2">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => onFinishWeek(weekIndex)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
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
