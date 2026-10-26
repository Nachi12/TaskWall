import React, { useEffect, useState } from 'react';
import { useWallpaperStore } from '../stores/useWallpaperStore';
import { AppSettings, CarryForwardPolicy } from '@shared/types';
import {
  Settings as SettingsIcon,
  Sliders,
  Calendar,
  Monitor,
  Database,
  Info,
  CheckCircle,
  RefreshCw,
  Power
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    fetchSettings,
    capabilities,
    fetchCapabilities,
    displays,
    fetchDisplays,
    deactivateDesktopMode
  } = useWallpaperStore();

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'tasks' | 'displays' | 'about'>('general');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchCapabilities();
    fetchDisplays();
  }, []);

  const handleUpdate = async (updates: Partial<AppSettings>) => {
    await updateSettings(updates);
    setSaveStatus('Preferences updated');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  if (!settings) {
    return <div className="p-8 text-canvas-muted">Loading settings...</div>;
  }

  return (
    <div className="flex h-full bg-canvas-bg text-white select-none">
      {/* Settings Navigation Tabs */}
      <div className="w-56 p-4 border-r border-canvas-border flex flex-col gap-1 bg-slate-950/30">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <SettingsIcon className="w-5 h-5 text-canvas-accent" />
          <span className="font-bold text-sm tracking-tight">Preferences</span>
        </div>

        {[
          { id: 'general', label: 'General', icon: Sliders },
          { id: 'appearance', label: 'Appearance', icon: Sliders },
          { id: 'tasks', label: 'Task Rollover', icon: Calendar },
          { id: 'displays', label: 'Displays', icon: Monitor },
          { id: 'about', label: 'About & Diagnostics', icon: Info }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-canvas-accent text-slate-950 shadow-md font-bold'
                  : 'text-canvas-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {saveStatus && (
          <div className="mt-auto p-2 rounded-lg bg-canvas-success/15 border border-canvas-success/30 text-canvas-success text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold">General Settings</h2>
              <p className="text-xs text-canvas-muted mt-1">Configure launch behavior and calendar formatting.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold">Launch in Wallpaper Mode</div>
                  <div className="text-xs text-canvas-muted">Automatically activate desktop wallpaper on launch</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.launch_in_wallpaper_mode}
                  onChange={e => handleUpdate({ launch_in_wallpaper_mode: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold">Start on Login</div>
                  <div className="text-xs text-canvas-muted">Start DayCanvas automatically when your computer turns on</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.start_on_login}
                  onChange={e => handleUpdate({ start_on_login: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
              </label>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-sm font-semibold">Week Start Day</div>
                <div className="flex gap-2">
                  {(['monday', 'sunday'] as const).map(day => (
                    <button
                      key={day}
                      onClick={() => handleUpdate({ week_start: day })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        settings.week_start === day
                          ? 'bg-canvas-accent text-slate-950 border-canvas-accent'
                          : 'border-white/10 text-canvas-muted hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-sm font-semibold">Time Format</div>
                <div className="flex gap-2">
                  {(['12h', '24h'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleUpdate({ time_format: fmt })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        settings.time_format === fmt
                          ? 'bg-canvas-accent text-slate-950 border-canvas-accent'
                          : 'border-white/10 text-canvas-muted hover:text-white'
                      }`}
                    >
                      {fmt === '12h' ? '12-Hour (AM/PM)' : '24-Hour'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold">Appearance & Material</h2>
              <p className="text-xs text-canvas-muted mt-1">Customize opacity and backdrop blur for widgets.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Widget Opacity</span>
                  <span className="text-canvas-accent">{Math.round(settings.widget_opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={settings.widget_opacity}
                  onChange={e => handleUpdate({ widget_opacity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Backdrop Blur Intensity</span>
                  <span className="text-canvas-accent">{settings.blur_intensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="2"
                  value={settings.blur_intensity}
                  onChange={e => handleUpdate({ blur_intensity: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold">Automatic Carry-Forward Policy</h2>
              <p className="text-xs text-canvas-muted mt-1">Control how unfinished tasks from previous days behave at midnight.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'auto_carry' as CarryForwardPolicy,
                  title: 'Auto Carry-Forward (Recommended)',
                  desc: 'Unfinished past tasks automatically appear in today\'s working set with clear overdue badges. Historical dates remain untouched.'
                },
                {
                  id: 'manual' as CarryForwardPolicy,
                  title: 'Manual Rescheduling Required',
                  desc: 'Incomplete tasks remain on their original scheduled dates until you explicitly click "Reschedule to Today".'
                },
                {
                  id: 'backlog' as CarryForwardPolicy,
                  title: 'Move to Backlog',
                  desc: 'Incomplete past tasks are moved out of today\'s view into the pending backlog repository.'
                }
              ].map(policy => (
                <div
                  key={policy.id}
                  onClick={() => handleUpdate({ carry_forward_policy: policy.id })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.carry_forward_policy === policy.id
                      ? 'bg-canvas-accent/15 border-canvas-accent shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{policy.title}</span>
                    <input
                      type="radio"
                      checked={settings.carry_forward_policy === policy.id}
                      onChange={() => {}}
                      className="accent-purple-500"
                    />
                  </div>
                  <p className="text-xs text-canvas-muted mt-1 leading-relaxed">{policy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'displays' && (
          <div className="max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Connected Displays</h2>
                <p className="text-xs text-canvas-muted mt-1">Multi-monitor detection and resolution scaling.</p>
              </div>
              <button
                onClick={fetchDisplays}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-canvas-muted hover:text-white"
                title="Refresh Displays"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {displays.map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-canvas-accent" />
                      <span>{d.label}</span>
                      {d.isPrimary && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-canvas-accent text-slate-950">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-canvas-muted mt-1">
                      Resolution: {d.bounds.width} × {d.bounds.height} • Scale: {d.scaleFactor}x
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold">About DayCanvas</h2>
              <p className="text-xs text-canvas-muted mt-1">System architecture and desktop capabilities diagnostic.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="text-sm font-semibold text-canvas-accent">Operating System Integration</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-canvas-muted">Platform:</span>
                  <span className="font-mono">{capabilities?.platform}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-canvas-muted">Native Layering:</span>
                  <span className={capabilities?.nativeLevelSupported ? 'text-canvas-success' : 'text-canvas-warning'}>
                    {capabilities?.nativeLevelSupported ? 'Verified Active' : 'Fallback'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-canvas-muted">Dynamic Click-Through:</span>
                  <span className={capabilities?.clickThroughSupported ? 'text-canvas-success' : 'text-canvas-warning'}>
                    {capabilities?.clickThroughSupported ? 'Active' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-canvas-muted">Multi-Space / Virtual Desktops:</span>
                  <span className={capabilities?.spacesSupported ? 'text-canvas-success' : 'text-canvas-warning'}>
                    {capabilities?.spacesSupported ? 'Active' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-canvas-subtle mt-2">{capabilities?.message}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Restore Desktop State</div>
                <div className="text-xs text-canvas-muted">Deactivate live wallpaper overlay and restore clean desktop</div>
              </div>
              <button
                onClick={deactivateDesktopMode}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
              >
                Restore Desktop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
