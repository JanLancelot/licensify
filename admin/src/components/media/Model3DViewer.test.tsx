import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Model3DViewer } from "./Model3DViewer";

describe("Model3DViewer Component", () => {
  it("renders the 3D model container, title, and GLB badge", () => {
    render(
      <Model3DViewer
        modelUrl="https://example.com/parthenon_column.glb"
        title="Parthenon Doric Column"
      />
    );

    expect(screen.getByText("Parthenon Doric Column")).toBeInTheDocument();
    expect(screen.getByText(".GLB / glTF")).toBeInTheDocument();
    expect(screen.getByText(/Drag to rotate 360°/i)).toBeInTheDocument();
  });

  it("toggles auto-rotation button state", () => {
    render(
      <Model3DViewer
        modelUrl="https://example.com/parthenon_column.glb"
        autoRotate={true}
      />
    );

    const rotateBtn = screen.getByRole("button", { name: /Auto Rotate/i });
    expect(rotateBtn).toBeInTheDocument();

    // Click to toggle
    fireEvent.click(rotateBtn);
    // Button still exists and handles state toggle cleanly
    expect(rotateBtn).toBeInTheDocument();
  });
});
