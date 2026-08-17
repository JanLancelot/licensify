import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import QuestionsPage from "./page";
import { getFunctionName } from "convex/server";

const mockBulkCreateQuestions = vi.fn().mockResolvedValue({ count: 1 });


const sampleSubjects = [
  { _id: "subj_1", name: "History & Theory of Architecture", order: 1, isPublished: true },
  { _id: "subj_2", name: "Building Utilities", order: 2, isPublished: true },
];

const sampleTopics = [
  { _id: "topic_1", subjectId: "subj_1", name: "Classical Orders", order: 1, isPublished: true },
];

const sampleQuestions = [
  {
    _id: "q_1",
    subjectId: "subj_1",
    topicId: "topic_1",
    question: "Which Classical Order features acanthus leaves on its capital?",
    choices: [
      { id: "a", text: "Doric" },
      { id: "b", text: "Ionic" },
      { id: "c", text: "Corinthian" },
      { id: "d", text: "Composite" },
    ],
    correctChoiceId: "c",
    explanation: "Corinthian order is decorated with acanthus leaf motifs.",
    difficulty: "easy",
    isPublished: true,
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "subjects:listAllSubjects") return sampleSubjects;
    if (fnName === "topics:listAllTopicsAdmin") return sampleTopics;
    if (fnName === "questions:listAllQuestionsAdmin") return sampleQuestions;
    return [];
  },
  useMutation: () => mockBulkCreateQuestions,
}));

describe("Question Bank Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Question Bank header and questions list", () => {
    render(<QuestionsPage />);

    expect(screen.getByText("Question Bank Studio")).toBeInTheDocument();
    expect(screen.getByText(/Which Classical Order features acanthus leaves/i)).toBeInTheDocument();
    expect(screen.getByText("Corinthian")).toBeInTheDocument();
    expect(screen.getByText("easy")).toBeInTheDocument();
  });

  it("opens create question modal with dynamic choice builder", () => {
    render(<QuestionsPage />);

    const newQuestionBtn = screen.getByRole("button", { name: /New Question/i });
    fireEvent.click(newQuestionBtn);

    expect(screen.getByText("New Multiple Choice Question")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/State the problem, architectural standard/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Option A text...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option B text...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option C text...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option D text...")).toBeInTheDocument();
  });

  it("opens bulk import modal, validates and parses JSON input", async () => {
    render(<QuestionsPage />);

    const bulkBtn = screen.getByRole("button", { name: /Bulk JSON \/ CSV Import/i });
    fireEvent.click(bulkBtn);

    expect(screen.getByText(/Bulk Question Importer/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/maximum stair riser height/i);
    const jsonSample = JSON.stringify([
      {
        question: "What is the maximum riser height under NBCP?",
        choices: [
          { id: "a", text: "150mm" },
          { id: "b", text: "200mm" },
        ],
        correctChoiceId: "b",
        difficulty: "easy",
      },
    ]);

    fireEvent.change(textarea, { target: { value: jsonSample } });

    const validateBtn = screen.getByRole("button", { name: /Validate & Parse/i });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText(/1 questions ready to import/i)).toBeInTheDocument();
    });

    const commitBtn = screen.getByRole("button", { name: /Commit 1 Questions to Database/i });
    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(mockBulkCreateQuestions).toHaveBeenCalled();
    });
  });
});
