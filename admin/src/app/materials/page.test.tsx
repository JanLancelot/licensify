import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import MaterialsPage from "./page";
import { getFunctionName } from "convex/server";

const mockCreateMaterial = vi.fn().mockResolvedValue("mat_new");

const sampleSubjects = [{ _id: "subj_1", name: "Building Utilities", order: 1, isPublished: true }];
const sampleMaterials = [
  {
    _id: "mat_1",
    subjectId: "subj_1",
    title: "Sanitary & Plumbing Systems Guide",
    description: "National Plumbing Code summary",
    type: "article",
    content: "# Plumbing Systems\n\n- NPCP standards and drainage slope",
    isPublished: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

vi.mock("convex/react", () => ({
  useQuery: (queryRef: any) => {
    const fnName = getFunctionName(queryRef);
    if (fnName === "subjects:listAllSubjects") return sampleSubjects;
    if (fnName === "topics:listAllTopicsAdmin") return [];
    if (fnName === "materials:listAllMaterialsAdmin") return sampleMaterials;
    return [];
  },
  useMutation: () => mockCreateMaterial,
}));

describe("Study Notes & Materials Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders review notes list and format filter tabs", () => {
    render(<MaterialsPage />);

    expect(screen.getByText("Study Notes & Documents")).toBeInTheDocument();
    expect(screen.getByText("Sanitary & Plumbing Systems Guide")).toBeInTheDocument();
  });

  it("opens live Markdown editor modal", () => {
    render(<MaterialsPage />);

    const newMaterialBtn = screen.getByRole("button", { name: /New Study Note/i });
    fireEvent.click(newMaterialBtn);

    expect(screen.getByText(/Author Study Note \/ Reference/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/National Building Code/i)).toBeInTheDocument();
  });
});
