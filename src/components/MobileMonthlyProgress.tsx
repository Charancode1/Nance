import React, { useState } from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface MobileMonthlyProgressProps {
  monthlyCalc: MonthlyCalculation;
}

export const MobileMonthlyProgress: React.FC<MobileMonthlyProgressProps> = ({
  monthlyCalc,
}) => {
  const [showRecovery, setShowRecovery] = useState<boolean>(false);

  const {
    completedWeeksCount,
    totalWeeksCount,
    isUnderBudget,
    headlineMessage,
    subMessage,
    recoveryPoints,
  } = monthlyCalc;

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-subtle text-left">
      {/* Category Tag */}
      <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
        <span>Monthly Progress</span>
        <span className="font-semibold text-slate-500 lowercase first-letter:uppercase">
          {completedWeeksCount} of {totalWeeksCount} weeks completed
        </span>
      </div>

      {/* Massive Percentage Headline */}
      <div className="my-1.5">
        <h2
          className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${
            completedWeeksCount === 0
              ? 'text-slate-800'
              : isUnderBudget
              ? 'text-emerald-600'
              : 'text-amber-600'
          }`}
        >
          {headlineMessage}
        </h2>
      </div>

      {/* Encouraging Habit Subtitle */}
      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
        {subMessage}
      </p>

      {/* 4-Segment Completion Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5 mt-3.5 mb-2">
        {Array.from({ length: totalWeeksCount }).map((_, i) => {
          const isDone = i < completedWeeksCount;
          return (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                isDone
                  ? isUnderBudget
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>

      {/* Dynamic Recovery Journey Accordion (Section 7) */}
      {recoveryPoints.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowRecovery(!showRecovery)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cumulative Recovery Trail</span>
            </span>
            {showRecovery ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showRecovery && (
            <div className="mt-2.5 space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <p className="text-[11px] text-slate-500 mb-2">
                Running net progress across completed weeks (an overspending week never destroys cumulative progress):
              </p>
              {recoveryPoints.map((pt) => {
                const isPos = pt.runningCumulativeNet >= 0;
                return (
                  <div
                    key={pt.weekIndex}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="font-medium text-slate-700">
                      After {pt.weekLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {pt.weekDiff >= 0
                          ? `+${formatINR(pt.weekDiff)}`
                          : `-${formatINR(Math.abs(pt.weekDiff))}`}
                      </span>
                      <strong
                        className={`font-black ${
                          isPos ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isPos ? `+${formatINR(pt.runningCumulativeNet)}` : `-${formatINR(Math.abs(pt.runningCumulativeNet))}`}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
