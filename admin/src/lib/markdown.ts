import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Renders staff-authored markdown to HTML that is safe to inject.
 * marked passes raw HTML through untouched, so the output is sanitized to
 * strip scripts, event handlers and javascript: URLs before it reaches the DOM.
 */
export function renderMarkdown(source: string): string {
  return DOMPurify.sanitize(marked.parse(source, { async: false }));
}
