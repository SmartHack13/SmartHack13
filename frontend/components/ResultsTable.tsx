import React from 'react';
import {
  Star,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Globe,
  Info,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { DoctorMatchResult } from '../types';

interface ResultsTableProps {
  results: DoctorMatchResult[];
  selectedDoctorId?: string;
  onSelectDoctor: (doctorId: string) => void;
  onOpenDetails: (result: DoctorMatchResult) => void;
  onOpenBooking: (result: DoctorMatchResult) => void;
  bookmarkedDoctorIds?: string[];
  onToggleBookmark?: (doctorId: string) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  selectedDoctorId,
  onSelectDoctor,
  onOpenDetails,
  onOpenBooking,
  bookmarkedDoctorIds = [],
  onToggleBookmark,
}) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No matching doctors found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Try loosening your filter constraints (e.g. increase travel time or select &ldquo;All Languages&rdquo;).
        </p>
      </div>
    );
  }

  const topResult = results[0];

  return (
    <div className="space-y-4">
      {/* "Why this doctor ranked #1" prominent card */}
      {topResult && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-amber-500 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
                #1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Why {topResult.doctor.name} ranked #1
              </h3>
              {topResult.doctor.isLiveGrounded && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Grounded
                </span>
              )}
            </div>
            <span className="text-xs font-extrabold text-amber-800">
              {topResult.matchScore}% Match Score
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1.5 pl-8 leading-relaxed">
            {topResult.whyRankOneReason ||
              `Ranked #1 because this doctor meets your primary language (${topResult.doctor.languages.join('/')}), earliest availability (${topResult.doctor.earliestSlot.display}), and is within ${topResult.estimatedTravelTimeMinutes} mins travel time.`}
          </p>
        </div>
      )}

      {/* Desktop / Tablet Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 pl-4 pr-2">Rank</th>
                <th className="py-3.5 px-3">Doctor</th>
                <th className="py-3.5 px-3">Specialty & Languages</th>
                <th className="py-3.5 px-3">Location & Travel</th>
                <th className="py-3.5 px-3">Earliest Appointment</th>
                <th className="py-3.5 px-3">Match Score</th>
                <th className="py-3.5 px-3">Why This Doctor</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => {
                const isSelected = r.doctor.id === selectedDoctorId;
                const isBookmarked = bookmarkedDoctorIds.includes(r.doctor.id);

                return (
                  <tr
                    key={r.doctor.id}
                    onClick={() => onSelectDoctor(r.doctor.id)}
                    className={`cursor-pointer transition hover:bg-blue-50/60 ${
                      isSelected ? 'bg-blue-50/90 ring-1 ring-blue-500/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 pl-4 pr-2 font-extrabold text-slate-800">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          r.rank === 1
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : r.rank <= 3
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{r.rank}
                      </span>
                    </td>

                    {/* Doctor Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.doctor.avatarUrl}
                          alt={r.doctor.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 block hover:text-blue-600">
                              {r.doctor.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>{r.doctor.sector}</span>
                            {r.doctor.isLiveGrounded && (
                              <span className="text-emerald-600 font-bold text-[10px]">
                                • Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specialty & Languages */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 block">
                        {r.doctor.specialty}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.doctor.languages.map((l) => (
                          <span
                            key={l}
                            className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Location & Travel */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-700 block truncate max-w-[150px]">
                        {r.doctor.postalCode} {r.doctor.city}
                      </span>
                      <span className="text-[11px] text-blue-600 font-semibold block">
                        {r.distanceKm} km (~{r.estimatedTravelTimeMinutes}m)
                      </span>
                    </td>

                    {/* Earliest appointment */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{r.doctor.earliestSlot.display}</span>
                      </span>
                    </td>

                    {/* Match score with mini bar */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {r.matchScore}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.matchScore >= 90
                                ? 'bg-emerald-500'
                                : r.matchScore >= 75
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${r.matchScore}%` }}
                          />
                        </div>
                      </div>
                      {/* Dynamic Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.badges.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Why this doctor matches */}
                    <td className="py-3.5 px-3 text-slate-600 text-[11px] max-w-[180px] leading-tight">
                      {r.whyMatched}
                    </td>

                    {/* Actions & Bookmarks */}
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onToggleBookmark && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(r.doctor.id);
                            }}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark doctor'}
                            className={`p-1.5 rounded-lg transition ${
                              isBookmarked
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                          >
                            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(r);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenBooking(r);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Book
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {results.map((r) => {
          const isSelected = r.doctor.id === selectedDoctorId;
          const isBookmarked = bookmarkedDoctorIds.includes(r.doctor.id);

          return (
            <div
              key={r.doctor.id}
              onClick={() => onSelectDoctor(r.doctor.id)}
              className={`bg-white rounded-2xl p-4 shadow-sm border transition ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                      r.rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    #{r.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{r.doctor.name}</h4>
                    <p className="text-xs text-slate-500">{r.doctor.specialty} • {r.doctor.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleBookmark && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(r.doctor.id);
                      }}
                      className={`p-1.5 rounded-lg ${
                        isBookmarked ? 'bg-amber-100 text-amber-800' : 'text-slate-400'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  )}
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600">{r.matchScore}%</span>
                    <span className="text-[10px] text-slate-400 block">Match</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Earliest Appointment:</span>
                  <span className="font-bold text-emerald-700">{r.doctor.earliestSlot.display}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Distance / Travel:</span>
                  <span className="font-semibold text-slate-700">
                    {r.distanceKm} km (~{r.estimatedTravelTimeMinutes}m)
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                &ldquo;{r.whyMatched}&rdquo;
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(r);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBooking(r);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
