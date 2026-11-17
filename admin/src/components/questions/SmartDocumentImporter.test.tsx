import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SmartDocumentImporter } from "./SmartDocumentImporter";

const mockSubjects = [
  { _id: "subj_1", name: "History of Architecture" },
  { _id: "subj_2", name: "Building Technology" },
];

describe("SmartDocumentImporter Component", () => {
  it("renders 3-tab navigation and subject dropdown", () => {
    const handleImport = vi.fn();
    const handleClose = vi.fn();

    render(
      <SmartDocumentImporter
        subjects={mockSubjects}
        defaultSubjectId={"subj_1" as any}
        onImport={handleImport}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("PDF & Document AI")).toBeInTheDocument();
    expect(screen.getByText("Excel / CSV")).toBeInTheDocument();
    expect(screen.getByText("Raw JSON")).toBeInTheDocument();
    expect(screen.getByText("History of Architecture")).toBeInTheDocument();
  });

  it("parses CSV data into the staging preview table and allows toggling choice", async () => {
    const handleImport = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <SmartDocumentImporter
        subjects={mockSubjects}
        defaultSubjectId={"subj_1" as any}
        onImport={handleImport}
        onClose={handleClose}
      />
    );

    // Switch to CSV tab
    fireEvent.click(screen.getByText("Excel / CSV"));

    const textarea = screen.getByRole("textbox");
    const sampleCsv = `Question,Choice A,Choice B,Choice C,Choice D,Correct,Explanation
"What is the minimum stair width in NBCP?","600mm","750mm","900mm","1200mm","c","NBCP Section 1207"`;

    fireEvent.change(textarea, { target: { value: sampleCsv } });
    fireEvent.click(screen.getByRole("button", { name: /Parse CSV Data/i }));

    // Verify Staging Preview shows the parsed item
    expect(screen.getByText(/Staging Preview \(1 Items Detected\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/What is the minimum stair width in NBCP\?/i).length).toBeGreaterThanOrEqual(1);

    // Choice C should be marked initially (c = 900mm)
    expect(screen.getByText("900mm")).toBeInTheDocument();

    // Toggle choice to B (750mm)
    fireEvent.click(screen.getByText("750mm"));

    // Click confirm import
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Import 1 Questions/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            correctChoiceId: "b",
          }),
        ])
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("parses full mock exam text with answer keys and populates staging preview table", async () => {
    const handleImport = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <SmartDocumentImporter
        subjects={mockSubjects}
        defaultSubjectId={"subj_1" as any}
        onImport={handleImport}
        onClose={handleClose}
      />
    );

    // PDF & Document AI tab is active by default
    const textarea = screen.getByRole("textbox");
    const mockExam = `1. Which classical order features volutes on its capital?
A. Doric
B. Ionic
C. Corinthian
D. Tuscan

2. What is the maximum ramp slope under BP 344?
A. 1:10
B. 1:12
C. 1:15
D. 1:20

ANSWER KEY:
1. B - Volutes on capital
2. B - Rule II Section 1`;

    fireEvent.change(textarea, { target: { value: mockExam } });
    fireEvent.click(screen.getByRole("button", { name: /Parse Questions & Answer Key/i }));

    // Verify staging preview shows both questions
    expect(screen.getByText(/Staging Preview \(2 Items Detected\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Which classical order features volutes on its capital\?/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/What is the maximum ramp slope under BP 344\?/i).length).toBeGreaterThanOrEqual(1);

    // Confirm import
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Import 2 Questions/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            question: "Which classical order features volutes on its capital?",
            correctChoiceId: "b",
          }),
          expect.objectContaining({
            question: "What is the maximum ramp slope under BP 344?",
            correctChoiceId: "b",
          }),
        ])
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
