import { useEffect, useState } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import * as schema from '@/db/schema';

export interface ModularExamPreset {
  id: string;
  title: string;
  iconName?: string;
  lessonIds: string[];
  subjectNames?: string[];
  questionCount?: number;
  timeLimitSeconds?: number;
  createdAt: number;
}

const MODULAR_EXAMS_STORAGE_KEY = 'licensify_modular_exams_v1';

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
        }
      }
    } catch (e) {
      console.warn('[ModularExamStore] Failed to load from storage:', e);
    }
  }

  hydrateFromDatabase();

  isLoaded = true;
  return inMemoryModularExams;
}

async function hydrateFromDatabase() {
  try {
    const rows = await db
      .select()
      .from(schema.userPresets)
      .where(eq(schema.userPresets.type, 'exam'));

    if (rows && rows.length > 0) {
      const parsedFromDb: ModularExamPreset[] = rows.map((r) => {
        let lessonIds: string[] = [];
        let subjectNames: string[] = [];
        try {
          lessonIds = typeof r.lessonIds === 'string' ? JSON.parse(r.lessonIds) : (r.lessonIds || []);
        } catch {}
        try {
          subjectNames = typeof r.subjectNames === 'string' ? JSON.parse(r.subjectNames) : (r.subjectNames || []);
        } catch {}

        return {
          id: r.id,
          title: r.title,
          iconName: r.iconName || 'Layers',
          lessonIds,
          subjectNames,
          questionCount: r.questionCount || 25,
          timeLimitSeconds: r.timeLimitSeconds || 3600,
          createdAt: r.createdAt || Date.now(),
        };
      });

      const mergedMap = new Map<string, ModularExamPreset>();
      parsedFromDb.forEach((p) => mergedMap.set(p.id, p));
      inMemoryModularExams.forEach((p) => {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      });

      inMemoryModularExams = Array.from(mergedMap.values());
      notifyListeners();
    }
  } catch (e) {
    console.warn('[ModularExamStore] SQLite hydration notice:', e);
  }
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

  // Persist to SQLite
  (async () => {
    try {
      const now = Date.now();
      await db
        .insert(schema.userPresets)
        .values({
          id: preset.id,
          userId: 'local-student-1',
          type: 'exam',
          title: preset.title,
          iconName: preset.iconName || 'Layers',
          lessonIds: JSON.stringify(preset.lessonIds || []),
          subjectNames: JSON.stringify(preset.subjectNames || []),
          questionCount: preset.questionCount || 25,
          timeLimitSeconds: preset.timeLimitSeconds || 3600,
          isShuffled: true,
          syncStatus: 'pending_sync',
          createdAt: preset.createdAt || now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.userPresets.id,
          set: {
            title: preset.title,
            iconName: preset.iconName || 'Layers',
            lessonIds: JSON.stringify(preset.lessonIds || []),
            subjectNames: JSON.stringify(preset.subjectNames || []),
            questionCount: preset.questionCount || 25,
            timeLimitSeconds: preset.timeLimitSeconds || 3600,
            syncStatus: 'pending_sync',
            updatedAt: now,
          },
        });
    } catch (e) {
      console.warn('[ModularExamStore] Failed to insert SQLite preset:', e);
    }
  })();

  return updated;
}

export function deleteModularExamPreset(id: string): ModularExamPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);

  (async () => {
    try {
      await db.delete(schema.userPresets).where(eq(schema.userPresets.id, id));
    } catch (e) {
      console.warn('[ModularExamStore] Failed to delete SQLite preset:', e);
    }
  })();

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
    hydrateFromDatabase();
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
