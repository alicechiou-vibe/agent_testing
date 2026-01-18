import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateMarketReport } from './services/geminiService';
import { ReportCard } from './components/ReportCard';
import { ConfigPanel } from './components/ConfigPanel';
import { Clock } from './components/Clock';
import { ReportConfig, ReportData, ReportType, LogEntry } from './types';
import { LayoutDashboard, History, Zap, Play } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [config, setConfig] = useState<ReportConfig>({
    morningTime: "08:00",
    eveningTime: "22:00",
    email: "",
    isActive: false,
  });

  const [reports, setReports] = useState<ReportData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // To prevent double firing in the same minute
  const lastRunMorning = useRef<string | null>(null);
  const lastRunEvening = useRef<string | null>(null);

  // --- Helpers ---
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Date.now().toString(), timestamp: Date.now(), message, type }, ...prev]);
  };

  const createReportEntry = (type: ReportType): string => {
    const id = Date.now().toString();
    const newReport: ReportData = {
      id,
      type,
      timestamp: Date.now(),
      content: "",
      groundingUrls: [],
      status: 'generating'
    };
    setReports(prev => [newReport, ...prev]);
    return id;
  };

  const updateReport = (id: string, updates: Partial<ReportData>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const executeTask = useCallback(async (type: ReportType, manual: boolean = false) => {
    addLog(`Starting ${type} report generation...`, 'info');
    const reportId = createReportEntry(type);

    try {
      const result = await generateMarketReport(type);
      
      updateReport(reportId, {
        content: result.content,
        groundingUrls: result.urls,
        status: 'sent' // Simulating email sent immediately
      });

      addLog(`${type} report generated successfully.`, 'success');
      
      // Simulate Email Sending Action
      if (config.email) {
        addLog(`(Simulation) Email sent to ${config.email}`, 'info');
        // In a real browser app without backend, we can trigger mailto, but that's intrusive for automation.
        // We'll just show the visual confirmation.
      } else if (!manual) {
        addLog(`No email configured, skipping delivery.`, 'error');
      }

    } catch (error) {
      updateReport(reportId, { status: 'failed', content: "Failed to generate report. Please check API Key configuration." });
      addLog(`Failed to generate ${type} report.`, 'error');
    }
  }, [config.email]);

  // --- Automation Loop ---
  useEffect(() => {
    if (!config.isActive) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentHm = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = now.toDateString(); // "Mon Jan 01 2024"

      // Morning Check
      if (currentHm === config.morningTime && lastRunMorning.current !== dateStr) {
        lastRunMorning.current = dateStr;
        executeTask(ReportType.MORNING);
      }

      // Evening Check
      if (currentHm === config.eveningTime && lastRunEvening.current !== dateStr) {
        lastRunEvening.current = dateStr;
        executeTask(ReportType.EVENING);
      }
    };

    const interval = setInterval(checkSchedule, 1000); // Check every second to catch the minute transition accurately
    return () => clearInterval(interval);
  }, [config.isActive, config.morningTime, config.eveningTime, executeTask]);

  // --- UI ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                MarketFlow AI
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Run Logs
              </button>
            </div>

            <Clock />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Config & Controls */}
            <div className="lg:col-span-1 space-y-6">
              <ConfigPanel config={config} onUpdate={setConfig} />

              {/* Manual Triggers */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Manual Override</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => executeTask(ReportType.MORNING, true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-amber-500" />
                      Run Morning Briefing
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Mag 7 Review</span>
                  </button>
                  
                  <button 
                    onClick={() => executeTask(ReportType.EVENING, true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-500" />
                      Run Evening Briefing
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">News & Trends</span>
                  </button>
                </div>
              </div>

               {/* Log Preview */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-3 h-3" /> Recent Activity
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {logs.length === 0 && <p className="text-xs text-slate-600 italic">No activity recorded yet.</p>}
                  {logs.map(log => (
                    <div key={log.id} className="text-xs flex gap-2">
                      <span className="text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </span>
                      <span className={`${
                        log.type === 'success' ? 'text-emerald-400' : 
                        log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Reports Feed */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                Live Reports Feed
              </h2>
              
              <div className="space-y-6">
                {reports.length === 0 ? (
                  <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
                    <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">System Ready</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                      Waiting for scheduled time ({config.morningTime} or {config.eveningTime}) or manual trigger. 
                      Ensure this tab remains open for automation to occur.
                    </p>
                  </div>
                ) : (
                  reports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
           <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
               <h2 className="text-lg font-semibold text-slate-100">System Logs</h2>
             </div>
             <div className="p-0">
               <table className="w-full text-left text-sm text-slate-400">
                 <thead className="bg-slate-900/50 uppercase tracking-wider text-xs font-semibold text-slate-500">
                   <tr>
                     <th className="px-6 py-3">Timestamp</th>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Message</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700">
                   {logs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                       <td className="px-6 py-3 font-mono text-slate-500">
                         {new Date(log.timestamp).toLocaleString()}
                       </td>
                       <td className="px-6 py-3">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                           log.type === 'success' ? 'bg-emerald-400/10 text-emerald-400' :
                           log.type === 'error' ? 'bg-rose-400/10 text-rose-400' :
                           'bg-blue-400/10 text-blue-400'
                         }`}>
                           {log.type.toUpperCase()}
                         </span>
                       </td>
                       <td className="px-6 py-3 text-slate-300">{log.message}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {logs.length === 0 && (
                 <div className="p-8 text-center text-slate-500">No logs available.</div>
               )}
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;