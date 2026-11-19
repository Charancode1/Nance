import React, { useState } from 'react';
import { Transaction, PaymentMode } from '../types';
import { ELIGIBLE_CATEGORIES, EXCLUDED_CATEGORIES } from '../services/budgetCalculator';
import { X, Plus, QrCode } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Transaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [amount, setAmount] = useState<string>('120');
  const [merchantName, setMerchantName] = useState<string>('Campus Canteen');
  const [mainCategory, setMainCategory] = useState<string>('Food & Dining');
  const [subCategory, setSubCategory] = useState<string>('Quick Meal');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [txnDate, setTxnDate] = useState<string>('2026-10-16');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const newTxn: Transaction = {
      txn_id: `sim_${Date.now()}`,
      txn_date: txnDate,
      txn_time: new Date().toTimeString().split(' ')[0],
      amount: numAmt,
      transaction_type: 'debit',
      payment_mode: paymentMode,
      main_category: mainCategory,
      sub_category: subCategory,
      merchant_name: merchantName,
      person_name: null,
      source: 'UPI Notification',
      arrived_at: new Date().toISOString(),
      is_eligible: ELIGIBLE_CATEGORIES.has(mainCategory),
    };

    onAddTransaction(newTxn);
    onClose();
  };

  // Quick preset chips for student testing
  const presets = [
    { label: '₹20 Chai & Samosa', amt: '20', merchant: 'Chai Point', cat: 'Food & Dining', sub: 'Tea & Snacks' },
    { label: '₹60 Auto Ride', amt: '60', merchant: 'Namma Yatri Auto', cat: 'Transportation', sub: 'Auto' },
    { label: '₹180 Blinkit Groceries', amt: '180', merchant: 'Blinkit', cat: 'Groceries', sub: 'Instant Grocery' },
    { label: '₹350 Swiggy Weekend Treat', amt: '350', merchant: 'Swiggy', cat: 'Food & Dining', sub: 'Delivery' },
    { label: '₹500 Excluded Lend to Friend', amt: '500', merchant: 'Roommate UPI', cat: 'Lend', sub: 'Split Repayment' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add Simulated Expense</h3>
              <p className="text-xs text-slate-500">Test live weekly & monthly budget recalculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="my-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Quick Student Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setAmount(p.amt);
                  setMerchantName(p.merchant);
                  setMainCategory(p.cat);
                  setSubCategory(p.sub);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Merchant / Person Name
            </label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
            />
          </div>

          {/* Main Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
              >
                <optgroup label="Eligible Flexible Debits">
                  {Array.from(ELIGIBLE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Excluded (Non-Flexible)">
                  {Array.from(EXCLUDED_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c} (Excluded)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Sub category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sub-category
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
              />
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Date (October 2026)
              </label>
              <input
                type="date"
                min="2026-10-01"
                max="2026-10-28"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
              >
                <option value="UPI">UPI (QR / App)</option>
                <option value="Card">Debit / Student Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Record Simulated Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
