import React from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { Wallet, Target, TrendingUp, Edit2, CheckCircle2, Clock } from 'lucide-react';

interface MonthlyOverviewProps {
  monthlyCalc: MonthlyCalculation;
  onOpenBudgetSetup: () => void;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  monthlyCalc,
  onOpenBudgetSetup,
}) => {
  const {
    monthlyBudget,
    totalWeeklyBudgets,
    unallocatedMonthlyBudget,
    totalEligibleSpending,
    monthlyDifference,
    monthlyPercentage,
    isUnderBudget,
    allWeeksCompleted,
    completedWeeksCount,
    weeklyWinsCount,
    statusLabel,
    headlineMessage,
  } = monthlyCalc;

  const spentPercentOfBudget =
    monthlyBudget > 0 ? Math.min(100, Math.round((totalEligibleSpending / monthlyBudget) * 100)) : 0;

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-subtle">
      {/* Header with Title and Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Monthly Budget & Progress</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                allWeeksCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {allWeeksCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{statusLabel}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{statusLabel}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Set your planned monthly limit, allocate weekly amounts, and monitor cumulative performance.
          </p>
        </div>

        <button
          onClick={onOpenBudgetSetup}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Adjust Monthly & Weekly Budgets</span>
        </button>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
        {/* Monthly Budget */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Monthly Budget</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatINR(monthlyBudget)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Allocated: {formatINR(totalWeeklyBudgets)} across 4 weeks
          </p>
        </div>

        {/* Total Spent Month-to-Date */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Eligible Spent</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatINR(totalEligibleSpending)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {spentPercentOfBudget}% of planned monthly limit
          </p>
        </div>

        {/* Amount Under / Over Budget */}
        <div
          className={`p-3.5 rounded-xl border ${
            isUnderBudget
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isUnderBudget ? 'text-emerald-800 font-semibold' : 'text-amber-800 font-semibold'}>
              {isUnderBudget ? 'Unspent Budget' : 'Over Budget'}
            </span>
            <Target className={`w-4 h-4 ${isUnderBudget ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold ${
              isUnderBudget ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isUnderBudget ? `+${formatINR(monthlyDifference)}` : `-${formatINR(Math.abs(monthlyDifference))}`}
          </div>
          <p className={`text-[11px] font-semibold mt-1 ${isUnderBudget ? 'text-emerald-700' : 'text-amber-700'}`}>
            {monthlyPercentage}% {isUnderBudget ? 'under budget' : 'over budget'}
          </p>
        </div>

        {/* Weekly Wins Claimed */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Weekly Wins</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Habit Progress
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {weeklyWinsCount} / 4 <span className="text-xs font-normal text-slate-500">Weeks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {completedWeeksCount} of 4 weeks finished
          </p>
        </div>
      </div>

      {/* Progress Bar & Allocation Breakdown */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span className="font-semibold">{headlineMessage}</span>
          <span className="text-slate-500">
            {formatINR(totalEligibleSpending)} of {formatINR(monthlyBudget)}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, (totalEligibleSpending / (monthlyBudget || 1)) * 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              isUnderBudget ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        {unallocatedMonthlyBudget > 0 && (
          <p className="text-[11px] text-slate-500 mt-2">
            💡 You have <strong>{formatINR(unallocatedMonthlyBudget)}</strong> unallocated in your monthly budget. You can distribute this into any upcoming week!
          </p>
        )}
      </div>
    </section>
  );
};
