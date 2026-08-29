import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSubjects } from '../hooks/useLocalData';
import { useSyncService } from '../services/useSyncService';
import { db } from '../db/client';
import * as schema from '../db/schema';

export default function DebugSQLite() {
  const { subjects, loading, refetch } = useLocalSubjects();
  const { syncDown, syncUp, isSyncing } = useSyncService();

  const handleSync = async () => {
    try {
      await syncDown();
      await syncUp();
      await refetch?.();
      Alert.alert('Success', 'Local SQLite database synchronized with Convex!');
    } catch (err: any) {
      Alert.alert('Sync Notice', err?.message || 'Offline database active.');
      console.warn(err);
    }
  };

  const handleWipeDatabase = async () => {
    try {
      // Clear all tables in dependency order
      await db.delete(schema.quizAnswers);
      await db.delete(schema.quizAttempts);
      await db.delete(schema.quizzes);
      await db.delete(schema.questions);
      await db.delete(schema.flashcards);
      await db.delete(schema.materials);
      await db.delete(schema.lessons);
      await db.delete(schema.topics);
      await db.delete(schema.branches);
      await db.delete(schema.subjects);

      await refetch?.();
      Alert.alert('Database Cleared', 'All local cached data has been successfully wiped. Please synchronize again to pull fresh data.');
    } catch (err: any) {
      Alert.alert('Wipe Failed', err?.message || 'Error clearing database.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SQLite & Convex Live Sync</Text>

      <View style={styles.buttonGroup}>
        <Button 
          title={isSyncing ? "Syncing..." : "🔄 Synchronize Database with Convex"} 
          color="#3c87f7"
          disabled={isSyncing}
          onPress={handleSync} 
        />
        <View style={{ height: 10 }} />
        <Button 
          title="🗑️ Wipe Local Cache" 
          color="#ef4444"
          onPress={handleWipeDatabase} 
        />
      </View>

      {isSyncing && <ActivityIndicator color="#3c87f7" style={{ marginVertical: 15 }} />}

      <Text style={styles.subHeader}>
        Local Subjects Count: {loading ? 'Loading...' : subjects.length}
      </Text>

      {subjects.map((sub) => (
        <View key={sub.id} style={styles.item}>
          <Text style={styles.itemName}>{sub.name}</Text>
          <Text style={styles.itemDesc}>{sub.description}</Text>
          <Text style={styles.itemStatus}>
            Published: {sub.isPublished ? 'Yes' : 'No'} | Order: {sub.order}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 10,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  itemStatus: {
    fontSize: 12,
    color: '#888',
  },
});
