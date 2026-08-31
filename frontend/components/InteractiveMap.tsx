import React from 'react';
import { MapPin, Navigation, Clock, Star, ExternalLink, Shield } from 'lucide-react';
import { DoctorMatchResult } from '../types';

interface InteractiveMapProps {
  results: DoctorMatchResult[];
  selectedDoctorId?: string;
  onSelectDoctor: (doctorId: string) => void;
  userLocationLabel: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  results,
  selectedDoctorId,
  onSelectDoctor,
  userLocationLabel,
}) => {
  // Center bounds calculation
  const selectedResult = results.find((r) => r.doctor.id === selectedDoctorId) || results[0];

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl flex flex-col h-[480px]">
      {/* Map Header / Google Maps integration bar */}
      <div className="bg-slate-950/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-200">
            Map View • {results.length} Doctors Located
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">Google Maps / Places Routing Ready</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            {userLocationLabel}
          </span>
        </div>
      </div>

      {/* Map Canvas with realistic map styling */}
      <div className="relative flex-1 bg-[#1a2332] overflow-hidden select-none">
        {/* Stylized Street Grid Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
              />
              <circle cx="30" cy="30" r="1.5" fill="#475569" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Seine / River curve */}
          <path
            d="M -50 250 Q 200 180, 450 320 T 900 240"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d="M -50 250 Q 200 180, 450 320 T 900 240"
            fill="none"
            stroke="#2563eb"
            strokeWidth="18"
            strokeOpacity="0.4"
          />
        </svg>

        {/* User Location Origin Pin (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center animate-pulse">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-md shadow-blue-500" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-blue-300 text-[10px] font-bold border border-blue-500/40 backdrop-blur-xs whitespace-nowrap">
            You ({userLocationLabel})
          </span>
        </div>

        {/* Doctor Markers distributed organically around center */}
        {results.slice(0, 15).map((res, index) => {
          const isSelected = res.doctor.id === selectedDoctorId;
          // Deterministic offset based on rank & coordinates
          const angle = (index * (360 / Math.min(12, results.length))) * (Math.PI / 180);
          const radius = Math.min(180, 45 + res.distanceKm * 18);
          const xOffset = Math.cos(angle) * radius;
          const yOffset = Math.sin(angle) * (radius * 0.7);

          return (
            <div
              key={res.doctor.id}
              onClick={() => onSelectDoctor(res.doctor.id)}
              className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              style={{
                left: `calc(50% + ${xOffset}px)`,
                top: `calc(50% + ${yOffset}px)`,
              }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border transition ${
                  isSelected
                    ? 'bg-blue-600 text-white border-white ring-4 ring-blue-500/40 shadow-blue-500/50'
                    : res.rank === 1
                    ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-300'
                    : 'bg-slate-800/90 text-slate-200 border-slate-600 hover:bg-slate-700'
                }`}
              >
                <span className="text-[11px] font-bold">#{res.rank}</span>
                <span className="text-[10px] font-semibold truncate max-w-[80px]">
                  {res.doctor.name.replace('Dr. ', '')}
                </span>
                <span className="text-[9px] px-1 rounded bg-black/30 font-mono">
                  {res.matchScore}%
                </span>
              </div>
            </div>
          );
        })}

        {/* Selected Doctor Preview Floating Card in Map */}
        {selectedResult && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-30 bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-700 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                    Rank #{selectedResult.rank}
                  </span>
                  <span className="text-xs font-bold text-slate-100">
                    {selectedResult.doctor.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedResult.doctor.specialty} • {selectedResult.doctor.address}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-emerald-400">
                  {selectedResult.matchScore}%
                </span>
                <span className="text-[10px] text-slate-400 block">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedResult.doctor.earliestSlot.display}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {selectedResult.distanceKm} km (~{selectedResult.estimatedTravelTimeMinutes}m)
                </span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-blue-300 bg-blue-950/60 p-1.5 rounded border border-blue-900/60 leading-tight">
              &ldquo;{selectedResult.whyMatched}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Rank #1</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Selected Marker</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
            <span>Other Matches</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          Click any marker or doctor row to highlight
        </span>
      </div>
    </div>
  );
};
