import { FlashcardItem } from '@/types/curriculum';
import { SUBJECT_NOTES } from '@/data/curriculum';

export function buildCardsForLessons(
  selectedLessonIds: Set<string>,
  isShuffled: boolean = false
): FlashcardItem[] {
  const generated: FlashcardItem[] = [];

  SUBJECT_NOTES.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.has(lesson.id)) {
          lesson.keyPoints.forEach((point, pIdx) => {
            const colonIndex = point.indexOf(':');
            let term = '';
            let explanation = '';

            if (colonIndex !== -1) {
              term = point.substring(0, colonIndex).trim();
              explanation = point.substring(colonIndex + 1).trim();
            } else {
              term = `${lesson.title} Concept #${pIdx + 1}`;
              explanation = point.trim();
            }

            generated.push({
              id: `fc-${lesson.id}-${pIdx}-${Date.now()}`,
              subjectTitle: subject.title,
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              question: `What are the key provisions and characteristics of "${term}" in ${lesson.title}?`,
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
