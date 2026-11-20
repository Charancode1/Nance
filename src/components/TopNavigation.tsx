import React from 'react';
import { Sparkles, PiggyBank } from 'lucide-react';
import { PageId } from '../utils/navigation';

interface TopNavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="Habit Feature Selection"
      className="bg-slate-900 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 text-white z-30 sticky top-0"
    >
      {/* NANCE HABITS Branding */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-black tracking-tight text-white">NANCE</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 uppercase tracking-wider">
          Habits
        </span>
      </div>

      {/* Two Independent Habit Page Links */}
      <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 text-[11px] font-bold">
        <a
          href="/weekly-wins"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('weekly_wins');
          }}
          aria-current={currentPage === 'weekly_wins' ? 'page' : undefined}
          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            currentPage === 'weekly_wins'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Weekly Wins</span>
        </a>

        <a
          href="/save-first"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('save_first');
          }}
          aria-current={currentPage === 'save_first' ? 'page' : undefined}
          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            currentPage === 'save_first'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-3 h-3" />
          <span>Save First</span>
        </a>
      </div>
    </nav>
  );
};
