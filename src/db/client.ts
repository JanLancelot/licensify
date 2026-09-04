import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';
import { Platform } from 'react-native';

function initDatabase() {
  const expoDb = openDatabaseSync('reapp.db');

  // Enable WAL mode & busy timeout on native platforms for fast concurrent access
  if (Platform.OS !== 'web') {
    try {
      expoDb.execSync('PRAGMA journal_mode = WAL;');
      expoDb.execSync('PRAGMA busy_timeout = 5000;');
      expoDb.execSync('PRAGMA foreign_keys = OFF;');
    } catch (e) {
      console.warn('Failed to set PRAGMA on SQLite:', e);
    }
  }

  // Ensure tables exist on startup without strict relational blocking during asynchronous cloud sync
  expoDb.execSync(`
    PRAGMA foreign_keys = OFF;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      branch_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      branch_id TEXT,
      topic_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      branch_id TEXT,
      topic_id TEXT,
      lesson_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      content TEXT,
      local_file_uri TEXT
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      branch_id TEXT,
      topic_id TEXT,
      lesson_id TEXT,
      front TEXT NOT NULL,
      back TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL,
      branch_id TEXT,
      topic_id TEXT,
      lesson_id TEXT,
      question TEXT NOT NULL,
      choices TEXT NOT NULL,
      correct_choice_hash TEXT,
      explanation TEXT,
      difficulty TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      subject_id TEXT,
      branch_id TEXT,
      topic_id TEXT,
      lesson_id TEXT,
      question_ids TEXT NOT NULL,
      time_limit_seconds INTEGER,
      passing_score INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      status TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending_sync',
      score INTEGER,
      correct_answers INTEGER,
      total_questions INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      submitted_at INTEGER,
      signature TEXT
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_choice_id TEXT,
      answered_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS sync_metadata (
      table_name TEXT PRIMARY KEY,
      last_synced_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      lesson_id TEXT UNIQUE NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 1,
      completed_at INTEGER NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending_sync'
    );

    CREATE TABLE IF NOT EXISTS user_presets (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      icon_name TEXT,
      lesson_ids TEXT NOT NULL,
      subject_names TEXT,
      question_count INTEGER,
      time_limit_seconds INTEGER,
      is_shuffled INTEGER DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'pending_sync',
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      bg TEXT,
      dark_bg TEXT,
      icon_color TEXT,
      criteria_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      is_unlocked INTEGER NOT NULL DEFAULT 0,
      unlocked_at INTEGER,
      sync_status TEXT NOT NULL DEFAULT 'pending_sync'
    );

    CREATE TABLE IF NOT EXISTS user_streaks (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT UNIQUE NOT NULL,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending_sync'
    );
  `);

  // Migration fallbacks for existing local SQLite databases
  try {
    expoDb.execSync(`ALTER TABLE lesson_progress ADD COLUMN sync_status TEXT NOT NULL DEFAULT 'pending_sync';`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE lesson_progress ADD COLUMN convex_id TEXT;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE questions ADD COLUMN specialized_type TEXT;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE quizzes ADD COLUMN specialized_type TEXT;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE users ADD COLUMN sound_enabled INTEGER DEFAULT 1;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE users ADD COLUMN daily_reminder INTEGER DEFAULT 1;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE users ADD COLUMN profile_image_id TEXT;`);
  } catch {}
  try {
    expoDb.execSync(`ALTER TABLE users ADD COLUMN profile_image_url TEXT;`);
  } catch {}

  return drizzle(expoDb, { schema });
}



export const db = initDatabase();

