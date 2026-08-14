import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSubjects } from '../hooks/useLocalData';
import { useSyncService } from '../services/useSyncService';
import { seedSampleData } from '../db/seed';

export default function DebugSQLite() {
  const { subjects, loading, refetch } = useLocalSubjects();
  const { syncDown } = useSyncService();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedSampleData();
      await refetch?.();
      Alert.alert('Success', 'Sample database seeded! Switch to the Home tab to see subjects.');
    } catch (err: any) {
      Alert.alert('Seed Failed', err?.message || 'Error occurred while seeding');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SQLite Debugger</Text>

      <View style={styles.buttonGroup}>
        <Button 
          title={seeding ? "Seeding..." : "🌱 Populate Sample Data"} 
          color="#3c87f7"
          disabled={seeding}
          onPress={handleSeed} 
        />
        <View style={{ height: 10 }} />
        <Button 
          title="Force Sync (Pull from Convex)" 
          color="#444"
          onPress={() => syncDown()} 
        />
      </View>

      {seeding && <ActivityIndicator color="#3c87f7" style={{ marginVertical: 15 }} />}

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
    backgroundColor: '#1e1e1e',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  buttonGroup: {
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 15,
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  itemDesc: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  itemStatus: {
    fontSize: 12,
    color: '#00ffcc',
    marginTop: 8,
  },
});

