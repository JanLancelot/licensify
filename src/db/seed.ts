/**
 * Database Seeding Module - DEPRECATED
 * 
 * The app now exclusively relies on live database records synchronized
 * between Convex cloud backend and local SQLite via `useSyncService`.
 */
export async function seedSampleData() {
  console.log('[Seed] Hardcoded seed is disabled. Using live Convex database synchronization.');
}
