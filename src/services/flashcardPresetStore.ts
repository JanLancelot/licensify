import { useEffect, useState } from 'react';
import { FlashcardPreset } from '@/types/curriculum';

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
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(FLASHCARD_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryFlashcardPresets = parsed;
          isLoaded = true;
          return inMemoryFlashcardPresets;
        }
      }
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to load from storage:', e);
    }
  }
  isLoaded = true;
  return inMemoryFlashcardPresets;
}

function persistPresets(presets: FlashcardPreset[]) {
  inMemoryFlashcardPresets = presets;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(FLASHCARD_PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn('[FlashcardPresetStore] Failed to persist to storage:', e);
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
  return updated;
}

export function deleteFlashcardPreset(id: string): FlashcardPreset[] {
  const current = loadPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);
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
