import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReportData, ReportType } from '../types';
import { Loader2, ExternalLink, Share2, Copy } from 'lucide-react';

interface ReportCardProps {
  report: ReportData;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const isMorning = report.type === ReportType.MORNING;

  const handleCopy = () => {
    navigator.clipboard.writeText(report.content);
    alert('Report copied to clipboard!');
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[75vh]">
      {/* Header */}
      <div className={`px-5 py-4 border-b ${isMorning ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' : 'border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-transparent'} flex justify-between items-center sticky top-0 bg-slate-800/95 backdrop-blur z-10`}>
        <div>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isMorning ? 'text-amber-400' : 'text-indigo-400'}`}>
            {isMorning ? '☀️ 美股早報' : '🌙 市場晚報'}
          </h3>
          <p className="text-slate-400 text-xs font-mono mt-0.5 opacity-80">
            {new Date(report.timestamp).toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
          </p>
        </div>
        
        {report.status === 'completed' && (
          <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white bg-slate-700/50 rounded-full active:scale-95 transition-all">
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto overscroll-contain flex-grow">
        {report.status === 'generating' ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className={`absolute inset-0 blur-lg opacity-50 ${isMorning ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              <div className="relative bg-slate-900 rounded-full p-4">
                <Loader2 className={`w-8 h-8 animate-spin ${isMorning ? 'text-amber-400' : 'text-indigo-400'}`} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-200 font-medium">AI 正在分析市場數據...</p>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">搜尋即時新聞、整理股價表現、生成摘要中</p>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-white prose-table:text-xs prose-th:text-slate-400 prose-td:text-slate-300 prose-a:text-indigo-400">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer / Sources */}
      {report.groundingUrls.length > 0 && (
        <div className="px-5 py-4 bg-slate-900/80 border-t border-slate-700 backdrop-blur-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">參考來源</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {report.groundingUrls.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 active:bg-indigo-500/20 transition-colors max-w-[200px] truncate"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};