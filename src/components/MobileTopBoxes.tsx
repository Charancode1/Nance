import React from 'react';
import { WeeklyCalculation } from '../types';
import { Check, AlertTriangle } from 'lucide-react';

interface MobileTopBoxesProps {
  weeks: WeeklyCalculation[];
  selectedWeekIndex: number;
  onSelectWeek: (weekIndex: number) => void;
}

export const MobileTopBoxes: React.FC<MobileTopBoxesProps> = ({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
}) => {
  return (
    <section className="w-full">
      {/* 4 Weekly Boxes Grid */}
      <div className="grid grid-cols-4 gap-2">
        {weeks.map((week) => {
          const isSelected = selectedWeekIndex === week.weekIndex;
          const isCompleted = week.isCompleted;
          const isWin = week.resultStatus === 'win';
          const isOver = week.resultStatus === 'over';

          // Color & Styling determination
          let bgClasses = 'bg-slate-100/90 border-slate-200 text-slate-600';
          let dotColor = 'bg-slate-300';
          let textColor = 'text-slate-500';

          if (isCompleted) {
            if (isWin) {
              bgClasses = 'bg-emerald-50 border-emerald-300 text-emerald-950';
              dotColor = 'bg-emerald-500';
              textColor = 'text-emerald-700';
            } else if (isOver) {
              bgClasses = 'bg-amber-50 border-amber-300 text-amber-950';
              dotColor = 'bg-amber-500';
              textColor = 'text-amber-700';
            }
          } else if (isSelected) {
            bgClasses = 'bg-white border-slate-300 text-slate-800';
            dotColor = 'bg-emerald-500';
          }

          return (
            <button
              key={week.weekCode}
              type="button"
              onClick={() => onSelectWeek(week.weekIndex)}
              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[76px] cursor-pointer relative ${bgClasses} ${
                isSelected
                  ? 'ring-2 ring-emerald-600 shadow-sm font-semibold scale-[1.02]'
                  : 'hover:border-slate-300'
              }`}
            >
              {/* Top: Week Label & Status Dot */}
              <div className="flex items-center justify-between w-full px-0.5">
                <span className="text-[11px] font-bold tracking-tight text-slate-900">
                  {week.weekCode}
                </span>
                <span className="flex items-center">
                  {isCompleted ? (
                    isWin ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">
                        <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  )}
                </span>
              </div>

              {/* Bottom: Dynamic Percentage / Status */}
              <div className="mt-1 w-full text-center">
                <span
                  className={`text-[11px] leading-tight font-black block truncate ${
                    isCompleted ? textColor : 'text-slate-500 font-medium'
                  }`}
                  title={week.boxLabel}
                >
                  {week.boxLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
