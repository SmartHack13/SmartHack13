import { SearchCriteria, InterpretedPreferences, DoctorMatchResult, Doctor } from '../types';

export interface SavedProjectSession {
  version: string;
  savedAt: string;
  name: string;
  criteria: SearchCriteria;
  preferences: InterpretedPreferences | null;
  bookmarkedDoctorIds: string[];
  customDoctorsPool?: Doctor[];
  notes?: string;
}

const STORAGE_KEYS = {
  CURRENT_SESSION: 'medmatch_current_session_v1',
  SAVED_SESSIONS: 'medmatch_saved_sessions_list_v1',
  BOOKMARKED_DOCTORS: 'medmatch_bookmarked_doctors_v1',
  CUSTOM_WEIGHTS: 'medmatch_custom_weights_v1',
};

// 1. Save and load bookmarked doctors
export const getBookmarkedDoctorIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_DOCTORS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleDoctorBookmark = (doctorId: string): string[] => {
  const current = getBookmarkedDoctorIds();
  const exists = current.includes(doctorId);
  const updated = exists ? current.filter((id) => id !== doctorId) : [...current, doctorId];
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKED_DOCTORS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
  return updated;
};

// 2. Export full session as JSON file
export const exportSessionToJsonFile = (session: SavedProjectSession, filename?: string) => {
  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || `MedMatch_France_Session_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 3. Parse and validate an imported session file
export const importSessionFromJsonFile = (file: File): Promise<SavedProjectSession> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as SavedProjectSession;
        if (!parsed.criteria || !parsed.criteria.location) {
          throw new Error('Invalid MedMatch France session file structure.');
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('Failed to parse JSON file. Please ensure it is a valid MedMatch session export.'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
};

// 4. Local quick saves
export const saveQuickSnapshot = (session: SavedProjectSession) => {
  try {
    const existingList = getSavedQuickSnapshots();
    const updatedList = [session, ...existingList.filter((s) => s.savedAt !== session.savedAt)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SAVED_SESSIONS, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('Could not store quick snapshot:', err);
  }
};

export const getSavedQuickSnapshots = (): SavedProjectSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
