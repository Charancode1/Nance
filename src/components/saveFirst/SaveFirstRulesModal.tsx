import React from 'react';
import { X, PiggyBank, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface SaveFirstRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveFirstRulesModal: React.FC<SaveFirstRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left relative animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">How Save First Works</h3>
              <p className="text-[10px] text-slate-400">Save a little first. Build a better tomorrow.</p>
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

        <div className="space-y-3.5 my-3.5 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <h4 className="font-black text-emerald-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Save Before You Spend</span>
            </h4>
            <p className="text-[11px] text-emerald-800">
              Instead of waiting to see what happens to be left at the end of the week, you set aside your savings commitment <strong>first</strong>, leaving an explicit spending limit for consumption.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Weekly Spending Limit Formula</span>
            </h4>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-800 text-center">
              Weekly Spending Limit = Weekly Budget – Savings Goal
            </div>
            <p className="text-[11px] text-slate-500">
              For example, on a ₹1,000 weekly budget with a ₹100 savings goal, your available spending limit is ₹900.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Automatic Savings Calculation</span>
            </h4>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-800 text-center">
              Amount Saved = max(0, Weekly Budget – Actual Spending)
            </div>
            <p className="text-[11px] text-slate-500">
              No manual savings entry needed! When your expenses stay within budget, your savings are automatically secured. Spend even less, and you earn extra savings!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>4. Zero-Guilt & Fresh Opportunities</span>
            </h4>
            <p className="text-[11px] text-amber-900">
              If an unexpected expense causes actual spending to exceed budget, savings is cleanly set to ₹0 without negative penalties. Every new week is another opportunity to save!
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
