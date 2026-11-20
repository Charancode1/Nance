import React, { useEffect } from 'react';
import { MonthlySavingsCalculation } from '../../types/saveFirst';
import { formatINR } from '../../utils/formatters';
import { fireCelebrationBurst } from '../../utils/confetti';
import { Award, RotateCcw, X } from 'lucide-react';

interface SaveFirstMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyCalc: MonthlySavingsCalculation;
  onStartNewMonth: () => void;
}

export const SaveFirstMonthModal: React.FC<SaveFirstMonthModalProps> = ({
  isOpen,
  onClose,
  monthlyCalc,
  onStartNewMonth,
}) => {
  const {
    totalAmountKeptAside,
    percentOfBudgetKeptAside,
    weeksAchievedCount,
    totalWeeksCount,
    weeks,
  } = monthlyCalc;

  useEffect(() => {
    if (isOpen && totalAmountKeptAside > 0) {
      fireCelebrationBurst();
    }
  }, [isOpen, totalAmountKeptAside]);

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

        {/* Badge */}
        <div className="mt-1">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
            WEEK 4 FINISHED • MONTH COMPLETE!
          </span>
        </div>

        {/* Headline */}
        <div className="my-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Congratulations! 🎉
          </h3>
          <p className="text-base font-black text-emerald-700 mt-1">
            You kept {formatINR(totalAmountKeptAside)} aside this month!
          </p>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            That's {percentOfBudgetKeptAside}% of your total monthly budget kept aside. Every amount you put aside is progress. Keep building this habit!
          </p>
        </div>

        {/* 4 Weekly Result Chips */}
        <div className="my-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>4-Week Savings Summary</span>
            <span className="text-emerald-700 font-extrabold">
              {weeksAchievedCount} of {totalWeeksCount} Goals Met
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {weeks.map((w) => (
              <div
                key={w.weekCode}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                  w.isGoalAchieved
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : w.amountSaved > 0
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <span className="font-bold">{w.weekCode}</span>
                <span className="font-black text-[11px]">{formatINR(w.amountSaved)}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Saved</span>
            <span className="font-extrabold text-emerald-700">
              {formatINR(totalAmountKeptAside)} ({percentOfBudgetKeptAside}%)
            </span>
          </div>
        </div>

        {/* Action Button: Start a New Month */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onStartNewMonth}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start a New Month</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Keep Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
