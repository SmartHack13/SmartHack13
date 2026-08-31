import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Globe,
  Star,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Award,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { DoctorMatchResult } from '../types';

interface DoctorDetailModalProps {
  result: DoctorMatchResult | null;
  onClose: () => void;
  onOpenBooking: (result: DoctorMatchResult) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  result,
  onClose,
  onOpenBooking,
}) => {
  if (!result) return null;
  const { doctor } = result;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-18 h-18 rounded-2xl object-cover border-2 border-white/80 shadow-md bg-slate-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-extrabold uppercase">
                  Rank #{result.rank}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-mono font-bold">
                  {result.matchScore}% Match
                </span>
                {doctor.isLiveGrounded && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Live Grounded
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mt-1">{doctor.name}</h2>
              <p className="text-sm text-blue-100">{doctor.specialty} • RPPS: {doctor.rppsNumber || 'Verified'}</p>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Why Matched explanation card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-blue-600" />
              Why this doctor matches your criteria:
            </h4>
            <p className="text-blue-800 text-xs leading-relaxed">
              {result.whyRankOneReason || `High suitability match: ${result.whyMatched}.`}
            </p>
          </div>

          {/* Live Grounding Citations */}
          {doctor.groundingSources && doctor.groundingSources.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Verified Live Web Sources & Grounding:
              </h4>
              <div className="space-y-1.5">
                {doctor.groundingSources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-emerald-800 hover:text-emerald-950 underline text-[11px] truncate"
                  >
                    <span className="truncate">{s.title || s.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sub-expertise & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                Languages Spoken:
              </span>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Sub-Specialties & Expertise:
              </span>
              <div className="flex flex-wrap gap-1">
                {doctor.subSpecialties.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Transit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{doctor.address}</p>
                <p className="text-slate-500">
                  {doctor.postalCode} {doctor.city} • {doctor.metroOrBus}
                </p>
                <p className="text-blue-600 font-medium mt-0.5">
                  Distance: {result.distanceKm} km (~{result.estimatedTravelTimeMinutes} mins estimated transit)
                </p>
              </div>
            </div>
          </div>

          {/* French Healthcare Sector & Tariff */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Convention Sector</span>
              <span className="font-bold text-slate-800 block mt-0.5">{doctor.sector}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Consultation Fee</span>
              <span className="font-bold text-slate-800 block mt-0.5">{doctor.consultationFee.toFixed(2)} €</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Carte Vitale</span>
              <span className="font-bold text-emerald-600 block mt-0.5">
                {doctor.carteVitaleAccepted ? '✓ Accepted' : 'Not accepted'}
              </span>
            </div>
          </div>

          {/* Doctor Bio */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              About the Practitioner
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {doctor.bio}
            </p>
          </div>

          {/* Earliest appointment highlight */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>
                Earliest available slot: <strong>{doctor.earliestSlot.display}</strong> ({doctor.availableSlotsCountThisWeek} available this week)
              </span>
            </div>
          </div>
        </div>

        {/* Modal footer CTAs */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBooking(result);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <span>Book / View Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
