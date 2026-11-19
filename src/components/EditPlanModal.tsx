import React, { useState } from 'react';
import { Budget, UserFinancialProfile } from '../types';
import { formatINR } from '../utils/formatters';
import { X, Sliders, Check, Info } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserFinancialProfile;
  budgets: Budget[];
  onSavePlan: (updatedProfile: UserFinancialProfile, updatedBudgets: Budget[]) => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isOpen,
  onClose,
  profile,
  budgets,
  onSavePlan,
}) => {
  const [allowance, setAllowance] = useState<number>(profile.monthly_allowance);
  const [rent, setRent] = useState<number>(profile.fixed_rent);
  const [savingsTarget, setSavingsTarget] = useState<number>(profile.monthly_savings_target);

  // 4 weekly amounts
  const [weeklyBudgets, setWeeklyBudgets] = useState<number[]>(
    budgets.map((b) => b.amount)
  );

  if (!isOpen) return null;

  const flexiblePool = allowance - rent;
  const totalWeekly = weeklyBudgets.reduce((acc, curr) => acc + curr, 0);
  const remainingBuffer = flexiblePool - totalWeekly - savingsTarget;

  const handleWeeklyChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = [...weeklyBudgets];
    next[index] = num;
    setWeeklyBudgets(next);
  };

  const handleEqualSplit = () => {
    // Splits (flexiblePool - savingsTarget) equally across the 4 weeks
    const targetPool = Math.max(0, flexiblePool - savingsTarget);
    const perWeek = Math.floor(targetPool / 4);
    setWeeklyBudgets([perWeek, perWeek, perWeek, perWeek]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserFinancialProfile = {
      ...profile,
      monthly_allowance: allowance,
      fixed_rent: rent,
      monthly_savings_target: savingsTarget,
    };

    const updatedBudgets = budgets.map((b, idx) => ({
      ...b,
      amount: weeklyBudgets[idx] || 1000,
    }));

    onSavePlan(updatedProfile, updatedBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-floating border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Customize Monthly Money Plan</h3>
              <p className="text-xs text-slate-500">Edit allowance, fixed commitments & weekly spending limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 my-4">
          {/* Allowance & Rent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Monthly Allowance (₹)
              </label>
              <input
                type="number"
                step="100"
                min="1000"
                value={allowance}
                onChange={(e) => setAllowance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Parent credit</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fixed PG Rent (₹)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={rent}
                onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-amber-600 block mt-0.5">Fixed commitment</span>
            </div>
          </div>

          {/* Flexible Pool Summary */}
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-semibold">Available Flexible Monthly Pool:</span>
            <span className="text-base font-extrabold text-emerald-900">
              {formatINR(flexiblePool)}
            </span>
          </div>

          {/* End-of-month Savings Target */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Monthly Savings Target (₹)
              </label>
              <span className="text-xs font-bold text-teal-700">
                {formatINR(savingsTarget)}
              </span>
            </div>
            <input
              type="number"
              step="50"
              min="0"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-bold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Desired buffer kept unspent at month end
            </span>
          </div>

          {/* 4 Weekly Limits */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Weekly Spending Limits
              </label>
              <button
                type="button"
                onClick={handleEqualSplit}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Auto-Split Evenly
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {weeklyBudgets.map((amt, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Week {idx + 1}
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={amt}
                      onChange={(e) => handleWeeklyChange(idx, e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health check buffer warning or confirmation */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              remainingBuffer >= 0
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>
                Total planned weekly spending is <strong>{formatINR(totalWeekly)}</strong>.
                {remainingBuffer >= 0 ? (
                  <>
                    {' '}You have <strong>{formatINR(remainingBuffer)}</strong> unallocated buffer left in your flexible pool.
                  </>
                ) : (
                  <>
                    {' '}Warning: Your plan exceeds your flexible monthly pool by{' '}
                    <strong>{formatINR(Math.abs(remainingBuffer))}</strong>. Consider trimming weekly budgets.
                  </>
                )}
              </p>
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
