import { useEffect, useState } from 'react';

export interface ModularExamPreset {
  id: string;
  title: string;
  iconName?: string;
  lessonIds: string[];
  subjectNames?: string[];
  questionCount?: number;
  timeLimitSeconds?: number; // Total timer in seconds (e.g. 3600 for 1h, 5400 for 1.5h, 10800 for 3h)
  createdAt: number;
}

const MODULAR_EXAMS_STORAGE_KEY = 'licensify_modular_exams_v1';

// Empty at first as requested by the user
let inMemoryModularExams: ModularExamPreset[] = [];
let isLoaded = false;
const listeners = new Set<(presets: ModularExamPreset[]) => void>();

function notifyListeners() {
  const current = [...inMemoryModularExams];
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.warn('[ModularExamStore] Listener notification error:', e);
    }
  });
}

function loadPresetsFromStorage(): ModularExamPreset[] {
  if (isLoaded) return inMemoryModularExams;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(MODULAR_EXAMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryModularExams = parsed;
          isLoaded = true;
          return inMemoryModularExams;
        }
      }
    } catch (e) {
      console.warn('[ModularExamStore] Failed to load from storage:', e);
    }
  }
  isLoaded = true;
  return inMemoryModularExams;
}

function persistPresets(presets: ModularExamPreset[]) {
  inMemoryModularExams = presets;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(MODULAR_EXAMS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn('[ModularExamStore] Failed to persist to storage:', e);
    }
  }
  notifyListeners();
}

export function getModularExamPresets(): ModularExamPreset[] {
  return loadPresetsFromStorage();
}

export function saveModularExamPreset(preset: ModularExamPreset): ModularExamPreset[] {
  const current = loadPresetsFromStorage();
  const existingIdx = current.findIndex((p) => p.id === preset.id);
  let updated: ModularExamPreset[];
  if (existingIdx >= 0) {
    updated = current.map((p, idx) => (idx === existingIdx ? preset : p));
  } else {
    updated = [preset, ...current];
  }
  persistPresets(updated);
  return updated;
}

export function deleteModularExamPreset(id: string): ModularExamPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);
  return updated;
}

export function subscribeModularExamPresets(
  listener: (presets: ModularExamPreset[]) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useModularExamPresets() {
  const [presets, setPresets] = useState<ModularExamPreset[]>(() => getModularExamPresets());

  useEffect(() => {
    const unsub = subscribeModularExamPresets((updated) => {
      setPresets(updated);
    });
    return unsub;
  }, []);

  return {
    presets,
    savePreset: saveModularExamPreset,
    deletePreset: deleteModularExamPreset,
  };
}
