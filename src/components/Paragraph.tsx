const { widget } = figma;
const { AutoLayout } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';
import { TextSegment } from '../parser/markdown';
import { renderFormattedText } from './FormattedText';

interface ParagraphProps {
  segments: TextSegment[];
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

export function Paragraph({ segments, theme, width, fontSizeMultiplier }: ParagraphProps) {
  const style = applyFontSizeMultiplier(textStyles.paragraph, fontSizeMultiplier);
  const plainText = segments.map((s) => s.text).join('');
  const truncatedText = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

  return (
    <AutoLayout
      name={`P: ${truncatedText}`}
      direction="vertical"
      width={width}
      padding={{ top: 0, bottom: 12 }}
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

