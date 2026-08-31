import React, { useState } from 'react';
import { Sparkles, Sliders, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { InterpretedPreferences } from '../types';

interface AiPreferenceCardProps {
  preferences: InterpretedPreferences;
  onUpdateWeights: (newWeights: InterpretedPreferences['weights']) => void;
  isLoading?: boolean;
}

export const AiPreferenceCard: React.FC<AiPreferenceCardProps> = ({
  preferences,
  onUpdateWeights,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localWeights, setLocalWeights] = useState(preferences.weights);

  const handleSliderChange = (key: keyof InterpretedPreferences['weights'], value: number) => {
    const updated = { ...localWeights, [key]: value / 100 };
    setLocalWeights(updated);
    onUpdateWeights(updated);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-300">
              AI Preference Interpretation
            </h3>
            <p className="text-xs text-slate-300">
              {preferences.summary || 'Priorities calibrated from your search & note'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 transition border border-white/10"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isExpanded ? 'Hide Weightings' : 'Fine-Tune Weights'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Badges of interpreted priorities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
          <span className="text-[11px] text-indigo-200 block">Availability</span>
          <span className="text-xs font-bold text-emerald-400 uppercase">
            {preferences.availability_priority}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">
            ({Math.round(preferences.weights.availability * 100)}%)
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
          <span className="text-[11px] text-indigo-200 block">Languages</span>
          <span className="text-xs font-bold text-sky-300">
            {preferences.languages.join(', ') || 'Any'}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">
            ({Math.round(preferences.weights.language * 100)}%)
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
          <span className="text-[11px] text-indigo-200 block">Max Travel Time</span>
          <span className="text-xs font-bold text-amber-300">
            ~{preferences.maximum_travel_time_minutes} mins
          </span>
          <span className="text-[10px] text-slate-400 ml-1">
            ({Math.round(preferences.weights.distance * 100)}%)
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
          <span className="text-[11px] text-indigo-200 block">Specialty Match</span>
          <span className="text-xs font-bold text-indigo-300 truncate block">
            {preferences.specialty}
          </span>
          <span className="text-[10px] text-slate-400">
            ({Math.round(preferences.weights.specialty * 100)}%)
          </span>
        </div>
      </div>

      {/* Expandable slider controls for full transparency */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 bg-black/20 p-4 rounded-xl">
          <p className="text-xs font-medium text-slate-300 mb-2">
            Adjust the transparent weights MedMatch uses to calculate match scores:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Appointment Speed (Availability)</span>
                <span className="font-bold text-emerald-400">{Math.round(localWeights.availability * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={Math.round(localWeights.availability * 100)}
                onChange={(e) => handleSliderChange('availability', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Specialty / Expertise Match</span>
                <span className="font-bold text-indigo-300">{Math.round(localWeights.specialty * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={Math.round(localWeights.specialty * 100)}
                onChange={(e) => handleSliderChange('specialty', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Language Alignment</span>
                <span className="font-bold text-sky-400">{Math.round(localWeights.language * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={Math.round(localWeights.language * 100)}
                onChange={(e) => handleSliderChange('language', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Proximity / Short Travel Time</span>
                <span className="font-bold text-amber-400">{Math.round(localWeights.distance * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(localWeights.distance * 100)}
                onChange={(e) => handleSliderChange('distance', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
