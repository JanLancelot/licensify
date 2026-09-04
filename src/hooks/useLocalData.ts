import { useMutation, useQuery } from 'convex/react';
import { useCallback, useMemo } from 'react';
import { BookOpen, Compass, Landmark } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { SubjectNote, FlashcardItem } from '@/types/curriculum';

const AREA_ICONS = [Landmark, Compass, BookOpen];

export interface LocalAchievementItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  bg?: string;
  darkBg?: string;
  iconColor?: string;
  criteriaType: string;
  targetValue: number;
  order: number;
  isUnlocked: boolean;
  progressText: string;
}

/**
 * Pure Online Hook: Fetches published subjects directly from Convex Cloud.
 */
export function useLocalSubjects() {
  const data = useQuery(api.subjects.listPublishedSubjects);
  const loading = data === undefined;

  const subjects = useMemo(() => {
    if (!data) return [];
    return data.map((s) => ({
      id: s._id,
      name: s.name,
      description: s.description ?? null,
      isPublished: s.isPublished,
      order: s.order,
    }));
  }, [data]);

  return { subjects, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches the entire curriculum hierarchy directly from Convex Cloud.
 * Formatted matching the UI SubjectNote[] type with reactive real-time updates.
 */
export function useLocalHierarchy() {
  const rawData = useQuery(api.subjects.getFullCurriculum);
  const loading = rawData === undefined;

  const curriculum: SubjectNote[] = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((sub, sIdx) => {
      const iconComponent = AREA_ICONS[sIdx % AREA_ICONS.length] || Landmark;
      return {
        ...sub,
        icon: iconComponent,
      } as SubjectNote;
    });
  }, [rawData]);

  return { curriculum, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Submits a quiz attempt directly to Convex.
 * Graded on the server and updates user streak instantly.
 */
export function useSubmitLocalAttempt() {
  const submitDirectMutation = useMutation(api.attempts.submitAttemptDirect);

  const submitAttempt = useCallback(
    async (
      _userId: string,
      quizId: string,
      answers: { questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[]
    ) => {
      try {
        const payload = {
          quizId,
          answers: answers.map((a) => ({
            questionId: a.questionId,
            selectedChoiceId: a.selectedChoiceId,
          })),
        };

        const result = await submitDirectMutation(payload);
        return result;
      } catch (error) {
        console.error('[useSubmitLocalAttempt] Failed to submit attempt online:', error);
        throw error;
      }
    },
    [submitDirectMutation]
  );

  return submitAttempt;
}

/**
 * Pure Online Hook: Fetches flashcards directly from Convex Cloud.
 */
export function useLocalFlashcards(subjectId?: string, topicId?: string) {
  const data = useQuery(api.flashcards.listPublishedFlashcards, {
    subjectId: subjectId || undefined,
    topicId: topicId || undefined,
  });
  const loading = data === undefined;
  const flashcards: FlashcardItem[] = useMemo(() => data || [], [data]);

  return { flashcards, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches questions for practice drills directly from Convex.
 */
export function useLocalQuestions(options?: {
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  specializedType?: string;
  count?: number;
}) {
  const data = useQuery(api.questions.getQuestionsForPractice, {
    subjectId: options?.subjectId,
    topicId: options?.topicId,
    difficulty: options?.difficulty,
    specializedType: options?.specializedType,
    count: options?.count,
  });
  const loading = data === undefined;
  const questions = useMemo(() => data || [], [data]);

  return { questions, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches quizzes & mock exams directly from Convex Cloud.
 */
export function useLocalQuizzes(
  filter?: 'practice' | 'mock_exam' | { type?: 'practice' | 'mock_exam'; specializedType?: string }
) {
  const filterType = typeof filter === 'string' ? filter : filter?.type;
  const specializedType = typeof filter === 'object' ? filter?.specializedType : undefined;

  const data = useQuery(api.quizzes.listPublishedQuizzesOnline, {
    type: filterType,
    specializedType,
  });
  const loading = data === undefined;
  const quizzes = useMemo(() => data || [], [data]);

  return { quizzes, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches a single quiz and its questions by ID from Convex Cloud.
 */
export function useLocalQuizWithQuestions(quizId: string) {
  const data = useQuery(
    api.quizzes.getQuizWithQuestionsOnline,
    quizId ? { quizId } : 'skip'
  );
  const loading = data === undefined;

  return {
    quiz: data?.quiz || null,
    questions: data?.questions || [],
    loading,
  };
}

/**
 * Pure Online Hook: Fetches student quiz attempt history from Convex Cloud.
 */
export function useLocalAttempts() {
  const data = useQuery(api.attempts.getUserQuizHistory);
  const loading = data === undefined;

  const attempts = useMemo(() => {
    if (!data) return [];
    return data.map((att) => ({
      id: att._id,
      quizId: att.quizId,
      status: att.status,
      score: att.score ?? 0,
      correctAnswers: att.correctAnswers ?? 0,
      totalQuestions: att.totalQuestions,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
      quizTitle: att.quizTitle,
      quizType: att.quizType,
    }));
  }, [data]);

  return { attempts, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Computes live student statistics directly in Convex Cloud.
 */
export function useLocalStats() {
  const data = useQuery(api.users.getUserStats);
  const loading = data === undefined;

  const stats = useMemo(
    () =>
      data || {
        progressPercentage: 0,
        completedQuizzes: 0,
        averageScore: 0,
        streakDays: 0,
      },
    [data]
  );

  return { stats, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches achievements with real-time unlocked state from Convex Cloud.
 */
export function useLocalAchievements(_userId?: string) {
  const data = useQuery(api.users.getUserAchievementsOnline);
  const loading = data === undefined;
  const achievements: LocalAchievementItem[] = useMemo(() => data || [], [data]);

  return { achievements, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Fetches study streak data directly from Convex Cloud.
 */
export function useUserStreak() {
  const data = useQuery(api.users.getUserStreakOnline);
  const loading = data === undefined;

  const streak = useMemo(
    () =>
      data || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: undefined,
      },
    [data]
  );

  return { streak, loading, refetch: () => {} };
}

/**
 * Pure Online Hook: Manages persistent lesson completion progress stored in Convex Cloud.
 */
export function useLessonProgress() {
  const completedIdsArray = useQuery(api.sync.getUserLessonProgress);
  const toggleMutation = useMutation(api.sync.toggleLessonProgress);
  const loading = completedIdsArray === undefined;

  const completedLessonIds = useMemo(
    () => new Set(completedIdsArray || []),
    [completedIdsArray]
  );

  const toggleLessonCompleted = useCallback(
    async (lessonId: string) => {
      try {
        await toggleMutation({ lessonId });
      } catch (error) {
        console.error('[useLessonProgress] Error toggling lesson progress online:', error);
      }
    },
    [toggleMutation]
  );

  const markLessonCompleted = useCallback(
    async (lessonId: string) => {
      try {
        await toggleMutation({ lessonId, isCompleted: true });
      } catch (error) {
        console.error('[useLessonProgress] Error marking lesson completed online:', error);
      }
    },
    [toggleMutation]
  );

  const isCompleted = useCallback(
    (lessonId: string) => completedLessonIds.has(lessonId),
    [completedLessonIds]
  );

  return {
    completedLessonIds,
    toggleLessonCompleted,
    markLessonCompleted,
    isCompleted,
    loading,
    refetch: () => {},
  };
}
