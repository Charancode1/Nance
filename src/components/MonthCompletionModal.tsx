import React from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { Award, RotateCcw, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const {
    monthlyProgressPercentage,
    isUnderBudget,
    weeklyWinsCount,
    totalWeeksCount,
    completedDifference,
    weeks,
  } = monthlyCalc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Award Icon */}
        <div className="my-2 flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 flex items-center justify-center shadow-sm">
            <Award className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        {/* Main Headline */}
        <div className="my-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Monthly Completion
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isUnderBudget
              ? `You saved ${monthlyProgressPercentage}% of your planned budget this month!`
              : `Finished ${monthlyProgressPercentage}% over planned budget`}
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Congratulations! Four weeks of mindful money decisions. Keep building this habit.
          </p>
        </div>

        {/* 4 Weekly Result Chips */}
        <div className="my-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>4-Week Summary</span>
            <span className="text-emerald-700">
              {weeklyWinsCount} of {totalWeeksCount} Weekly Wins
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
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

          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>Total Unspent Planned Budget:</span>
            <strong className="font-black text-emerald-700">
              {isUnderBudget
                ? `+${formatINR(completedDifference)}`
                : `-${formatINR(Math.abs(completedDifference))}`}
            </strong>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onStartNewMonth}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start a New Month</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Review Details
          </button>
        </div>
      </div>
    </div>
  );
};
