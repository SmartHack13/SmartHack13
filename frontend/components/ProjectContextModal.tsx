import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, Terminal, Layers, ShieldCheck, Database } from 'lucide-react';

interface ProjectContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

export const ProjectContextModal: React.FC<ProjectContextModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MedMatch_France_PROJECT_CONTEXT.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  MedMatch France — Project Context & Tech Specs
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30">
                  PROJECT_CONTEXT.md
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete architecture, data models, ranking formulas, Gemini schemas & backend guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Markdown' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .md</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="bg-slate-900/90 px-6 py-2.5 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>React 18 + TS + Gemini</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Search Grounding</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic Scoring</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>PostGIS Ready Schema</span>
          </div>
        </div>

        {/* Markdown Viewer */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/60 leading-relaxed select-text space-y-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-slate-300 bg-black/40 p-5 rounded-2xl border border-slate-800">
            {markdownContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ready to be used with any AI agent, coding assistant, or backend framework.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
