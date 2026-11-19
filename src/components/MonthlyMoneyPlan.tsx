import React from 'react';
import { MonthlyCalculation, UserFinancialProfile } from '../types';
import { formatINR } from '../utils/formatters';
import {
  Wallet,
  Home,
  PieChart,
  CalendarDays,
  Target,
  Edit3,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface MonthlyMoneyPlanProps {
  profile: UserFinancialProfile;
  monthlyCalc: MonthlyCalculation;
  onEditPlan: () => void;
}

export const MonthlyMoneyPlan: React.FC<MonthlyMoneyPlanProps> = ({
  profile,
  monthlyCalc,
  onEditPlan,
}) => {
  const allowance = monthlyCalc.monthlyAllowance;
  const rent = monthlyCalc.fixedRent;
  const flexiblePool = monthlyCalc.flexibleMonthlyPool;
  const plannedWeeklyTotal = monthlyCalc.totalPlannedWeeklyBudget;
  const savingsTarget = monthlyCalc.monthlySavingsTarget;
  const buffer = monthlyCalc.unallocatedPool;

  const rentPct = Math.round((rent / allowance) * 100);
  const flexiblePct = Math.round((plannedWeeklyTotal / allowance) * 100);
  const savingsPct = Math.round((savingsTarget / allowance) * 100);
  const bufferPct = Math.max(0, 100 - rentPct - flexiblePct - savingsPct);

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle relative overflow-hidden">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      {/* Header with Title and User Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <PieChart className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Monthly Money Plan</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              October 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {profile.living_arrangement} • {profile.life_stage}
          </p>
        </div>

        <button
          onClick={onEditPlan}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Adjust Plan</span>
        </button>
      </div>

      {/* Top 5 Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mt-5">
        {/* 1. Monthly Allowance */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Allowance</span>
            <Wallet className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatINR(allowance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Parental credit</p>
        </div>

        {/* 2. Fixed Rent */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 relative">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Fixed PG Rent</span>
            <Home className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatINR(rent)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-0.5">
            <ShieldCheck className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="truncate" title="Fixed commitment (excluded from weekly tracker)">
              Fixed outside budget
            </span>
          </div>
        </div>

        {/* 3. Flexible Monthly Pool */}
        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span className="font-semibold">Flexible Budget</span>
            <PieChart className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-800">
            {formatINR(flexiblePool)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Allowance – Fixed Rent
          </p>
        </div>

        {/* 4. Planned Weekly Spending (4 Weeks) */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Weekly Limits</span>
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatINR(plannedWeeklyTotal)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ₹{Math.round(plannedWeeklyTotal / 4).toLocaleString('en-IN')}/wk × 4 wks
          </p>
        </div>

        {/* 5. Savings Target */}
        <div className="col-span-2 md:col-span-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Savings Target</span>
            <Target className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-800">
            {formatINR(savingsTarget)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">End-of-month target</p>
        </div>
      </div>

      {/* Visual Budget Allocation Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="font-semibold text-slate-700">Allowance Allocation Blueprint</span>
          <span className="text-slate-500">{formatINR(allowance)} Total</span>
        </div>

        {/* Allocation Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${rentPct}%` }}
            className="bg-amber-400 hover:bg-amber-500 transition-all cursor-help"
            title={`Fixed PG Rent: ${formatINR(rent)} (${rentPct}%)`}
          />
          <div
            style={{ width: `${flexiblePct}%` }}
            className="bg-emerald-500 hover:bg-emerald-600 transition-all cursor-help"
            title={`4-Week Flexible Spending: ${formatINR(plannedWeeklyTotal)} (${flexiblePct}%)`}
          />
          <div
            style={{ width: `${savingsPct}%` }}
            className="bg-teal-500 hover:bg-teal-600 transition-all cursor-help"
            title={`End-of-Month Savings Target: ${formatINR(savingsTarget)} (${savingsPct}%)`}
          />
          {bufferPct > 0 && (
            <div
              style={{ width: `${bufferPct}%` }}
              className="bg-slate-300 hover:bg-slate-400 transition-all cursor-help"
              title={`Flexible Buffer: ${formatINR(buffer)} (${bufferPct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Fixed Rent ({rentPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Weekly Flexible Budget ({flexiblePct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Savings Target ({savingsPct}%)</span>
          </div>
          {buffer > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Unallocated Buffer ({formatINR(buffer)})</span>
            </div>
          )}
        </div>
      </div>

      {/* Explanatory Note regarding Rent Isolation */}
      <div className="mt-3.5 bg-slate-50 rounded-xl p-2.5 px-3 flex items-start gap-2 border border-slate-200/50 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-800">Fixed Commitment Rule:</strong> PG rent of {formatINR(rent)} is locked separately and will never deplete your {formatINR(flexiblePool)} weekly spending allowance.
        </p>
      </div>
    </section>
  );
};
