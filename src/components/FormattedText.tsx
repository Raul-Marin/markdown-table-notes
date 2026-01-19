const { widget } = figma;
const { Text, Span } = widget;

import { ThemeColors, ElementTextStyle } from '../styles/theme';
import { TextSegment } from '../parser/markdown';

interface FormattedTextProps {
  segments: TextSegment[];
  baseStyle: ElementTextStyle;
  theme: ThemeColors;
  width: number | 'fill-parent';
}

export function renderFormattedText({ segments, baseStyle, theme, width }: FormattedTextProps) {
  // Check if we have any formatting
  const hasFormatting = segments.some((s) => s.bold || s.italic || s.code || s.link);

  if (!hasFormatting && segments.length === 1) {
    // Simple text without formatting
    return (
      <Text
        width={width}
        fontSize={baseStyle.fontSize}
        fontWeight={baseStyle.fontWeight}
        lineHeight={{ unit: 'percent', value: baseStyle.lineHeightPercent }}
        fill={theme[baseStyle.color]}
      >
        {segments[0].text}
      </Text>
    );
  }

  // Text with formatting - use Spans
  return (
    <Text
      width={width}
      fontSize={baseStyle.fontSize}
      fontWeight={baseStyle.fontWeight}
      lineHeight={{ unit: 'percent', value: baseStyle.lineHeightPercent }}
      fill={theme[baseStyle.color]}
    >
      {segments.map((segment, index) => {
        let fontWeight = baseStyle.fontWeight;
        let fontStyle: 'normal' | 'italic' = 'normal';
        let fill = theme[baseStyle.color];
        let textDecoration: 'none' | 'underline' | 'strikethrough' = 'none';

        if (segment.bold) {
          fontWeight = 700;
        }
        if (segment.italic) {
          fontStyle = 'italic';
        }
        if (segment.code) {
          fill = theme.codeText;
        }
        if (segment.link) {
          fill = theme.textLink;
          textDecoration = 'underline';
        }
        if (segment.strikethrough) {
          textDecoration = 'strikethrough';
        }

        return (
          <Span
            key={index}
            fontWeight={fontWeight}
            fontFamily={segment.code ? 'Source Code Pro' : undefined}
            fontSize={segment.code ? baseStyle.fontSize - 1 : undefined}
            fill={fill}
            textDecoration={textDecoration}
            href={segment.link}
          >
            {segment.text}
          </Span>
        );
      })}
    </Text>
  );
}

