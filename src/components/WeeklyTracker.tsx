import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { isEligibleTransaction, getExclusionReason } from '../services/budgetCalculator';
import {
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  Tag,
  Clock,
  RotateCcw,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface WeeklyTrackerProps {
  activeWeek: WeeklyCalculation;
  onFinishWeek: (weekIndex: number) => void;
  onReopenWeek: (weekIndex: number) => void;
  onOpenAddExpense: () => void;
  onAddQuickExpense: (sample: { amount: number; category: string; merchant: string }) => void;
}

export const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({
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
    spendingPercentage,
    differencePercentage,
    isUnderBudget,
    isCompleted,
    resultStatus,
    resultMessage,
    categoryBreakdown,
    transactions,
  } = activeWeek;

  const quickSamples = [
    { label: '+ ₹40 Food & Dining', amount: 40, category: 'Food & Dining', merchant: 'Chai & Snacks' },
    { label: '+ ₹250 Groceries', amount: 250, category: 'Groceries', merchant: 'Blinkit' },
    { label: '+ ₹60 Transportation', amount: 60, category: 'Transportation', merchant: 'Metro Ticket' },
    { label: '+ ₹180 Shopping', amount: 180, category: 'Shopping', merchant: 'Stationery Store' },
  ];

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-subtle space-y-6">
      {/* Top Header: Week Title, Dates, and Finish Week CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900">{weekLabel} Tracker</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {formatDateLabel(startDate)} – {formatDateLabel(endDate)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily spending against your {formatINR(budgetAmount)} budget. When the week ends, click Finish Week.
          </p>
        </div>

        {/* The Main Finish Week Action */}
        <div className="flex items-center gap-2">
          {!isCompleted ? (
            <button
              onClick={() => onFinishWeek(weekIndex)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finish {weekLabel}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Week Completed</span>
              </span>
              <button
                onClick={() => onReopenWeek(weekIndex)}
                className="text-xs text-slate-500 hover:text-slate-800 underline p-1 flex items-center gap-1"
                title="Reopen week to make adjustments"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reopen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Callout (If Finished or Live Message) */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isCompleted
            ? resultStatus === 'win'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {isCompleted ? (
          resultStatus === 'win' ? (
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )
        ) : (
          <Clock className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <strong className="text-sm">
              {isCompleted
                ? resultStatus === 'win'
                  ? `Weekly Win! ${differencePercentage}% Under Budget`
                  : `Above Budget: ${differencePercentage}% Over`
                : 'Week Status: In Progress'}
            </strong>
          </div>
          <p className="text-xs mt-0.5 leading-relaxed">{resultMessage}</p>
        </div>
      </div>

      {/* 4 Core Financial Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
        <div>
          <span className="text-[11px] text-slate-500 block mb-0.5">Weekly Budget</span>
          <span className="text-xl font-bold text-slate-900">{formatINR(budgetAmount)}</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block mb-0.5">Total Amount Spent</span>
          <span className="text-xl font-bold text-slate-900">{formatINR(actualSpending)}</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block mb-0.5">
            {isUnderBudget ? 'Remaining Budget' : 'Amount Over Budget'}
          </span>
          <span
            className={`text-xl font-extrabold ${
              isUnderBudget ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isUnderBudget
              ? `+${formatINR(remainingBudget)}`
              : `-${formatINR(Math.abs(remainingBudget))}`}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 block mb-0.5">Spending Pace</span>
          <span
            className={`text-xl font-bold ${
              isUnderBudget ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {spendingPercentage}%
          </span>
        </div>
      </div>

      {/* Visual Spending Velocity Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Weekly Budget Utilization</span>
          <span>{spendingPercentage}% of {formatINR(budgetAmount)}</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, spendingPercentage)}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              isUnderBudget ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Category-Wise Spending Breakdown */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Expenses Grouped by Category</h3>
          </div>
          <span className="text-xs text-slate-500">
            {categoryBreakdown.length} active {categoryBreakdown.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            No expenses recorded for this week yet. Add your first expense below!
          </div>
        ) : (
          <div className="space-y-2.5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="bg-slate-50/70 p-2.5 px-3.5 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{cat.category}</span>
                    <span className="text-[10px] text-slate-400">({cat.transactionCount} txn)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">{cat.percentageOfTotal}%</span>
                    <strong className="text-slate-900 font-bold">{formatINR(cat.amount)}</strong>
                  </div>
                </div>

                {/* Category mini bar */}
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.percentageOfTotal}%` }}
                    className="bg-emerald-600 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Demo Expenses Section */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Add Demo Expenses to {weekLabel}</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Test instant recalculation of category totals, remaining budget, and weekly result.
            </p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Custom Expense</span>
          </button>
        </div>

        {/* 1-Click Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {quickSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAddQuickExpense(sample)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 border border-slate-200 font-medium transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List for This Week */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Transactions in {weekLabel} ({transactions.length})
          </h3>
          <span className="text-[11px] text-slate-400">Filtered strictly by txn_date</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No transactions found in this date range.</p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {transactions.map((t) => {
              const eligible = isEligibleTransaction(t);
              const reason = getExclusionReason(t);

              return (
                <div
                  key={t.txn_id}
                  className="p-3 hover:bg-slate-50/70 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-800">{t.merchant_name || t.main_category}</strong>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {t.payment_mode}
                      </span>
                      {eligible ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Eligible Spending
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                          title={reason || 'Excluded money movement'}
                        >
                          Excluded
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.main_category} • {formatDateLabel(t.txn_date)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-bold text-sm ${
                        eligible ? 'text-slate-900' : 'text-slate-400 line-through'
                      }`}
                    >
                      {formatINR(t.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {t.txn_time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
