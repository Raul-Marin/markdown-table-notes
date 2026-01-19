// Theme types
export type ThemeMode = 'light' | 'dark';

// Width presets
export type WidthPreset = 'small' | 'medium' | 'large' | 'full' | 'custom';

export const WIDTH_PRESETS: Record<Exclude<WidthPreset, 'custom'>, number> = {
  small: 400,
  medium: 600,
  large: 800,
  full: 1200,
};

// Markdown AST Node Types
export type MarkdownNodeType =
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'strong'
  | 'em'
  | 'codespan'
  | 'code'
  | 'blockquote'
  | 'list'
  | 'list_item'
  | 'table'
  | 'tablerow'
  | 'tablecell'
  | 'hr'
  | 'br'
  | 'link'
  | 'image'
  | 'html'
  | 'space'
  | 'checkbox';

export interface MarkdownToken {
  type: MarkdownNodeType;
  raw?: string;
  text?: string;
  depth?: number; // For headings (1-6)
  ordered?: boolean; // For lists
  start?: number; // For ordered lists
  items?: MarkdownToken[]; // For lists
  tokens?: MarkdownToken[]; // Nested tokens
  header?: MarkdownToken[]; // Table header
  rows?: MarkdownToken[][]; // Table rows
  align?: Array<'left' | 'center' | 'right' | null>; // Table alignment
  cells?: MarkdownToken[]; // Table cells
  lang?: string; // Code language
  href?: string; // Link URL
  title?: string; // Link/image title
  checked?: boolean; // Checkbox state
  loose?: boolean; // List item
  task?: boolean; // Task list item
}

// Widget State
export interface WidgetState {
  markdown: string;
  width: number;
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
}

// Text style definitions
export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semi-bold' | 'bold';
  lineHeight: number | 'auto';
  letterSpacing?: number;
}

export const FONT_SIZE_MULTIPLIERS: Record<WidgetState['fontSize'], number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

