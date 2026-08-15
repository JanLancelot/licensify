import React from 'react';
import { Redirect } from 'expo-router';

export default function PracticeFlashcardsRedirect() {
  return <Redirect href={'/(tabs)/learn/flashcards' as any} />;
}
