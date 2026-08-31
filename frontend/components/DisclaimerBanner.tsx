import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Prototype and Privacy Notice" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-tight text-slate-300">
            <span className="font-semibold text-white">Prototype Only:</span> Doctor availability, profiles, ratings and booking links are illustrative demo data. MedMatch does not claim to identify the medically &ldquo;best&rdquo; doctor, but the best match for your stated preferences.
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 shrink-0 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>No medical history or sensitive diagnosis is requested or stored.</span>
        </div>
      </div>
    </aside>
  );
};
