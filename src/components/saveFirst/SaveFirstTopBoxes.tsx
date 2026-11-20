import React from 'react';
import { WeeklySavingsCalculation } from '../../types/saveFirst';
import { Check } from 'lucide-react';

interface SaveFirstTopBoxesProps {
  weeks: WeeklySavingsCalculation[];
  selectedWeekIndex: number;
  onSelectWeek: (weekIndex: number) => void;
}

export const SaveFirstTopBoxes: React.FC<SaveFirstTopBoxesProps> = ({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
}) => {
  return (
    <section className="w-full">
      <div className="grid grid-cols-4 gap-2">
        {weeks.map((week) => {
          const isSelected = selectedWeekIndex === week.weekIndex;
          const isCompleted = week.isCompleted;
          const isAchieved = isCompleted && week.isGoalAchieved;
          const isPartial = isCompleted && week.isPartiallyAchieved;

          let bgClasses = 'bg-slate-100/90 border-slate-200 text-slate-600';
          let dotColor = 'bg-slate-300';
          let textColor = 'text-slate-500';

          if (isCompleted) {
            if (isAchieved) {
              bgClasses = 'bg-emerald-50 border-emerald-300 text-emerald-950';
              dotColor = 'bg-emerald-500';
              textColor = 'text-emerald-700';
            } else if (isPartial) {
              bgClasses = 'bg-amber-50/70 border-amber-300 text-amber-950';
              dotColor = 'bg-amber-500';
              textColor = 'text-amber-700';
            } else {
              bgClasses = 'bg-slate-100 border-slate-300 text-slate-700';
              dotColor = 'bg-slate-400';
              textColor = 'text-slate-600';
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
              {/* Top: Week Label & Status Indicator */}
              <div className="flex items-center justify-between w-full px-0.5">
                <span className="text-[11px] font-bold tracking-tight text-slate-900">
                  {week.weekCode}
                </span>
                <span className="flex items-center">
                  {isCompleted ? (
                    isAchieved ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[2]" />
                      </span>
                    )
                  ) : week.actualSpending > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  )}
                </span>
              </div>

              {/* Bottom: Dynamic Savings Amount / Status */}
              <div className="mt-1 w-full text-center">
                <span
                  className={`text-[10px] sm:text-[11px] leading-tight font-black block truncate ${
                    isAchieved ? textColor : 'text-slate-500 font-semibold'
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
