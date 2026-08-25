import { useConvex } from 'convex/react';
import { eq } from 'drizzle-orm';
import * as crypto from 'expo-crypto';
import { useCallback, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { db } from '../db/client';
import * as schema from '../db/schema';

export function useSyncService() {
  const convex = useConvex();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  /**
   * Generates a deterministic hash for an answer choice
   */
  const hashAnswer = useCallback(async (questionId: string, choiceId: string) => {
    const payload = `${questionId}:${choiceId}`;
    return await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
  }, []);

  /**
   * PULL DOWN: Fetches published subjects, topics, materials, flashcards, questions, and quizzes
   * from Convex and upserts them into the local SQLite database.
   */
  const syncDown = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      console.log('[SyncService] Starting Down-Sync...');

      // 1. Fetch published subjects
      const subjects = await convex.query(api.subjects.listPublishedSubjects as any, {});

      if (subjects && subjects.length > 0) {
        for (const sub of subjects) {
          await db.insert(schema.subjects).values({
            id: sub._id,
            convexId: sub._id,
            name: sub.name,
            description: sub.description,
            isPublished: sub.isPublished,
            order: sub.order,
          }).onConflictDoUpdate({
            target: schema.subjects.id,
            set: {
              name: sub.name,
              description: sub.description,
              isPublished: sub.isPublished,
              order: sub.order,
            },
          });

          // 2. Fetch topics under subject
          const topics = await convex.query(api.topics.listTopicsBySubject as any, {
            subjectId: sub._id,
          });

          if (topics && topics.length > 0) {
            for (const top of topics) {
              await db.insert(schema.topics).values({
                id: top._id,
                convexId: top._id,
                subjectId: sub._id,
                name: top.name,
                description: top.description,
                order: top.order,
                isPublished: top.isPublished,
              }).onConflictDoUpdate({
                target: schema.topics.id,
                set: {
                  name: top.name,
                  description: top.description,
                  order: top.order,
                  isPublished: top.isPublished,
                },
              });

              // Fetch lessons under topic
              const topicLessons = await convex.query(api.lessons.listLessonsByTopic as any, {
                topicId: top._id,
              });

              if (topicLessons && topicLessons.length > 0) {
                for (const les of topicLessons) {
                  await db.insert(schema.lessons).values({
                    id: les._id,
                    convexId: les._id,
                    subjectId: sub._id,
                    topicId: top._id,
                    name: les.name,
                    description: les.description,
                    order: les.order,
                    isPublished: les.isPublished,
                  }).onConflictDoUpdate({
                    target: schema.lessons.id,
                    set: {
                      name: les.name,
                      description: les.description,
                      order: les.order,
                      isPublished: les.isPublished,
                    },
                  });
                }
              }
              const topicMaterials = await convex.query(api.materials.listMaterialsByTopic as any, {
                topicId: top._id,
              });
              if (topicMaterials && topicMaterials.length > 0) {
                for (const mat of topicMaterials) {
                  await db.insert(schema.materials).values({
                    id: mat._id,
                    convexId: mat._id,
                    subjectId: sub._id,
                    topicId: top._id,
                    title: mat.title,
                    description: mat.description,
                    type: mat.type,
                    content: mat.content,
                  }).onConflictDoUpdate({
                    target: schema.materials.id,
                    set: {
                      title: mat.title,
                      description: mat.description,
                      type: mat.type,
                      content: mat.content,
                    },
                  });
                }
              }

              // Fetch flashcards by topic
              const topicFlashcards = await convex.query(api.flashcards.getFlashcardsByTopic as any, {
                topicId: top._id,
              });
              if (topicFlashcards && topicFlashcards.length > 0) {
                for (const card of topicFlashcards) {
                  await db.insert(schema.flashcards).values({
                    id: card._id,
                    convexId: card._id,
                    subjectId: sub._id,
                    topicId: top._id,
                    front: card.front,
                    back: card.back,
                  }).onConflictDoUpdate({
                    target: schema.flashcards.id,
                    set: {
                      front: card.front,
                      back: card.back,
                    },
                  });
                }
              }

              // Fetch questions by topic
              const topicQuestions = await convex.query(api.questions.listQuestionsByTopic as any, {
                topicId: top._id,
              });
              if (topicQuestions && topicQuestions.length > 0) {
                for (const q of topicQuestions) {
                  const correctChoiceHash = q.correctChoiceId
                    ? await hashAnswer(q._id, q.correctChoiceId)
                    : undefined;

                  await db.insert(schema.questions).values({
                    id: q._id,
                    convexId: q._id,
                    subjectId: sub._id,
                    topicId: top._id,
                    question: q.question,
                    choices: q.choices,
                    correctChoiceHash,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                  }).onConflictDoUpdate({
                    target: schema.questions.id,
                    set: {
                      question: q.question,
                      choices: q.choices,
                      correctChoiceHash,
                      explanation: q.explanation,
                      difficulty: q.difficulty,
                    },
                  });
                }
              }
            }
          }

          // 3. Fetch questions by subject
          const subjectQuestions = await convex.query(api.questions.listQuestionsBySubject as any, {
            subjectId: sub._id,
          });
          if (subjectQuestions && subjectQuestions.length > 0) {
            for (const q of subjectQuestions) {
              const correctChoiceHash = q.correctChoiceId
                ? await hashAnswer(q._id, q.correctChoiceId)
                : undefined;

              await db.insert(schema.questions).values({
                id: q._id,
                convexId: q._id,
                subjectId: sub._id,
                topicId: q.topicId,
                question: q.question,
                choices: q.choices,
                correctChoiceHash,
                explanation: q.explanation,
                difficulty: q.difficulty,
              }).onConflictDoUpdate({
                target: schema.questions.id,
                set: {
                  question: q.question,
                  choices: q.choices,
                  correctChoiceHash,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                },
              });
            }
          }

          // 4. Fetch flashcards by subject
          const subjectFlashcards = await convex.query(api.flashcards.getFlashcardsBySubject as any, {
            subjectId: sub._id,
          });
          if (subjectFlashcards && subjectFlashcards.length > 0) {
            for (const card of subjectFlashcards) {
              await db.insert(schema.flashcards).values({
                id: card._id,
                convexId: card._id,
                subjectId: sub._id,
                topicId: card.topicId,
                front: card.front,
                back: card.back,
              }).onConflictDoUpdate({
                target: schema.flashcards.id,
                set: {
                  front: card.front,
                  back: card.back,
                },
              });
            }
          }
        }
      }

      // 5. Fetch published quizzes
      const quizzesResult = await convex.query(api.quizzes.listQuizzes as any, {
        paginationOpts: { numItems: 50, cursor: null },
      });
      if (quizzesResult && quizzesResult.page && quizzesResult.page.length > 0) {
        for (const quiz of quizzesResult.page) {
          await db.insert(schema.quizzes).values({
            id: quiz._id,
            convexId: quiz._id,
            title: quiz.title,
            description: quiz.description,
            type: quiz.type,
            subjectId: quiz.subjectId,
            topicId: quiz.topicId,
            questionIds: quiz.questionIds,
            timeLimitSeconds: quiz.timeLimitSeconds,
            passingScore: quiz.passingScore,
          }).onConflictDoUpdate({
            target: schema.quizzes.id,
            set: {
              title: quiz.title,
              description: quiz.description,
              type: quiz.type,
              subjectId: quiz.subjectId,
              topicId: quiz.topicId,
              questionIds: quiz.questionIds,
              timeLimitSeconds: quiz.timeLimitSeconds,
              passingScore: quiz.passingScore,
            },
          });
        }
      }

      setLastSyncedAt(new Date());
      console.log('[SyncService] Down-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Down-Sync Failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown down-sync error');
    } finally {
      setIsSyncing(false);
    }
  }, [convex, hashAnswer]);

  /**
   * PUSH UP: Fetches pending quiz attempts and answers from SQLite and pushes to Convex
   */
  const syncUp = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      console.log('[SyncService] Starting Up-Sync...');

      const pendingAttempts = await db
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.syncStatus, 'pending_sync'));

      for (const attempt of pendingAttempts) {
        // Query recorded answers for this attempt
        const answers = await db
          .select()
          .from(schema.quizAnswers)
          .where(eq(schema.quizAnswers.attemptId, attempt.id));

        try {
          // 1. Start attempt on Convex
          const serverAttemptId = await convex.mutation(api.attempts.startQuizAttempt as any, {
            quizId: attempt.quizId,
          });

          // 2. Record each answer choice
          for (const ans of answers) {
            if (ans.selectedChoiceId) {
              await convex.mutation(api.attempts.recordAnswer as any, {
                attemptId: serverAttemptId,
                questionId: ans.questionId,
                selectedChoiceId: ans.selectedChoiceId,
              });
            }
          }

          // 3. Finalize attempt on Convex if marked submitted
          if (attempt.status === 'submitted') {
            await convex.mutation(api.attempts.submitQuizAttempt as any, {
              attemptId: serverAttemptId,
            });
          }

          // 4. Update local SQLite record status to synced
          await db.update(schema.quizAttempts)
            .set({
              syncStatus: 'synced',
              convexId: serverAttemptId,
            })
            .where(eq(schema.quizAttempts.id, attempt.id));
        } catch (attemptError) {
          console.warn(`[SyncService] Failed to sync attempt ${attempt.id}:`, attemptError);
        }
      }

      setLastSyncedAt(new Date());
      console.log('[SyncService] Up-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Up-Sync Failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown up-sync error');
    } finally {
      setIsSyncing(false);
    }
  }, [convex]);

  const syncAll = useCallback(async () => {
    await syncUp();
    await syncDown();
  }, [syncUp, syncDown]);

  return {
    syncDown,
    syncUp,
    syncAll,
    hashAnswer,
    isSyncing,
    syncError,
    lastSyncedAt,
  };
}
