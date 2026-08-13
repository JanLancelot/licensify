import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function StudyRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const roomId = id as Id<'studyRooms'>;
  const roomDetails = useQuery(api.rooms.getRoomDetails, roomId ? { roomId } : 'skip');
  const joinRoom = useMutation(api.rooms.joinRoom);
  const leaveRoom = useMutation(api.rooms.leaveRoom);

  const [joining, setJoining] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleJoin = async () => {
    if (!roomId) return;
    setJoining(true);
    setErrorMsg(null);
    try {
      await joinRoom({ roomId });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to join study room.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;
    try {
      await leaveRoom({ roomId });
      router.back();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to leave room.');
    }
  };

  if (!roomDetails) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
        <ThemedText style={{ marginTop: Spacing.two }}>Loading Study Room...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="small">← Back to Explorer</ThemedText>
        </Pressable>

        <ThemedView style={styles.headerCard}>
          <ThemedText type="subtitle" style={styles.roomBadge}>
            Live Study Room
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            {roomDetails.name}
          </ThemedText>
          {roomDetails.description && (
            <ThemedText type="small" style={styles.description}>
              {roomDetails.description}
            </ThemedText>
          )}
        </ThemedView>

        {errorMsg && (
          <ThemedView style={styles.errorBanner}>
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="subtitle">Room Information</ThemedText>
          <ThemedText type="small">Status: {roomDetails.status.toUpperCase()}</ThemedText>
          <ThemedText type="small">
            Participants: {roomDetails.activeMemberCount} / {roomDetails.maxParticipants}
          </ThemedText>
          <ThemedText type="small">LiveKit Channel: {roomDetails.providerRoomName}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="subtitle">Active Participants</ThemedText>
          {roomDetails.members.length === 0 ? (
            <ThemedText type="small" style={{ color: '#888' }}>
              No active participants yet. Be the first to join!
            </ThemedText>
          ) : (
            roomDetails.members.map((member) => (
              <ThemedView key={member._id} style={styles.participantRow}>
                <ThemedText type="default">
                  👤 {member.username || 'Anonymous Student'} ({member.role})
                </ThemedText>
              </ThemedView>
            ))
          )}
        </ThemedView>

        <ThemedView style={styles.actionsContainer}>
          <Pressable
            style={[styles.primaryButton, joining && { opacity: 0.6 }]}
            onPress={handleJoin}
            disabled={joining}
          >
            <ThemedText style={styles.buttonText}>
              {joining ? 'Connecting...' : 'Join Study Session'}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleLeave}>
            <ThemedText style={styles.secondaryButtonText}>Leave Room</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.one,
  },
  headerCard: {
    padding: Spacing.four,
    borderRadius: 12,
    gap: Spacing.one,
  },
  roomBadge: {
    fontSize: 12,
    color: '#208AEF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
  },
  description: {
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FFE6E6',
    padding: Spacing.three,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
  },
  sectionCard: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  participantRow: {
    paddingVertical: Spacing.one,
  },
  actionsContainer: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
  },
});
