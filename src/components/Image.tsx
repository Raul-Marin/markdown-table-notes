const { widget } = figma;
const { AutoLayout, Text, Rectangle } = widget;

import { ThemeColors } from '../styles/theme';

interface ImageProps {
  src: string;
  alt?: string;
  title?: string;
  theme: ThemeColors;
  width: number;
}

export function ImagePlaceholder({ src, alt, title, theme, width }: ImageProps) {
  // Since Figma Widget can't directly load external images without async operations,
  // we render a placeholder with the image URL
  // Users can manually replace this with an actual image

  const displayText = alt || title || 'Image';
  const truncatedText = displayText.length > 40 ? displayText.substring(0, 40) + '...' : displayText;

  return (
    <AutoLayout
      name={`IMG: ${truncatedText}`}
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
        stroke={theme.border}
        strokeWidth={1}
        strokeDashPattern={[4, 4]}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={8}
      >
        {/* Image icon placeholder */}
        <Text fontSize={32}>🖼️</Text>
        
        {/* Alt text */}
        {alt && (
          <Text
            fontSize={14}
            fontWeight={500}
            fill={theme.textSecondary}
            horizontalAlignText="center"
          >
            {alt}
          </Text>
        )}
        
        {/* URL (truncated) */}
        <Text
          fontSize={11}
          fill={theme.textMuted}
          horizontalAlignText="center"
          width="fill-parent"
        >
          {src.length > 60 ? src.substring(0, 60) + '...' : src}
        </Text>
        
        {/* Instructions */}
        <Text
          fontSize={10}
          fill={theme.textMuted}
          horizontalAlignText="center"
        >
          (Replace with actual image)
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

