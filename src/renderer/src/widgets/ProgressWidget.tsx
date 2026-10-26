import React from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { CheckCircle2, TrendingUp, Sparkles, Award } from 'lucide-react';

interface ProgressWidgetProps {
  theme?: string;
  config?: {
    showPercentage?: boolean;
  };
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  theme = 'midnight',
  config = { showPercentage: true }
}) => {
  const { tasks } = useTaskStore();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const isAllDone = total > 0 && completed === total;

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  return (
    <div className={`p-5 rounded-2xl ${panelClass} flex flex-col justify-between h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAllDone ? (
            <Award className="w-4 h-4 text-canvas-success animate-bounce" />
          ) : (
            <TrendingUp className="w-4 h-4 text-canvas-accent" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-canvas-accent">
            Daily Progress
          </span>
        </div>
        {config.showPercentage && (
          <span className={`text-xs font-extrabold ${isAllDone ? 'text-canvas-success' : 'text-canvas-text'}`}>
            {total === 0 ? '—' : `${percentage}%`}
          </span>
        )}
      </div>

      <div className="my-auto space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black tracking-tight">
            {total === 0 ? (
              <span className="text-sm font-normal text-canvas-muted">No tasks assigned today</span>
            ) : isAllDone ? (
              <span className="text-canvas-success flex items-center gap-1.5 text-lg">
                <Sparkles className="w-5 h-5 text-amber-300" />
                All {total} goals completed!
              </span>
            ) : (
              <span>
                {completed} <span className="text-sm font-medium text-canvas-subtle">of {total} done</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isAllDone
                ? 'bg-gradient-to-r from-emerald-400 to-canvas-success shadow-lg shadow-emerald-500/50'
                : 'bg-gradient-to-r from-canvas-accent to-canvas-secondary shadow-lg shadow-purple-500/30'
            }`}
            style={{ width: `${total === 0 ? 0 : Math.max(percentage, 4)}%` }}
          />
        </div>
      </div>

      <p className="text-[11px] text-canvas-muted mt-1 truncate">
        {total === 0
          ? 'Enjoy the day or add tasks from the calendar'
          : isAllDone
          ? 'Phenomenal productivity today! Take a well-deserved break.'
          : `${total - completed} task${total - completed > 1 ? 's' : ''} remaining for today`}
      </p>
    </div>
  );
};
