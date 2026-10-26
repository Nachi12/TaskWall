import React from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { Clock, AlertTriangle, Check, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface PendingTasksWidgetProps {
  theme?: string;
  config?: {
    maxItems?: number;
  };
}

export const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({
  theme = 'midnight',
  config = { maxItems: 5 }
}) => {
  const { pendingTasks, toggleTaskStatus, rescheduleTask } = useTaskStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  const visibleTasks = pendingTasks.slice(0, config.maxItems || 5);

  return (
    <div className={`p-5 rounded-2xl ${panelClass} flex flex-col h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-canvas-secondary" />
          <h2 className="text-xs font-bold tracking-wider text-canvas-secondary uppercase">
            Pending & Carried Tasks
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-canvas-muted">
          {pendingTasks.length} total
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-4 text-canvas-subtle">
            <Check className="w-6 h-6 text-canvas-success mb-1" />
            <p className="text-xs">All tasks completed! Great job.</p>
          </div>
        ) : (
          visibleTasks.map(task => {
            const isOverdue = task.scheduled_date < today;

            return (
              <div
                key={task.id}
                onClick={() => toggleTaskStatus(task.id)}
                className="group flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-canvas-border-focus transition-all cursor-pointer select-none active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id);
                    }}
                    className="w-4 h-4 rounded-md border border-canvas-subtle/40 hover:border-canvas-accent flex-shrink-0 flex items-center justify-center transition-all"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                      {isOverdue ? (
                        <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{task.overdueDays}d overdue ({task.scheduled_date})</span>
                        </span>
                      ) : (
                        <span className="text-canvas-subtle">
                          Scheduled: {task.scheduled_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action: Reschedule to Today if overdue */}
                {isOverdue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      rescheduleTask(task.id, today);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-[10px] font-semibold bg-canvas-accent/20 hover:bg-canvas-accent text-canvas-accent hover:text-slate-950 flex items-center gap-1 transition-all"
                    title="Reschedule to Today"
                  >
                    <span>To Today</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
