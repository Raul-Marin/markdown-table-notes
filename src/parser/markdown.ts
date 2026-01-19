/**
 * Simple Markdown Parser - ES5 Compatible
 * Figma Widget環境で動作するシンプルなMarkdownパーサー
 */

export interface Token {
  type: string;
  raw: string;
  text?: string;
  depth?: number;
  ordered?: boolean;
  start?: number;
  items?: ListItemToken[];
  lang?: string;
  header?: TableCell[];
  rows?: TableCell[][];
  align?: Array<'left' | 'center' | 'right' | null>;
  href?: string;
  title?: string;
  tokens?: Token[];
  task?: boolean;
  checked?: boolean;
}

export interface ListItemToken {
  type: 'list_item';
  raw: string;
  text: string;
  task?: boolean;
  checked?: boolean;
  tokens?: Token[];
}

export interface TableCell {
  text: string;
  tokens?: Token[];
}

export interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
  strikethrough?: boolean;
}

export interface ParsedMarkdown {
  tokens: Token[];
}

/**
 * Parse markdown text into tokens
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  const tokens: Token[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Empty line / space
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      tokens.push({ type: 'hr', raw: line });
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        raw: line,
        depth: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Code block (fenced)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({
        type: 'code',
        raw: line + '\n' + codeLines.join('\n') + '\n```',
        text: codeLines.join('\n'),
        lang: lang || undefined,
      });
      i++; // Skip closing ```
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && /^\|?[\s-:|]+\|?$/.test(lines[i + 1])) {
      const tableToken = parseTable(lines, i);
      if (tableToken) {
        tokens.push(tableToken);
        i = tableToken._endIndex || i + 1;
        continue;
      }
    }

    // List (ordered or unordered)
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const listToken = parseList(lines, i);
      tokens.push(listToken.token);
      i = listToken.endIndex;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() !== '' && quoteLines.length > 0))) {
        const qLine = lines[i].replace(/^>\s?/, '');
        quoteLines.push(qLine);
        i++;
        if (lines[i] && lines[i].trim() === '') break;
      }
      tokens.push({
        type: 'blockquote',
        raw: quoteLines.join('\n'),
        text: quoteLines.join('\n'),
        tokens: [{ type: 'paragraph', raw: quoteLines.join('\n'), text: quoteLines.join('\n') }],
      });
      continue;
    }

    // Paragraph (default)
    const paragraphLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      paragraphLines.push(lines[i]);
      i++;
    }
    tokens.push({
      type: 'paragraph',
      raw: paragraphLines.join('\n'),
      text: paragraphLines.join(' '),
    });
  }

  return { tokens };
}

function isBlockStart(line: string): boolean {
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) return true;
  if (line.trim().startsWith('```')) return true;
  if (line.trim().startsWith('>')) return true;
  if (/^(\s*)([-*+]|\d+\.)\s+/.test(line)) return true;
  if (line.includes('|')) return true;
  return false;
}

interface TableToken extends Token {
  _endIndex?: number;
}

function parseTable(lines: string[], startIndex: number): TableToken | null {
  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1];
  
  if (!separatorLine || !/^\|?[\s-:|]+\|?$/.test(separatorLine)) {
    return null;
  }

  // Parse header
  const headerCells = parsePipedLine(headerLine);
  
  // Parse alignment
  const alignCells = parsePipedLine(separatorLine);
  const align: Array<'left' | 'center' | 'right' | null> = alignCells.map((cell) => {
    const trimmed = cell.trim();
    const leftColon = trimmed.startsWith(':');
    const rightColon = trimmed.endsWith(':');
    if (leftColon && rightColon) return 'center';
    if (rightColon) return 'right';
    if (leftColon) return 'left';
    return null;
  });

  // Parse rows
  const rows: TableCell[][] = [];
  let i = startIndex + 2;
  while (i < lines.length && lines[i].includes('|')) {
    const rowCells = parsePipedLine(lines[i]);
    if (rowCells.length === 0) break;
    rows.push(rowCells.map((text) => ({ text: text.trim() })));
    i++;
  }

  return {
    type: 'table',
    raw: lines.slice(startIndex, i).join('\n'),
    header: headerCells.map((text) => ({ text: text.trim() })),
    align,
    rows,
    _endIndex: i,
  };
}

function parsePipedLine(line: string): string[] {
  // Remove leading/trailing pipes and split
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
}

interface ListResult {
  token: Token;
  endIndex: number;
}

function parseList(lines: string[], startIndex: number): ListResult {
  const firstLine = lines[startIndex];
  const firstMatch = firstLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
  
  if (!firstMatch) {
    return { token: { type: 'paragraph', raw: firstLine, text: firstLine }, endIndex: startIndex + 1 };
  }

  const baseIndent = firstMatch[1].length;
  const ordered = /\d+\./.test(firstMatch[2]);
  const start = ordered ? parseInt(firstMatch[2], 10) : 1;
  const items: ListItemToken[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    
    if (!match) {
      // Check if it's a continuation of previous item (indented)
      if (line.trim() === '' || (items.length > 0 && line.startsWith(' '.repeat(baseIndent + 2)))) {
        if (line.trim() === '') {
          i++;
          continue;
        }
      } else {
        break;
      }
    }

    if (match) {
      const indent = match[1].length;
      if (indent < baseIndent) break;
      if (indent > baseIndent) {
        // Nested list - for simplicity, treat as part of previous item
        i++;
        continue;
      }

      const itemText = match[3];
      const isTask = itemText.startsWith('[ ]') || itemText.startsWith('[x]') || itemText.startsWith('[X]');
      const checked = itemText.startsWith('[x]') || itemText.startsWith('[X]');
      const text = isTask ? itemText.slice(3).trim() : itemText;

      items.push({
        type: 'list_item',
        raw: line,
        text,
        task: isTask,
        checked: isTask ? checked : undefined,
      });
    }
    i++;
  }

  return {
    token: {
      type: 'list',
      raw: lines.slice(startIndex, i).join('\n'),
      ordered,
      start,
      items,
    },
    endIndex: i,
  };
}

/**
 * Extract text segments with formatting from text
 */
export function extractTextSegments(token: Token): TextSegment[] {
  const text = token.text || '';
  return parseInlineFormatting(text);
}

function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;
  let currentText = '';

  while (remaining.length > 0) {
    // Bold + Italic ***text***
    let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], bold: true, italic: true });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold **text** or __text__
    match = remaining.match(/^\*\*(.+?)\*\*/) || remaining.match(/^__(.+?)__/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], bold: true });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic *text* or _text_
    match = remaining.match(/^\*([^*]+?)\*/) || remaining.match(/^_([^_]+?)_/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], italic: true });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Strikethrough ~~text~~
    match = remaining.match(/^~~(.+?)~~/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], strikethrough: true });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code `text`
    match = remaining.match(/^`([^`]+?)`/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], code: true });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Link [text](url)
    match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      if (currentText) { segments.push({ text: currentText }); currentText = ''; }
      segments.push({ text: match[1], link: match[2] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Regular character
    currentText += remaining[0];
    remaining = remaining.slice(1);
  }

  if (currentText) {
    segments.push({ text: currentText });
  }

  // If no segments, return the whole text as one segment
  if (segments.length === 0) {
    return [{ text: text }];
  }

  return segments;
}

/**
 * Get plain text from token
 */
export function getTokenText(token: Token): string {
  return token.text || '';
}
