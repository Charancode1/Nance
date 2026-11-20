import React, { useState, useEffect } from 'react';
import { WeeklySavingsBudget } from '../../types/saveFirst';
import { formatINR } from '../../utils/formatters';
import { X, SlidersHorizontal, Check, Lock, AlertCircle, Info, CheckCircle2, PiggyBank } from 'lucide-react';

interface SaveFirstBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBudget: number;
  monthlySavingsGoal: number;
  weeklyBudgets: WeeklySavingsBudget[];
  onSaveBudgets: (
    newMonthlyBudget: number,
    newMonthlySavingsGoal: number,
    newWeeklyBudgets: WeeklySavingsBudget[]
  ) => void;
}

export const SaveFirstBudgetModal: React.FC<SaveFirstBudgetModalProps> = ({
  isOpen,
  onClose,
  monthlyBudget: initialMonthlyBudget,
  monthlySavingsGoal: initialMonthlySavingsGoal,
  weeklyBudgets: initialWeeklyBudgets,
  onSaveBudgets,
}) => {
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState<string>(String(initialMonthlyBudget));
  const [monthlySavingsInput, setMonthlySavingsInput] = useState<string>(String(initialMonthlySavingsGoal));
  const [weeklyBudgetInputs, setWeeklyBudgetInputs] = useState<string[]>(
    initialWeeklyBudgets.map((b) => String(b.budget_amount))
  );
  const [weeklySavingsInputs, setWeeklySavingsInputs] = useState<string[]>(
    initialWeeklyBudgets.map((b) => String(b.savings_target))
  );

  useEffect(() => {
    if (isOpen) {
      setMonthlyBudgetInput(String(initialMonthlyBudget));
      setMonthlySavingsInput(String(initialMonthlySavingsGoal));
      setWeeklyBudgetInputs(initialWeeklyBudgets.map((b) => String(b.budget_amount)));
      setWeeklySavingsInputs(initialWeeklyBudgets.map((b) => String(b.savings_target)));
    }
  }, [isOpen, initialMonthlyBudget, initialMonthlySavingsGoal, initialWeeklyBudgets]);

  if (!isOpen) return null;

  const monthlyBudgetVal = parseFloat(monthlyBudgetInput) || 0;
  const monthlySavingsVal = parseFloat(monthlySavingsInput) || 0;

  const weeklyBudgetVals = weeklyBudgetInputs.map((val) => parseFloat(val) || 0);
  const weeklySavingsVals = weeklySavingsInputs.map((val) => parseFloat(val) || 0);

  const totalAllocatedBudget = weeklyBudgetVals.reduce((acc, curr) => acc + curr, 0);
  const totalAllocatedSavings = weeklySavingsVals.reduce((acc, curr) => acc + curr, 0);

  const savingsDiff = monthlySavingsVal - totalAllocatedSavings;

  const handleWeeklyBudgetChange = (index: number, val: string) => {
    const next = [...weeklyBudgetInputs];
    next[index] = val;
    setWeeklyBudgetInputs(next);
  };

  const handleWeeklySavingsChange = (index: number, val: string) => {
    const next = [...weeklySavingsInputs];
    next[index] = val;
    setWeeklySavingsInputs(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedWeekly: WeeklySavingsBudget[] = initialWeeklyBudgets.map((b, idx) => {
      if (b.is_completed) {
        return b;
      }
      return {
        ...b,
        budget_amount: Math.max(0, parseFloat(weeklyBudgetInputs[idx]) || 0),
        savings_target: Math.max(0, parseFloat(weeklySavingsInputs[idx]) || 0),
      };
    });

    onSaveBudgets(
      Math.max(0, monthlyBudgetVal),
      Math.max(0, monthlySavingsVal),
      updatedWeekly
    );
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
              <h3 className="font-extrabold text-base text-slate-900">Save First Plan</h3>
              <p className="text-[10px] text-slate-400">Monthly goals & independent weekly targets</p>
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
          {/* Section A: Monthly Budget & Savings Goal */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1">
                Monthly Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
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
                  className="w-full pl-6 pr-2 py-1.5 text-xs font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 bg-slate-50/50"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-emerald-600" />
                <span>Savings Goal (₹)</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={monthlySavingsInput}
                  onChange={(e) => setMonthlySavingsInput(e.target.value)}
                  onFocus={(e) => {
                    if (e.target.value === '0') e.target.select();
                  }}
                  className="w-full pl-6 pr-2 py-1.5 text-xs font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 bg-emerald-50/30"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section B: Individual Weekly Budgets and Savings Targets */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Weekly Budgets & Savings Targets
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              Independently configure budget and savings for each week (Save first before you spend!).
            </p>

            <div className="space-y-2">
              {initialWeeklyBudgets.map((b, idx) => {
                const isCompleted = Boolean(b.is_completed);

                return (
                  <div
                    key={b.budget_id || idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-100/70 border-slate-200'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Week {b.week_index || idx + 1}
                      </span>
                      {isCompleted ? (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 flex items-center gap-0.5"
                          title="Completed weeks maintain historical recorded results"
                        >
                          <Lock className="w-2.5 h-2.5" /> Finished
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Editable
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold block mb-0.5">
                          Weekly Budget
                        </span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            disabled={isCompleted}
                            value={isCompleted ? b.budget_amount : weeklyBudgetInputs[idx]}
                            onChange={(e) => handleWeeklyBudgetChange(idx, e.target.value)}
                            onFocus={(e) => {
                              if (e.target.value === '0') e.target.select();
                            }}
                            placeholder="0"
                            className={`w-full pl-5 pr-1.5 py-1 text-xs font-black rounded-lg border text-right focus:outline-none ${
                              isCompleted
                                ? 'bg-slate-200/60 border-slate-200 text-slate-500 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-emerald-700 font-semibold block mb-0.5">
                          Savings Target
                        </span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 text-[10px] font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            disabled={isCompleted}
                            value={isCompleted ? b.savings_target : weeklySavingsInputs[idx]}
                            onChange={(e) => handleWeeklySavingsChange(idx, e.target.value)}
                            onFocus={(e) => {
                              if (e.target.value === '0') e.target.select();
                            }}
                            placeholder="0"
                            className={`w-full pl-5 pr-1.5 py-1 text-xs font-black rounded-lg border text-right focus:outline-none ${
                              isCompleted
                                ? 'bg-slate-200/60 border-slate-200 text-slate-500 cursor-not-allowed'
                                : 'bg-white border-emerald-200 text-emerald-900 focus:ring-1 focus:ring-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Budget Allocation Summary */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1 text-slate-700">
            <div className="flex items-center justify-between font-bold">
              <span>Total Weekly Budgets:</span>
              <span className="font-extrabold">{formatINR(totalAllocatedBudget)} of {formatINR(monthlyBudgetVal)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-emerald-800">
              <span>Total Weekly Savings Targets:</span>
              <span className="font-extrabold">{formatINR(totalAllocatedSavings)} of {formatINR(monthlySavingsVal)}</span>
            </div>
            {monthlySavingsVal === 0 && totalAllocatedSavings === 0 ? (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Configure your savings targets to start tracking.</span>
              </p>
            ) : savingsDiff === 0 ? (
              <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Weekly savings targets match your monthly savings goal.</span>
              </p>
            ) : savingsDiff > 0 ? (
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>{formatINR(savingsDiff)} savings goal remaining to be allocated.</span>
              </p>
            ) : (
              <p className="text-[10px] text-amber-800 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Weekly targets exceed monthly goal by {formatINR(Math.abs(savingsDiff))}.</span>
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
              <span>Save Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
