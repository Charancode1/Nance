import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { fireWinConfetti } from '../utils/confetti';
import {
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface WeeklyTrackerProps {
  weeks: WeeklyCalculation[];
  selectedWeekIndex: number | null;
  onSelectWeek: (weekIndex: number | null) => void;
}

export const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
}) => {
  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Weekly Spending Tracker</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare actual eligible spending against weekly budget limits.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Target: ₹1,000/week flexible limit
        </div>
      </div>

      {/* 4 Weekly Tracker Cards */}
      <div className="space-y-4 mt-5">
        {weeks.map((week) => {
          const isSelected = selectedWeekIndex === week.weekIndex;
          const isWin = week.status === 'within_budget';
          const percentVal = week.percentageUnderOrOver;
          const remainingOrOver = Math.abs(week.underBudgetAmount);

          // Calculate category distribution for this week
          const categoryTotals: { [key: string]: number } = {};
          week.transactions.forEach((tx) => {
            if (tx.is_eligible !== false && tx.transaction_type === 'debit') {
              categoryTotals[tx.main_category] =
                (categoryTotals[tx.main_category] || 0) + tx.amount;
            }
          });

          return (
            <div
              key={week.weekCode}
              id={`week-tracker-${week.weekIndex}`}
              className={`rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Top Row: Week Title, Dates, and Achievement Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-base text-slate-900">
                      {week.weekLabel}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      {formatDateLabel(week.startDate)} – {formatDateLabel(week.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Achievement: {week.achievementStatus}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Achievement: {week.achievementStatus}</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        const nextSelection = isSelected ? null : week.weekIndex;
                        onSelectWeek(nextSelection);
                        if (nextSelection && isWin) {
                          fireWinConfetti();
                        }
                      }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {isSelected ? 'Collapse' : 'Inspect'}
                    </button>
                  </div>
                </div>

                {/* 4 Key Values Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/50">
                  {/* 1. Limit */}
                  <div>
                    <span className="text-[11px] text-slate-500 block">Weekly Limit</span>
                    <span className="text-base sm:text-lg font-bold text-slate-800">
                      {formatINR(week.budgetAmount)}
                    </span>
                  </div>

                  {/* 2. Actual Spending */}
                  <div>
                    <span className="text-[11px] text-slate-500 block">Actual Spending</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {formatINR(week.actualSpending)}
                    </span>
                  </div>

                  {/* 3. Under / Over budget */}
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      {isWin ? 'Under Budget' : 'Overspending'}
                    </span>
                    <span
                      className={`text-base sm:text-lg font-extrabold flex items-center gap-1 ${
                        isWin ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isWin ? (
                        <>
                          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                          <span>{formatINR(remainingOrOver)}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4 text-amber-600" />
                          <span>{formatINR(remainingOrOver)}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* 4. Variance Percentage */}
                  <div>
                    <span className="text-[11px] text-slate-500 block">Variance</span>
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        isWin ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isWin ? `${percentVal}% under` : `${percentVal}% over`}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Spending Velocity</span>
                    <span>
                      {Math.round((week.actualSpending / (week.budgetAmount || 1)) * 100)}% of limit
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (week.actualSpending / (week.budgetAmount || 1)) * 100
                        )}%`,
                      }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWin ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Encouraging message */}
                <div
                  className={`mt-3 p-2.5 px-3 rounded-lg text-xs flex items-center gap-2 ${
                    isWin
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/60'
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isWin ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                  <span>{week.encouragingMessage}</span>
                </div>

                {/* Category Chips Preview */}
                {Object.keys(categoryTotals).length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 mr-1">Categories:</span>
                    {Object.entries(categoryTotals).map(([cat, amt]) => (
                      <span
                        key={cat}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        {cat}: {formatINR(amt)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
