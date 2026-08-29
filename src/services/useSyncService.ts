import { useConvex } from 'convex/react';
import { eq } from 'drizzle-orm';
import * as crypto from 'expo-crypto';
import { useCallback, useState, useRef } from 'react';
import { api } from '../../convex/_generated/api';
import { db } from '../db/client';
import * as schema from '../db/schema';

export interface SyncProgress {
  percentage: number;
  message: string;
  step: 'idle' | 'subjects' | 'topics' | 'flashcards' | 'quizzes' | 'attempts' | 'complete' | 'error';
}

export function useSyncService() {
  const convex = useConvex();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    percentage: 0,
    message: 'Ready',
    step: 'idle',
  });
  
  // Mutex locks to prevent concurrent runs of down-sync and up-sync
  const syncDownInProgressRef = useRef(false);
  const syncUpInProgressRef = useRef(false);

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
    if (syncDownInProgressRef.current) {
      console.log('[SyncService] Down-sync already in progress, skipping.');
      return;
    }
    syncDownInProgressRef.current = true;
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncProgress({
        percentage: 15,
        message: 'Connecting to Convex Cloud...',
        step: 'subjects',
      });
      console.log('[SyncService] Starting Down-Sync...');

      // 1. Fetch published subjects
      const subjects = await convex.query(api.subjects.listPublishedSubjects as any, {});

      if (subjects && subjects.length > 0) {
        for (let i = 0; i < subjects.length; i++) {
          const sub = subjects[i];
          const pct = 25 + Math.round(((i + 1) / subjects.length) * 35);
          setSyncProgress({
            percentage: pct,
            message: `Syncing ${sub.name || 'Subject'} (${i + 1}/${subjects.length})...`,
            step: 'topics',
          });

          try {
            await db.insert(schema.subjects).values({
              id: sub._id,
              convexId: sub._id,
              name: sub.name,
              description: sub.description || null,
              isPublished: sub.isPublished ?? true,
              order: sub.order || 0,
            }).onConflictDoUpdate({
              target: schema.subjects.id,
              set: {
                name: sub.name,
                description: sub.description || null,
                isPublished: sub.isPublished ?? true,
                order: sub.order || 0,
              },
            });
          } catch (e) {
            console.warn('[SyncService] Failed to upsert subject:', sub._id, e);
          }

          // 2. Fetch branches under subject
          try {
            const branches = await convex.query((api.branches as any).listBranchesBySubject, {
              subjectId: sub._id,
            });

            if (branches && branches.length > 0) {
              for (const br of branches) {
                await db.insert(schema.branches).values({
                  id: br._id,
                  convexId: br._id,
                  subjectId: sub._id,
                  name: br.name,
                  description: br.description || null,
                  order: br.order || 0,
                  isPublished: br.isPublished ?? true,
                }).onConflictDoUpdate({
                  target: schema.branches.id,
                  set: {
                    name: br.name,
                    description: br.description || null,
                    order: br.order || 0,
                    isPublished: br.isPublished ?? true,
                  },
                });
              }
            }
          } catch {
            // Optional branches
          }

          // 3. Fetch topics under subject
          try {
            const topics = await convex.query(api.topics.listTopicsBySubject as any, {
              subjectId: sub._id,
            });

            if (topics && topics.length > 0) {
              for (const top of topics) {
                await db.insert(schema.topics).values({
                  id: top._id,
                  convexId: top._id,
                  subjectId: sub._id,
                  branchId: top.branchId || null,
                  name: top.name,
                  description: top.description || null,
                  order: top.order || 0,
                  isPublished: top.isPublished ?? true,
                }).onConflictDoUpdate({
                  target: schema.topics.id,
                  set: {
                    name: top.name,
                    description: top.description || null,
                    order: top.order || 0,
                    isPublished: top.isPublished ?? true,
                  },
                });

                // Fetch lessons under topic
                try {
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
                        branchId: les.branchId || null,
                        name: les.name,
                        description: les.description || null,
                        order: les.order || 0,
                        isPublished: les.isPublished ?? true,
                      }).onConflictDoUpdate({
                        target: schema.lessons.id,
                        set: {
                          name: les.name,
                          description: les.description || null,
                          order: les.order || 0,
                          isPublished: les.isPublished ?? true,
                        },
                      });
                    }
                  }
                } catch {
                  console.warn('[SyncService] Failed lessons sync');
                }

                // Fetch materials by topic
                try {
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
                        branchId: mat.branchId || null,
                        lessonId: mat.lessonId || null,
                        title: mat.title,
                        description: mat.description || null,
                        type: mat.type || 'article',
                        content: mat.content || null,
                      }).onConflictDoUpdate({
                        target: schema.materials.id,
                        set: {
                          title: mat.title,
                          description: mat.description || null,
                          type: mat.type || 'article',
                          content: mat.content || null,
                        },
                      });
                    }
                  }
                } catch {
                  // Optional materials
                }

                // Fetch flashcards by topic
                try {
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
                        branchId: card.branchId || null,
                        lessonId: card.lessonId || null,
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
                } catch {
                  // Optional flashcards
                }

                // Fetch questions by topic
                try {
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
                        branchId: q.branchId || null,
                        lessonId: q.lessonId || null,
                        question: q.question,
                        choices: q.choices,
                        correctChoiceHash,
                        explanation: q.explanation || null,
                        difficulty: q.difficulty || 'medium',
                      }).onConflictDoUpdate({
                        target: schema.questions.id,
                        set: {
                          question: q.question,
                          choices: q.choices,
                          correctChoiceHash,
                          explanation: q.explanation || null,
                          difficulty: q.difficulty || 'medium',
                        },
                      });
                    }
                  }
                } catch {
                  // Optional questions
                }
              }
            }
          } catch {
            console.warn('[SyncService] Failed topics sync for subject:', sub._id);
          }

          // 4. Fetch questions by subject
          try {
            const subjectQuestions = await convex.query(api.questions.listQuestionsBySubject as any, {
              subjectId: sub._id,
            });
            console.log(`[SyncService] Subject ${sub.name || sub._id} returned ${subjectQuestions?.length ?? 0} questions`);
            if (subjectQuestions && subjectQuestions.length > 0) {
              for (const q of subjectQuestions) {
                const correctChoiceHash = q.correctChoiceId
                  ? await hashAnswer(q._id, q.correctChoiceId)
                  : undefined;

                await db.insert(schema.questions).values({
                  id: q._id,
                  convexId: q._id,
                  subjectId: sub._id,
                  topicId: q.topicId || null,
                  branchId: q.branchId || null,
                  lessonId: q.lessonId || null,
                  question: q.question,
                  choices: q.choices,
                  correctChoiceHash,
                  explanation: q.explanation || null,
                  difficulty: q.difficulty || 'medium',
                }).onConflictDoUpdate({
                  target: schema.questions.id,
                  set: {
                    question: q.question,
                    choices: q.choices,
                    correctChoiceHash,
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || 'medium',
                  },
                });
              }
            }
          } catch {
            console.warn('[SyncService] Questions sync notice for subject:', sub._id);
          }

          // 5. Fetch flashcards by subject
          try {
            const subjectFlashcards = await convex.query(api.flashcards.getFlashcardsBySubject as any, {
              subjectId: sub._id,
            });
            if (subjectFlashcards && subjectFlashcards.length > 0) {
              for (const card of subjectFlashcards) {
                await db.insert(schema.flashcards).values({
                  id: card._id,
                  convexId: card._id,
                  subjectId: sub._id,
                  topicId: card.topicId || null,
                  branchId: card.branchId || null,
                  lessonId: card.lessonId || null,
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
          } catch {
            // Optional subject flashcards
          }
        }
      }

      // 6. Fetch published quizzes
      setSyncProgress({
        percentage: 65,
        message: 'Downloading Quizzes & Mock Exams...',
        step: 'quizzes',
      });

      try {
        const quizzesResult = await convex.query(api.quizzes.listQuizzes as any, {
          paginationOpts: { numItems: 100, cursor: null },
        });
        const quizzesList = quizzesResult?.page || [];
        console.log(`[SyncService] Fetched ${quizzesList.length} quizzes from Convex`);
        if (quizzesList.length > 0) {
          for (const quiz of quizzesList) {
            await db.insert(schema.quizzes).values({
              id: quiz._id,
              convexId: quiz._id,
              title: quiz.title,
              description: quiz.description || null,
              type: quiz.type || 'practice',
              subjectId: quiz.subjectId || null,
              branchId: quiz.branchId || null,
              topicId: quiz.topicId || null,
              lessonId: quiz.lessonId || null,
              questionIds: quiz.questionIds || [],
              timeLimitSeconds: quiz.timeLimitSeconds || null,
              passingScore: quiz.passingScore || null,
            }).onConflictDoUpdate({
              target: schema.quizzes.id,
              set: {
                title: quiz.title,
                description: quiz.description || null,
                type: quiz.type || 'practice',
                subjectId: quiz.subjectId || null,
                branchId: quiz.branchId || null,
                topicId: quiz.topicId || null,
                lessonId: quiz.lessonId || null,
                questionIds: quiz.questionIds || [],
                timeLimitSeconds: quiz.timeLimitSeconds || null,
                passingScore: quiz.passingScore || null,
              },
            });

            // Ingest questions attached to this quiz
            try {
              const quizDetails = await convex.query(api.quizzes.getQuizWithQuestions as any, {
                quizId: quiz._id,
              });
              if (quizDetails && quizDetails.questions && quizDetails.questions.length > 0) {
                console.log(`[SyncService] Ingested ${quizDetails.questions.length} questions from quiz "${quiz.title}"`);
                for (const q of quizDetails.questions) {
                  const correctChoiceHash = q.correctChoiceId
                    ? await hashAnswer(q._id, q.correctChoiceId)
                    : undefined;

                  await db.insert(schema.questions).values({
                    id: q._id,
                    convexId: q._id,
                    subjectId: q.subjectId || quiz.subjectId || 'general',
                    topicId: q.topicId || null,
                    branchId: q.branchId || null,
                    lessonId: q.lessonId || null,
                    question: q.question,
                    choices: q.choices,
                    correctChoiceHash,
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || 'medium',
                  }).onConflictDoUpdate({
                    target: schema.questions.id,
                    set: {
                      question: q.question,
                      choices: q.choices,
                      correctChoiceHash,
                      explanation: q.explanation || null,
                      difficulty: q.difficulty || 'medium',
                    },
                  });
                }
              }
            } catch (qErr) {
              console.warn('[SyncService] Notice fetching questions for quiz:', quiz.title, qErr);
            }
          }
        }
      } catch (e) {
        console.warn('[SyncService] Quizzes sync warning:', e);
      }

      setLastSyncedAt(new Date());
      setSyncProgress({
        percentage: 85,
        message: 'Curriculum & questions saved.',
        step: 'quizzes',
      });
      console.log('[SyncService] Down-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Down-Sync Failed:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown down-sync error';
      setSyncError(errMsg);
      setSyncProgress({
        percentage: 100,
        message: errMsg,
        step: 'error',
      });
    } finally {
      setIsSyncing(false);
      syncDownInProgressRef.current = false;
    }
  }, [convex, hashAnswer]);

  /**
   * PUSH UP: Fetches pending quiz attempts and answers from SQLite and pushes to Convex
   */
  const syncUp = useCallback(async () => {
    if (syncUpInProgressRef.current) {
      console.log('[SyncService] Up-sync already in progress, skipping.');
      return;
    }
    syncUpInProgressRef.current = true;
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncProgress({
        percentage: 90,
        message: 'Uploading offline attempts...',
        step: 'attempts',
      });
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
          // If attempt is a local offline drill, resolve locally
          if (attempt.id.startsWith('attempt-loc-') || !attempt.quizId || attempt.quizId.startsWith('area-') || attempt.quizId.startsWith('all-') || attempt.quizId.startsWith('mock-')) {
            await db.update(schema.quizAttempts)
              .set({ syncStatus: 'synced' })
              .where(eq(schema.quizAttempts.id, attempt.id));
            continue;
          }

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
      setSyncProgress({
        percentage: 100,
        message: 'All data synchronized successfully!',
        step: 'complete',
      });
      console.log('[SyncService] Up-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Up-Sync Failed:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown up-sync error';
      setSyncError(errMsg);
      setSyncProgress({
        percentage: 100,
        message: errMsg,
        step: 'error',
      });
    } finally {
      setIsSyncing(false);
      syncUpInProgressRef.current = false;
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
    syncProgress,
    lastSyncedAt,
  };
}
