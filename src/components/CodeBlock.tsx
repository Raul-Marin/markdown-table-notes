const { widget } = figma;
const { AutoLayout, Text, Span } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

// Simple syntax highlighting - identifies common patterns
interface HighlightedSegment {
  text: string;
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'normal';
}

var KEYWORDS = [
  // JavaScript/TypeScript
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import',
  'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw',
  'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined',
  // Python
  'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
  'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not',
  'True', 'False', 'None', 'pass', 'raise', 'global', 'nonlocal',
];

function isKeyword(word: string): boolean {
  for (var i = 0; i < KEYWORDS.length; i++) {
    if (KEYWORDS[i] === word) return true;
  }
  return false;
}

function simpleHighlight(code: string): HighlightedSegment[] {
  var segments: HighlightedSegment[] = [];
  var i = 0;
  var currentText = '';

  function pushCurrent(type: HighlightedSegment['type']) {
    if (currentText) {
      segments.push({ text: currentText, type: type || 'normal' });
      currentText = '';
    }
  }

  while (i < code.length) {
    var char = code[i];
    var remaining = code.slice(i);

    // Comments (// or #)
    if (remaining.indexOf('//') === 0 || remaining.indexOf('#') === 0) {
      pushCurrent('normal');
      var endOfLine = code.indexOf('\n', i);
      var commentEnd = endOfLine === -1 ? code.length : endOfLine;
      segments.push({ text: code.slice(i, commentEnd), type: 'comment' });
      i = commentEnd;
      continue;
    }

    // Multi-line comments /* */
    if (remaining.indexOf('/*') === 0) {
      pushCurrent('normal');
      var commentEndIndex = code.indexOf('*/', i + 2);
      var end = commentEndIndex === -1 ? code.length : commentEndIndex + 2;
      segments.push({ text: code.slice(i, end), type: 'comment' });
      i = end;
      continue;
    }

    // Strings
    if (char === '"' || char === "'" || char === '`') {
      pushCurrent('normal');
      var quote = char;
      var j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++; // Skip escaped characters
        j++;
      }
      segments.push({ text: code.slice(i, j + 1), type: 'string' });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char) && (i === 0 || /[\s\(\[\{,;:=]/.test(code[i - 1]))) {
      pushCurrent('normal');
      var numJ = i;
      while (numJ < code.length && /[0-9.xXa-fA-F]/.test(code[numJ])) numJ++;
      segments.push({ text: code.slice(i, numJ), type: 'number' });
      i = numJ;
      continue;
    }

    // Words (potential keywords or functions)
    if (/[a-zA-Z_$]/.test(char)) {
      pushCurrent('normal');
      var wordJ = i;
      while (wordJ < code.length && /[a-zA-Z0-9_$]/.test(code[wordJ])) wordJ++;
      var word = code.slice(i, wordJ);
      
      // Check if it's followed by ( to determine if it's a function
      var restAfterWord = code.slice(wordJ);
      var isFunction = /^\s*\(/.test(restAfterWord);
      
      if (isKeyword(word)) {
        segments.push({ text: word, type: 'keyword' });
      } else if (isFunction) {
        segments.push({ text: word, type: 'function' });
      } else {
        segments.push({ text: word, type: 'normal' });
      }
      i = wordJ;
      continue;
    }

    // Default: add to current text
    currentText += char;
    i++;
  }

  pushCurrent('normal');
  return segments;
}

function getColorForType(type: HighlightedSegment['type'], theme: ThemeColors): string {
  if (type === 'keyword') return theme.codeKeyword;
  if (type === 'string') return theme.codeString;
  if (type === 'comment') return theme.codeComment;
  if (type === 'number') return theme.codeNumber;
  if (type === 'function') return theme.codeFunction;
  return theme.codeText;
}

export function CodeBlock(props: CodeBlockProps) {
  var code = props.code;
  var language = props.language;
  var theme = props.theme;
  var width = props.width;
  var fontSizeMultiplier = props.fontSizeMultiplier;

  var style = applyFontSizeMultiplier(textStyles.code, fontSizeMultiplier);
  var lines = code.split('\n');
  
  var highlightedLines: HighlightedSegment[][] = [];
  for (var i = 0; i < lines.length; i++) {
    highlightedLines.push(simpleHighlight(lines[i]));
  }

  return (
    <AutoLayout
      name={'PRE: ' + (language || 'code')}
      direction="vertical"
      width={width}
      padding={{ top: 8, bottom: 16 }}
    >
      <AutoLayout
        direction="vertical"
        width="fill-parent"
        padding={16}
        fill={theme.backgroundCode}
        cornerRadius={6}
        stroke={theme.borderLight}
        strokeWidth={1}
      >
        {/* Language badge if specified */}
        {language ? (
          <AutoLayout padding={{ bottom: 8 }}>
            <Text
              fontSize={10}
              fontWeight={500}
              fill={theme.textMuted}
              fontFamily="Inter"
            >
              {language.toUpperCase()}
            </Text>
          </AutoLayout>
        ) : null}
        
        {/* Code content */}
        <AutoLayout direction="vertical" width="fill-parent" spacing={2}>
          {highlightedLines.map(function(segments, lineIndex) {
            return (
              <AutoLayout key={lineIndex} direction="horizontal" width="fill-parent">
                <Text
                  width="fill-parent"
                  fontSize={style.fontSize}
                  fontWeight={style.fontWeight}
                  lineHeight={{ unit: 'percent', value: style.lineHeightPercent }}
                  fontFamily="Source Code Pro"
                >
                  {segments.length === 0 ? (
                    ' '
                  ) : (
                    segments.map(function(segment, segIndex) {
                      return (
                        <Span
                          key={segIndex}
                          fill={getColorForType(segment.type, theme)}
                        >
                          {segment.text}
                        </Span>
                      );
                    })
                  )}
                </Text>
              </AutoLayout>
            );
          })}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}

// Inline code (for `code` in text)
interface InlineCodeProps {
  text: string;
  theme: ThemeColors;
  fontSize: number;
}

export function InlineCode(props: InlineCodeProps) {
  var text = props.text;
  var theme = props.theme;
  var fontSize = props.fontSize;

  return (
    <AutoLayout
      direction="horizontal"
      padding={{ horizontal: 4, vertical: 2 }}
      fill={theme.backgroundCode}
      cornerRadius={3}
    >
      <Text
        fontSize={fontSize - 1}
        fontFamily="Source Code Pro"
        fill={theme.codeText}
      >
        {text}
      </Text>
    </AutoLayout>
  );
}
