import { useEffect, useState } from 'react';
import { eq } from 'drizzle-orm';
import { FlashcardPreset } from '@/types/curriculum';
import { db } from '@/db/client';
import * as schema from '@/db/schema';

const FLASHCARD_PRESETS_STORAGE_KEY = 'licensify_flashcard_presets_v1';

let inMemoryFlashcardPresets: FlashcardPreset[] = [];
let isLoaded = false;
const listeners = new Set<(presets: FlashcardPreset[]) => void>();

function notifyListeners() {
  const current = [...inMemoryFlashcardPresets];
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.warn('[FlashcardPresetStore] Listener notification error:', e);
    }
  });
}

function loadPresetsFromStorage(): FlashcardPreset[] {
  if (isLoaded) return inMemoryFlashcardPresets;

  // Fallback to web localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(FLASHCARD_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryFlashcardPresets = parsed;
        }
      }
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to load from localStorage:', e);
    }
  }

  // Asynchronously hydrate from SQLite database
  hydrateFromDatabase();

  isLoaded = true;
  return inMemoryFlashcardPresets;
}

async function hydrateFromDatabase() {
  try {
    const rows = await db
      .select()
      .from(schema.userPresets)
      .where(eq(schema.userPresets.type, 'flashcard'));

    if (rows && rows.length > 0) {
      const parsedFromDb: FlashcardPreset[] = rows.map((r) => {
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
          lessonCount: lessonIds.length,
          cardCount: r.questionCount || 10,
          isShuffled: !!r.isShuffled,
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
          subjectNames,
          cards: [],
          selectedLessonIds: lessonIds,
          iconName: r.iconName || 'Layers',
        };
      });

      // Merge avoiding duplicates
      const mergedMap = new Map<string, FlashcardPreset>();
      parsedFromDb.forEach((p) => mergedMap.set(p.id, p));
      inMemoryFlashcardPresets.forEach((p) => {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      });

      inMemoryFlashcardPresets = Array.from(mergedMap.values());
      notifyListeners();
    }
  } catch (err) {
    console.warn('[FlashcardPresetStore] SQLite hydration notice:', err);
  }
}

function persistPresets(presets: FlashcardPreset[]) {
  inMemoryFlashcardPresets = presets;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(FLASHCARD_PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to persist to localStorage:', e);
    }
  }

  notifyListeners();
}

export function getFlashcardPresets(): FlashcardPreset[] {
  return loadPresetsFromStorage();
}

export function saveFlashcardPreset(preset: FlashcardPreset): FlashcardPreset[] {
  const current = loadPresetsFromStorage();
  const existingIdx = current.findIndex((p) => p.id === preset.id);
  let updated: FlashcardPreset[];
  if (existingIdx >= 0) {
    updated = current.map((p, idx) => (idx === existingIdx ? preset : p));
  } else {
    updated = [preset, ...current];
  }
  persistPresets(updated);

  // Persist to local SQLite
  (async () => {
    try {
      const now = Date.now();
      await db
        .insert(schema.userPresets)
        .values({
          id: preset.id,
          userId: 'local-student-1',
          type: 'flashcard',
          title: preset.title,
          iconName: preset.iconName || 'Layers',
          lessonIds: JSON.stringify(preset.selectedLessonIds || []),
          subjectNames: JSON.stringify(preset.subjectNames || []),
          questionCount: preset.cardCount || preset.cards?.length || 10,
          isShuffled: preset.isShuffled,
          syncStatus: 'pending_sync',
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.userPresets.id,
          set: {
            title: preset.title,
            iconName: preset.iconName || 'Layers',
            lessonIds: JSON.stringify(preset.selectedLessonIds || []),
            subjectNames: JSON.stringify(preset.subjectNames || []),
            questionCount: preset.cardCount || preset.cards?.length || 10,
            isShuffled: preset.isShuffled,
            syncStatus: 'pending_sync',
            updatedAt: now,
          },
        });
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to insert SQLite preset:', e);
    }
  })();

  return updated;
}

export function deleteFlashcardPreset(id: string): FlashcardPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);

  // Delete from local SQLite
  (async () => {
    try {
      await db.delete(schema.userPresets).where(eq(schema.userPresets.id, id));
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to delete SQLite preset:', e);
    }
  })();

  return updated;
}

export function subscribeFlashcardPresets(
  listener: (presets: FlashcardPreset[]) => void
): () => void {
  listeners.add(listener);
  listener(loadPresetsFromStorage());
  return () => {
    listeners.delete(listener);
  };
}

export function useFlashcardPresets() {
  const [presets, setPresets] = useState<FlashcardPreset[]>(() => loadPresetsFromStorage());

  useEffect(() => {
    hydrateFromDatabase();
    const unsubscribe = subscribeFlashcardPresets((updated) => {
      setPresets(updated);
    });
    return unsubscribe;
  }, []);

  return {
    presets,
    savePreset: saveFlashcardPreset,
    deletePreset: deleteFlashcardPreset,
  };
}
