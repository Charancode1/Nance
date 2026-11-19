import React from 'react';
import { User } from '../types';
import {
  Sparkles,
  Smartphone,
  Monitor,
  HelpCircle,
  PlusCircle,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  users: User[];
  currentUser: User;
  onSelectUser: (userId: string) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenAddTxn: () => void;
  onOpenEditPlan: () => void;
  onOpenRules: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  users,
  currentUser,
  onSelectUser,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenAddTxn,
  onOpenEditPlan,
  onOpenRules,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Nance
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Weekly Wins
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Small weekly wins. Better money habits.
              </p>
            </div>
          </div>

          {/* User Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/70 p-1.5 pl-2.5 rounded-xl border border-slate-200 transition-colors">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-200 border border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-800">
                {currentUser.profile.avatar ? (
                  <img
                    src={currentUser.profile.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name[0]
                )}
              </div>
              <select
                value={currentUser.user_id}
                onChange={(e) => onSelectUser(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
                aria-label="Select student persona"
              >
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.city} • {u.profile.life_stage.split('(')[0].trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onOpenAddTxn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
                title="Add simulated transaction"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Add Expense</span>
              </button>

              <button
                onClick={onOpenEditPlan}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all"
                title="Edit weekly budgets and targets"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Edit Plan</span>
              </button>

              <button
                onClick={onOpenRules}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all flex items-center gap-1"
                title="Transparent calculation rules & schema"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span className="hidden lg:inline">Rules & Audit</span>
              </button>

              <button
                onClick={onResetData}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset synthetic data to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Mobile Device Frame Toggle */}
              <button
                onClick={onToggleMobileFrame}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={isMobileFrame ? 'Switch to Full Dashboard' : 'Switch to Mobile Mockup'}
              >
                {isMobileFrame ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Desktop</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile View</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
