import React, { useEffect } from 'react';
import { WeeklySavingsCalculation } from '../../types/saveFirst';
import { formatINR } from '../../utils/formatters';
import { fireWinConfetti } from '../../utils/confetti';
import { Trophy, Heart, ArrowRight, X, PiggyBank, CheckCircle2 } from 'lucide-react';

interface SaveFirstWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: WeeklySavingsCalculation;
  hasNextWeek: boolean;
  onNextWeek: () => void;
}

export const SaveFirstWeekModal: React.FC<SaveFirstWeekModalProps> = ({
  isOpen,
  onClose,
  week,
  hasNextWeek,
  onNextWeek,
}) => {
  const isZeroGoal = week.savingsGoal === 0 || week.budgetAmount === 0;
  const isAchieved = !isZeroGoal && week.isGoalAchieved;
  const isPartial = !isZeroGoal && week.isPartiallyAchieved;

  useEffect(() => {
    if (isOpen && isAchieved) {
      fireWinConfetti();
    }
  }, [isOpen, isAchieved]);

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

        {isZeroGoal ? (
          /* ========================================================= */
          /* Scenario Neutral: Zero Budget or Zero Goal */
          /* ========================================================= */
          <>
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 ring-4 ring-slate-50 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7 text-slate-600" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                WEEK COMPLETED
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              You finished {week.weekLabel}!
            </h3>

            <div className="my-2.5 space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed px-1">
                No savings goal was configured for this week.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Set a weekly savings goal in <strong>Set Budget</strong> to start building your savings habit!
              </p>
            </div>

            <div className="my-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-700 block mb-2 tracking-wider">
                {week.weekLabel} Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Amount Saved:</span>
                  <span className="font-semibold text-slate-900">₹0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Actual Spending:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
              </div>
            </div>
          </>
        ) : isAchieved ? (
          /* ========================================================= */
          /* Scenario A: Savings Goal Achieved (100%+) */
          /* ========================================================= */
          <>
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 flex items-center justify-center shadow-xs">
                <Trophy className="w-7 h-7 text-emerald-600" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                SAVINGS GOAL ACHIEVED!
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              Congratulations! 🎉
            </h3>

            <div className="my-2.5 space-y-1 text-xs text-slate-600 leading-relaxed px-1">
              <p className="text-sm font-bold text-emerald-700">
                You set aside {formatINR(week.amountSaved)} this week. Your savings goal is achieved!
              </p>
              {week.extraSaved > 0 && (
                <p className="font-extrabold text-emerald-800 bg-emerald-100/70 py-1 px-2 rounded-lg mt-1 inline-block">
                  You saved {formatINR(week.extraSaved)} extra! 🚀
                </p>
              )}
              <p className="text-slate-500 pt-1">
                Keep going. Small steps like these build strong financial habits!
              </p>
            </div>

            <div className="my-4 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-2 tracking-wider">
                {week.weekLabel} Savings Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Savings Goal:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.savingsGoal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Actual Spending:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 font-bold">
                  <span className="text-emerald-800">Amount Saved:</span>
                  <span className="text-emerald-700 font-black">{formatINR(week.amountSaved)}</span>
                </div>
              </div>
            </div>
          </>
        ) : isPartial ? (
          /* ========================================================= */
          /* Scenario B: Savings Below Goal (1% - 99%) */
          /* ========================================================= */
          <>
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50 flex items-center justify-center shadow-xs">
                <PiggyBank className="w-7 h-7 text-emerald-600" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                KEEP GOING!
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              You're getting there!
            </h3>

            <div className="my-2.5 space-y-1 text-xs text-slate-600 leading-relaxed px-1">
              <p className="font-semibold text-slate-700">
                You managed to keep {formatINR(week.amountSaved)} aside this week.
              </p>
              <p className="text-slate-500">
                You were {formatINR(week.shortfall)} short of your goal. You can try again next week. Keep going!
              </p>
            </div>

            <div className="my-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-700 block mb-2 tracking-wider">
                {week.weekLabel} Savings Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Savings Goal:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.savingsGoal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Actual Spending:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>Amount Saved:</span>
                  <span className="font-black text-emerald-700">{formatINR(week.amountSaved)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* Scenario C: Overspent / ₹0 Saved */
          /* ========================================================= */
          <>
            <div className="my-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 ring-4 ring-amber-50 flex items-center justify-center shadow-xs">
                <Heart className="w-7 h-7 text-emerald-600 fill-emerald-600" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-block">
                DON'T WORRY!
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
              Don't worry!
            </h3>

            <div className="my-2.5 space-y-1 text-xs text-slate-600 leading-relaxed px-1">
              <p className="font-semibold text-slate-700">
                This week didn't go as planned.
              </p>
              <p className="text-slate-500">
                Every new week is another opportunity to save. Keep going!
              </p>
            </div>

            <div className="my-4 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-2 tracking-wider">
                {week.weekLabel} Savings Summary
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Weekly Budget:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.budgetAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Actual Spending:</span>
                  <span className="font-semibold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 font-bold">
                  <span className="text-amber-900">Amount Saved:</span>
                  <span className="text-amber-700 font-black">₹0</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
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
