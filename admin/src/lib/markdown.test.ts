import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("keeps regular markdown formatting", () => {
    const html = renderMarkdown("# Title\n\n- **bold** [link](https://example.com)");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('href="https://example.com"');
  });

  it("strips scripts, event handlers and javascript: links", () => {
    const html = renderMarkdown(
      [
        "<script>alert(1)</script>",
        '<img src="x" onerror="alert(2)">',
        "[click](javascript:alert(3))",
        '<a href="javascript:alert(4)">raw</a>',
        '<iframe src="https://evil.example"></iframe>',
      ].join("\n\n")
    );
    expect(html).not.toMatch(/<script|onerror|javascript:|<iframe/i);
  });
});
