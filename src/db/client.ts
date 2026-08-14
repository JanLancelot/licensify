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
    } catch (e) {
      console.warn('Failed to set PRAGMA on SQLite:', e);
    }
  }

  // Ensure tables exist on startup
  expoDb.execSync(`
    PRAGMA foreign_keys = ON;

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

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      name TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      topic_id TEXT REFERENCES topics(id),
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      content TEXT,
      local_file_uri TEXT
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      topic_id TEXT REFERENCES topics(id),
      front TEXT NOT NULL,
      back TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      topic_id TEXT REFERENCES topics(id),
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
      subject_id TEXT REFERENCES subjects(id),
      topic_id TEXT REFERENCES topics(id),
      question_ids TEXT NOT NULL,
      time_limit_seconds INTEGER,
      passing_score INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      convex_id TEXT UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id),
      quiz_id TEXT NOT NULL REFERENCES quizzes(id),
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
      attempt_id TEXT NOT NULL REFERENCES quiz_attempts(id),
      question_id TEXT NOT NULL REFERENCES questions(id),
      selected_choice_id TEXT,
      answered_at INTEGER
    );
  `);

  return expoDb;
}

// Singleton across hot-reloads in development
const globalForDb = globalThis as unknown as {
  __expoDb?: ReturnType<typeof openDatabaseSync>;
  __drizzleDb?: ReturnType<typeof drizzle>;
};

export const expoDb = globalForDb.__expoDb ?? initDatabase();
export const db = globalForDb.__drizzleDb ?? drizzle(expoDb, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__expoDb = expoDb;
  globalForDb.__drizzleDb = db;
}
