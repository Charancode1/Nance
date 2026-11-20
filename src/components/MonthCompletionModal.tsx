import React, { useEffect } from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { fireCelebrationBurst } from '../utils/confetti';
import { Award, RotateCcw, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MonthCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyCalc: MonthlyCalculation;
  onStartNewMonth: () => void;
}

export const MonthCompletionModal: React.FC<MonthCompletionModalProps> = ({
  isOpen,
  onClose,
  monthlyCalc,
  onStartNewMonth,
}) => {
  const {
    monthlyProgressPercentage,
    isUnderBudget,
    completedWeeklyBudget,
    weeklyWinsCount,
    totalWeeksCount,
    completedDifference,
    weeks,
  } = monthlyCalc;

  const isZeroBudgetMonth = completedWeeklyBudget === 0;
  const week4 = weeks.find((w) => w.weekIndex === 4);

  // Trigger celebratory burst on final month completion ONLY when saving with a set budget
  useEffect(() => {
    if (isOpen && isUnderBudget && !isZeroBudgetMonth) {
      fireCelebrationBurst();
    }
  }, [isOpen, isUnderBudget, isZeroBudgetMonth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Award Icon */}
        <div className="my-2 flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 flex items-center justify-center shadow-xs">
            <Award className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        {/* Badge & Week 4 Completion Indicator */}
        <div className="mt-1">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
            WEEK 4 FINISHED • MONTH COMPLETE!
          </span>
        </div>

        {/* Main Headline */}
        <div className="my-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {isZeroBudgetMonth
              ? 'All 4 weeks completed!'
              : isUnderBudget
              ? `You saved ${monthlyProgressPercentage}% of your planned budget this month!`
              : `Finished ${monthlyProgressPercentage}% over planned budget`}
          </h3>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {isZeroBudgetMonth
              ? 'Great effort finishing the month! Configure your monthly and weekly budgets anytime in Set Budget to start tracking savings percentages.'
              : 'Congratulations! Four weeks of mindful money decisions. Keep building this habit.'}
          </p>
        </div>

        {/* Week 4 Result Highlight */}
        {week4 && (
          <div className="my-2 p-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-left">
            <div className="flex items-center gap-1.5">
              {week4.isUnderBudget ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="font-semibold text-slate-700">Week 4 Result:</span>
            </div>
            <strong className={`font-black ${week4.isUnderBudget ? 'text-emerald-700' : 'text-amber-700'}`}>
              {week4.boxLabel} ({formatINR(week4.actualSpending)} spent)
            </strong>
          </div>
        )}

        {/* 4 Weekly Result Chips */}
        <div className="my-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>4-Week Summary</span>
            <span className="text-emerald-700 font-extrabold">
              {weeklyWinsCount} of {totalWeeksCount} Weekly Wins
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {weeks.map((w) => (
              <div
                key={w.weekCode}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                  w.resultStatus === 'win'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold">{w.weekCode}</span>
                <span className="font-black text-[11px]">{w.boxLabel}</span>
              </div>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Total Unspent Planned Budget:</span>
            <strong className="font-black text-emerald-700">
              {isUnderBudget
                ? `+${formatINR(completedDifference)}`
                : `-${formatINR(Math.abs(completedDifference))}`}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onStartNewMonth}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start a New Month</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Review Details
          </button>
        </div>
      </div>
    </div>
  );
};
