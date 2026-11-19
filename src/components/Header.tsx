import React from 'react';
import { Sparkles, SlidersHorizontal, RotateCcw, PlusCircle, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenBudgetSetup: () => void;
  onOpenAddExpense: () => void;
  onOpenRules: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBudgetSetup,
  onOpenAddExpense,
  onOpenRules,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Nance
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Weekly Wins
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Small weekly wins. Better money habits.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={onOpenBudgetSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Set Budgets</span>
            </button>

            <button
              onClick={onOpenRules}
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors flex items-center gap-1"
              title="Formulas & Rules"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Rules</span>
            </button>

            <button
              onClick={onResetDemo}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Demo to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
