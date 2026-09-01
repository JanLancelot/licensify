import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// 1. USERS & ACCESS
// ---------------------------------------------------------------------------
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // local UUID
  convexId: text('convex_id').unique(), // ID from Convex (if synced)
  userId: text('user_id').notNull(), // Convex auth identifier
  username: text('username').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').notNull(), // 'student', 'admin', 'content_manager'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// ---------------------------------------------------------------------------
// 2. LEARNING CONTENT
// ---------------------------------------------------------------------------
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  name: text('name').notNull(),
  description: text('description'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull().default(0),
});

export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
});

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  branchId: text('branch_id'),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
});

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  branchId: text('branch_id'),
  topicId: text('topic_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
});

export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  branchId: text('branch_id'),
  topicId: text('topic_id'),
  lessonId: text('lesson_id'),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'article', 'pdf', 'image', 'document'
  content: text('content'), // For offline articles
  localFileUri: text('local_file_uri'), 
});

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  branchId: text('branch_id'),
  topicId: text('topic_id'),
  lessonId: text('lesson_id'),
  front: text('front').notNull(),
  back: text('back').notNull(),
});

// ---------------------------------------------------------------------------
// 3. ASSESSMENTS
// ---------------------------------------------------------------------------
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  subjectId: text('subject_id').notNull(),
  branchId: text('branch_id'),
  topicId: text('topic_id'),
  lessonId: text('lesson_id'),
  question: text('question').notNull(),
  
  // JSON serialized string [{ id: "c1", text: "Option A" }, ...]
  choices: text('choices', { mode: 'json' }).notNull(),
  correctChoiceHash: text('correct_choice_hash'),
  explanation: text('explanation'),
  difficulty: text('difficulty').notNull(),
});

export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  subjectId: text('subject_id'),
  branchId: text('branch_id'),
  topicId: text('topic_id'),
  lessonId: text('lesson_id'),
  
  // Stored as JSON string [questionId1, questionId2, ...]
  questionIds: text('question_ids', { mode: 'json' }).notNull(),
  timeLimitSeconds: integer('time_limit_seconds'),
  passingScore: integer('passing_score'),
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  convexId: text('convex_id').unique(),
  userId: text('user_id').notNull(),
  quizId: text('quiz_id').notNull(),
  status: text('status').notNull(), // 'in_progress', 'submitted', 'expired'
  
  // Sync metadata
  syncStatus: text('sync_status').notNull().default('pending_sync'), // 'pending_sync', 'synced'
  
  score: integer('score'), // Local computed score (Convex will re-grade on sync)
  correctAnswers: integer('correct_answers'),
  totalQuestions: integer('total_questions').notNull(),
  
  startedAt: integer('started_at').notNull(),
  submittedAt: integer('submitted_at'),
  
  // Cryptographic signature to detect tampering before up-sync
  signature: text('signature'), 
});

export const quizAnswers = sqliteTable('quiz_answers', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull(),
  questionId: text('question_id').notNull(),
  selectedChoiceId: text('selected_choice_id'),
  
  answeredAt: integer('answered_at'),
});

export const lessonProgress = sqliteTable('lesson_progress', {
  id: text('id').primaryKey(), // local ID e.g. `lp_${lessonId}`
  convexId: text('convex_id').unique(),
  lessonId: text('lesson_id').notNull().unique(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(true),
  completedAt: integer('completed_at').notNull(),
  syncStatus: text('sync_status').notNull().default('pending_sync'), // 'pending_sync', 'synced'
});

// ---------------------------------------------------------------------------
// 4. METADATA
// ---------------------------------------------------------------------------
export const syncMetadata = sqliteTable('sync_metadata', {
  tableName: text('table_name').primaryKey(),
  lastSyncedAt: integer('last_synced_at').notNull(),
});



