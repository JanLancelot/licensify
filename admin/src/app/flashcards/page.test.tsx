import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import FlashcardsPage from "./page";
import { getFunctionName } from "convex/server";

const mockCreateFlashcard = vi.fn().mockResolvedValue("card_new");

const sampleSubjects = [{ _id: "subj_1", name: "History & Theory", order: 1, isPublished: true }];
const sampleFlashcards = [
  {
    _id: "card_1",
    subjectId: "subj_1",
    front: "Who designed the Guggenheim Museum in Bilbao, Spain?",
    back: "Frank Gehry",
    isPublished: true,
    createdAt: Date.now(),
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "subjects:listAllSubjects") return sampleSubjects;
    if (fnName === "topics:listAllTopicsAdmin") return [];
    if (fnName === "flashcards:listAllFlashcardsAdmin") return sampleFlashcards;
    return [];
  },
  useMutation: () => mockCreateFlashcard,
}));

describe("Flashcards Studio Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders flashcard deck list with prompt and answer", () => {
    render(<FlashcardsPage />);

    expect(screen.getByText("Flashcards Studio")).toBeInTheDocument();
    expect(screen.getByText(/Who designed the Guggenheim Museum in Bilbao/i)).toBeInTheDocument();
  });

  it("opens create flashcard modal and live 3D card preview", () => {
    render(<FlashcardsPage />);

    const newCardBtn = screen.getByRole("button", { name: /New Flashcard/i });
    fireEvent.click(newCardBtn);

    expect(screen.getByRole("heading", { name: "New Flashcard" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minimum width of a ramp/i)).toBeInTheDocument();
  });
});
