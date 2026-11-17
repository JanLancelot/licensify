import { describe, expect, it } from 'vitest';
import { parseContentToBlocks } from '../contentParser';

describe('parseContentToBlocks', () => {
  it('parses raw WYSIWYG HTML containing headings, paragraphs, and base64 images without newlines', () => {
    const html = '<h1>The Classical Greek Orders</h1><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="Three Orders"><p>Comprehensive guide to Doric, Ionic, and Corinthian columns.</p>';
    const blocks = parseContentToBlocks(html);

    expect(blocks.length).toBe(3);
    expect(blocks[0]).toEqual({
      type: 'h1',
      text: 'The Classical Greek Orders',
    });
    expect(blocks[1]).toEqual({
      type: 'image',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      alt: 'Three Orders',
    });
    expect(blocks[2]).toEqual({
      type: 'p',
      text: 'Comprehensive guide to Doric, Ionic, and Corinthian columns.',
    });
  });

  it('parses HTML lists (ul/li and ol/li) into bullet and numbered blocks', () => {
    const html = '<ul><li>Doric</li><li>Ionic</li><li>Corinthian</li></ul><ol><li>Step 1</li><li>Step 2</li></ol>';
    const blocks = parseContentToBlocks(html);

    expect(blocks).toEqual([
      { type: 'bullet', level: 0, text: 'Doric' },
      { type: 'bullet', level: 0, text: 'Ionic' },
      { type: 'bullet', level: 0, text: 'Corinthian' },
      { type: 'numbered', num: '1', text: 'Step 1' },
      { type: 'numbered', num: '2', text: 'Step 2' },
    ]);
  });

  it('parses standard Markdown with headings, bullet points, and markdown images', () => {
    const md = '# Vitruvian Triad\n\n![Vitruvian Man](https://cdn.example.com/vitruvius.jpg)\n\n* **Firmitas**: Strength\n* **Utilitas**: Utility';
    const blocks = parseContentToBlocks(md);

    expect(blocks).toContainEqual({
      type: 'h1',
      text: 'Vitruvian Triad',
    });
    expect(blocks).toContainEqual({
      type: 'image',
      src: 'https://cdn.example.com/vitruvius.jpg',
      alt: 'Vitruvian Man',
    });
    expect(blocks).toContainEqual({
      type: 'bullet',
      level: 0,
      text: '**Firmitas**: Strength',
    });
    expect(blocks).toContainEqual({
      type: 'bullet',
      level: 0,
      text: '**Utilitas**: Utility',
    });
  });

  it('handles HTML dividers and blockquotes cleanly', () => {
    const html = '<blockquote>Marcus Vitruvius Pollio</blockquote><hr/>';
    const blocks = parseContentToBlocks(html);

    expect(blocks).toEqual([
      { type: 'blockquote', text: 'Marcus Vitruvius Pollio' },
      { type: 'divider' },
    ]);
  });
});
