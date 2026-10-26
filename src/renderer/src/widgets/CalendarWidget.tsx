import React, { useState } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface CalendarWidgetProps {
  theme?: string;
  config?: {
    weekStart?: 'monday' | 'sunday';
  };
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  theme = 'midnight',
  config = { weekStart: 'monday' }
}) => {
  const { selectedDate, setSelectedDate, calendarSummary, setCurrentMonth } = useTaskStore();
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const weekStartsOn = config.weekStart === 'sunday' ? 0 : 1;

  const monthStart = startOfMonth(currentViewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => {
    const prev = subMonths(currentViewDate, 1);
    setCurrentViewDate(prev);
    setCurrentMonth(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const next = addMonths(currentViewDate, 1);
    setCurrentViewDate(next);
    setCurrentMonth(format(next, 'yyyy-MM'));
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentViewDate(now);
    setSelectedDate(format(now, 'yyyy-MM-dd'));
    setCurrentMonth(format(now, 'yyyy-MM'));
  };

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  const weekDays = config.weekStart === 'sunday'
    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className={`p-5 rounded-2xl ${panelClass} flex flex-col h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-canvas-accent" />
          <span className="font-bold text-base tracking-tight">
            {format(currentViewDate, 'MMMM yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleTodayClick}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-canvas-muted hover:text-white flex items-center gap-1"
            title="Jump to Today"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Today</span>
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-canvas-muted hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-canvas-muted hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-[11px] font-semibold text-canvas-subtle py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
        {days.map(day => {
          const dateISO = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateISO;
          const isCurrentDay = isToday(day);
          const inCurrentMonth = isSameMonth(day, currentViewDate);
          const summary = calendarSummary[dateISO];

          let dayClasses = 'relative h-9 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all duration-150 cursor-pointer ';

          if (!inCurrentMonth) {
            dayClasses += 'text-canvas-subtle/40 hover:text-canvas-subtle ';
          } else if (isSelected) {
            dayClasses += 'bg-canvas-accent text-slate-950 font-bold shadow-lg shadow-canvas-accent/30 scale-105 z-10 ';
          } else if (isCurrentDay) {
            dayClasses += 'bg-canvas-accent/20 text-canvas-accent font-bold border border-canvas-accent/40 ';
          } else {
            dayClasses += 'text-slate-200 hover:bg-white/10 ';
          }

          return (
            <div
              key={dateISO}
              onClick={() => setSelectedDate(dateISO)}
              className={dayClasses}
            >
              <span>{format(day, 'd')}</span>

              {/* Status indicator dots */}
              {summary && summary.total > 0 && (
                <div className="absolute bottom-1 flex items-center gap-0.5">
                  {summary.overdue > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-canvas-danger" />
                  ) : summary.completed === summary.total ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-canvas-success" />
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-900' : 'bg-canvas-accent'}`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
