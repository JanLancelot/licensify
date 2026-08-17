import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import DashboardOverviewPage from "./page";
import { getFunctionName } from "convex/server";

const sampleStats = {
  totals: {
    subjects: 3,
    publishedSubjects: 3,
    topics: 6,
    publishedTopics: 6,
    questions: 150,
    publishedQuestions: 140,
    materials: 12,
    publishedMaterials: 10,
    flashcards: 45,
    publishedFlashcards: 45,
    quizzes: 5,
    publishedQuizzes: 4,
    users: 28,
    attempts: 110,
  },
  questionsByDifficulty: {
    easy: 50,
    medium: 70,
    hard: 30,
  },
  usersByRole: {
    student: 25,
    content_manager: 2,
    admin: 1,
  },
  subjectBreakdown: [
    {
      _id: "subj_1",
      name: "History & Theory of Architecture",
      isPublished: true,
      order: 1,
      topicsCount: 2,
      questionsCount: 50,
      materialsCount: 4,
      flashcardsCount: 15,
    },
  ],
  recentQuestions: [
    {
      _id: "q_1",
      question: "Which architect designed Fallingwater?",
      difficulty: "easy",
      subjectId: "subj_1",
      createdAt: Date.now(),
    },
  ],
};

const sampleUser = {
  _id: "admin_1",
  username: "ArchAdmin",
  role: "admin",
};

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName.includes("getDashboardStats") || fnName.includes("admin")) {
      return sampleStats;
    }
    if (fnName.includes("getCurrentUserProfile") || fnName.includes("users")) {
      return sampleUser;
    }
    return sampleStats;
  },
}));

describe("Dashboard Overview Page", () => {
  it("renders live KPI cards, syllabus progress, and recent questions", () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText(/LICENSIFY • ALE Studio Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, ArchAdmin!/i)).toBeInTheDocument();
    expect(screen.getAllByText("150").length).toBeGreaterThan(0); // Question Bank total
    expect(screen.getByText("History & Theory of Architecture")).toBeInTheDocument();
    expect(screen.getByText(/Which architect designed Fallingwater/i)).toBeInTheDocument();
  });
});
