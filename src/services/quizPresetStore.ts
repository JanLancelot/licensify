import { useEffect, useState } from 'react';
import { eq } from 'drizzle-orm';
import { FlashcardPreset, QuizPreset } from '@/types/curriculum';
import { db } from '@/db/client';
import * as schema from '@/db/schema';

const QUIZ_PRESETS_STORAGE_KEY = 'licensify_quiz_presets_v2';

let inMemoryPresets: QuizPreset[] = [];
let isLoaded = false;
const listeners = new Set<(presets: QuizPreset[]) => void>();

function notifyListeners() {
  const current = [...inMemoryPresets];
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.warn('[QuizPresetStore] Listener notification error:', e);
    }
  });
}

function loadPresetsFromStorage(): QuizPreset[] {
  if (isLoaded) return inMemoryPresets;

  // Web localStorage fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(QUIZ_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryPresets = parsed;
        }
      }
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to load from storage:', e);
    }
  }

  // Hydrate from SQLite
  hydrateFromDatabase();

  isLoaded = true;
  return inMemoryPresets;
}

async function hydrateFromDatabase() {
  try {
    const rows = await db
      .select()
      .from(schema.userPresets)
      .where(eq(schema.userPresets.type, 'quiz'));

    if (rows && rows.length > 0) {
      const parsedFromDb: QuizPreset[] = rows.map((r) => {
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
          questionCount: r.questionCount || 10,
          lessonCount: lessonIds.length,
          iconName: r.iconName || 'Layers',
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
          subjectNames,
          selectedLessonIds: lessonIds,
          defaultTimerSeconds: r.timeLimitSeconds || 15,
        };
      });

      const mergedMap = new Map<string, QuizPreset>();
      parsedFromDb.forEach((p) => mergedMap.set(p.id, p));
      inMemoryPresets.forEach((p) => {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      });

      inMemoryPresets = Array.from(mergedMap.values());
      notifyListeners();
    }
  } catch (e) {
    console.warn('[QuizPresetStore] SQLite hydration notice:', e);
  }
}

function persistPresets(presets: QuizPreset[]) {
  inMemoryPresets = presets;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(QUIZ_PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to persist to storage:', e);
    }
  }
  notifyListeners();
}

export function getQuizPresets(): QuizPreset[] {
  return loadPresetsFromStorage();
}

export function saveQuizPreset(preset: QuizPreset): QuizPreset[] {
  const current = loadPresetsFromStorage();
  const existingIdx = current.findIndex((p) => p.id === preset.id);
  let updated: QuizPreset[];
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
          type: 'quiz',
          title: preset.title,
          iconName: preset.iconName || 'Layers',
          lessonIds: JSON.stringify(preset.selectedLessonIds || []),
          subjectNames: JSON.stringify(preset.subjectNames || []),
          questionCount: preset.questionCount || 10,
          timeLimitSeconds: preset.defaultTimerSeconds || 15,
          isShuffled: true,
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
            questionCount: preset.questionCount || 10,
            timeLimitSeconds: preset.defaultTimerSeconds || 15,
            syncStatus: 'pending_sync',
            updatedAt: now,
          },
        });
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to insert SQLite preset:', e);
    }
  })();

  return updated;
}

export function deleteQuizPreset(id: string): QuizPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);

  // Delete from local SQLite
  (async () => {
    try {
      await db.delete(schema.userPresets).where(eq(schema.userPresets.id, id));
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to delete SQLite preset:', e);
    }
  })();

  return updated;
}

export function addFlashcardPresetToQuiz(flashcardPreset: FlashcardPreset): QuizPreset {
  const current = loadPresetsFromStorage();
  const existing = current.find(
    (p) => p.id === `quiz-${flashcardPreset.id}` || p.title === `${flashcardPreset.title} (Quiz)` || p.title === flashcardPreset.title
  );
  if (existing) {
    return existing;
  }

  const newQuizPreset: QuizPreset = {
    id: `quiz-${flashcardPreset.id}`,
    title: flashcardPreset.title,
    questionCount: flashcardPreset.cardCount || flashcardPreset.cards?.length || 10,
    lessonCount: flashcardPreset.lessonCount || 1,
    iconName: flashcardPreset.iconName || 'Layers',
    createdAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    subjectNames: flashcardPreset.subjectNames || ['Custom Flashcards'],
    selectedLessonIds: flashcardPreset.selectedLessonIds,
    difficulty: 'medium',
    defaultTimerSeconds: 15,
  };

  saveQuizPreset(newQuizPreset);
  return newQuizPreset;
}

export function removeFlashcardFromQuiz(flashcardPresetId: string): QuizPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter(
    (p) => p.id !== `quiz-${flashcardPresetId}` && p.id !== flashcardPresetId
  );
  persistPresets(updated);

  (async () => {
    try {
      await db.delete(schema.userPresets).where(eq(schema.userPresets.id, `quiz-${flashcardPresetId}`));
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to delete SQLite preset:', e);
    }
  })();

  return updated;
}

export function subscribeQuizPresets(listener: (presets: QuizPreset[]) => void): () => void {
  listeners.add(listener);
  listener(loadPresetsFromStorage());
  return () => {
    listeners.delete(listener);
  };
}

export function useQuizPresets() {
  const [presets, setPresets] = useState<QuizPreset[]>(() => loadPresetsFromStorage());

  useEffect(() => {
    hydrateFromDatabase();
    const unsubscribe = subscribeQuizPresets((updated) => {
      setPresets(updated);
    });
    return unsubscribe;
  }, []);

  return {
    presets,
    savePreset: saveQuizPreset,
    deletePreset: deleteQuizPreset,
    addFromFlashcard: addFlashcardPresetToQuiz,
    removeFromFlashcard: removeFlashcardFromQuiz,
  };
}
