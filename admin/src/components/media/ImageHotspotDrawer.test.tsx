import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImageHotspotDrawer, HotspotItem } from "./ImageHotspotDrawer";

const sampleHotspots: HotspotItem[] = [
  {
    id: "hs_1",
    stepIndex: 1,
    title: "Capital (Abacus & Echinus)",
    description: "Top member of a column",
    xPercent: 20,
    yPercent: 15,
    widthPercent: 25,
    heightPercent: 15,
    zoomScale: 2.5,
    isOccluded: true,
  },
  {
    id: "hs_2",
    stepIndex: 2,
    title: "Column Shaft",
    description: "Fluted cylindrical body",
    xPercent: 25,
    yPercent: 35,
    widthPercent: 15,
    heightPercent: 40,
    zoomScale: 2.0,
    isOccluded: false,
  },
];

describe("ImageHotspotDrawer Component", () => {
  it("renders the canvas, hotspots, and step tour buttons", () => {
    const handleChange = vi.fn();
    render(
      <ImageHotspotDrawer
        imageUrl="https://example.com/doric_order.png"
        hotspots={sampleHotspots}
        onChange={handleChange}
      />
    );

    // Verify canvas title and step chips
    expect(screen.getByText("Interactive Hotspot Canvas")).toBeInTheDocument();
    expect(screen.getByText("Capital (Abacus & Echinus)")).toBeInTheDocument();
    expect(screen.getByText("Column Shaft")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("selects a hotspot and shows the inspector to edit title", () => {
    const handleChange = vi.fn();
    render(
      <ImageHotspotDrawer
        imageUrl="https://example.com/doric_order.png"
        hotspots={sampleHotspots}
        onChange={handleChange}
      />
    );

    // Click on the first hotspot in the sidebar list
    const firstItem = screen.getByText("Capital (Abacus & Echinus)");
    fireEvent.click(firstItem);

    // Inspector should open with step #1
    expect(screen.getByText(/Editing Step #1/i)).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e\.g\. Ionic Volute/i);
    expect(titleInput).toHaveValue("Capital (Abacus & Echinus)");

    // Edit title
    fireEvent.change(titleInput, { target: { value: "Updated Doric Capital" } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "hs_1", title: "Updated Doric Capital" }),
      ])
    );
  });

  it("toggles the flashcard occlusion mask", () => {
    const handleChange = vi.fn();
    render(
      <ImageHotspotDrawer
        imageUrl="https://example.com/doric_order.png"
        hotspots={sampleHotspots}
        onChange={handleChange}
      />
    );

    // Select second hotspot (which has isOccluded: false)
    fireEvent.click(screen.getByText("Column Shaft"));

    const maskBtn = screen.getByRole("button", { name: /Visible/i });
    fireEvent.click(maskBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "hs_2", isOccluded: true }),
      ])
    );
  });
});
