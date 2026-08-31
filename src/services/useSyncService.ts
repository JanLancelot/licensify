import { useConvex } from 'convex/react';
import { eq, sql } from 'drizzle-orm';
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

export interface SyncSubjectItem {
  id: string;
  name: string;
  description?: string;
  isPublished?: boolean;
  order?: number;
}

export interface SyncBranchItem {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface SyncTopicItem {
  id: string;
  subjectId: string;
  branchId?: string;
  name: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface SyncLessonItem {
  id: string;
  subjectId: string;
  branchId?: string;
  topicId: string;
  name: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface SyncMaterialItem {
  id: string;
  subjectId: string;
  branchId?: string;
  topicId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  type: string;
  content?: string;
}

export interface SyncFlashcardItem {
  id: string;
  subjectId: string;
  branchId?: string;
  topicId?: string;
  lessonId?: string;
  front: string;
  back: string;
}

export interface SyncQuestionItem {
  id: string;
  subjectId: string;
  branchId?: string;
  topicId?: string;
  lessonId?: string;
  question: string;
  choices: any;
  correctChoiceHash?: string;
  explanation?: string;
  difficulty: string;
  isPublished?: boolean;
}

export interface SyncQuizItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  subjectId?: string;
  branchId?: string;
  topicId?: string;
  lessonId?: string;
  questionIds: any;
  timeLimitSeconds?: number;
  passingScore?: number;
}

export interface SyncBundleResponse {
  upToDate: boolean;
  timestamp: number;
  subjects: SyncSubjectItem[];
  branches: SyncBranchItem[];
  topics: SyncTopicItem[];
  lessons: SyncLessonItem[];
  materials: SyncMaterialItem[];
  flashcards: SyncFlashcardItem[];
  questions: SyncQuestionItem[];
  quizzes: SyncQuizItem[];
}

const CHUNK_SIZE = 50;

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

  // Mutex locks to prevent concurrent runs
  const syncDownInProgressRef = useRef(false);
  const syncUpInProgressRef = useRef(false);

  /**
   * Generates a deterministic hash for an answer choice (kept for backwards-compatibility)
   */
  const hashAnswer = useCallback(async (questionId: string, choiceId: string) => {
    const payload = `${questionId}:${choiceId}`;
    return await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
  }, []);

  /**
   * PULL DOWN (Bulk & Delta Sync):
   * Fetches the entire curriculum dataset in a single network roundtrip from Convex
   * and batch-inserts it into SQLite.
   */
  const syncDown = useCallback(async (forceFull = false) => {
    if (syncDownInProgressRef.current) {
      console.log('[SyncService] Down-sync already in progress, skipping.');
      return;
    }
    syncDownInProgressRef.current = true;

    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncProgress({
        percentage: 10,
        message: 'Connecting to Convex Cloud...',
        step: 'subjects',
      });
      console.log('[SyncService] Starting High-Performance Down-Sync...');

      // 1. Read last synced timestamp from SQLite
      let sinceTimestamp: number | undefined = undefined;
      if (!forceFull) {
        try {
          const meta = await db
            .select()
            .from(schema.syncMetadata)
            .where(eq(schema.syncMetadata.tableName, 'all_data'))
            .limit(1);
          if (meta.length > 0 && meta[0].lastSyncedAt > 0) {
            sinceTimestamp = meta[0].lastSyncedAt;
          }
        } catch {
          // If metadata read fails, proceed with full sync
        }
      }

      setSyncProgress({
        percentage: 25,
        message: 'Fetching curriculum bundle...',
        step: 'topics',
      });

      // 2. Fetch single bulk bundle from Convex (1 network roundtrip)
      const bundle = (await convex.query(api.sync.getSyncBundle as any, {
        sinceTimestamp,
      })) as SyncBundleResponse;

      if (!bundle) {
        throw new Error('No sync bundle received from server.');
      }

      // If server reports data is already up-to-date
      if (bundle.upToDate) {
        console.log('[SyncService] Local database is already up to date (<50ms).');
        setSyncProgress({
          percentage: 100,
          message: 'Database is up to date.',
          step: 'complete',
        });
        setLastSyncedAt(new Date(bundle.timestamp));
        return;
      }

      setSyncProgress({
        percentage: 50,
        message: 'Saving subjects, topics & flashcards...',
        step: 'flashcards',
      });

      // 3. Batch insert Subjects
      if (bundle.subjects && bundle.subjects.length > 0) {
        for (let i = 0; i < bundle.subjects.length; i += CHUNK_SIZE) {
          const chunk = bundle.subjects.slice(i, i + CHUNK_SIZE).map((s: SyncSubjectItem) => ({
            id: s.id,
            convexId: s.id,
            name: s.name,
            description: s.description || null,
            isPublished: s.isPublished ?? true,
            order: s.order || 0,
          }));
          await db
            .insert(schema.subjects)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.subjects.id,
              set: {
                name: sql`excluded.name`,
                description: sql`excluded.description`,
                isPublished: sql`excluded.is_published`,
                order: sql`excluded."order"`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 4. Batch insert Branches
      if (bundle.branches && bundle.branches.length > 0) {
        for (let i = 0; i < bundle.branches.length; i += CHUNK_SIZE) {
          const chunk = bundle.branches.slice(i, i + CHUNK_SIZE).map((b: SyncBranchItem) => ({
            id: b.id,
            convexId: b.id,
            subjectId: b.subjectId,
            name: b.name,
            description: b.description || null,
            order: b.order || 0,
            isPublished: b.isPublished ?? true,
          }));
          await db
            .insert(schema.branches)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.branches.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                name: sql`excluded.name`,
                description: sql`excluded.description`,
                order: sql`excluded."order"`,
                isPublished: sql`excluded.is_published`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 5. Batch insert Topics
      if (bundle.topics && bundle.topics.length > 0) {
        for (let i = 0; i < bundle.topics.length; i += CHUNK_SIZE) {
          const chunk = bundle.topics.slice(i, i + CHUNK_SIZE).map((t: SyncTopicItem) => ({
            id: t.id,
            convexId: t.id,
            subjectId: t.subjectId,
            branchId: t.branchId || null,
            name: t.name,
            description: t.description || null,
            order: t.order || 0,
            isPublished: t.isPublished ?? true,
          }));
          await db
            .insert(schema.topics)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.topics.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                name: sql`excluded.name`,
                description: sql`excluded.description`,
                order: sql`excluded."order"`,
                isPublished: sql`excluded.is_published`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 6. Batch insert Lessons
      if (bundle.lessons && bundle.lessons.length > 0) {
        for (let i = 0; i < bundle.lessons.length; i += CHUNK_SIZE) {
          const chunk = bundle.lessons.slice(i, i + CHUNK_SIZE).map((l: SyncLessonItem) => ({
            id: l.id,
            convexId: l.id,
            subjectId: l.subjectId,
            branchId: l.branchId || null,
            topicId: l.topicId,
            name: l.name,
            description: l.description || null,
            order: l.order || 0,
            isPublished: l.isPublished ?? true,
          }));
          await db
            .insert(schema.lessons)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.lessons.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                topicId: sql`excluded.topic_id`,
                name: sql`excluded.name`,
                description: sql`excluded.description`,
                order: sql`excluded."order"`,
                isPublished: sql`excluded.is_published`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 7. Batch insert Materials
      if (bundle.materials && bundle.materials.length > 0) {
        for (let i = 0; i < bundle.materials.length; i += CHUNK_SIZE) {
          const chunk = bundle.materials.slice(i, i + CHUNK_SIZE).map((m: SyncMaterialItem) => ({
            id: m.id,
            convexId: m.id,
            subjectId: m.subjectId,
            branchId: m.branchId || null,
            topicId: m.topicId || null,
            lessonId: m.lessonId || null,
            title: m.title,
            description: m.description || null,
            type: m.type,
            content: m.content || null,
          }));
          await db
            .insert(schema.materials)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.materials.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                topicId: sql`excluded.topic_id`,
                lessonId: sql`excluded.lesson_id`,
                title: sql`excluded.title`,
                description: sql`excluded.description`,
                type: sql`excluded.type`,
                content: sql`excluded.content`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 8. Batch insert Flashcards
      if (bundle.flashcards && bundle.flashcards.length > 0) {
        for (let i = 0; i < bundle.flashcards.length; i += CHUNK_SIZE) {
          const chunk = bundle.flashcards.slice(i, i + CHUNK_SIZE).map((f: SyncFlashcardItem) => ({
            id: f.id,
            convexId: f.id,
            subjectId: f.subjectId,
            branchId: f.branchId || null,
            topicId: f.topicId || null,
            lessonId: f.lessonId || null,
            front: f.front,
            back: f.back,
          }));
          await db
            .insert(schema.flashcards)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.flashcards.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                topicId: sql`excluded.topic_id`,
                lessonId: sql`excluded.lesson_id`,
                front: sql`excluded.front`,
                back: sql`excluded.back`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      setSyncProgress({
        percentage: 75,
        message: 'Saving question bank & quizzes...',
        step: 'quizzes',
      });

      // 9. Batch insert Questions (with pre-computed hashes from server)
      if (bundle.questions && bundle.questions.length > 0) {
        for (let i = 0; i < bundle.questions.length; i += CHUNK_SIZE) {
          const chunk = bundle.questions.slice(i, i + CHUNK_SIZE).map((q: SyncQuestionItem) => ({
            id: q.id,
            convexId: q.id,
            subjectId: q.subjectId,
            branchId: q.branchId || null,
            topicId: q.topicId || null,
            lessonId: q.lessonId || null,
            question: q.question,
            choices: q.choices,
            correctChoiceHash: q.correctChoiceHash || null,
            explanation: q.explanation || null,
            difficulty: q.difficulty,
          }));
          await db
            .insert(schema.questions)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.questions.id,
              set: {
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                topicId: sql`excluded.topic_id`,
                lessonId: sql`excluded.lesson_id`,
                question: sql`excluded.question`,
                choices: sql`excluded.choices`,
                correctChoiceHash: sql`excluded.correct_choice_hash`,
                explanation: sql`excluded.explanation`,
                difficulty: sql`excluded.difficulty`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 10. Batch insert Quizzes
      if (bundle.quizzes && bundle.quizzes.length > 0) {
        for (let i = 0; i < bundle.quizzes.length; i += CHUNK_SIZE) {
          const chunk = bundle.quizzes.slice(i, i + CHUNK_SIZE).map((qz: SyncQuizItem) => ({
            id: qz.id,
            convexId: qz.id,
            title: qz.title,
            description: qz.description || null,
            type: qz.type,
            subjectId: qz.subjectId || null,
            branchId: qz.branchId || null,
            topicId: qz.topicId || null,
            lessonId: qz.lessonId || null,
            questionIds: qz.questionIds,
            timeLimitSeconds: qz.timeLimitSeconds || null,
            passingScore: qz.passingScore || null,
          }));
          await db
            .insert(schema.quizzes)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.quizzes.id,
              set: {
                title: sql`excluded.title`,
                description: sql`excluded.description`,
                type: sql`excluded.type`,
                subjectId: sql`excluded.subject_id`,
                branchId: sql`excluded.branch_id`,
                topicId: sql`excluded.topic_id`,
                lessonId: sql`excluded.lesson_id`,
                questionIds: sql`excluded.question_ids`,
                timeLimitSeconds: sql`excluded.time_limit_seconds`,
                passingScore: sql`excluded.passing_score`,
                convexId: sql`excluded.convex_id`,
              },
            });
        }
      }

      // 11. Save lastSyncedAt timestamp in SQLite metadata
      await db
        .insert(schema.syncMetadata)
        .values({
          tableName: 'all_data',
          lastSyncedAt: bundle.timestamp,
        })
        .onConflictDoUpdate({
          target: schema.syncMetadata.tableName,
          set: {
            lastSyncedAt: bundle.timestamp,
          },
        });

      setLastSyncedAt(new Date(bundle.timestamp));
      setSyncProgress({
        percentage: 100,
        message: 'Curriculum & question bank synchronized successfully!',
        step: 'complete',
      });
      console.log(`[SyncService] Down-Sync Complete (${bundle.questions?.length ?? 0} questions, ${bundle.flashcards?.length ?? 0} flashcards)`);
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
  }, [convex]);

  /**
   * PUSH UP (Batch Sync):
   * Uploads all pending offline attempts and answers in 1 atomic mutation to Convex.
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
        percentage: 85,
        message: 'Uploading offline attempts...',
        step: 'attempts',
      });
      console.log('[SyncService] Starting Batch Up-Sync...');

      const pendingAttempts = await db
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.syncStatus, 'pending_sync'));

      if (!pendingAttempts || pendingAttempts.length === 0) {
        console.log('[SyncService] No pending attempts to sync.');
        setSyncProgress({
          percentage: 100,
          message: 'All attempts synced.',
          step: 'complete',
        });
        return;
      }

      const validAttemptsToSync: any[] = [];

      for (const attempt of pendingAttempts) {
        // Resolve pure offline custom drills locally
        if (
          attempt.id.startsWith('attempt-loc-') ||
          !attempt.quizId ||
          attempt.quizId.startsWith('area-') ||
          attempt.quizId.startsWith('all-') ||
          attempt.quizId.startsWith('mock-')
        ) {
          await db
            .update(schema.quizAttempts)
            .set({ syncStatus: 'synced' })
            .where(eq(schema.quizAttempts.id, attempt.id));
          continue;
        }

        const answers = await db
          .select()
          .from(schema.quizAnswers)
          .where(eq(schema.quizAnswers.attemptId, attempt.id));

        validAttemptsToSync.push({
          localId: attempt.id,
          quizId: attempt.quizId,
          status: attempt.status,
          score: attempt.score ?? undefined,
          correctAnswers: attempt.correctAnswers ?? undefined,
          totalQuestions: attempt.totalQuestions,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt ?? undefined,
          answers: answers.map((ans) => ({
            questionId: ans.questionId,
            selectedChoiceId: ans.selectedChoiceId ?? undefined,
            answeredAt: ans.answeredAt ?? undefined,
          })),
        });
      }

      if (validAttemptsToSync.length > 0) {
        // Send single batch mutation to Convex
        const result = (await convex.mutation(api.sync.syncAttemptsBatch as any, {
          attempts: validAttemptsToSync as any,
        })) as { synced?: Array<{ localId: string; serverId: string }> };

        if (result && result.synced && result.synced.length > 0) {
          for (const item of result.synced) {
            await db
              .update(schema.quizAttempts)
              .set({
                syncStatus: 'synced',
                convexId: item.serverId,
              })
              .where(eq(schema.quizAttempts.id, item.localId));
          }
          console.log(`[SyncService] Successfully batch-synced ${result.synced.length} attempts to Convex.`);
        }
      }

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
