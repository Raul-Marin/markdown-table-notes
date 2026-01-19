const { widget } = figma;
const { AutoLayout, Rectangle } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';
import { TextSegment } from '../parser/markdown';
import { renderFormattedText } from './FormattedText';

interface BlockquoteProps {
  segments: TextSegment[];
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

export function Blockquote({ segments, theme, width, fontSizeMultiplier }: BlockquoteProps) {
  const style = applyFontSizeMultiplier(textStyles.blockquote, fontSizeMultiplier);
  const plainText = segments.map((s) => s.text).join('');
  const truncatedText = plainText.length > 40 ? plainText.substring(0, 40) + '...' : plainText;

  return (
    <AutoLayout
      name={`BLOCKQUOTE: ${truncatedText}`}
      direction="horizontal"
      width={width}
      padding={{ top: 4, bottom: 16 }}
      spacing={12}
    >
      <Rectangle
        name="Border"
        width={4}
        height="fill-parent"
        fill={theme.border}
        cornerRadius={2}
      />
      <AutoLayout direction="vertical" width="fill-parent" padding={{ top: 4, bottom: 4 }}>
        {renderFormattedText({
          segments,
          baseStyle: style,
          theme,
          width: 'fill-parent',
        })}
      </AutoLayout>
    </AutoLayout>
  );
}

