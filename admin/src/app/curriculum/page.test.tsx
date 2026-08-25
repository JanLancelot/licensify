import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import CurriculumPage from "./page";
import { getFunctionName } from "convex/server";

const mockCreateSubject = vi.fn().mockResolvedValue("subj_new");

const sampleSubjects = [
  {
    _id: "subj_1",
    name: "History & Theory of Architecture",
    description: "Antiquity to Contemporary architecture.",
    order: 1,
    isPublished: true,
  },
];

const sampleTopics = [
  {
    _id: "topic_1",
    subjectId: "subj_1",
    name: "Ancient Greek Architecture",
    description: "Doric, Ionic, and Corinthian structures.",
    order: 1,
    isPublished: true,
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "subjects:listAllSubjects") return sampleSubjects;
    if (fnName === "topics:listAllTopicsAdmin") return sampleTopics;
    return [];
  },
  useMutation: () => mockCreateSubject,
}));

describe("Curriculum Hierarchy Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders subjects and syllabus topics structure", () => {
    render(<CurriculumPage />);

    expect(screen.getByText("Curriculum Structure")).toBeInTheDocument();
    expect(screen.getByText("History & Theory of Architecture")).toBeInTheDocument();
  });

  it("opens create subject modal and triggers creation", async () => {
    render(<CurriculumPage />);

    const newSubjectBtn = screen.getByRole("button", { name: /New Subject Area/i });
    fireEvent.click(newSubjectBtn);

    expect(screen.getByText("New Board Exam Subject")).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/Theory of Architecture/i);
    fireEvent.change(nameInput, { target: { value: "Building Technology" } });

    const submitBtn = screen.getByRole("button", { name: /^Create Subject$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateSubject).toHaveBeenCalled();
    });
  });
});
