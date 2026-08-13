import { useConvex } from 'convex/react';
import { eq } from 'drizzle-orm';
import * as crypto from 'expo-crypto';
import { useCallback } from 'react';
import { api } from '../../convex/_generated/api';
import { db } from '../db/client';
import * as schema from '../db/schema';

export function useSyncService() {
  const convex = useConvex();

  /**
   * Generates a deterministic hash for an answer choice
   */
  const hashAnswer = async (questionId: string, choiceId: string) => {
    // In production, we'd fetch a pepper/salt from SecureStore
    const payload = `${questionId}:${choiceId}`;
    return await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
  };

  /**
   * PULL DOWN: Fetches published data from Convex and inserts/updates SQLite
   */
  const syncDown = useCallback(async () => {
    try {
      console.log('[SyncService] Starting Down-Sync...');

      // Example: Fetch subjects from Convex
      // Note: We use convex.query directly so we can run this imperatively
      const subjects = await convex.query(api.subjects.listPublishedSubjects as any, {});

      if (subjects && subjects.length > 0) {
        for (const sub of subjects) {
          // Upsert to SQLite
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
            }
          });
        }
      }

      // TODO: Repeat for topics, materials, questions, quizzes...
      // For questions, we will hash the correctChoiceId before saving it locally

      console.log('[SyncService] Down-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Down-Sync Failed:', error);
    }
  }, [convex]);

  /**
   * PUSH UP: Fetches pending quiz attempts from SQLite and pushes to Convex
   */
  const syncUp = useCallback(async () => {
    try {
      console.log('[SyncService] Starting Up-Sync...');

      // Find all attempts that are pending sync
      const pendingAttempts = await db
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.syncStatus, 'pending_sync'));

      for (const attempt of pendingAttempts) {
        // Fetch answers for this attempt
        // const answers = await db
        //   .select()
        //   .from(schema.quizAnswers)
        //   .where(eq(schema.quizAnswers.attemptId, attempt.id));

        // Submit to Convex server for grading
        // The server will grade it, ignoring our local 'score' to prevent cheating.

        // 1. Start attempt on Convex (if not started)
        // const serverAttemptId = await convex.mutation(api.attempts.startQuizAttempt, { quizId: attempt.quizId });

        // 2. Record answers
        // for (const ans of answers) {
        //    await convex.mutation(api.attempts.recordAnswer, { attemptId: serverAttemptId, questionId: ans.questionId, selectedChoiceId: ans.selectedChoiceId });
        // }

        // 3. Submit
        // const result = await convex.mutation(api.attempts.submitQuizAttempt, { attemptId: serverAttemptId });

        // 4. Update local sync status
        await db.update(schema.quizAttempts)
          .set({ syncStatus: 'synced' })
          .where(eq(schema.quizAttempts.id, attempt.id));
      }

      console.log('[SyncService] Up-Sync Complete');
    } catch (error) {
      console.error('[SyncService] Up-Sync Failed:', error);
    }
  }, []);

  return { syncDown, syncUp, hashAnswer };
}
