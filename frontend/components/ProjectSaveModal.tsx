import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  FolderArchive,
  Terminal,
  Bookmark,
  Sparkles,
  FileCode,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import { SearchCriteria, InterpretedPreferences, DoctorMatchResult, Doctor } from '../types';
// Fixed relative path to storageService located in services/
import {
  SavedProjectSession,
  exportSessionToJsonFile,
  importSessionFromJsonFile,
  saveQuickSnapshot,
  getSavedQuickSnapshots,
} from '../services/storageService';

interface ProjectSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: SearchCriteria;
  preferences: InterpretedPreferences | null;
  results: DoctorMatchResult[];
  bookmarkedDoctorIds: string[];
  onRestoreSession: (session: SavedProjectSession) => void;
  markdownSpecs: string;
}

export const ProjectSaveModal: React.FC<ProjectSaveModalProps> = ({
  isOpen,
  onClose,
  criteria,
  preferences,
  results,
  bookmarkedDoctorIds,
  onRestoreSession,
  markdownSpecs,
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'codebase' | 'run_anywhere'>('session');
  const [sessionName, setSessionName] = useState(`${criteria.specialty} in ${criteria.location}`);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [quickSaved, setQuickSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentSessionData: SavedProjectSession = {
    version: '1.2.0',
    savedAt: new Date().toISOString(),
    name: sessionName || 'MedMatch France Saved Search',
    criteria,
    preferences,
    bookmarkedDoctorIds,
    customDoctorsPool: results.map((r) => r.doctor),
  };

  const handleDownloadSessionJson = () => {
    exportSessionToJsonFile(
      currentSessionData,
      `MedMatch_France_${criteria.specialty.replace(/\s+/g, '_')}_${criteria.location.replace(/\s+/g, '_')}.json`
    );
  };

  const handleQuickSaveBrowser = () => {
    saveQuickSnapshot(currentSessionData);
    setQuickSaved(true);
    setTimeout(() => setQuickSaved(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importSessionFromJsonFile(file);
      onRestoreSession(restored);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Error loading file.');
    }
  };

  const localSavedList = getSavedQuickSnapshots();

  const viteStarterCommands = `# 1. Create a modern React + TypeScript project
npm create vite@latest medmatch-france -- --template react-ts
cd medmatch-france

# 2. Install dependencies
npm install @google/genai lucide-react xlsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Add process.env.API_KEY to your .env file
echo "API_KEY=your_gemini_api_key_here" >> .env.local

# 4. Copy the component files and run
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Save & Reuse MedMatch France
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  Export / Restore Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Save your search snapshot, export doctor matches, or copy the codebase to run locally.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close save modal"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 px-6 pt-3 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition ${
              activeTab === 'session'
                ? 'bg-slate-950 text-blue-400 border-slate-700 border-b-slate-950'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>1. Save Search & Doctor Matches (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('codebase')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition ${
              activeTab === 'codebase'
                ? 'bg-slate-950 text-blue-400 border-slate-700 border-b-slate-950'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>2. Export Project Blueprint (.md)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('run_anywhere')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition ${
              activeTab === 'run_anywhere'
                ? 'bg-slate-950 text-blue-400 border-slate-700 border-b-slate-950'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. How to Run Locally / In Any IDE</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-950/60 text-xs">
          {/* TAB 1: Session State Save & Restore */}
          {activeTab === 'session' && (
            <div className="space-y-6">
              {/* Current Session Summary Card */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current Active Search
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {criteria.specialty} in {criteria.location}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[11px]">
                      {results.length} Verified Matches
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                      {bookmarkedDoctorIds.length} Bookmarked
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Target Languages:</span>
                    <span className="font-semibold text-slate-200">{criteria.languages.join(', ') || 'Any'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Availability Request:</span>
                    <span className="font-semibold text-emerald-400">{criteria.availabilityPreference}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AI Weights:</span>
                    <span className="font-semibold text-sky-400">
                      Avail {Math.round((preferences?.weights.availability || 0.4) * 100)}% / Spec {Math.round((preferences?.weights.specialty || 0.25) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Session Name input */}
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Label this snapshot (optional):
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Paris 8th English Dermatologists - Urgent"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Save Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadSessionJson}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Session (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickSaveBrowser}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                  >
                    {quickSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    <span>{quickSaved ? 'Saved in Browser!' : 'Save in Browser Memory'}</span>
                  </button>
                </div>
              </div>

              {/* Restore Session Section */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      Restore a Saved Session
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Upload a previously exported `.json` file to instantly reload your doctor list, weights, and bookmarks.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload .json File</span>
                  </button>
                </div>

                {importError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                    {importError}
                  </div>
                )}

                {/* Local Quick Snapshots List */}
                {localSavedList.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Saved in this browser:
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {localSavedList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                        >
                          <div>
                            <span className="font-bold text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(item.savedAt).toLocaleDateString()} at {new Date(item.savedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onRestoreSession(item);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white font-semibold text-[11px] transition"
                          >
                            <span>Load</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Export Codebase Blueprint */}
          {activeTab === 'codebase' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    Complete Project Blueprint & Context (.md)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Use this markdown specification to re-create the entire MedMatch France architecture in any environment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(markdownSpecs);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied MD' : 'Copy All'}</span>
                  </button>

                  <a
                    href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdownSpecs)}`}
                    download="MedMatch_France_PROJECT_CONTEXT.md"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </a>
                </div>
              </div>

              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-slate-300 bg-black/40 p-4 rounded-2xl border border-slate-800 max-h-80 overflow-y-auto">
                {markdownSpecs}
              </pre>
            </div>
          )}

          {/* TAB 3: How to Run Anywhere */}
          {activeTab === 'run_anywhere' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Quickstart Setup in Any Code Editor (VS Code, Cursor, WebStorm)
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Run this standalone React 18 + TypeScript application locally in 60 seconds:
                </p>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {viteStarterCommands}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(viteStarterCommands);
                      setCopiedCommands(true);
                      setTimeout(() => setCopiedCommands(false), 2500);
                    }}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 flex items-center gap-1"
                  >
                    {copiedCommands ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommands ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                  <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    Backend Roadmap (FastAPI/Node)
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Connect the PostGIS doctor database schema described in `PROJECT_CONTEXT.md` to feed real-time appointments.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                  <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Offline Capable
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The deterministic ranking engine and Excel exporter operate 100% client-side with zero external database dependencies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Everything you build and customize can be saved and reloaded instantly.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
