import * as schema from '@/db/schema';

// Local storage key for persisting web SQLite data
const WEB_DB_STORAGE_KEY = 'reapp_web_sqlite_v1';

// Initial in-memory table store
type TableStore = Record<string, any[]>;

function loadInitialStore(): TableStore {
  const defaultStore: TableStore = {
    users: [],
    subjects: [],
    branches: [],
    topics: [],
    lessons: [],
    materials: [],
    flashcards: [],
    questions: [],
    quizzes: [],
    quiz_attempts: [],
    quiz_answers: [],
    lesson_progress: [],
    user_presets: [],
    achievements: [],
    user_achievements: [],
    user_streaks: [],
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(WEB_DB_STORAGE_KEY);
      if (saved) {
        return { ...defaultStore, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[Licensify Web DB] Failed to load localStorage data:', e);
    }
  }

  return defaultStore;
}

const memoryStore: TableStore = loadInitialStore();

function saveStore() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(WEB_DB_STORAGE_KEY, JSON.stringify(memoryStore));
    } catch (e) {
      console.warn('[Licensify Web DB] Failed to save localStorage data:', e);
    }
  }
}

function resolveTableName(table: any): string {
  if (!table) return 'unknown';
  if (table === schema.users) return 'users';
  if (table === schema.subjects) return 'subjects';
  if (table === schema.branches) return 'branches';
  if (table === schema.topics) return 'topics';
  if (table === schema.lessons) return 'lessons';
  if (table === schema.materials) return 'materials';
  if (table === schema.flashcards) return 'flashcards';
  if (table === schema.questions) return 'questions';
  if (table === schema.quizzes) return 'quizzes';
  if (table === schema.quizAttempts) return 'quiz_attempts';
  if (table === schema.quizAnswers) return 'quiz_answers';
  if (table === schema.lessonProgress) return 'lesson_progress';
  if (table === schema.userPresets) return 'user_presets';
  if (table === schema.achievements) return 'achievements';
  if (table === schema.userAchievements) return 'user_achievements';
  if (table === schema.userStreaks) return 'user_streaks';




  const name =
    table?._?.name ||
    table?.[Symbol.for('drizzle:Name')] ||
    table?._?.config?.name ||
    'unknown';
  return name;
}

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function matchesCondition(item: any, condition: any): boolean {
  if (!condition) return true;

  try {
    const col =
      condition?.column?.name ||
      condition?.column?.key ||
      condition?.left?.name ||
      condition?.left?.key;

    const getItemVal = (c: string) => {
      if (item[c] !== undefined) return item[c];
      const snake = toSnakeCase(c);
      if (item[snake] !== undefined) return item[snake];
      const camel = toCamelCase(c);
      if (item[camel] !== undefined) return item[camel];
      return undefined;
    };

    // 1. Check for inArray condition
    if (condition?.values && Array.isArray(condition.values)) {
      if (col) {
        const itemVal = getItemVal(col);
        if (itemVal !== undefined) {
          const rawValues = condition.values.map((v: any) =>
            v !== null && typeof v === 'object' && 'value' in v ? v.value : v
          );
          return rawValues.includes(itemVal);
        }
        return false;
      }
    }

    // 2. Check for Equality / BinaryOperator (eq)
    const rawRight =
      condition?.right !== undefined
        ? condition?.right?.value !== undefined
          ? condition?.right?.value
          : condition?.right
        : condition?.value !== undefined
          ? condition?.value?.value !== undefined
            ? condition?.value?.value
            : condition?.value
          : undefined;

    if (col && rawRight !== undefined) {
      const itemVal = getItemVal(col);
      return itemVal === rawRight;
    }
  } catch {
    return false;
  }

  return true;
}

/**
 * Creates an intelligent, chainable query builder for Web with in-memory & localStorage persistence
 */
function createWebQueryBuilder(initialData: any = null) {
  let currentTable = '';
  let operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  let insertValues: any[] = [];
  let updateValues: any = {};
  let whereConditions: any[] = [];
  let sortField: string | null = null;
  let sortAsc = true;
  let limitCount: number | null = null;

  const builder: any = {
    select: (_fields?: any) => {
      operation = 'select';
      return builder;
    },

    from: (table: any) => {
      currentTable = resolveTableName(table);
      if (!memoryStore[currentTable]) {
        memoryStore[currentTable] = [];
      }
      return builder;
    },

    insert: (table: any) => {
      operation = 'insert';
      currentTable = resolveTableName(table);
      if (!memoryStore[currentTable]) {
        memoryStore[currentTable] = [];
      }
      return builder;
    },

    values: (data: any) => {
      insertValues = Array.isArray(data) ? data : [data];
      return builder;
    },

    onConflictDoUpdate: (config: any) => {
      // Store conflict update rule
      const setFields = config?.set || {};
      const targetCol = config?.target?.name || config?.target?.key || 'id';

      const tableData = memoryStore[currentTable] || [];
      for (const item of insertValues) {
        const key = item[targetCol] || item.id;
        const existingIdx = tableData.findIndex((row) => (row[targetCol] || row.id) === key);
        if (existingIdx >= 0) {
          tableData[existingIdx] = {
            ...tableData[existingIdx],
            ...item,
            ...setFields,
          };
        } else {
          tableData.push({ ...item });
        }
      }
      memoryStore[currentTable] = tableData;
      saveStore();
      return builder;
    },

    onConflictDoNothing: () => {
      const tableData = memoryStore[currentTable] || [];
      for (const item of insertValues) {
        const key = item.id;
        const existingIdx = tableData.findIndex((row) => row.id === key);
        if (existingIdx === -1) {
          tableData.push({ ...item });
        }
      }
      memoryStore[currentTable] = tableData;
      saveStore();
      return builder;
    },

    update: (table: any) => {
      operation = 'update';
      currentTable = resolveTableName(table);
      if (!memoryStore[currentTable]) {
        memoryStore[currentTable] = [];
      }
      return builder;
    },

    set: (values: any) => {
      updateValues = values;
      return builder;
    },

    delete: (table: any) => {
      operation = 'delete';
      currentTable = resolveTableName(table);
      if (!memoryStore[currentTable]) {
        memoryStore[currentTable] = [];
      }
      return builder;
    },

    where: (condition: any) => {
      if (condition) {
        whereConditions.push(condition);
      }
      return builder;
    },

    orderBy: (orderCol: any) => {
      const colName = orderCol?.name || orderCol?.key;
      if (colName) {
        sortField = colName;
        sortAsc = true;
      }
      return builder;
    },

    limit: (n: number) => {
      limitCount = n;
      return builder;
    },

    then: (resolve: (data: any) => void, reject?: (err: any) => void) => {
      try {
        const tableData = memoryStore[currentTable] || [];

        if (operation === 'insert') {
          for (const item of insertValues) {
            const idx = tableData.findIndex((r) => r.id === item.id);
            if (idx >= 0) {
              tableData[idx] = { ...tableData[idx], ...item };
            } else {
              tableData.push({ ...item });
            }
          }
          memoryStore[currentTable] = tableData;
          saveStore();
          return Promise.resolve(insertValues).then(resolve);
        }

        if (operation === 'delete') {
          if (whereConditions.length === 0) {
            // Delete all records in table
            memoryStore[currentTable] = [];
          } else {
            memoryStore[currentTable] = tableData.filter(
              (row) => !whereConditions.every((cond) => matchesCondition(row, cond))
            );
          }
          saveStore();
          return Promise.resolve([]).then(resolve);
        }

        if (operation === 'update') {
          for (let i = 0; i < tableData.length; i++) {
            if (whereConditions.every((cond) => matchesCondition(tableData[i], cond))) {
              tableData[i] = { ...tableData[i], ...updateValues };
            }
          }
          saveStore();
          return Promise.resolve(tableData).then(resolve);
        }

        // Default: SELECT
        let result = [...tableData];
        if (whereConditions.length > 0) {
          result = result.filter((row) =>
            whereConditions.every((cond) => matchesCondition(row, cond))
          );
        }

        if (sortField) {
          result.sort((a, b) => {
            const valA = a[sortField!];
            const valB = b[sortField!];
            if (valA === valB) return 0;
            return valA > valB ? (sortAsc ? 1 : -1) : sortAsc ? -1 : 1;
          });
        }

        if (limitCount !== null) {
          result = result.slice(0, limitCount);
        }

        return Promise.resolve(result).then(resolve);
      } catch (err) {
        if (reject) {
          return Promise.reject(err).catch(reject);
        }
        return Promise.reject(err);
      }
    },

    catch: (reject: (err: any) => void) => {
      return builder.then((data: any) => data, reject);
    },
  };

  return builder;
}

export const db = {
  select: (fields?: any) => createWebQueryBuilder().select(fields),
  insert: (table: any) => createWebQueryBuilder().insert(table),
  update: (table: any) => createWebQueryBuilder().update(table),
  delete: (table: any) => createWebQueryBuilder().delete(table),
};

export const expoDb = {
  execSync: () => { },
  runSync: () => { },
  getAllSync: () => [],
  getFirstSync: () => null,
};
