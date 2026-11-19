import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

interface WeeklyWinsStripProps {
  weeks: WeeklyCalculation[];
  selectedWeekIndex: number;
  onSelectWeek: (weekIndex: number) => void;
}

export const WeeklyWinsStrip: React.FC<WeeklyWinsStripProps> = ({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
}) => {
  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Weekly Wins Overview</h3>
          <p className="text-xs text-slate-500">
            Select a week to track expenses, inspect category breakdowns, and finish the week.
          </p>
        </div>
        <span className="text-xs text-slate-400">October 2026</span>
      </div>

      {/* 4-Week Compact Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {weeks.map((week) => {
          const isSelected = selectedWeekIndex === week.weekIndex;
          const isCompleted = week.isCompleted;
          const isWin = week.resultStatus === 'win';

          return (
            <button
              key={week.weekCode}
              type="button"
              onClick={() => onSelectWeek(week.weekIndex)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
              }`}
            >
              {/* Top Row: Week label and Status Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {week.weekLabel}
                </span>

                {isCompleted ? (
                  isWin ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>+{week.differencePercentage}% Win</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>-{week.differencePercentage}% Over</span>
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>

              {/* Date Range */}
              <div className="text-[11px] text-slate-500 mb-2 font-mono">
                {formatDateLabel(week.startDate)} – {formatDateLabel(week.endDate)}
              </div>

              {/* Numbers */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">
                  Spent: <strong className="text-slate-800">{formatINR(week.actualSpending)}</strong>
                </span>
                <span className="text-slate-500">
                  Budget: <strong className="text-slate-700">{formatINR(week.budgetAmount)}</strong>
                </span>
              </div>

              {/* Micro Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  style={{
                    width: `${Math.min(100, (week.actualSpending / (week.budgetAmount || 1)) * 100)}%`,
                  }}
                  className={`h-full rounded-full ${
                    isCompleted
                      ? isWin
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                      : week.actualSpending <= week.budgetAmount
                      ? 'bg-slate-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>

              {isSelected && (
                <div className="mt-2.5 text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
                  <span>Currently Viewing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
