import { useEffect, useState, useCallback } from 'react';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import * as crypto from 'expo-crypto';
import { useSyncService } from '../services/useSyncService';

/**
 * Hook to fetch published subjects from the local SQLite database.
 * Falls back to local data if offline.
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
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, loading, refetch: fetchSubjects };
}

/**
 * Hook to submit a quiz attempt locally and queue it for syncing.
 * Provides immediate feedback using cryptographic hashing.
 */
export function useSubmitLocalAttempt() {
  const { hashAnswer, syncUp } = useSyncService();

  const submitAttempt = async (
    userId: string,
    quizId: string,
    answers: { questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[]
  ) => {
    try {
      // 1. Create a local attempt ID
      const attemptId = crypto.randomUUID();

      // 2. Grade locally (Zero-Trust: The server will re-grade this later)
      let correctAnswers = 0;
      for (const answer of answers) {
        if (answer.correctChoiceHash) {
          const userHash = await hashAnswer(answer.questionId, answer.selectedChoiceId);
          if (userHash === answer.correctChoiceHash) {
            correctAnswers++;
          }
        }
      }

      const score = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;

      // 3. Insert the Attempt
      await db.insert(schema.quizAttempts).values({
        id: attemptId,
        userId,
        quizId,
        status: 'submitted',
        syncStatus: 'pending_sync', // IMPORTANT: queued for up-sync
        score,
        correctAnswers,
        totalQuestions: answers.length,
        startedAt: Date.now() - (10 * 60 * 1000), // Mock start time 10 mins ago
        submittedAt: Date.now(),
      });

      // 4. Insert the Answers
      for (const answer of answers) {
        await db.insert(schema.quizAnswers).values({
          id: crypto.randomUUID(),
          attemptId,
          questionId: answer.questionId,
          selectedChoiceId: answer.selectedChoiceId,
          answeredAt: Date.now(),
        });
      }

      // 5. Fire off a background sync up (if online, it will push immediately)
      syncUp().catch((e) => console.warn('Background sync failed, will retry later:', e));

      return { attemptId, score, correctAnswers };
    } catch (error) {
      console.error('[useSubmitLocalAttempt] Failed to submit locally', error);
      throw error;
    }
  };

  return submitAttempt;
}

/**
 * Hook to fetch a single subject.
 */
export function useLocalSubject(subjectId: string) {
  const [subject, setSubject] = useState<typeof schema.subjects.$inferSelect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchSubject = async () => {
      try {
        const data = await db
          .select()
          .from(schema.subjects)
          .where(eq(schema.subjects.id, subjectId))
          .limit(1);
        setSubject(data[0] || null);
      } catch (error) {
        console.error('[useLocalSubject] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  return { subject, loading };
}

/**
 * Hook to fetch topics for a subject.
 */
export function useLocalTopics(subjectId: string) {
  const [topics, setTopics] = useState<typeof schema.topics.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchTopics = async () => {
      try {
        const data = await db
          .select()
          .from(schema.topics)
          .where(
            and(
              eq(schema.topics.subjectId, subjectId),
              eq(schema.topics.isPublished, true)
            )
          )
          .orderBy(schema.topics.order);
        setTopics(data);
      } catch (error) {
        console.error('[useLocalTopics] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [subjectId]);

  return { topics, loading };
}

/**
 * Hook to fetch a single topic.
 */
export function useLocalTopic(topicId: string) {
  const [topic, setTopic] = useState<typeof schema.topics.$inferSelect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;
    const fetchTopic = async () => {
      try {
        const data = await db
          .select()
          .from(schema.topics)
          .where(eq(schema.topics.id, topicId))
          .limit(1);
        setTopic(data[0] || null);
      } catch (error) {
        console.error('[useLocalTopic] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  return { topic, loading };
}

/**
 * Hook to fetch materials for a subject or specific topic.
 */
export function useLocalMaterials(subjectId: string, topicId?: string) {
  const [materials, setMaterials] = useState<typeof schema.materials.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchMaterials = async () => {
      try {
        let conditions = eq(schema.materials.subjectId, subjectId);
        if (topicId) {
          conditions = and(conditions, eq(schema.materials.topicId, topicId))!;
        }
        
        const data = await db
          .select()
          .from(schema.materials)
          .where(conditions);
        setMaterials(data);
      } catch (error) {
        console.error('[useLocalMaterials] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [subjectId, topicId]);

  return { materials, loading };
}

/**
 * Hook to fetch quizzes for a subject or specific topic.
 */
export function useLocalQuizzes(subjectId: string, topicId?: string) {
  const [quizzes, setQuizzes] = useState<typeof schema.quizzes.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchQuizzes = async () => {
      try {
        let conditions = eq(schema.quizzes.subjectId, subjectId);
        if (topicId) {
          conditions = and(conditions, eq(schema.quizzes.topicId, topicId))!;
        }
        
        const data = await db
          .select()
          .from(schema.quizzes)
          .where(conditions);
        setQuizzes(data);
      } catch (error) {
        console.error('[useLocalQuizzes] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [subjectId, topicId]);

  return { quizzes, loading };
}

/**
 * Hook to fetch flashcards for a subject or specific topic.
 */
export function useLocalFlashcards(subjectId: string, topicId?: string) {
  const [flashcards, setFlashcards] = useState<typeof schema.flashcards.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchFlashcards = async () => {
      try {
        let conditions = eq(schema.flashcards.subjectId, subjectId);
        if (topicId) {
          conditions = and(conditions, eq(schema.flashcards.topicId, topicId))!;
        }
        
        const data = await db
          .select()
          .from(schema.flashcards)
          .where(conditions);
        setFlashcards(data);
      } catch (error) {
        console.error('[useLocalFlashcards] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [subjectId, topicId]);

  return { flashcards, loading };
}

/**
 * Hook to fetch a single quiz and its questions.
 */
export function useLocalQuizWithQuestions(quizId: string) {
  const [quiz, setQuiz] = useState<typeof schema.quizzes.$inferSelect | null>(null);
  const [questions, setQuestions] = useState<typeof schema.questions.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const quizData = await db
          .select()
          .from(schema.quizzes)
          .where(eq(schema.quizzes.id, quizId))
          .limit(1);
          
        if (quizData.length > 0) {
          const q = quizData[0];
          setQuiz(q);
          
          let questionIds: string[] = [];
          try {
            questionIds = JSON.parse(q.questionIds as string);
          } catch (e) {
            console.error("Failed to parse questionIds", e);
          }
          
          if (questionIds.length > 0) {
            const qs = await db
              .select()
              .from(schema.questions)
              .where(inArray(schema.questions.id, questionIds));
              
            // Sort questions to match the order in questionIds
            const sortedQs = [...qs].sort((a, b) => {
              return questionIds.indexOf(a.id) - questionIds.indexOf(b.id);
            });
            setQuestions(sortedQs);
          }
        }
      } catch (error) {
        console.error('[useLocalQuizWithQuestions] Error fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  return { quiz, questions, loading };
}
