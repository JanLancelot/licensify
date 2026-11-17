import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor Component", () => {
  it("renders toolbar buttons and initial text content", () => {
    const handleChange = vi.fn();
    render(
      <RichTextEditor
        value="<p>Test Architecture Material</p>"
        onChange={handleChange}
      />
    );

    // Verify key Word-like toolbar controls exist
    expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Underline/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Strikethrough/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Heading 1/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Heading 2/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Heading 3/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Align Center/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Bulleted List/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Numbered List/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Insert picture/i)).toBeInTheDocument();

    // Verify content is rendered
    expect(screen.getByText(/Test Architecture Material/i)).toBeInTheDocument();
  });

  it("handles legacy markdown-style input cleanly", () => {
    const handleChange = vi.fn();
    render(
      <RichTextEditor
        value="# NBCP Rule 7\nMinimum clear ceiling height"
        onChange={handleChange}
      />
    );

    // Check that header and text rendered
    expect(screen.getByText(/NBCP Rule 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimum clear ceiling height/i)).toBeInTheDocument();
  });
});
