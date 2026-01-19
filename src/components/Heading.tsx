const { widget } = figma;
const { AutoLayout, Text } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';
import { TextSegment } from '../parser/markdown';
import { renderFormattedText } from './FormattedText';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  segments: TextSegment[];
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

export function Heading({ level, segments, theme, width, fontSizeMultiplier }: HeadingProps) {
  const styleKey = `h${level}` as keyof typeof textStyles;
  const style = applyFontSizeMultiplier(textStyles[styleKey], fontSizeMultiplier);
  const plainText = segments.map((s) => s.text).join('');
  const truncatedText = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

  // Calculate bottom margin based on heading level
  const marginBottom = level <= 2 ? 16 : level <= 4 ? 12 : 8;
  const marginTop = level <= 2 ? 24 : level <= 4 ? 20 : 16;

  return (
    <AutoLayout
      name={`H${level}: ${truncatedText}`}
      direction="vertical"
      width={width}
      padding={{ top: marginTop, bottom: marginBottom }}
    >
      {renderFormattedText({
        segments,
        baseStyle: style,
        theme,
        width,
      })}
    </AutoLayout>
  );
}

