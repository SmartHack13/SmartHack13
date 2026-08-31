import React from 'react';
import { ShieldCheck, ExternalLink, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';
import { GroundingSource } from '../types';

interface GroundingSourcesViewProps {
  sources: GroundingSource[];
  searchMode: 'live_grounded' | 'demo';
  queryLocation: string;
  querySpecialty: string;
}

export const GroundingSourcesView: React.FC<GroundingSourcesViewProps> = ({
  sources,
  searchMode,
  queryLocation,
  querySpecialty,
}) => {
  if (searchMode !== 'live_grounded' || sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Live Grounded Search Validation
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Practitioners & availability ground-checked in real time for &ldquo;{querySpecialty}&rdquo; in {queryLocation}.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          {sources.length} Live Citations Extracted
        </span>
      </div>

      {/* Citations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {sources.map((src, index) => (
          <a
            key={index}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-xs transition group"
          >
            <div className="flex items-start gap-2 overflow-hidden">
              <Globe2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                  {src.title || 'Verified Healthcare Directory'}
                </p>
                <p className="text-[10px] text-slate-400 group-hover:text-emerald-700 truncate font-mono">
                  {src.url.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
