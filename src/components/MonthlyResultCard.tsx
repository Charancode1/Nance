import React from 'react';
import { MonthlyCalculation } from '../types';
import { formatINR } from '../utils/formatters';
import { Award, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';

interface MonthlyResultCardProps {
  monthlyCalc: MonthlyCalculation;
  onSelectWeek: (weekIndex: number) => void;
}

export const MonthlyResultCard: React.FC<MonthlyResultCardProps> = ({
  monthlyCalc,
  onSelectWeek,
}) => {
  const {
    monthlyDifference,
    isUnderBudget,
    completedWeeksCount,
    weeklyWinsCount,
    statusLabel,
    headlineMessage,
    resultMessage,
    weeks,
  } = monthlyCalc;

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Monthly Results</h3>
            <span className="text-xs text-slate-500">{statusLabel}</span>
          </div>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {completedWeeksCount} of {weeks.length} Weeks Completed ({weeklyWinsCount} Wins)
        </div>
      </div>

      {/* Main Headline Banner */}
      <div
        className={`my-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isUnderBudget
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}
      >
        <div>
          <h4 className="text-base sm:text-lg font-black">{headlineMessage}</h4>
          <p className="text-xs mt-1 text-slate-600">{resultMessage}</p>
        </div>

        <div className="text-left sm:text-right flex-shrink-0">
          <span className="text-xs text-slate-500 block">
            {isUnderBudget ? 'Total Unspent Budget' : 'Total Overspending'}
          </span>
          <span
            className={`text-2xl font-black ${
              isUnderBudget ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isUnderBudget ? `+${formatINR(monthlyDifference)}` : `-${formatINR(Math.abs(monthlyDifference))}`}
          </span>
        </div>
      </div>

      {/* Week-by-Week Summary Table */}
      <div className="mt-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Week-by-Week Performance Breakdown
        </span>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Week</th>
                <th className="py-2.5 px-3">Budget</th>
                <th className="py-2.5 px-3">Actual Spent</th>
                <th className="py-2.5 px-3">Variance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map((w) => {
                const diff = w.budgetAmount - w.actualSpending;
                const under = diff >= 0;

                return (
                  <tr key={w.weekCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{w.weekLabel}</td>
                    <td className="py-2.5 px-3 text-slate-700">{formatINR(w.budgetAmount)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{formatINR(w.actualSpending)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${under ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {under ? `+${formatINR(diff)}` : `-${formatINR(Math.abs(diff))}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {w.isCompleted ? (
                        under ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            +{w.differencePercentage}% Win
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            -{w.differencePercentage}% Over
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectWeek(w.weekIndex)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology & Accounting Notice */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Accounting Principle:</strong> The monthly result is computed from actual eligible transaction debits across the month, not by averaging percentages. This amount represents <strong>Unspent Planned Budget</strong> rather than confirmed bank savings.
        </p>
      </div>
    </section>
  );
};
