import React from 'react';

export interface Lesson {
  id: string;
  lessonId?: string;
  topicId?: string;
  subjectId?: string;
  lessonNumber: number;
  title: string;
  duration: string;
  summary: string;
  keyPoints: string[];
}

export interface Topic {
  id: string;
  topicId?: string;
  subjectId?: string;
  topicNumber: number;
  title: string;
  lessons: Lesson[];
}

export interface SubjectNote {
  id: string;
  subjectId?: string;
  subjectNumber: number;
  title: string;
  area: string;
  weight: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  topics: Topic[];
}

export interface FlashcardItem {
  id: string;
  subjectId?: string;
  topicId?: string;
  lessonId?: string;
  subjectTitle: string;
  topicTitle: string;
  lessonTitle: string;
  question: string;
  answer: string;
  explanation: string;
  isDifficult: boolean;
  isFavorite: boolean;
}

export interface FlashcardPreset {
  id: string;
  title: string;
  lessonCount: number;
  cardCount: number;
  isShuffled: boolean;
  createdAt: string;
  subjectNames: string[];
  cards: FlashcardItem[];
  selectedLessonIds?: string[];
  iconName?: string;
}

export interface QuizQuestion {
  id: string;
  area: string;
  areaLabel: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}
