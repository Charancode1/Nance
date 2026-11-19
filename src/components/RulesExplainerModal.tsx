import React from 'react';
import { X, Database, Calculator, ShieldCheck, HeartHandshake } from 'lucide-react';

interface RulesExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesExplainerModal: React.FC<RulesExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-floating border border-slate-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Weekly Wins Calculation & Architecture Rules
              </h3>
              <p className="text-xs text-slate-500">
                Transparent logic, database schema, and ethical financial wellness principles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 my-5 text-left text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* 1. Core Mathematical Formulas */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-2 text-sm">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Core Mathematical Formulas</span>
            </h4>
            <div className="space-y-2 font-mono text-xs text-slate-800">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>Flexible Monthly Pool</strong> = Monthly Allowance – Fixed PG Rent
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>Monthly Planned Flexible Budget</strong> = Sum of all 4 Weekly Budgets (₹4,000)
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>Monthly Under-Budget Amount</strong> = Total Planned Budget – Total Actual Eligible Spending
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <strong>Monthly Performance %</strong> = (Monthly Under-Budget Amount / Total Planned Budget) × 100
              </div>
            </div>
          </div>

          {/* 2. Cumulative Progress & Zero-Destruction Recovery */}
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cumulative Progress & The Recovery Guarantee</span>
            </h4>
            <p className="text-slate-600">
              Traditional habit trackers break your entire streak after a single off-week. In Weekly Wins, <strong>overspending in Week 2 reduces cumulative performance, but does NOT reset or destroy it</strong>. When a student tightens their spending in Week 3, their cumulative performance recovers!
            </p>
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs">
              <strong>Why "Unspent Planned Budget" instead of "Confirmed Savings"?</strong> Actual bank savings cannot be established purely from debit transactions alone (e.g. money might be kept in wallet or uninvested). Hence, this amount is accurately labeled unspent planned budget.
            </div>
          </div>

          {/* 3. Transaction Calculation Rules (Eligible vs Excluded) */}
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1.5 text-sm">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Transaction Eligibility Rules</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1 text-xs uppercase tracking-wider">
                  Included Flexible Debits
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-emerald-800">
                  <li>Food & Dining (Swiggy, Canteen, Cafes)</li>
                  <li>Groceries (Blinkit, Zepto, Kirana)</li>
                  <li>Transportation (Metro, Auto QR, Uber)</li>
                  <li>Shopping (Stationery, Books, Clothes)</li>
                  <li>Entertainment (Movies, Spotify, Events)</li>
                  <li>Personal Care (Pharmacy, Haircut, Hygiene)</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block mb-1 text-xs uppercase tracking-wider">
                  Excluded Non-Flexible Transactions
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-800">
                  <li><strong>Rent:</strong> Fixed PG commitment outside budget</li>
                  <li><strong>Self Transfers:</strong> Wallet top-ups, bank transfers</li>
                  <li><strong>Credit Card Settlements:</strong> Prevents double-counting</li>
                  <li><strong>Cash Withdrawals (ATM):</strong> Outflow counted at purchase</li>
                  <li><strong>Lend / Borrow:</strong> Temporary hostel splits</li>
                  <li><strong>Investments:</strong> SIPs / Mutual funds</li>
                </ul>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              *Transactions are strictly filtered using <code>txn_date</code> (the date the transaction took place) rather than <code>arrived_at</code> (when the SMS or feed was parsed).
            </p>
          </div>

          {/* 4. Ethical Financial Wellness Note */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-950 font-bold mb-0.5">
                Ethical Financial Wellness Principle
              </strong>
              Never encourage students to avoid essential purchases such as doctor consultations, medicines, or healthy groceries just to maintain a streak. Health and well-being always take precedence over a gamified badge.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
