# Licensify - ALE Reviewer Mobile Application 🏗️

Licensify is an offline-first mobile Architectural Licensure Examination (ALE) Reviewer application built with React Native (Expo SDK 52 / v57 docs), Convex Cloud, and SQLite with Drizzle ORM.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Convex Cloud Backend
```bash
npx convex dev
```

### 3. Start Expo Mobile Development Server
```bash
npx expo start
```

### 4. Start Web Admin Dashboard
```bash
cd admin
npm run dev
```

---

## 📖 Project Documentation

The repository includes comprehensive technical guides:

* **[`PROJECT_DOCUMENTATION.md`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/PROJECT_DOCUMENTATION.md)**: Full platform architecture, core screens, sync strategy, and features overview.
* **[`LOCAL_DATABASE_GUIDE.md`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/LOCAL_DATABASE_GUIDE.md)**: Complete guide to the local SQLite database, Drizzle ORM schemas, zero-trust SHA-256 grading, and React hooks.
* **[`DATABASE_INTEGRATION.md`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/DATABASE_INTEGRATION.md)**: Details on the offline-first migration, preset stores, gamification, and synchronization engine.
* **[`backend_database_api_guide.md`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/backend_database_api_guide.md)**: Backend Convex API endpoints, query and mutation specifications, security patterns, and testing instructions.
* **[`TODO.md`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/TODO.md)**: Completed tracking checklist for database migration and mock data elimination.

---

## 🗄️ Database Seeding & Clean-Up

### Seed Curriculum Hierarchy from Excel
```bash
npx convex run seed:seedCurriculumFromExcel
```

### Seed Genuine Mock Assessments, Questions & Achievements
Populates board exam mock tests, NBCP Rule 7 & 8 computation drills, flashcards, study notes, and achievements tagged with `[Seed]` or `[Mock]`:
```bash
npx convex run seedAssessments:seedMockAssessmentsAndMaterials
```

### Purge Seed Data for Production Content
Cleanly deletes all seeded test data when production review content is ready:
```bash
npx convex run seedAssessments:deleteMockSeedData
```
