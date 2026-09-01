const lessonProgressListeners = new Set<() => void>();

export function subscribeLessonProgressChanged(listener: () => void): () => void {
  lessonProgressListeners.add(listener);
  return () => {
    lessonProgressListeners.delete(listener);
  };
}

export function notifyLessonProgressChanged(): void {
  lessonProgressListeners.forEach((listener) => listener());
}
