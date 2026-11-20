import React, { useEffect } from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { fireWinConfetti } from '../utils/confetti';
import { Trophy, Heart, ArrowRight, X } from 'lucide-react';

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
  const isWin = week.isUnderBudget;
  const remaining = Math.abs(week.remainingBudget);

  // Trigger subtle celebratory confetti when opening an under-budget weekly win
  useEffect(() => {
    if (isOpen && isWin) {
      fireWinConfetti();
    }
  }, [isOpen, isWin]);

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

        {isWin ? (
          /* ========================================================= */
          /* Scenario A: User Finishes Under Budget (Emerald Green Theme) */
          /* ========================================================= */
          <>
            {/* Trophy Icon */}
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 flex items-center justify-center shadow-xs">
                <Trophy className="w-7 h-7 text-emerald-600" />
              </div>
            </div>

            {/* Badge */}
            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                WEEKLY WIN!
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              You saved {week.differencePercentage}% of your planned budget this week!
            </h3>

            {/* Subheading & Mindful Habit Message */}
            <div className="my-2.5 space-y-1">
              <p className="text-sm font-bold text-emerald-700">
                Congratulations! 🎉
              </p>
              <p className="text-xs text-slate-600 leading-relaxed px-1">
                You stayed within your spending limit and made mindful money decisions.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Keep this momentum going. Another week, another opportunity to build a better money habit!
              </p>
            </div>

            {/* Weekly Summary Card */}
            <div className="my-4 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-2 tracking-wider">
                {week.weekLabel} Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Budget:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.budgetAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Spent:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 font-bold">
                  <span className="text-emerald-800">Under Budget:</span>
                  <span className="text-emerald-700 font-black">{formatINR(remaining)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* Scenario B: User Finishes Above Budget (Soft Amber Theme) */
          /* ========================================================= */
          <>
            {/* Friendly Encouragement Icon */}
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 ring-4 ring-amber-50 flex items-center justify-center shadow-xs">
                <Heart className="w-7 h-7 text-emerald-600 fill-emerald-600" />
              </div>
            </div>

            {/* Badge */}
            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-block">
                THIS WEEK IS COMPLETE!
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              You went {week.differencePercentage}% over your budget this week.
            </h3>

            {/* Supportive Non-Punitive Message */}
            <div className="my-2.5 space-y-1">
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Don't worry! One difficult week doesn't define your progress.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed px-1">
                Come on, you can get back on track! Next week is a fresh opportunity to spend mindfully and stay within your budget.
              </p>
            </div>

            {/* Weekly Summary Card */}
            <div className="my-4 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-2 tracking-wider">
                {week.weekLabel} Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Budget:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.budgetAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Spent:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 font-bold">
                  <span className="text-amber-900">Above Budget:</span>
                  <span className="text-amber-700 font-black">{formatINR(remaining)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Button: Continue to Next Week */}
        <div className="mt-4">
          <button
            type="button"
            onClick={hasNextWeek ? onNextWeek : onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
          >
            <span>{hasNextWeek ? `Continue to Week ${week.weekIndex + 1}` : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
