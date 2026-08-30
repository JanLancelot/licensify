import { useEffect, useState } from 'react';
import { FlashcardPreset, QuizPreset } from '@/types/curriculum';

const QUIZ_PRESETS_STORAGE_KEY = 'licensify_quiz_presets_v1';

const DEFAULT_QUIZ_PRESETS: QuizPreset[] = [
  {
    id: 'quiz-preset-core-ale',
    title: 'Core ALE Essential Concepts',
    questionCount: 15,
    lessonCount: 6,
    iconName: 'Layers',
    createdAt: 'Auto Generated',
    subjectNames: ['History', 'Utilities', 'Design'],
    difficulty: 'medium',
    defaultTimerSeconds: 15,
  },
  {
    id: 'quiz-preset-nbcp',
    title: 'NBCP Rule 7 & 8 Computations',
    questionCount: 10,
    lessonCount: 4,
    iconName: 'Compass',
    createdAt: 'Official Syllabus',
    subjectNames: ['Rule 7 & 8', 'Zoning', 'Setbacks'],
    difficulty: 'hard',
    defaultTimerSeconds: 30,
  },
];

let inMemoryPresets: QuizPreset[] = [...DEFAULT_QUIZ_PRESETS];
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
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(QUIZ_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryPresets = parsed;
          isLoaded = true;
          return inMemoryPresets;
        }
      }
    } catch (e) {
      console.warn('[QuizPresetStore] Failed to load from storage:', e);
    }
  }
  isLoaded = true;
  return inMemoryPresets;
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
  return updated;
}

export function deleteQuizPreset(id: string): QuizPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);
  return updated;
}

export function addFlashcardPresetToQuiz(flashcardPreset: FlashcardPreset): QuizPreset {
  const newQuizPreset: QuizPreset = {
    id: `quiz-${flashcardPreset.id}-${Date.now()}`,
    title: `${flashcardPreset.title} (Quiz)`,
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
  };
}
