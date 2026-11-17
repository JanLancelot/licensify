export type ContentBlock =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'bullet'; text: string; level: number }
  | { type: 'numbered'; text: string; num: string }
  | { type: 'blockquote'; text: string }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'divider' }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'spacer' };

/**
 * Cleanly decodes common HTML entities.
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Normalizes inline HTML formatting tags (<b>, <i>, <u>, <s>, <code>, <br>)
 * into standard token representations for rendering.
 */
export function normalizeInlineTags(text: string): string {
  let s = text;
  // Convert break tags to newline
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // Normalize bold
  s = s.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gis, '**$1**');
  // Normalize italics
  s = s.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gis, '*$1*');
  // Normalize inline code
  s = s.replace(/<code[^>]*>(.*?)<\/code>/gis, '`$1`');
  // Normalize underline
  s = s.replace(/<u[^>]*>(.*?)<\/u>/gis, '__U_START__$1__U_END__');
  // Normalize strikethrough
  s = s.replace(/<(?:s|strike|del)[^>]*>(.*?)<\/(?:s|strike|del)>/gis, '__S_START__$1__S_END__');
  // Strip any remaining structural wrappers like <span>, <p>, etc.
  s = s.replace(/<\/?[a-z0-9_-]+(?:\s+[^>]*?)?>/gi, '');
  return decodeHtmlEntities(s);
}

/**
 * Universal block parser that handles both raw WYSIWYG HTML output
 * (from TipTap) and standard Markdown (from seed review notes).
 */
export function parseContentToBlocks(content: string): ContentBlock[] {
  if (!content || !content.trim()) return [];

  let text = content.trim();

  // 1. Normalize images: both HTML <img ...> and Markdown ![alt](src)
  // Markdown images: ![alt](src)
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '\n__IMG__src="$2" alt="$1"__\n');

  // HTML images: <img src="..." alt="..." />
  text = text.replace(/<img\s+([^>]*?)\/?>/gi, (_, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    return `\n__IMG__src="${src}" alt="${alt}"__\n`;
  });

  // 2. Normalize HTML structural tags into block marker tokens
  text = text
    .replace(/<hr\s*\/?>/gi, '\n__DIVIDER__\n')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n__H1__$1__\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n__H2__$1__\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n__H3__$1__\n')
    .replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n__H3__$1__\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n__QUOTE__$1__\n')
    .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n__CODE__$1__\n')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n__CODE__$1__\n');

  // Handle <ol> list items with numbers
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    let count = 1;
    return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, liContent: string) => {
      const token = `\n__NUM_${count}__${liContent}__\n`;
      count++;
      return token;
    });
  });

  // Handle <ul> list items with bullets
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, liContent: string) => {
      return `\n__BULLET__${liContent}__\n`;
    });
  });

  // Convert <p> blocks to paragraph tokens
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n__P__$1__\n');

  // Clean redundant multi-newlines created by tag replacements
  text = text.replace(/\n{3,}/g, '\n\n');

  // 3. Split by newline and convert to ContentBlock items
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang: string | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          code: codeBuffer.join('\n'),
          lang: codeLang,
        });
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = undefined;
      } else {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim() || undefined;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (!trimmed) {
      const last = blocks[blocks.length - 1];
      if (
        last &&
        last.type === 'p' &&
        blocks.length > 0 &&
        blocks[blocks.length - 1].type !== 'spacer'
      ) {
        blocks.push({ type: 'spacer' });
      }
      continue;
    }

    // 1. Image Token
    const imgMatch = trimmed.match(/^__IMG__src="([^"]*)"\s+alt="([^"]*)"__$/);
    if (imgMatch) {
      const src = imgMatch[1];
      const alt = imgMatch[2];
      if (src) {
        blocks.push({ type: 'image', src, alt: alt || undefined });
      }
      continue;
    }

    // 2. Tokenized H1
    if (trimmed.startsWith('__H1__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'h1', text: trimmed.slice(6, -2).trim() });
      continue;
    }

    // 3. Tokenized H2
    if (trimmed.startsWith('__H2__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'h2', text: trimmed.slice(6, -2).trim() });
      continue;
    }

    // 4. Tokenized H3
    if (trimmed.startsWith('__H3__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'h3', text: trimmed.slice(6, -2).trim() });
      continue;
    }

    // 5. Tokenized Blockquote
    if (trimmed.startsWith('__QUOTE__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'blockquote', text: trimmed.slice(9, -2).trim() });
      continue;
    }

    // 6. Tokenized Code
    if (trimmed.startsWith('__CODE__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'code', code: decodeHtmlEntities(trimmed.slice(8, -2).trim()) });
      continue;
    }

    // 7. Tokenized Numbered Item
    const numMatch = trimmed.match(/^__NUM_(\d+)__(.*)__$/);
    if (numMatch) {
      blocks.push({ type: 'numbered', num: numMatch[1], text: numMatch[2].trim() });
      continue;
    }

    // 8. Tokenized Bullet Item
    if (trimmed.startsWith('__BULLET__') && trimmed.endsWith('__')) {
      blocks.push({ type: 'bullet', level: 0, text: trimmed.slice(10, -2).trim() });
      continue;
    }

    // 9. Tokenized Divider
    if (trimmed === '__DIVIDER__') {
      blocks.push({ type: 'divider' });
      continue;
    }

    // 10. Tokenized Paragraph
    if (trimmed.startsWith('__P__') && trimmed.endsWith('__')) {
      const pText = trimmed.slice(5, -2).trim();
      if (pText) {
        blocks.push({ type: 'p', text: pText });
      }
      continue;
    }

    // Standard Markdown fallback parsing:
    // Markdown Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({ type: 'divider' });
      continue;
    }

    // Markdown H1 (# ...)
    if (rawLine.startsWith('# ')) {
      blocks.push({ type: 'h1', text: rawLine.replace(/^#\s+/, '').trim() });
      continue;
    }

    // Markdown H2 (## ...)
    if (rawLine.startsWith('## ')) {
      blocks.push({ type: 'h2', text: rawLine.replace(/^##\s+/, '').trim() });
      continue;
    }

    // Markdown H3 (### ...)
    if (rawLine.startsWith('### ')) {
      blocks.push({ type: 'h3', text: rawLine.replace(/^###\s+/, '').trim() });
      continue;
    }

    // Markdown Blockquote (> ...)
    if (rawLine.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: rawLine.replace(/^>\s+/, '').trim() });
      continue;
    }

    // Markdown Bullet (- ... or * ...)
    const mdBulletMatch = rawLine.match(/^(\s*)([\*\-])\s+(.*)$/);
    if (mdBulletMatch) {
      const level = Math.min(Math.floor(mdBulletMatch[1].length / 2), 2);
      blocks.push({ type: 'bullet', level, text: mdBulletMatch[3].trim() });
      continue;
    }

    // Markdown Numbered list (1. ... or 2. ...)
    const mdNumberedMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (mdNumberedMatch) {
      blocks.push({ type: 'numbered', num: mdNumberedMatch[2], text: mdNumberedMatch[3].trim() });
      continue;
    }

    // Default regular paragraph
    blocks.push({ type: 'p', text: rawLine });
  }

  // Remove any trailing spacers
  while (blocks.length > 0 && blocks[blocks.length - 1].type === 'spacer') {
    blocks.pop();
  }

  return blocks;
}
