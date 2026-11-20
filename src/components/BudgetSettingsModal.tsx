import React, { useState, useEffect } from 'react';
import { Budget } from '../types';
import { formatINR } from '../utils/formatters';
import { X, SlidersHorizontal, Check, Lock, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBudget: number;
  weeklyBudgets: Budget[];
  onSaveBudgets: (newMonthlyBudget: number, newWeeklyBudgets: Budget[]) => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  monthlyBudget: initialMonthly,
  weeklyBudgets: initialWeekly,
  onSaveBudgets,
}) => {
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState<string>(String(initialMonthly));
  const [weeklyInputs, setWeeklyInputs] = useState<string[]>(
    initialWeekly.map((b) => String(b.amount))
  );

  // Sync state whenever modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setMonthlyBudgetInput(String(initialMonthly));
      setWeeklyInputs(initialWeekly.map((b) => String(b.amount)));
    }
  }, [isOpen, initialMonthly, initialWeekly]);

  if (!isOpen) return null;

  const monthlyVal = parseFloat(monthlyBudgetInput) || 0;
  const weeklyVals = weeklyInputs.map((val) => parseFloat(val) || 0);
  const totalAllocated = weeklyVals.reduce((acc, curr) => acc + curr, 0);
  const diff = monthlyVal - totalAllocated;

  const handleWeeklyChange = (index: number, val: string) => {
    const next = [...weeklyInputs];
    next[index] = val;
    setWeeklyInputs(next);
  };

  const handleDistributeRemainder = () => {
    // Distributes remaining unallocated amount evenly across non-completed weeks
    const editableIndices = initialWeekly
      .map((b, idx) => (!b.is_completed ? idx : -1))
      .filter((idx) => idx !== -1);

    if (editableIndices.length === 0 || diff <= 0) return;

    const additionPerWeek = Math.floor(diff / editableIndices.length);
    const remainder = diff % editableIndices.length;

    const next = [...weeklyInputs];
    editableIndices.forEach((idx, i) => {
      const current = parseFloat(next[idx]) || 0;
      const extra = i === 0 ? additionPerWeek + remainder : additionPerWeek;
      next[idx] = String(Math.max(0, current + extra));
    });
    setWeeklyInputs(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedWeekly: Budget[] = initialWeekly.map((b, idx) => {
      // Completed weeks preserve their original budget to protect historical results
      if (b.is_completed) {
        return b;
      }
      return {
        ...b,
        amount: Math.max(0, parseFloat(weeklyInputs[idx]) || 0),
      };
    });

    onSaveBudgets(Math.max(0, monthlyVal), updatedWeekly);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Set Budgets</h3>
              <p className="text-[10px] text-slate-400">Monthly ceiling & independent weekly allocations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-3.5">
          {/* Section A: Overall Monthly Budget */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Overall Monthly Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={monthlyBudgetInput}
                onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === '0') e.target.select();
                }}
                className="w-full pl-7 pr-3 py-2 text-sm font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 bg-slate-50/50"
                placeholder="0"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Total planned spending ceiling across all four weeks.
            </p>
          </div>

          {/* Section B: Individual Weekly Budgets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Individual Weekly Budgets
              </label>
              {diff > 0 && (
                <button
                  type="button"
                  onClick={handleDistributeRemainder}
                  className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Distribute +{formatINR(diff)}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mb-2.5">
              Customize each week independently (e.g. allocate more to rent/deposit weeks without forcing equal splits).
            </p>

            <div className="space-y-2">
              {initialWeekly.map((b, idx) => {
                const isCompleted = Boolean(b.is_completed);

                return (
                  <div
                    key={b.budget_id || idx}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isCompleted
                        ? 'bg-slate-100/70 border-slate-200'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Week {b.week_index || idx + 1}
                      </span>
                      {isCompleted ? (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 flex items-center gap-0.5"
                          title="Completed weeks maintain historical recorded budgets"
                        >
                          <Lock className="w-2.5 h-2.5" /> Finished
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Editable
                        </span>
                      )}
                    </div>

                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        disabled={isCompleted}
                        value={isCompleted ? b.amount : weeklyInputs[idx]}
                        onChange={(e) => handleWeeklyChange(idx, e.target.value)}
                        onFocus={(e) => {
                          if (e.target.value === '0') e.target.select();
                        }}
                        placeholder="0"
                        className={`w-full pl-6 pr-2 py-1 text-xs font-black rounded-lg border text-right focus:outline-none ${
                          isCompleted
                            ? 'bg-slate-200/60 border-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Budget Allocation Summary */}
          <div
            className={`p-3 rounded-xl border text-xs ${
              monthlyVal === 0 && totalAllocated === 0
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : diff === 0
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : diff > 0
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Total Allocated:</span>
              <span className="font-extrabold">{formatINR(totalAllocated)} of {formatINR(monthlyVal)}</span>
            </div>

            {monthlyVal === 0 && totalAllocated === 0 ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>Enter your monthly budget and allocate amounts for each week.</span>
              </p>
            ) : diff === 0 ? (
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span>Exactly 100% of your monthly budget is planned.</span>
              </p>
            ) : diff > 0 ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>
                  <strong>{formatINR(diff)}</strong> remains unallocated. You can distribute it or keep as cushion.
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                <span>
                  Weekly budgets exceed monthly limit by <strong>{formatINR(Math.abs(diff))}</strong>. (You can still save).
                </span>
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Budget</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

