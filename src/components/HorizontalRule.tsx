const { widget } = figma;
const { AutoLayout, Rectangle } = widget;

import { ThemeColors } from '../styles/theme';

interface HorizontalRuleProps {
  theme: ThemeColors;
  width: number;
}

export function HorizontalRule({ theme, width }: HorizontalRuleProps) {
  return (
    <AutoLayout
      name="HR"
      direction="vertical"
      width={width}
      padding={{ top: 16, bottom: 16 }}
      horizontalAlignItems="center"
    >
      <Rectangle
        width={width}
        height={1}
        fill={theme.border}
      />
    </AutoLayout>
  );
}

