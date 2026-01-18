import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReportData, ReportType } from '../types';
import { Mail, Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportCardProps {
  report: ReportData;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const isMorning = report.type === ReportType.MORNING;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isMorning ? 'border-amber-500/30 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/10'} flex justify-between items-center`}>
        <div>
          <h3 className={`font-bold text-lg ${isMorning ? 'text-amber-400' : 'text-blue-400'}`}>
            {isMorning ? '☀️ Morning Briefing' : '🌙 Evening Intelligence'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'generating' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full border border-indigo-400/20">
              <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
            </span>
          )}
          {report.status === 'sent' && (
             <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
             <CheckCircle className="w-3 h-3" /> Emailed
           </span>
          )}
          {report.status === 'failed' && (
             <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full border border-rose-400/20">
             <AlertCircle className="w-3 h-3" /> Failed
           </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow overflow-y-auto max-h-[500px] scroll-smooth">
        {report.status === 'generating' ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-4 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm animate-pulse">Consulting Gemini Market Models...</p>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-200 prose-p:text-slate-300 prose-a:text-indigo-400">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer / Sources */}
      {report.groundingUrls.length > 0 && (
        <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources & References</p>
          <div className="flex flex-wrap gap-2">
            {report.groundingUrls.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline bg-indigo-500/10 px-2 py-1 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};