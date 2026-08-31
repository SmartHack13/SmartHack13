import React from 'react';
import { Activity, ShieldCheck, Sparkles, FileCode, Save, Bookmark } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onTryDemo: () => void;
  onOpenContext: () => void;
  onOpenSaveModal: () => void;
  bookmarkedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onTryDemo,
  onOpenContext,
  onOpenSaveModal,
  bookmarkedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  MedMatch <span className="text-blue-600">France</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Grounded AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Preference-driven healthcare discovery for France
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Save & Reuse Action */}
            <button
              onClick={onOpenSaveModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              title="Save project state, download JSON snapshot, or export code to run locally"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Reuse</span>
              {bookmarkedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-800 text-[10px] font-black flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenContext}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-slate-100 hover:bg-slate-800 transition border border-slate-700 shadow-xs"
              title="View or export complete PROJECT_CONTEXT.md specification file"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Specs (.md)</span>
            </button>

            <button
              onClick={onTryDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 shadow-sm"
              title="Loads: Paris 75008, Dermatologist, English, Earliest"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Try example</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Validated</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
