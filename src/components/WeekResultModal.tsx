import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { Sparkles, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface WeekResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: WeeklyCalculation;
  hasNextWeek: boolean;
  onNextWeek: () => void;
}

export const WeekResultModal: React.FC<WeekResultModalProps> = ({
  isOpen,
  onClose,
  week,
  hasNextWeek,
  onNextWeek,
}) => {
  if (!isOpen) return null;

  const isWin = week.isUnderBudget;
  const remaining = Math.abs(week.remainingBudget);

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

        {/* Icon & Celebration Badge */}
        <div className="my-2 flex justify-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
              isWin
                ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
                : 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'
            }`}
          >
            {isWin ? (
              <Sparkles className="w-7 h-7 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="my-3">
          <h3
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isWin ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isWin
              ? `${week.differencePercentage}% UNDER BUDGET!`
              : 'A little over budget this week.'}
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed px-2">
            {isWin
              ? "You completed this week's money goal. Great work!"
              : "Don't worry! Every week is a fresh opportunity. You can get back on track next week. Keep going!"}
          </p>
        </div>

        {/* Quick Numbers Banner */}
        <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-around">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
            <strong className="text-slate-800 font-bold">{formatINR(week.budgetAmount)}</strong>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Spent</span>
            <strong className="text-slate-800 font-bold">{formatINR(week.actualSpending)}</strong>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">
              {isWin ? 'Under by' : 'Over by'}
            </span>
            <strong className={`font-black ${isWin ? 'text-emerald-700' : 'text-amber-700'}`}>
              {formatINR(remaining)}
            </strong>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 space-y-2">
          {hasNextWeek ? (
            <button
              type="button"
              onClick={onNextWeek}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Move to Week {week.weekIndex + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Review Monthly Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
