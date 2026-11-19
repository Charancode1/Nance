import React from 'react';
import { X, Calculator, ShieldCheck, Database } from 'lucide-react';
import { ELIGIBLE_SPENDING_CATEGORIES } from '../services/budgetCalculator';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-floating border border-slate-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Calculation Formulas & Eligibility Rules
              </h3>
              <p className="text-xs text-slate-500">Transparent budgeting engine and transaction rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 my-4 text-xs sm:text-sm text-slate-600">
          {/* Core Formulas */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Calculation Formulas</span>
            </h4>
            <div className="space-y-2 font-mono text-xs text-slate-800">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong>Weekly Difference</strong> = Weekly Budget – Total Eligible Weekly Spending
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong>Weekly Percentage</strong> = (Weekly Difference / Weekly Budget) × 100
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong>Monthly Difference</strong> = Monthly Budget – Total Monthly Eligible Spending
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong>Monthly Percentage</strong> = (Monthly Difference / Monthly Budget) × 100
              </div>
            </div>
          </div>

          {/* Included vs Excluded Categories */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Transaction Taxonomy & Eligibility</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1.5 text-xs uppercase tracking-wider">
                  Eligible Spending Categories
                </span>
                <div className="max-h-40 overflow-y-auto space-y-0.5 text-xs text-emerald-800">
                  {ELIGIBLE_SPENDING_CATEGORIES.map((c) => (
                    <div key={c}>• {c}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block mb-1.5 text-xs uppercase tracking-wider">
                  Excluded Money Movements
                </span>
                <div className="space-y-1 text-xs text-amber-900">
                  <div>• <strong>Credit Card Settlements</strong> (avoids double-counting card purchases)</div>
                  <div>• <strong>Self Transfers</strong> (internal account/wallet moves)</div>
                  <div>• <strong>Cash Withdrawals</strong> (spending tracked at purchase)</div>
                  <div>• <strong>Investments</strong> (SIP / mutual fund outflows)</div>
                  <div>• <strong>Lend & Borrow</strong> (peer splits)</div>
                  <div>• <strong>Friends & Family</strong> (peer transfers)</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              *Transactions are strictly attributed using <code>txn_date</code> (the date of the purchase), not <code>arrived_at</code>.
            </p>
          </div>

          {/* Ethical & Terminology Note */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Terminology & Zero-Guilt Habit Principle:</strong> The under-budget amount is accurately described as <em>Unspent Planned Budget</em>. If a user exceeds budget in any week, the app provides supportive feedback and allows a clean fresh start next week without shame.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
