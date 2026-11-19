import React, { useState } from 'react';
import { Budget } from '../types';
import { formatINR } from '../utils/formatters';
import { X, Sliders, Check, Info, Lock } from 'lucide-react';

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBudget: number;
  weeklyBudgets: Budget[];
  onSaveBudgets: (newMonthlyBudget: number, newWeeklyBudgets: Budget[]) => void;
}

export const BudgetSetupModal: React.FC<BudgetSetupModalProps> = ({
  isOpen,
  onClose,
  monthlyBudget: initialMonthly,
  weeklyBudgets: initialWeekly,
  onSaveBudgets,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(initialMonthly);
  const [weeklyAmounts, setWeeklyAmounts] = useState<number[]>(
    initialWeekly.map((b) => b.amount)
  );

  if (!isOpen) return null;

  const totalWeekly = weeklyAmounts.reduce((sum, a) => sum + (a || 0), 0);
  const unallocated = monthlyBudget - totalWeekly;

  const handleWeeklyChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = [...weeklyAmounts];
    next[index] = num;
    setWeeklyAmounts(next);
  };

  const handleAutoSplit = () => {
    const perWeek = Math.floor(monthlyBudget / 4);
    setWeeklyAmounts([perWeek, perWeek, perWeek, perWeek]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWeekly = initialWeekly.map((b, idx) => ({
      ...b,
      amount: weeklyAmounts[idx] || 0,
    }));
    onSaveBudgets(monthlyBudget, updatedWeekly);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-floating border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Set Monthly & Weekly Budgets</h3>
              <p className="text-xs text-slate-500">Plan your overall limit and divide it into weekly targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {/* Monthly Budget Input */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Monthly Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="100"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 text-base font-extrabold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total planned spending ceiling for the month.
            </p>
          </div>

          {/* 4 Weekly Allocations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Weekly Budget Allocations
              </label>
              <button
                type="button"
                onClick={handleAutoSplit}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Auto-Split ₹{Math.floor(monthlyBudget / 4).toLocaleString('en-IN')}/wk
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {initialWeekly.map((b, idx) => {
                const isCompleted = b.is_completed;

                return (
                  <div key={b.budget_id} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Week {b.week_index || idx + 1}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5" title="Week already completed">
                          <Lock className="w-2.5 h-2.5" /> Finished
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        required
                        value={weeklyAmounts[idx] || 0}
                        onChange={(e) => handleWeeklyChange(idx, e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocation Health Check */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              unallocated >= 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>
                Total Weekly Allocations: <strong>{formatINR(totalWeekly)}</strong> of{' '}
                <strong>{formatINR(monthlyBudget)}</strong>.
              </p>
              {unallocated >= 0 ? (
                <p className="mt-0.5">
                  Remaining unallocated buffer: <strong>{formatINR(unallocated)}</strong>.
                </p>
              ) : (
                <p className="mt-0.5">
                  Warning: Weekly budgets exceed monthly ceiling by{' '}
                  <strong>{formatINR(Math.abs(unallocated))}</strong>.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Budgets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
