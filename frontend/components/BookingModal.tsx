import React, { useState } from 'react';
import { X, Calendar, CheckCircle, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { DoctorMatchResult } from '../types';

interface BookingModalProps {
  result: DoctorMatchResult | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ result, onClose }) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!result) return null;
  const { doctor } = result;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Book Appointment (Prototype)</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-12 h-12 rounded-xl object-cover bg-slate-100"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-900">{doctor.name}</h4>
              <p className="text-xs text-slate-500">{doctor.specialty} • {doctor.city}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This is a demonstration prototype. In production, this connects via authorized French healthcare scheduling APIs (e.g., Doctolib, Maiia, Qare).
            </p>
          </div>

          {confirmed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-sm">
                Mock Booking Confirmed!
              </h4>
              <p className="text-xs text-emerald-800">
                Simulated slot booked for <strong>{doctor.earliestSlot.display}</strong> with {doctor.name}.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1">Selected Earliest Slot:</span>
                <span className="font-bold text-slate-900 text-sm">{doctor.earliestSlot.display}</span>
                <span className="text-slate-500 block mt-1">Consultation Fee: {doctor.consultationFee.toFixed(2)} € ({doctor.sector})</span>
              </div>

              <button
                onClick={() => setConfirmed(true)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                Confirm Mock Booking
              </button>

              <a
                href={doctor.mockBookingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition"
              >
                <span>Open Provider Website Simulator</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
