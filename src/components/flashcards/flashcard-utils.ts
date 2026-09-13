import { FlashcardItem, SubjectNote } from '@/types/curriculum';

export function buildCardsForLessons(
  selectedLessonIds: Set<string>,
  isShuffled: boolean = false,
  curriculum: SubjectNote[] = [],
  availableDbFlashcards: FlashcardItem[] = []
): FlashcardItem[] {
  const generated: FlashcardItem[] = [];

  // 1. First, include matching real flashcards from Convex database created in Admin
  if (availableDbFlashcards.length > 0) {
    availableDbFlashcards.forEach((card) => {
      if (card.lessonId && selectedLessonIds.has(card.lessonId)) {
        generated.push(card);
      }
    });
  }

  // 2. For selected lessons without DB flashcards, generate cards from real notes (filter out boilerplate)
  curriculum.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.has(lesson.id)) {
          // If already has official DB cards, don't duplicate with auto-generated cards
          const hasDbCardsForLesson = availableDbFlashcards.some(
            (c) => c.lessonId === lesson.id
          );
          if (hasDbCardsForLesson) return;

          // Filter out legacy boilerplate placeholders
          const points = (lesson.keyPoints || []).filter((p) => {
            const lower = p.toLowerCase();
            return (
              !lower.startsWith('definition & scope:') &&
              !lower.startsWith('regulatory standard:') &&
              !lower.startsWith('practice application:')
            );
          });

          points.forEach((point, pIdx) => {
            const colonIndex = point.indexOf(':');
            let term = '';
            let explanation = '';

            if (colonIndex !== -1) {
              term = point.substring(0, colonIndex).trim();
              explanation = point.substring(colonIndex + 1).trim();
            } else {
              term = `${lesson.title} - Key Concept #${pIdx + 1}`;
              explanation = point.trim();
            }

            generated.push({
              id: `fc-${lesson.id}-${pIdx}-${Date.now()}`,
              subjectTitle: subject.title,
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              question: `What are the key provisions and principles of "${term}" in ${lesson.title}?`,
              answer: term,
              explanation,
              isDifficult: false,
              isFavorite: false,
            });
          });
        }
      });
    });
  });

  let result = [...generated];
  if (isShuffled) {
    result = result.sort(() => Math.random() - 0.5);
  }

  return result;
}
