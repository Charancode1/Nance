import React from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { fireCelebrationBurst } from '../utils/confetti';
import {
  TrendingUp,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface MonthlyProgressProps {
  monthlyCalc: MonthlyCalculation;
  onOpenRules: () => void;
}

export const MonthlyProgress: React.FC<MonthlyProgressProps> = ({
  monthlyCalc,
  onOpenRules,
}) => {
  const isNetUnder = monthlyCalc.monthlyUnderBudgetAmount >= 0;
  const absUnder = Math.abs(monthlyCalc.monthlyUnderBudgetAmount);
  const perfPct = monthlyCalc.monthlyPerformancePercentage;

  return (
    <section className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-floating relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Core Feature
              </span>
              <span className="text-xs text-slate-400">• Dynamic Cumulative Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Cumulative Monthly Progress
            </h2>
          </div>
        </div>

        <button
          onClick={fireCelebrationBurst}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>Celebrate Wins</span>
        </button>
      </div>

      {/* Main Cumulative Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 relative z-10">
        {/* Big Number: Unspent Planned Budget */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 mb-1">
              <span className="font-medium">Total Unspent Planned Budget</span>
              <button
                onClick={onOpenRules}
                className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-xs"
                title="Why is this termed unspent planned budget?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calculation Note</span>
              </button>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 my-2">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isNetUnder ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isNetUnder ? `+${formatINR(absUnder)}` : `-${formatINR(absUnder)}`}
              </span>
              <span
                className={`text-sm sm:text-base font-bold px-3 py-1 rounded-full ${
                  isNetUnder
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isNetUnder ? `${perfPct}% under budget` : `${Math.abs(perfPct)}% above budget`}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Formula: Planned Flexible ({formatINR(monthlyCalc.totalPlannedWeeklyBudget)}) – Actual Spent ({formatINR(monthlyCalc.totalActualEligibleSpending)}) = {formatINR(monthlyCalc.monthlyUnderBudgetAmount)}
            </p>
          </div>

          {/* Headline encouraging feedback */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{monthlyCalc.headlineMessage}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {monthlyCalc.encouragingMessage}
            </p>
          </div>
        </div>

        {/* Right Card: Quick Discipline Stats */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
              Discipline Summary
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Weekly Wins</span>
                <span className="text-sm font-bold text-emerald-400">
                  {monthlyCalc.weeklyWinsCount} / {monthlyCalc.totalWeeks} Weeks
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Total Planned Limit</span>
                <span className="text-sm font-semibold text-white">
                  {formatINR(monthlyCalc.totalPlannedWeeklyBudget)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Actual Spent</span>
                <span className="text-sm font-semibold text-white">
                  {formatINR(monthlyCalc.totalActualEligibleSpending)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Savings Target</span>
                <span className="text-sm font-semibold text-teal-300">
                  {formatINR(monthlyCalc.monthlySavingsTarget)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
            *Fixed PG rent ({formatINR(monthlyCalc.fixedRent)}) is locked separately and never reduces this flexible progress.
          </div>
        </div>
      </div>

      {/* The Cumulative Trajectory & Recovery Stepper */}
      <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Cumulative Trajectory & Overspend Recovery</span>
            </h4>
            <p className="text-xs text-slate-400">
              Notice how mid-month overspending in Week 2 did not wipe out cumulative progress—it recovered in Week 3 & 4!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Win
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Over budget
            </span>
          </div>
        </div>

        {/* 4-Step Trajectory Line */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {monthlyCalc.cumulativeTimeline.map((pt) => {
            const isPos = pt.cumulativeUnderBudget >= 0;

            return (
              <div
                key={pt.weekCode}
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="font-bold">{pt.weekLabel}</span>
                  {pt.recoveredThisWeek ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40">
                      Recovered!
                    </span>
                  ) : isPos ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      On Track
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                      Dip
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400">Running Under-Budget:</div>
                <div
                  className={`text-lg font-black my-0.5 ${
                    isPos ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isPos ? `+${formatINR(pt.cumulativeUnderBudget)}` : `-${formatINR(Math.abs(pt.cumulativeUnderBudget))}`}
                </div>

                <div className="text-[11px] text-slate-400">
                  Spent {formatINR(pt.cumulativeSpent)} of {formatINR(pt.cumulativeBudget)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Health Rule Callout */}
      <div className="mt-6 p-3 px-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-slate-300 relative z-10">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-white">Zero-Shame Wellness Guarantee:</strong> An unexpected spike never breaks your month. You are always given actionable room to pace future weeks and recover your unspent planned budget!
        </p>
      </div>
    </section>
  );
};
