import React from 'react';
import { ReportConfig } from '../types';
import { Settings, Save, Power } from 'lucide-react';

interface ConfigPanelProps {
  config: ReportConfig;
  onUpdate: (newConfig: ReportConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onUpdate }) => {
  const handleChange = (key: keyof ReportConfig, value: string | boolean) => {
    onUpdate({ ...config, [key]: value });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
          <Settings className="w-5 h-5 text-indigo-400" />
          Automation Settings
        </h2>
        <button
          onClick={() => handleChange('isActive', !config.isActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            config.isActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
              : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          <Power className="w-4 h-4" />
          {config.isActive ? 'System Active' : 'System Paused'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Morning Briefing (8:00 AM)</label>
          <input
            type="time"
            value={config.morningTime}
            onChange={(e) => handleChange('morningTime', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Magnificent 7 Performance Review</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Evening Briefing (10:00 PM)</label>
          <input
            type="time"
            value={config.eveningTime}
            onChange={(e) => handleChange('eveningTime', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Market News & Trend Forecast</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Delivery Email</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@gmail.com"
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">Recipient for reports</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
        <strong>Note:</strong> Since this app runs in your browser, this tab must remain open to trigger the scheduled automation.
      </div>
    </div>
  );
};