import React from 'react';
import { WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { fireWinConfetti } from '../utils/confetti';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface WeeklyWinsCalendarProps {
  weeks: WeeklyCalculation[];
  selectedWeekIndex: number | null;
  onSelectWeek: (weekIndex: number | null) => void;
  appActivityDates: string[];
}

export const WeeklyWinsCalendar: React.FC<WeeklyWinsCalendarProps> = ({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
  appActivityDates,
}) => {
  const activitySet = new Set(appActivityDates);
  const totalWins = weeks.filter((w) => w.status === 'within_budget').length;

  const handleWeekClick = (weekIndex: number) => {
    if (selectedWeekIndex === weekIndex) {
      onSelectWeek(null); // toggle off
    } else {
      onSelectWeek(weekIndex);
      const targetWeek = weeks.find((w) => w.weekIndex === weekIndex);
      if (targetWeek && targetWeek.status === 'within_budget') {
        fireWinConfetti();
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle">
      {/* Title & Streak Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Weekly Wins Calendar</h2>
            <p className="text-xs text-slate-500">
              Contribution-style discipline tracking. Click any week to inspect details.
            </p>
          </div>
        </div>

        {/* Win badges & summary */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalWins} of {weeks.length} Wins Claimed</span>
          </div>
          {selectedWeekIndex !== null && (
            <button
              onClick={() => onSelectWeek(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* 4 Weekly Contribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {weeks.map((week) => {
          const isSelected = selectedWeekIndex === week.weekIndex;
          const isWin = week.status === 'within_budget';
          const isAbove = week.status === 'above_budget';

          return (
            <div
              key={week.weekCode}
              onClick={() => handleWeekClick(week.weekIndex)}
              className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-200 border text-left ${
                isSelected
                  ? 'ring-2 ring-emerald-500 shadow-md scale-[1.02]'
                  : 'hover:shadow-sm hover:border-slate-300'
              } ${
                isWin
                  ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-200/90'
                  : isAbove
                  ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-200/90'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {week.weekLabel}
                </span>

                {isWin ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Win!</span>
                  </span>
                ) : isAbove ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Above</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>Upcoming</span>
                  </span>
                )}
              </div>

              {/* Date Range */}
              <div className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  {formatDateLabel(week.startDate)} – {formatDateLabel(week.endDate)}
                </span>
              </div>

              {/* Numbers */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Spent:</span>
                  <span className="font-bold text-slate-900">{formatINR(week.actualSpending)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Limit:</span>
                  <span className="text-slate-700">{formatINR(week.budgetAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                  <span className="text-slate-500">
                    {isWin ? 'Under budget:' : 'Over budget:'}
                  </span>
                  <span
                    className={`font-extrabold ${
                      isWin ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {isWin
                      ? `+${formatINR(week.underBudgetAmount)}`
                      : `+${formatINR(Math.abs(week.underBudgetAmount))}`}
                  </span>
                </div>
              </div>

              {/* Mini status indicator bar */}
              <div className="mt-3 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      (week.actualSpending / (week.budgetAmount || 1)) * 100
                    )}%`,
                  }}
                  className={`h-full rounded-full transition-all ${
                    isWin ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>

              {/* Click to inspect prompt */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-700 transition-colors">
                <span>{week.transactions.length} transactions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub-Inspired 28-Day Contribution Grid */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Daily Contribution Heatmap</span>
            <span className="text-[11px] text-slate-400">• October 1 – 28, 2026</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[3px] bg-slate-100 border border-slate-200" />
            <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-200" />
            <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-400" />
            <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600" />
            <span>More disciplined</span>
          </div>
        </div>

        {/* The 4-Week Column Heatmap */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
          {weeks.map((week) => {
            const isSelected = selectedWeekIndex === week.weekIndex;
            // Generate 7 days for each week
            const startDay = parseInt(week.startDate.split('-')[2], 10);
            const daysInWeek = Array.from({ length: 7 }, (_, i) => {
              const dNum = startDay + i;
              const dStr = `2026-10-${dNum.toString().padStart(2, '0')}`;
              const spend = week.dailyBreakdown[dStr] || 0;
              const hasActivity = activitySet.has(dStr);
              return { dateStr: dStr, dayNum: dNum, spend, hasActivity };
            });

            return (
              <div
                key={week.weekCode}
                onClick={() => handleWeekClick(week.weekIndex)}
                className={`p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-white ring-2 ring-emerald-500 shadow-sm' : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
                  <span>{week.weekCode}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      week.status === 'within_budget' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                {/* 7 Daily Tiles in a row or mini grid */}
                <div className="grid grid-cols-7 gap-1">
                  {daysInWeek.map((day) => {
                    // Color based on spending relative to daily ideal ₹142 (₹1,000 / 7)
                    let bgColor = 'bg-slate-200';
                    if (day.spend === 0) {
                      bgColor = 'bg-emerald-100 hover:bg-emerald-200';
                    } else if (day.spend <= 150) {
                      bgColor = 'bg-emerald-300 hover:bg-emerald-400';
                    } else if (day.spend <= 300) {
                      bgColor = 'bg-emerald-500 hover:bg-emerald-600';
                    } else {
                      bgColor = 'bg-amber-400 hover:bg-amber-500';
                    }

                    return (
                      <div
                        key={day.dateStr}
                        className={`h-5 sm:h-6 rounded-[3px] transition-all cursor-pointer ${bgColor}`}
                        title={`${formatDateLabel(day.dateStr)}: ${
                          day.spend > 0 ? formatINR(day.spend) + ' spent' : 'Zero spend day!'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                  <span>Day 1</span>
                  <span>Day 7</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
