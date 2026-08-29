import { FlashcardItem, SubjectNote } from '@/types/curriculum';

export function buildCardsForLessons(
  selectedLessonIds: Set<string>,
  isShuffled: boolean = false,
  curriculum: SubjectNote[] = []
): FlashcardItem[] {
  const generated: FlashcardItem[] = [];

  curriculum.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.has(lesson.id)) {
          const points = lesson.keyPoints && lesson.keyPoints.length > 0
            ? lesson.keyPoints
            : [lesson.summary || lesson.title];

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
