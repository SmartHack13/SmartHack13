import React, { useState } from 'react';
import {
  MapPin,
  Stethoscope,
  Globe,
  Calendar,
  Sparkles,
  Search,
  Crosshair,
  ChevronRight,
  Info,
  ShieldCheck,
  Radio,
  Wifi,
} from 'lucide-react';
import { SearchCriteria, AvailabilityOption } from '../types';
import { POPULAR_SPECIALTIES, AVAILABLE_LANGUAGES } from '../data/mockDoctors';

interface SearchStepFormProps {
  criteria: SearchCriteria;
  onChange: (updated: SearchCriteria) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchStepForm: React.FC<SearchStepFormProps> = ({
  criteria,
  onChange,
  onSearch,
  isLoading,
}) => {
  const [specialtyQuery, setSpecialtyQuery] = useState(criteria.specialty);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  const handleLocationChange = (val: string) => {
    onChange({ ...criteria, location: val, userLat: undefined, userLng: undefined });
  };

  const handleUseCurrentLocation = () => {
    setGeoLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLocating(false);
          onChange({
            ...criteria,
            location: 'Paris 75008 (GPS Location)',
            userLat: pos.coords.latitude,
            userLng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation blocked or unavailable, using Paris coordinate fallback:', err);
          setGeoLocating(false);
          onChange({
            ...criteria,
            location: 'Paris 75008 (Current Location)',
            userLat: 48.8724,
            userLng: 2.3117,
          });
        },
        { timeout: 4000 }
      );
    } else {
      setGeoLocating(false);
      onChange({
        ...criteria,
        location: 'Paris 75008 (Current Location)',
        userLat: 48.8724,
        userLng: 2.3117,
      });
    }
  };

  const handleLanguageToggle = (lang: string) => {
    const exists = criteria.languages.includes(lang);
    const updated = exists
      ? criteria.languages.filter((l) => l !== lang)
      : [...criteria.languages, lang];
    onChange({ ...criteria, languages: updated });
  };

  const filteredSpecialties = POPULAR_SPECIALTIES.filter((s) =>
    s.toLowerCase().includes(specialtyQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
      {/* Top Banner with Search Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              MedMatch France — Doctor Search
            </h2>
            {criteria.searchMode === 'live_grounded' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live Grounded Web Discovery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Demo Dataset
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real French healthcare verification powered by Gemini 2.5 Flash & Google Search Grounding.
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...criteria, searchMode: 'live_grounded' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              criteria.searchMode === 'live_grounded'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Grounded (Real Data)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...criteria, searchMode: 'demo' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              criteria.searchMode === 'demo'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Demo Data (Instant)</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Step 1 (Location) & Step 2 (Specialty) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1: Location */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                Where are you located?
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                <Crosshair className="w-3 h-3" />
                <span>{geoLocating ? 'Locating...' : 'Use my current location'}</span>
              </button>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={criteria.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="City, Postcode or Address in France (e.g. Paris 75008, Lyon 69002, Bordeaux)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="font-medium text-slate-400">Quick cities:</span>
              {['Paris 75008', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nice', 'Strasbourg'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleLocationChange(city)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Specialty */}
          <div className="space-y-1.5 relative">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
              Medical Specialty
            </label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={specialtyQuery}
                onFocus={() => setShowSpecialtyDropdown(true)}
                onChange={(e) => {
                  setSpecialtyQuery(e.target.value);
                  onChange({ ...criteria, specialty: e.target.value });
                  setShowSpecialtyDropdown(true);
                }}
                placeholder="Search or type specialty (e.g. Dermatologist, GP, Cardiologist...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition font-medium"
              />
            </div>

            {showSpecialtyDropdown && (
              <div
                className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-1"
                onMouseLeave={() => setShowSpecialtyDropdown(false)}
              >
                {filteredSpecialties.length > 0 ? (
                  filteredSpecialties.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        setSpecialtyQuery(spec);
                        onChange({ ...criteria, specialty: spec });
                        setShowSpecialtyDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                    >
                      {spec}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...criteria, specialty: specialtyQuery });
                      setShowSpecialtyDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Use &ldquo;{specialtyQuery}&rdquo; as custom specialty
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Step 3 (Languages) & Step 4 (Availability Preference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Step 3: Languages */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
              Languages Spoken (Multiple allowed)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = criteria.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Appointment Preference */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</span>
              When would you like to see the doctor?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'within_3_days', label: 'Within 3 days' },
                { id: 'within_7_days', label: 'Within 7 days' },
                { id: 'within_2_weeks', label: 'Within 2 weeks' },
                { id: 'any', label: 'No preference' },
              ].map((opt) => {
                const isSelected = criteria.availabilityPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...criteria,
                        availabilityPreference: opt.id as AvailabilityOption,
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 5: Natural Language Priority Box */}
        <div className="pt-2">
          <div className="space-y-2 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">5</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Tell us what matters most to you (AI Priority Interpreter)</span>
              </label>
              <span className="text-[11px] font-medium text-blue-700 hidden sm:inline-block">
                Powered by Gemini 2.5 Flash
              </span>
            </div>

            <textarea
              rows={2}
              value={criteria.naturalLanguagePriority}
              onChange={(e) =>
                onChange({ ...criteria, naturalLanguagePriority: e.target.value })
              }
              placeholder="e.g. &ldquo;I need an English speaking dermatologist in Paris as soon as possible. I can travel up to 30 minutes.&rdquo;"
              className="w-full p-3 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 placeholder-slate-400 transition"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                Tip: Specify your target city, language fluency, and max travel time.
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...criteria,
                    naturalLanguagePriority:
                      'I need an English speaking dermatologist as soon as possible. I can travel up to 30 minutes and prefer a doctor close to me.',
                  })
                }
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Insert sample prompt
              </button>
            </div>
          </div>
        </div>

        {/* Search CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {criteria.searchMode === 'live_grounded'
                ? 'Queries live French healthcare directories & Google Search Grounding for real doctors.'
                : 'Using curated instant French doctor dataset for prototype exploration.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onSearch}
            disabled={isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition transform active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed ${
              criteria.searchMode === 'live_grounded'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 shadow-blue-600/30'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {criteria.searchMode === 'live_grounded'
                    ? 'Searching real French healthcare directories with Google Search Grounding...'
                    : 'Finding doctors that best match your preferences...'}
                </span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>
                  {criteria.searchMode === 'live_grounded'
                    ? 'Search Real Doctors (Live Grounded)'
                    : 'Find my best doctor matches'}
                </span>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
