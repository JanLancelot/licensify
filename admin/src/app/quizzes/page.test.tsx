import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import QuizzesPage from "./page";
import { getFunctionName } from "convex/server";

const mockCreateQuiz = vi.fn().mockResolvedValue("quiz_new");

const sampleSubjects = [{ _id: "subj_1", name: "History & Theory", order: 1, isPublished: true }];

const sampleQuizzes = [
  {
    _id: "quiz_1",
    title: "Area 1 Comprehensive Mock Exam",
    description: "History and Theory timed assessment",
    type: "mock_exam",
    subjectId: "subj_1",
    questionIds: ["q_1"],
    timeLimitSeconds: 3600,
    passingScore: 75,
    isPublished: true,
    createdAt: Date.now(),
  },
];

const sampleQuestions = [
  {
    _id: "q_1",
    question: "What is the capital of the Parthenon column?",
    choices: [{ id: "a", text: "Doric" }],
    difficulty: "easy",
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "subjects:listAllSubjects") return sampleSubjects;
    if (fnName === "topics:listAllTopicsAdmin") return [];
    if (fnName === "quizzes:listAllQuizzesAdmin") return sampleQuizzes;
    if (fnName === "questions:listAllQuestionsAdmin") return sampleQuestions;
    return [];
  },
  useMutation: () => mockCreateQuiz,
}));

describe("Mock Exams & Assessments Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders mock exams list and passing score benchmarks", () => {
    render(<QuizzesPage />);

    expect(screen.getByText("Mock Exams & Assessments")).toBeInTheDocument();
    expect(screen.getByText("Area 1 Comprehensive Mock Exam")).toBeInTheDocument();
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
    expect(screen.getByText(/60 minutes/i)).toBeInTheDocument();
  });

  it("opens mock exam builder modal with question picker", () => {
    render(<QuizzesPage />);

    const newExamBtn = screen.getByRole("button", { name: /New Mock Exam/i });
    fireEvent.click(newExamBtn);

    expect(screen.getByText("Build Mock Exam / Quiz")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., ALE Area 3 Comprehensive Mock Exam/i)).toBeInTheDocument();
  });
});
