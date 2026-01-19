import { ThemeMode } from '../types';

export interface ThemeColors {
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLink: string;

  // Background colors
  background: string;
  backgroundCode: string;
  backgroundBlockquote: string;
  backgroundTableHeader: string;
  backgroundTableRow: string;
  backgroundTableRowAlt: string;

  // Border colors
  border: string;
  borderLight: string;

  // Code colors
  codeText: string;
  codeKeyword: string;
  codeString: string;
  codeComment: string;
  codeNumber: string;
  codeFunction: string;

  // Checkbox
  checkboxChecked: string;
  checkboxUnchecked: string;
}

export const lightTheme: ThemeColors = {
  // Text colors
  textPrimary: '#1a1a1a',
  textSecondary: '#333333',
  textMuted: '#666666',
  textLink: '#0969da',

  // Background colors
  background: '#ffffff',
  backgroundCode: '#f6f8fa',
  backgroundBlockquote: '#f6f8fa',
  backgroundTableHeader: '#f6f8fa',
  backgroundTableRow: '#ffffff',
  backgroundTableRowAlt: '#f9fafb',

  // Border colors
  border: '#d0d7de',
  borderLight: '#e5e7eb',

  // Code colors
  codeText: '#24292e',
  codeKeyword: '#cf222e',
  codeString: '#0a3069',
  codeComment: '#6e7781',
  codeNumber: '#0550ae',
  codeFunction: '#8250df',

  // Checkbox
  checkboxChecked: '#1f883d',
  checkboxUnchecked: '#d0d7de',
};

export const darkTheme: ThemeColors = {
  // Text colors
  textPrimary: '#f0f0f0',
  textSecondary: '#e0e0e0',
  textMuted: '#a0a0a0',
  textLink: '#58a6ff',

  // Background colors
  background: '#0d1117',
  backgroundCode: '#161b22',
  backgroundBlockquote: '#161b22',
  backgroundTableHeader: '#161b22',
  backgroundTableRow: '#0d1117',
  backgroundTableRowAlt: '#161b22',

  // Border colors
  border: '#30363d',
  borderLight: '#21262d',

  // Code colors
  codeText: '#c9d1d9',
  codeKeyword: '#ff7b72',
  codeString: '#a5d6ff',
  codeComment: '#8b949e',
  codeNumber: '#79c0ff',
  codeFunction: '#d2a8ff',

  // Checkbox
  checkboxChecked: '#3fb950',
  checkboxUnchecked: '#30363d',
};

export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'light' ? lightTheme : darkTheme;
}

// Text styles based on element type
export interface ElementTextStyle {
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  lineHeightPercent: number;
  color: keyof ThemeColors;
}

export const textStyles: Record<string, ElementTextStyle> = {
  h1: { fontSize: 32, fontWeight: 700, lineHeightPercent: 125, color: 'textPrimary' },
  h2: { fontSize: 24, fontWeight: 700, lineHeightPercent: 125, color: 'textPrimary' },
  h3: { fontSize: 20, fontWeight: 600, lineHeightPercent: 130, color: 'textPrimary' },
  h4: { fontSize: 16, fontWeight: 600, lineHeightPercent: 135, color: 'textPrimary' },
  h5: { fontSize: 14, fontWeight: 600, lineHeightPercent: 140, color: 'textPrimary' },
  h6: { fontSize: 12, fontWeight: 600, lineHeightPercent: 140, color: 'textMuted' },
  paragraph: { fontSize: 14, fontWeight: 400, lineHeightPercent: 150, color: 'textSecondary' },
  code: { fontSize: 13, fontWeight: 400, lineHeightPercent: 150, color: 'codeText' },
  tableHeader: { fontSize: 14, fontWeight: 600, lineHeightPercent: 140, color: 'textPrimary' },
  tableCell: { fontSize: 14, fontWeight: 400, lineHeightPercent: 140, color: 'textSecondary' },
  listItem: { fontSize: 14, fontWeight: 400, lineHeightPercent: 150, color: 'textSecondary' },
  blockquote: { fontSize: 14, fontWeight: 400, lineHeightPercent: 150, color: 'textMuted' },
  link: { fontSize: 14, fontWeight: 400, lineHeightPercent: 150, color: 'textLink' },
};

export function applyFontSizeMultiplier(
  style: ElementTextStyle,
  multiplier: number
): ElementTextStyle {
  return {
    fontSize: Math.round(style.fontSize * multiplier),
    fontWeight: style.fontWeight,
    lineHeightPercent: style.lineHeightPercent,
    color: style.color,
  };
}

