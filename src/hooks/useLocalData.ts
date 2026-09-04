import { and, eq, desc } from 'drizzle-orm';
import * as crypto from 'expo-crypto';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { useSyncService } from '../services/useSyncService';
import { subscribeLessonProgressChanged } from '../utils/syncEvents';
import { SubjectNote, Topic, Lesson, FlashcardItem } from '@/types/curriculum';
import { BookOpen, Compass, Landmark } from 'lucide-react-native';

const AREA_ICONS = [Landmark, Compass, BookOpen];

/**
 * Hook to fetch published subjects from the local SQLite database.
 */
export function useLocalSubjects() {
  const [subjects, setSubjects] = useState<typeof schema.subjects.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db
        .select()
        .from(schema.subjects)
        .where(eq(schema.subjects.isPublished, true))
        .orderBy(schema.subjects.order);

      setSubjects(data);
    } catch (error) {
      console.error('[useLocalSubjects] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await db
          .select()
          .from(schema.subjects)
          .where(eq(schema.subjects.isPublished, true))
          .orderBy(schema.subjects.order);

        if (isMounted) {
          setSubjects(data);
        }
      } catch (error) {
        console.error('[useLocalSubjects] Error fetching:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { subjects, loading, refetch: fetchSubjects };
}

/**
 * Hook to fetch full hierarchy: subjects with branches, topics, and lessons
 * Formatted matching the UI SubjectNote[] type directly from the live database.
 */
export function useLocalHierarchy() {
  const [curriculum, setCurriculum] = useState<SubjectNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      const subs = await db
        .select()
        .from(schema.subjects)
        .where(eq(schema.subjects.isPublished, true))
        .orderBy(schema.subjects.order);

      const allTopics = await db
        .select()
        .from(schema.topics)
        .where(eq(schema.topics.isPublished, true))
        .orderBy(schema.topics.order);

      const allLessons = await db
        .select()
        .from(schema.lessons)
        .where(eq(schema.lessons.isPublished, true))
        .orderBy(schema.lessons.order);

      const allMaterials = await db.select().from(schema.materials);

      const formatted: SubjectNote[] = subs.map((sub, sIdx) => {
        const subTopics = allTopics.filter((t) => t.subjectId === sub.id);
        const mappedTopics: Topic[] = subTopics.map((top, tIdx) => {
          const topLessons = allLessons.filter((l) => l.topicId === top.id);
          const mappedLessons: Lesson[] = topLessons.map((les, lIdx) => {
            const mat = allMaterials.find((m) => m.lessonId === les.id || m.topicId === top.id);
            const summary = mat?.description || les.description || 'Core syllabus competencies and architectural provisions.';
            let keyPoints: string[] = [];
            if (mat?.content) {
              const bulletLines = mat.content.split('\n').filter((l) => l.trim().startsWith('* ') || l.trim().startsWith('- '));
              if (bulletLines.length > 0) {
                keyPoints = bulletLines.slice(0, 4).map((l) => l.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '').trim());
              }
            }
            if (keyPoints.length === 0) {
              keyPoints = [
                `Definition & Scope: ${les.name}`,
                `Regulatory Standard: Applicable architectural board guidelines & provisions.`,
                `Practice Application: Professional architectural practice & code compliance.`,
              ];
            }

            return {
              id: les.id,
              lessonId: les.id,
              topicId: top.id,
              subjectId: sub.id,
              lessonNumber: les.order || (lIdx + 1),
              title: les.name,
              duration: '10 min',
              summary,
              keyPoints,
            };
          });

          return {
            id: top.id,
            topicId: top.id,
            subjectId: sub.id,
            topicNumber: top.order || (tIdx + 1),
            title: top.name,
            lessons: mappedLessons,
          };
        });

        const iconComponent = AREA_ICONS[sIdx % AREA_ICONS.length] || Landmark;

        return {
          id: sub.id,
          subjectId: sub.id,
          subjectNumber: sub.order || (sIdx + 1),
          title: sub.name,
          area: `Area ${sIdx + 1}`,
          weight: sIdx === 0 ? '30%' : sIdx === 1 ? '30%' : '40%',
          icon: iconComponent,
          topics: mappedTopics,
        };
      });

      setCurriculum(formatted);
    } catch (error) {
      console.error('[useLocalHierarchy] Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const subs = await db
          .select()
          .from(schema.subjects)
          .where(eq(schema.subjects.isPublished, true))
          .orderBy(schema.subjects.order);

        const allTopics = await db
          .select()
          .from(schema.topics)
          .where(eq(schema.topics.isPublished, true))
          .orderBy(schema.topics.order);

        const allLessons = await db
          .select()
          .from(schema.lessons)
          .where(eq(schema.lessons.isPublished, true))
          .orderBy(schema.lessons.order);

        const allMaterials = await db.select().from(schema.materials);

        const formatted: SubjectNote[] = subs.map((sub, sIdx) => {
          const subTopics = allTopics.filter((t) => t.subjectId === sub.id);
          const mappedTopics: Topic[] = subTopics.map((top, tIdx) => {
            const topLessons = allLessons.filter((l) => l.topicId === top.id);
            const mappedLessons: Lesson[] = topLessons.map((les, lIdx) => {
              const mat = allMaterials.find((m) => m.lessonId === les.id || m.topicId === top.id);
              const summary = mat?.description || les.description || 'Core syllabus competencies and architectural provisions.';
              let keyPoints: string[] = [];
              if (mat?.content) {
                const bulletLines = mat.content.split('\n').filter((l) => l.trim().startsWith('* ') || l.trim().startsWith('- '));
                if (bulletLines.length > 0) {
                  keyPoints = bulletLines.slice(0, 4).map((l) => l.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '').trim());
                }
              }
              if (keyPoints.length === 0) {
                keyPoints = [
                  `Definition & Scope: ${les.name}`,
                  `Regulatory Standard: Applicable architectural board guidelines & provisions.`,
                  `Practice Application: Professional architectural practice & code compliance.`,
                ];
              }

              return {
                id: les.id,
                lessonId: les.id,
                topicId: top.id,
                subjectId: sub.id,
                lessonNumber: les.order || (lIdx + 1),
                title: les.name,
                duration: '10 min',
                summary,
                keyPoints,
              };
            });

            return {
              id: top.id,
              topicId: top.id,
              subjectId: sub.id,
              topicNumber: top.order || (tIdx + 1),
              title: top.name,
              lessons: mappedLessons,
            };
          });

          const iconComponent = AREA_ICONS[sIdx % AREA_ICONS.length] || Landmark;

          return {
            id: sub.id,
            subjectId: sub.id,
            subjectNumber: sub.order || (sIdx + 1),
            title: sub.name,
            area: `Area ${sIdx + 1}`,
            weight: sIdx === 0 ? '30%' : sIdx === 1 ? '30%' : '40%',
            icon: iconComponent,
            topics: mappedTopics,
          };
        });

        if (isMounted) {
          setCurriculum(formatted);
        }
      } catch (error) {
        console.error('[useLocalHierarchy] Error fetching hierarchy:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { curriculum, loading, refetch: fetchHierarchy };
}

/**
 * Hook to submit a quiz attempt with zero-trust offline grading
 */
export function useSubmitLocalAttempt() {
  const { syncUp } = useSyncService();

  const submitAttempt = async (
    userId: string,
    quizId: string,
    answers: { questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[]
  ) => {
    try {
      const attemptId = `attempt-loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const nowTimestamp = Date.now();

      let correctAnswers = 0;
      for (const ans of answers) {
        if (ans.correctChoiceHash) {
          const userHash = await crypto.digestStringAsync(
            crypto.CryptoDigestAlgorithm.SHA256,
            `${ans.questionId}:${ans.selectedChoiceId}`
          );
          if (userHash === ans.correctChoiceHash) {
            correctAnswers++;
          }
        }
      }

      const score = answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0;

      await db.insert(schema.quizAttempts).values({
        id: attemptId,
        userId: userId || 'local-student-1',
        quizId,
        status: 'submitted',
        syncStatus: 'pending_sync',
        score,
        correctAnswers,
        totalQuestions: answers.length,
        startedAt: nowTimestamp,
        submittedAt: nowTimestamp,
      });

      for (const ans of answers) {
        await db.insert(schema.quizAnswers).values({
          id: `ans-loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          attemptId,
          questionId: ans.questionId,
          selectedChoiceId: ans.selectedChoiceId,
          answeredAt: nowTimestamp,
        });
      }

      syncUp().catch((e) => console.warn('Background sync failed, will retry later:', e));

      return { attemptId, score, correctAnswers, totalQuestions: answers.length };
    } catch (error) {
      console.error('[useSubmitLocalAttempt] Failed to submit locally', error);
      throw error;
    }
  };

  return submitAttempt;
}

/**
 * Hook to fetch flashcards from local database
 */
export function useLocalFlashcards(subjectId?: string, topicId?: string) {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      let query = db.select().from(schema.flashcards);
      const conditions = [];
      if (subjectId) conditions.push(eq(schema.flashcards.subjectId, subjectId));
      if (topicId) conditions.push(eq(schema.flashcards.topicId, topicId));

      const raw = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

      const subjects = await db.select().from(schema.subjects);
      const topics = await db.select().from(schema.topics);

      const items: FlashcardItem[] = raw.map((fc) => {
        const sub = subjects.find((s) => s.id === fc.subjectId);
        const top = topics.find((t) => t.id === fc.topicId);

        return {
          id: fc.id,
          lessonId: fc.lessonId || 'general',
          subjectTitle: sub?.name || 'Architecture Review',
          topicTitle: top?.name || 'Core Topic',
          lessonTitle: 'Key Concept',
          question: fc.front,
          answer: fc.back,
          explanation: 'Essential review definition and architectural standard.',
          isDifficult: false,
          isFavorite: false,
        };
      });

      setFlashcards(items);
    } catch (error) {
      console.error('[useLocalFlashcards] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, topicId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        let query = db.select().from(schema.flashcards);
        const conditions = [];
        if (subjectId) conditions.push(eq(schema.flashcards.subjectId, subjectId));
        if (topicId) conditions.push(eq(schema.flashcards.topicId, topicId));

        const raw = conditions.length > 0
          ? await query.where(and(...conditions))
          : await query;

        const subjects = await db.select().from(schema.subjects);
        const topics = await db.select().from(schema.topics);

        const items: FlashcardItem[] = raw.map((fc) => {
          const sub = subjects.find((s) => s.id === fc.subjectId);
          const top = topics.find((t) => t.id === fc.topicId);

          return {
            id: fc.id,
            lessonId: fc.lessonId || 'general',
            subjectTitle: sub?.name || 'Architecture Review',
            topicTitle: top?.name || 'Core Topic',
            lessonTitle: 'Key Concept',
            question: fc.front,
            answer: fc.back,
            explanation: 'Essential review definition and architectural standard.',
            isDifficult: false,
            isFavorite: false,
          };
        });

        if (isMounted) {
          setFlashcards(items);
        }
      } catch (error) {
        console.error('[useLocalFlashcards] Error fetching:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [subjectId, topicId]);

  return { flashcards, loading, refetch: fetchFlashcards };
}

/**
 * Hook to fetch questions for practice drills.
 */
export function useLocalQuestions(options?: {
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  specializedType?: string;
  count?: number;
}) {
  const [questions, setQuestions] = useState<typeof schema.questions.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectId = options?.subjectId;
  const topicId = options?.topicId;
  const difficulty = options?.difficulty;
  const specializedType = options?.specializedType;
  const count = options?.count;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let data = await db.select().from(schema.questions);

      if (specializedType) {
        const filtered = data.filter((q) => q.specializedType === specializedType);
        if (filtered.length > 0) {
          data = filtered;
        }
      }

      if (subjectId && subjectId !== 'all') {
        const filteredBySub = data.filter((q) => q.subjectId === subjectId);
        if (filteredBySub.length > 0) {
          data = filteredBySub;
        }
      }
      if (topicId) {
        const filteredByTopic = data.filter((q) => q.topicId === topicId);
        if (filteredByTopic.length > 0) {
          data = filteredByTopic;
        }
      }

      if (difficulty && difficulty !== 'all') {
        const filteredByDiff = data.filter(
          (q) => q.difficulty?.toLowerCase() === difficulty?.toLowerCase()
        );
        if (filteredByDiff.length > 0) {
          data = filteredByDiff;
        }
      }

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const targetCount = count || 10;
      setQuestions(shuffled.slice(0, targetCount));
    } catch (error) {
      console.error('[useLocalQuestions] Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, topicId, difficulty, specializedType, count]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        let data = await db.select().from(schema.questions);

        if (specializedType) {
          const filtered = data.filter((q) => q.specializedType === specializedType);
          if (filtered.length > 0) {
            data = filtered;
          }
        }

        if (subjectId && subjectId !== 'all') {
          const filteredBySub = data.filter((q) => q.subjectId === subjectId);
          if (filteredBySub.length > 0) {
            data = filteredBySub;
          }
        }
        if (topicId) {
          const filteredByTopic = data.filter((q) => q.topicId === topicId);
          if (filteredByTopic.length > 0) {
            data = filteredByTopic;
          }
        }

        if (difficulty && difficulty !== 'all') {
          const filteredByDiff = data.filter(
            (q) => q.difficulty?.toLowerCase() === difficulty?.toLowerCase()
          );
          if (filteredByDiff.length > 0) {
            data = filteredByDiff;
          }
        }

        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const targetCount = count || 10;
        if (isMounted) {
          setQuestions(shuffled.slice(0, targetCount));
        }
      } catch (error) {
        console.error('[useLocalQuestions] Error fetching questions:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [subjectId, topicId, difficulty, specializedType, count]);

  return { questions, loading, refetch: fetchQuestions };
}

/**
 * Hook to fetch quizzes & mock exams from local database.
 */
export function useLocalQuizzes(
  filter?: 'practice' | 'mock_exam' | { type?: 'practice' | 'mock_exam'; specializedType?: string }
) {
  const [quizzes, setQuizzes] = useState<typeof schema.quizzes.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  const filterType = typeof filter === 'string' ? filter : filter?.type;
  const specializedType = typeof filter === 'object' ? filter?.specializedType : undefined;

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const conditions = [];
      if (filterType) conditions.push(eq(schema.quizzes.type, filterType));
      if (specializedType) conditions.push(eq(schema.quizzes.specializedType, specializedType));

      const data = conditions.length > 0
        ? await db.select().from(schema.quizzes).where(and(...conditions))
        : await db.select().from(schema.quizzes);

      setQuizzes(data);
    } catch (error) {
      console.error('[useLocalQuizzes] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, specializedType]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const conditions = [];
        if (filterType) conditions.push(eq(schema.quizzes.type, filterType));
        if (specializedType) conditions.push(eq(schema.quizzes.specializedType, specializedType));

        const data = conditions.length > 0
          ? await db.select().from(schema.quizzes).where(and(...conditions))
          : await db.select().from(schema.quizzes);

        if (isMounted) {
          setQuizzes(data);
        }
      } catch (error) {
        console.error('[useLocalQuizzes] Error fetching:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [filterType, specializedType]);

  return { quizzes, loading, refetch: fetchQuizzes };
}

/**
 * Hook to fetch a single quiz and its questions by ID.
 */
export function useLocalQuizWithQuestions(quizId: string) {
  const [quiz, setQuiz] = useState<typeof schema.quizzes.$inferSelect | null>(null);
  const [questions, setQuestions] = useState<typeof schema.questions.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const quizData = await db
          .select()
          .from(schema.quizzes)
          .where(eq(schema.quizzes.id, quizId))
          .limit(1);

        if (quizData.length > 0 && isMounted) {
          const currentQuiz = quizData[0];
          setQuiz(currentQuiz);

          let qIds: string[] = [];
          if (Array.isArray(currentQuiz.questionIds)) {
            qIds = currentQuiz.questionIds;
          } else if (typeof currentQuiz.questionIds === 'string') {
            try {
              qIds = JSON.parse(currentQuiz.questionIds);
            } catch {
              qIds = [];
            }
          }

          let loadedQuestions: typeof schema.questions.$inferSelect[] = [];
          if (qIds.length > 0) {
            const allQ = await db.select().from(schema.questions);
            loadedQuestions = allQ.filter((q) => qIds.includes(q.id));
          }

          if (loadedQuestions.length === 0) {
            const allQ = await db.select().from(schema.questions);
            if (currentQuiz.subjectId) {
              const subQ = allQ.filter((q) => q.subjectId === currentQuiz.subjectId);
              loadedQuestions = subQ.length > 0 ? subQ : allQ;
            } else {
              loadedQuestions = allQ;
            }
          }

          if (isMounted) {
            setQuestions(loadedQuestions);
          }
        }
      } catch (error) {
        console.error('[useLocalQuizWithQuestions] Error fetching:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  return { quiz, questions, loading };
}

/**
 * Hook to fetch local quiz attempt history.
 */
export function useLocalAttempts() {
  const [attempts, setAttempts] = useState<(typeof schema.quizAttempts.$inferSelect & { quizTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = useCallback(async () => {
    try {
      setLoading(true);
      const rawAttempts = await db
        .select()
        .from(schema.quizAttempts)
        .orderBy(desc(schema.quizAttempts.submittedAt));

      const quizzes = await db.select().from(schema.quizzes);
      const subjects = await db.select().from(schema.subjects);

      const withTitles = rawAttempts.map((att) => {
        const matchedQuiz = quizzes.find((q) => q.id === att.quizId);
        const matchedSub = subjects.find((s) => s.id === att.quizId);
        const quizTitle = matchedQuiz?.title || (matchedSub ? `${matchedSub.name} Drill` : (att.quizId === 'all-modular' ? 'All Subjects Practice Drill' : 'Practice Drill'));
        return {
          ...att,
          quizTitle,
        };
      });

      setAttempts(withTitles);
    } catch (error) {
      console.error('[useLocalAttempts] Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const rawAttempts = await db
          .select()
          .from(schema.quizAttempts)
          .orderBy(desc(schema.quizAttempts.submittedAt));

        const quizzes = await db.select().from(schema.quizzes);
        const subjects = await db.select().from(schema.subjects);

        const withTitles = rawAttempts.map((att) => {
          const matchedQuiz = quizzes.find((q) => q.id === att.quizId);
          const matchedSub = subjects.find((s) => s.id === att.quizId);
          const quizTitle = matchedQuiz?.title || (matchedSub ? `${matchedSub.name} Drill` : (att.quizId === 'all-modular' ? 'All Subjects Practice Drill' : 'Practice Drill'));
          return {
            ...att,
            quizTitle,
          };
        });

        if (isMounted) {
          setAttempts(withTitles);
        }
      } catch (error) {
        console.error('[useLocalAttempts] Error fetching attempts:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { attempts, loading, refetch: fetchAttempts };
}

/**
 * Hook to compute live statistics (progress percentage, average score, quizzes count).
 */
export function useLocalStats() {
  const [stats, setStats] = useState({
    progressPercentage: 0,
    completedQuizzes: 0,
    averageScore: 0,
    streakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [allLessons, completedProgress, attempts, streaks] = await Promise.all([
        db.select().from(schema.lessons).where(eq(schema.lessons.isPublished, true)),
        db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.isCompleted, true)),
        db.select().from(schema.quizAttempts),
        db.select().from(schema.userStreaks),
      ]);

      const totalLessons = allLessons.length;
      const completedCount = completedProgress.length;
      const progressPercentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      const completedQuizzes = attempts.length;
      const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const averageScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;

      let streakDays = 0;
      if (streaks.length > 0 && streaks[0].currentStreak > 0) {
        streakDays = streaks[0].currentStreak;
      } else if (attempts.length > 0 || completedProgress.length > 0) {
        streakDays = 1;
      }

      setStats({
        progressPercentage,
        completedQuizzes,
        averageScore,
        streakDays,
      });
    } catch (e) {
      console.warn('Failed to compute stats:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export type LocalAchievementItem = typeof schema.achievements.$inferSelect & {
  isUnlocked: boolean;
  progressText: string;
};

/**
 * Hook to fetch local achievements with real-time unlocked state.
 */
export function useLocalAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<LocalAchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const [allAch, userAch, attempts, progress, streaks] = await Promise.all([
        db
          .select()
          .from(schema.achievements)
          .where(eq(schema.achievements.isPublished, true))
          .orderBy(schema.achievements.order),
        userId
          ? db.select().from(schema.userAchievements).where(eq(schema.userAchievements.userId, userId))
          : db.select().from(schema.userAchievements),
        userId
          ? db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, userId))
          : db.select().from(schema.quizAttempts),
        db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.isCompleted, true)),
        userId
          ? db.select().from(schema.userStreaks).where(eq(schema.userStreaks.userId, userId))
          : db.select().from(schema.userStreaks),
      ]);

      const currentStreak = streaks.length > 0 ? streaks[0].currentStreak : (attempts.length > 0 ? 1 : 0);

      const mapped = allAch.map((ach) => {
        const uRec = userAch.find(
          (ua) => ua.achievementId === ach.id || ua.achievementId === ach.convexId
        );
        let isUnlocked = uRec?.isUnlocked || false;
        let currentVal = uRec?.progress || 0;

        // Dynamic heuristic calculation if not manually recorded
        if (!isUnlocked) {
          if (ach.criteriaType === 'streak') {
            currentVal = currentStreak;
            if (currentVal >= ach.targetValue) isUnlocked = true;
          } else if (
            ach.criteriaType === 'quiz_count' ||
            ach.criteriaType === 'flashcard_decks'
          ) {
            currentVal = attempts.length;
            if (currentVal >= ach.targetValue) isUnlocked = true;
          } else if (ach.criteriaType === 'perfect_score') {
            const hasPerfect = attempts.some((att) => (att.score || 0) >= 100);
            currentVal = hasPerfect ? 1 : 0;
            if (hasPerfect) isUnlocked = true;
          } else if (
            ach.criteriaType === 'area1_exam' ||
            ach.criteriaType === 'rule7_8'
          ) {
            const passed = attempts.some((att) => (att.score || 0) >= 75);
            currentVal = passed ? 1 : 0;
            if (passed) isUnlocked = true;
          }
        }

        const progressText = isUnlocked
          ? 'Unlocked'
          : `${Math.min(currentVal, ach.targetValue)}/${ach.targetValue} Done`;

        return {
          ...ach,
          isUnlocked,
          progressText,
        };
      });

      setAchievements(mapped);
    } catch (err) {
      console.warn('[useLocalAchievements] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { achievements, loading, refetch: fetchAchievements };
}

/**
 * Hook to fetch study streak data.
 */
export function useUserStreak() {
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; lastActiveDate?: string }>({
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await db.select().from(schema.userStreaks);
      if (rows.length > 0) {
        setStreak({
          currentStreak: rows[0].currentStreak,
          longestStreak: rows[0].longestStreak,
          lastActiveDate: rows[0].lastActiveDate,
        });
      } else {
        const attempts = await db.select().from(schema.quizAttempts);
        setStreak({
          currentStreak: attempts.length > 0 ? 1 : 0,
          longestStreak: attempts.length > 0 ? 1 : 0,
        });
      }
    } catch (e) {
      console.warn('[useUserStreak] Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, loading, refetch: fetchStreak };
}

/**
 * Hook to manage persistent lesson completion progress stored in SQLite.
 */
export function useLessonProgress() {
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const records = await db
        .select()
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.isCompleted, true));

      setCompletedLessonIds(new Set(records.map((r) => r.lessonId)));
    } catch (error) {
      console.warn('[useLessonProgress] Error fetching lesson progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLessonCompleted = useCallback(async (lessonId: string) => {
    try {
      let isNowCompleted = true;
      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) {
          next.delete(lessonId);
          isNowCompleted = false;
        } else {
          next.add(lessonId);
          isNowCompleted = true;
        }
        return next;
      });

      await db
        .insert(schema.lessonProgress)
        .values({
          id: `lp_${lessonId}`,
          lessonId,
          isCompleted: isNowCompleted,
          completedAt: Date.now(),
          syncStatus: 'pending_sync',
        })
        .onConflictDoUpdate({
          target: schema.lessonProgress.lessonId,
          set: {
            isCompleted: isNowCompleted,
            completedAt: Date.now(),
            syncStatus: 'pending_sync',
          },
        });
    } catch (error) {
      console.error('[useLessonProgress] Error toggling lesson progress:', error);
      fetchProgress();
    }
  }, [fetchProgress]);

  const markLessonCompleted = useCallback(async (lessonId: string) => {
    try {
      setCompletedLessonIds((prev) => new Set([...prev, lessonId]));

      await db
        .insert(schema.lessonProgress)
        .values({
          id: `lp_${lessonId}`,
          lessonId,
          isCompleted: true,
          completedAt: Date.now(),
          syncStatus: 'pending_sync',
        })
        .onConflictDoUpdate({
          target: schema.lessonProgress.lessonId,
          set: {
            isCompleted: true,
            completedAt: Date.now(),
            syncStatus: 'pending_sync',
          },
        });
    } catch (error) {
      console.error('[useLessonProgress] Error marking lesson completed:', error);
      fetchProgress();
    }
  }, [fetchProgress]);

  useEffect(() => {
    const handleProgressChange = () => {
      queueMicrotask(() => {
        fetchProgress();
      });
    };

    handleProgressChange();
    const unsubscribe = subscribeLessonProgressChanged(handleProgressChange);
    return () => {
      unsubscribe();
    };
  }, [fetchProgress]);

  const isCompleted = useCallback((lessonId: string) => completedLessonIds.has(lessonId), [completedLessonIds]);

  return {
    completedLessonIds,
    toggleLessonCompleted,
    markLessonCompleted,
    isCompleted,
    loading,
    refetch: fetchProgress,
  };
}


