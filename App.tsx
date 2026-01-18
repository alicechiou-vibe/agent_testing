import React, { useState, useEffect, useCallback } from 'react';
import { generateMarketReport } from './services/geminiService';
import { ReportCard } from './components/ReportCard';
import { ReportData, ReportType } from './types';
import { Zap, RefreshCcw, Sun, Moon, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentType, setCurrentType] = useState<ReportType>(ReportType.MORNING);
  const [report, setReport] = useState<ReportData | null>(null);
  
  // Initialize context based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    // 05:00 - 14:00 (5 AM - 2 PM) -> Morning Briefing (Yesterday's recap)
    // 14:00 - 05:00 (2 PM - 5 AM) -> Evening Briefing (Today's news)
    const type = (hour >= 5 && hour < 14) ? ReportType.MORNING : ReportType.EVENING;
    setCurrentType(type);
    loadSavedReport(type);
  }, []);

  const getStorageKey = (type: ReportType) => {
    const today = new Date().toDateString();
    return `marketflow-${today}-${type}`;
  };

  const loadSavedReport = (type: ReportType) => {
    const key = getStorageKey(type);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setReport(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(key);
      }
    } else {
      setReport(null);
    }
  };

  const handleGenerate = async (forceType?: ReportType) => {
    const typeToRun = forceType || currentType;
    
    // Create skeleton
    const newReport: ReportData = {
      id: Date.now().toString(),
      type: typeToRun,
      dateStr: new Date().toDateString(),
      timestamp: Date.now(),
      content: "",
      groundingUrls: [],
      status: 'generating'
    };
    
    setReport(newReport);
    setCurrentType(typeToRun);

    try {
      const result = await generateMarketReport(typeToRun);
      const completedReport: ReportData = {
        ...newReport,
        content: result.content,
        groundingUrls: result.urls,
        status: 'completed'
      };
      setReport(completedReport);
      
      // Save to local storage so user doesn't lose it on refresh
      localStorage.setItem(getStorageKey(typeToRun), JSON.stringify(completedReport));
      
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "生成失敗，請檢查網路或稍後再試。";
      setReport(prev => prev ? { ...prev, status: 'failed', content: msg } : null);
    }
  };

  // Switch context manually
  const toggleContext = () => {
    const newType = currentType === ReportType.MORNING ? ReportType.EVENING : ReportType.MORNING;
    setCurrentType(newType);
    loadSavedReport(newType);
  };

  const isMorning = currentType === ReportType.MORNING;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
      {/* Mobile Top Bar */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${isMorning ? 'from-amber-400 to-orange-500' : 'from-indigo-400 to-purple-600'} shadow-lg`}>
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">MarketFlow</span>
        </div>
        
        <button 
          onClick={toggleContext}
          className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors active:scale-95"
          aria-label="Switch Mode"
        >
          {isMorning ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </header>

      <main className="px-4 max-w-md mx-auto w-full">
        
        {/* Welcome / Context Header */}
        <div className="mb-6 mt-2">
          <h1 className="text-3xl font-bold text-white mb-1">
            {isMorning ? '早安，投資人' : '晚安，投資人'}
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            {isMorning 
              ? <span>這裡是您昨天的 <span className="text-amber-400 font-medium">七巨頭報告</span></span>
              : <span>為您整理今天的 <span className="text-indigo-400 font-medium">市場重點新聞</span></span>
            }
          </p>
        </div>

        {/* Action Area */}
        {!report ? (
          <div className="mt-12 text-center animate-slide-up">
             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 relative group cursor-pointer" onClick={() => handleGenerate()}>
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${isMorning ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                <Sparkles className={`w-10 h-10 ${isMorning ? 'text-amber-400' : 'text-indigo-400'}`} />
             </div>
             <p className="text-slate-400 text-sm mb-8">
               {isMorning ? "尚未生成今日早報" : "尚未生成今日晚報"}
             </p>
             <button
              onClick={() => handleGenerate()}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isMorning 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {isMorning ? '生成早報分析' : '分析今日市場'}
            </button>
          </div>
        ) : (
          <>
            <ReportCard report={report} />
            
            <button
              onClick={() => handleGenerate()}
              className="mt-6 w-full py-3 rounded-xl border border-slate-700 text-slate-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
            >
              <RefreshCcw className="w-4 h-4" />
              重新生成分析
            </button>
          </>
        )}

      </main>
    </div>
  );
};

export default App;
