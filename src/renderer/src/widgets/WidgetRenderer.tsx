import React from 'react';
import { WidgetConfig } from '@shared/types';
import { ClockWidget } from './ClockWidget';
import { CalendarWidget } from './CalendarWidget';
import { TodayTasksWidget } from './TodayTasksWidget';
import { PendingTasksWidget } from './PendingTasksWidget';
import { ProgressWidget } from './ProgressWidget';
import { TimerWidget } from './TimerWidget';

interface WidgetRendererProps {
  widget: WidgetConfig;
  theme?: string;
  isEditor?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  theme = 'midnight',
  isEditor = false
}) => {
  if (!widget.visible) return null;

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget theme={theme} config={widget.config} />;
      case 'calendar':
        return <CalendarWidget theme={theme} config={widget.config} />;
      case 'today_tasks':
        return <TodayTasksWidget theme={theme} config={widget.config} />;
      case 'pending_tasks':
        return <PendingTasksWidget theme={theme} config={widget.config} />;
      case 'progress':
        return <ProgressWidget theme={theme} config={widget.config} />;
      case 'timer':
        return <TimerWidget theme={theme} config={widget.config} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${widget.position_x}px`,
        top: `${widget.position_y}px`,
        width: `${widget.width}px`,
        height: `${widget.height}px`
      }}
      className={`transition-all duration-150 ${isEditor ? 'cursor-move ring-2 ring-transparent hover:ring-canvas-accent' : ''}`}
    >
      {renderWidgetContent()}
    </div>
  );
};
