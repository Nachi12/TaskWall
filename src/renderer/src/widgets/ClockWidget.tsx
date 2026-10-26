import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sparkles, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

interface ClockWidgetProps {
  theme?: string;
  config?: {
    showSeconds?: boolean;
    greeting?: boolean;
  };
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ theme = 'midnight', config = {} }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  let greeting = 'Good evening';
  let GreetingIcon = Moon;

  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning';
    GreetingIcon = Sunrise;
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
    GreetingIcon = Sun;
  } else if (hours >= 17 && hours < 21) {
    greeting = 'Good evening';
    GreetingIcon = Sunset;
  }

  const timeString = format(time, config.showSeconds ? 'h:mm:ss a' : 'h:mm a');
  const dayString = format(time, 'EEEE');
  const dateString = format(time, 'MMMM d, yyyy');

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  return (
    <div className={`p-5 rounded-2xl ${panelClass} flex flex-col justify-between h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-75">
          <GreetingIcon className="w-4 h-4 text-canvas-accent" />
          <span>{greeting}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-canvas-accent/15 text-canvas-accent border border-canvas-accent/20">
          <Sparkles className="w-3 h-3" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="my-auto">
        <div className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
          {timeString}
        </div>
        <div className="text-sm font-medium mt-1 opacity-80 flex items-center gap-2">
          <span className="font-semibold text-canvas-accent">{dayString}</span>
          <span className="opacity-40">•</span>
          <span>{dateString}</span>
        </div>
      </div>
    </div>
  );
};
