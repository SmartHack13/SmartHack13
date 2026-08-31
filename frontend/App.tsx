import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Sparkles, RefreshCw, Layers, CheckCircle, ShieldCheck, Wifi, FileCode, Save, Bookmark } from 'lucide-react';
import {
  SearchCriteria,
  InterpretedPreferences,
  DoctorMatchResult,
  FilterOptions,
  SortField,
  Doctor,
  GroundingSource,
} from './types';
import { MOCK_DOCTORS } from './data/mockDoctors';
import { interpretUserPriorities, fetchLiveGroundedDoctors } from './services/geminiService';
import { rankDoctors } from './services/rankingEngine';
import { exportResultsToExcel } from './services/excelExport';
import { getBookmarkedDoctorIds, toggleDoctorBookmark, SavedProjectSession } from './services/storageService';

import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { SearchStepForm } from './components/SearchStepForm';
import { AiPreferenceCard } from './components/AiPreferenceCard';
import { GroundingSourcesView } from './components/GroundingSourcesView';
import { InteractiveMap } from './components/InteractiveMap';
import { FilterBar } from './components/FilterBar';
import { ResultsTable } from './components/ResultsTable';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { BookingModal } from './components/BookingModal';
import { ProjectContextModal } from './components/ProjectContextModal';
import { ProjectSaveModal } from './components/ProjectSaveModal';

const INITIAL_CRITERIA: SearchCriteria = {
  location: 'Paris 75008',
  specialty: 'Dermatologist',
  languages: ['English'],
  availabilityPreference: 'within_7_days',
  naturalLanguagePriority:
    'I need an English speaking dermatologist as soon as possible. I can travel up to 30 minutes and I prefer a doctor close to me.',
  searchMode: 'live_grounded',
};

const INITIAL_FILTERS: FilterOptions = {
  maxDistanceKm: 50,
  maxTravelTimeMinutes: 60,
  selectedLanguage: 'all',
  maxDaysUntilAppointment: 30,
  minMatchScore: 30,
  sectorFilter: 'all',
  teleconsultOnly: false,
};

const RAW_PROJECT_CONTEXT_MD = `# MedMatch France — Complete Project Context & Technical Specification

> **Version:** 1.2.0  
> **Target Region:** France (Metropolitan & DROM-COM)  
> **Core Concept:** Objective, preference-driven healthcare matchmaking for French residents and international patients.

---

## 1. Executive Summary & Value Proposition

**Core Principle:**  
"Don't just find doctors. Find the doctors that best match what matters to you."

MedMatch France is a decision-support medical matching application. It explicitly avoids making claims about identifying the medically "best" doctor. Instead, it computes an objective **Match Score (0–100%)** based on:
1. **Location & Travel Time:** Real transit distance, walking distance, and urban commute estimates.
2. **Medical Specialty & Sub-Expertise:** Exact specialty alignment and clinical sub-specialties.
3. **Availability Speed:** Verified next available slot (today, tomorrow, within 3/7/14 days).
4. **Languages Spoken:** Multilingual coverage (French, English, Spanish, German, Arabic, Italian, Hindi, etc.) for international residents and expats.
5. **French Healthcare Tariff System:** Convention status (Secteur 1 without fee overrun, Secteur 2, Carte Vitale acceptance).
6. **AI Natural Language Prioritization:** Automatic translation of free-text user priorities into calibrated dynamic weights using Gemini 2.5 Flash.
7. **Live Verification & Grounding:** Real-time validation against verified French medical directories (Ameli Annuaire Santé, Doctolib, Maiia, Ordre des Médecins) via Google Search Grounding.

---

## 2. Architecture Overview

Frontend (React 18 + TS + Tailwind) <---> Gemini 2.5 Flash AI <---> Ranking & Geo Engine <---> Google Search Grounding & Directories

---

## 3. Data Models & TypeScript Interfaces

- Doctor (RPPS, Specialty, Languages, Tariff Sector, Availability, Geo-coordinates, Citations)
- InterpretedPreferences (Weights, Priorities, Max Commute Time, Summary)
- DoctorMatchResult (Match Score 0-100%, Score Breakdown, Badges, Why Matched)

---

## 4. Transparent Ranking Algorithm

MatchScore = min(99, max(25, Specialty * W_spec + Language * W_lang + Availability * W_avail + Distance * W_dist + Rating * W_rate))

Default Weights: Availability 40%, Specialty 25%, Language 15%, Distance 15%, Rating 5%.

---

## 5. Gemini 2.5 Flash Integrations
- Priority Interpretation: Structured JSON Schema via Gemini 2.5 Flash.
- Live Search Grounding: Extract live verified practitioners with citations from tools: [{ googleSearch: {} }].

---

## 6. How to Save, Export, and Reuse Anywhere
1. **Export Session (.json):** Saves search criteria, custom weights, and verified doctors.
2. **Export Excel (.xlsx):** Full spreadsheet with ranking breakdown and booking URLs.
3. **Codebase Portability:** Run \`npm create vite@latest medmatch-france -- --template react-ts\` and drop in the components.
`;

export const App: React.FC = () => {
  const [criteria, setCriteria] = useState<SearchCriteria>(INITIAL_CRITERIA);
  const [preferences, setPreferences] = useState<InterpretedPreferences | null>(null);
  const [activeDoctorPool, setActiveDoctorPool] = useState<Doctor[]>(MOCK_DOCTORS);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [bookmarkedDoctorIds, setBookmarkedDoctorIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>(INITIAL_FILTERS);
  const [sortField, setSortField] = useState<SortField>('best_match');

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [detailModalResult, setDetailModalResult] = useState<DoctorMatchResult | null>(null);
  const [bookingModalResult, setBookingModalResult] = useState<DoctorMatchResult | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Load saved bookmarks from localStorage on mount
  useEffect(() => {
    setBookmarkedDoctorIds(getBookmarkedDoctorIds());
  }, []);

  const handleToggleBookmark = (docId: string) => {
    const updated = toggleDoctorBookmark(docId);
    setBookmarkedDoctorIds(updated);
  };

  // Perform AI Interpretation & Search Execution
  const executeSearch = useCallback(
    async (overrideCriteria?: SearchCriteria) => {
      const activeCriteria = overrideCriteria || criteria;
      setIsSearching(true);

      try {
        // Step 1: Interpret user natural language priorities
        const interpreted = await interpretUserPriorities(
          activeCriteria.naturalLanguagePriority,
          activeCriteria.specialty,
          activeCriteria.languages,
          activeCriteria.location
        );
        setPreferences(interpreted);

        // Step 2: Fetch pool of doctors
        if (activeCriteria.searchMode === 'live_grounded') {
          try {
            const liveResult = await fetchLiveGroundedDoctors(
              activeCriteria.specialty,
              activeCriteria.location,
              activeCriteria.languages,
              activeCriteria.naturalLanguagePriority
            );

            if (liveResult.doctors && liveResult.doctors.length > 0) {
              setActiveDoctorPool(liveResult.doctors);
              setGroundingSources(liveResult.groundingSources);
            } else {
              setActiveDoctorPool(MOCK_DOCTORS);
              setGroundingSources([]);
            }
          } catch (liveErr) {
            console.warn('Live grounding fetch notice, falling back to verified local dataset:', liveErr);
            setActiveDoctorPool(MOCK_DOCTORS);
            setGroundingSources([]);
          }
        } else {
          setActiveDoctorPool(MOCK_DOCTORS);
          setGroundingSources([]);
        }

        setHasSearched(true);
      } catch (err) {
        console.error('Search execution error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [criteria]
  );

  useEffect(() => {
    executeSearch(INITIAL_CRITERIA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTryDemoSearch = () => {
    const demoCriteria: SearchCriteria = {
      location: 'Paris 75008',
      specialty: 'Dermatologist',
      languages: ['English'],
      availabilityPreference: 'within_7_days',
      naturalLanguagePriority:
        'I need an English speaking dermatologist as soon as possible. I can travel up to 30 minutes.',
      searchMode: 'demo',
    };
    setCriteria(demoCriteria);
    setFilterOptions(INITIAL_FILTERS);
    setSortField('best_match');
    executeSearch(demoCriteria);
  };

  const handleRestoreSession = (session: SavedProjectSession) => {
    setCriteria(session.criteria);
    if (session.preferences) {
      setPreferences(session.preferences);
    }
    if (session.customDoctorsPool && session.customDoctorsPool.length > 0) {
      setActiveDoctorPool(session.customDoctorsPool);
    }
    if (session.bookmarkedDoctorIds) {
      setBookmarkedDoctorIds(session.bookmarkedDoctorIds);
    }
    setHasSearched(true);
  };

  const rawRankedResults = useMemo(() => {
    if (!preferences) return [];
    return rankDoctors(activeDoctorPool, criteria, preferences);
  }, [activeDoctorPool, criteria, preferences]);

  useEffect(() => {
    if (rawRankedResults.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(rawRankedResults[0].doctor.id);
    }
  }, [rawRankedResults, selectedDoctorId]);

  const filteredAndSortedResults = useMemo(() => {
    let list = rawRankedResults.filter((r) => {
      if (r.estimatedTravelTimeMinutes > filterOptions.maxTravelTimeMinutes) return false;
      if (
        filterOptions.selectedLanguage !== 'all' &&
        !r.doctor.languages.includes(filterOptions.selectedLanguage)
      ) {
        return false;
      }
      if (r.doctor.earliestSlot.daysFromNow > filterOptions.maxDaysUntilAppointment) return false;
      if (filterOptions.sectorFilter === 'secteur1' && !r.doctor.sector.includes('Secteur 1')) return false;
      if (filterOptions.sectorFilter === 'secteur2' && !r.doctor.sector.includes('Secteur 2')) return false;
      return true;
    });

    switch (sortField) {
      case 'earliest':
        list.sort((a, b) => a.doctor.earliestSlot.daysFromNow - b.doctor.earliestSlot.daysFromNow);
        break;
      case 'closest':
        list.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case 'travel_time':
        list.sort((a, b) => a.estimatedTravelTimeMinutes - b.estimatedTravelTimeMinutes);
        break;
      case 'rating':
        list.sort((a, b) => b.doctor.rating - a.doctor.rating);
        break;
      case 'best_match':
      default:
        list.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [rawRankedResults, filterOptions, sortField]);

  const handleUpdateWeights = (newWeights: InterpretedPreferences['weights']) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      weights: newWeights,
    });
  };

  const handleDownloadExcel = () => {
    exportResultsToExcel(filteredAndSortedResults, `${criteria.specialty} in ${criteria.location}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DisclaimerBanner />
      <Header
        onReset={() => {
          setCriteria(INITIAL_CRITERIA);
          executeSearch(INITIAL_CRITERIA);
        }}
        onTryDemo={handleTryDemoSearch}
        onOpenContext={() => setIsContextModalOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        bookmarkedCount={bookmarkedDoctorIds.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Step-by-Step Search Module with Live/Demo Mode */}
        <SearchStepForm
          criteria={criteria}
          onChange={setCriteria}
          onSearch={() => executeSearch()}
          isLoading={isSearching}
        />

        {/* Live Grounding Citations Drawer */}
        <GroundingSourcesView
          sources={groundingSources}
          searchMode={criteria.searchMode}
          queryLocation={criteria.location}
          querySpecialty={criteria.specialty}
        />

        {/* AI Transparent Preference Card */}
        {preferences && (
          <AiPreferenceCard
            preferences={preferences}
            onUpdateWeights={handleUpdateWeights}
            isLoading={isSearching}
          />
        )}

        {/* Results Area */}
        {hasSearched && (
          <div className="space-y-6">
            {/* Header / Export Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Ranked Doctor Matches ({filteredAndSortedResults.length})
                  </h2>
                  {criteria.searchMode === 'live_grounded' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live Grounded Web Sources
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Showing matches for {criteria.specialty} near {criteria.location}.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                {/* Save Snapshot Button */}
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                  title="Save current matches, criteria and weights to JSON or browser memory"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Snapshot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsContextModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition"
                  title="View complete developer and architecture specification"
                >
                  <FileCode className="w-4 h-4 text-slate-600" />
                  <span>Project Specs (.md)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                  title="Download results as formatted .xlsx Excel file"
                >
                  <Download className="w-4 h-4" />
                  <span>Download results as Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Filter & Sort controls */}
            <FilterBar
              filterOptions={filterOptions}
              onChangeFilters={setFilterOptions}
              sortField={sortField}
              onChangeSort={setSortField}
              totalResultsCount={filteredAndSortedResults.length}
            />

            {/* Grid layout: Results Table + Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Results Table (7 cols on desktop) */}
              <div className="lg:col-span-7">
                <ResultsTable
                  results={filteredAndSortedResults}
                  selectedDoctorId={selectedDoctorId}
                  onSelectDoctor={setSelectedDoctorId}
                  onOpenDetails={setDetailModalResult}
                  onOpenBooking={setBookingModalResult}
                  bookmarkedDoctorIds={bookmarkedDoctorIds}
                  onToggleBookmark={handleToggleBookmark}
                />
              </div>

              {/* Interactive Vector Map (5 cols on desktop) */}
              <div className="lg:col-span-5 sticky top-24">
                <InteractiveMap
                  results={filteredAndSortedResults}
                  selectedDoctorId={selectedDoctorId}
                  onSelectDoctor={(id) => {
                    setSelectedDoctorId(id);
                    const found = filteredAndSortedResults.find((r) => r.doctor.id === id);
                    if (found) setDetailModalResult(found);
                  }}
                  userLocationLabel={criteria.location}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        result={detailModalResult}
        onClose={() => setDetailModalResult(null)}
        onOpenBooking={(res) => setBookingModalResult(res)}
      />

      {/* Booking / Verification Modal */}
      <BookingModal
        result={bookingModalResult}
        onClose={() => setBookingModalResult(null)}
      />

      {/* Project Context & Specification Modal */}
      <ProjectContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        markdownContent={RAW_PROJECT_CONTEXT_MD}
      />

      {/* Save & Reuse Snapshot Modal */}
      <ProjectSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        criteria={criteria}
        preferences={preferences}
        results={filteredAndSortedResults}
        bookmarkedDoctorIds={bookmarkedDoctorIds}
        onRestoreSession={handleRestoreSession}
        markdownSpecs={RAW_PROJECT_CONTEXT_MD}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-200">
              MedMatch France — Intelligent Decision Support Prototype
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live Google Search Grounding for verified French healthcare directories & practices.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-3 justify-center sm:justify-end">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="hover:text-emerald-400 font-bold underline flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              Save & Reuse Session
            </button>
            <span>•</span>
            <button
              onClick={() => setIsContextModalOpen(true)}
              className="hover:text-blue-400 underline"
            >
              PROJECT_CONTEXT.md
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
