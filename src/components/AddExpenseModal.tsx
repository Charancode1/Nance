import React, { useState } from 'react';
import { Transaction, PaymentMode } from '../types';
import { ELIGIBLE_SPENDING_CATEGORIES, EXCLUDED_CATEGORIES } from '../services/budgetCalculator';
import { X, Plus, QrCode } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  onAddTransaction: (txn: Transaction) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  onAddTransaction,
}) => {
  const [amount, setAmount] = useState<string>('150');
  const [merchantName, setMerchantName] = useState<string>('Quick Mart');
  const [mainCategory, setMainCategory] = useState<string>('Groceries');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [txnDate, setTxnDate] = useState<string>(defaultDate || '2026-10-09');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const newTxn: Transaction = {
      txn_id: `txn_${Date.now()}`,
      user_id: 'user_demo',
      txn_date: txnDate,
      txn_time: new Date().toTimeString().split(' ')[0],
      amount: numAmt,
      transaction_type: 'debit',
      payment_mode: paymentMode,
      main_category: mainCategory,
      merchant_name: merchantName || mainCategory,
      source: 'User Entry',
      arrived_at: new Date().toISOString(),
    };

    onAddTransaction(newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add Expense</h3>
              <p className="text-xs text-slate-500">Record a spending debit for your active week</p>
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
          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
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
                className="w-full pl-8 pr-4 py-2.5 text-base rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category
            </label>
            <select
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
            >
              <optgroup label="Eligible Expense Categories">
                {ELIGIBLE_SPENDING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Excluded Money Movements (Audit Demo)">
                {EXCLUDED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c} (Excluded from spending)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Merchant Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Merchant Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Zepto, Local Store"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
            />
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                min="2026-10-01"
                max="2026-10-28"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
