const { widget } = figma;
const { AutoLayout, Text, SVG } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';
import { Token, ListItemToken, extractTextSegments } from '../parser/markdown';
import { renderFormattedText } from './FormattedText';

interface ListProps {
  token: Token;
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
  depth?: number;
}

interface ListItemProps {
  item: ListItemToken;
  index: number;
  ordered: boolean;
  start: number;
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
  depth: number;
}

// Bullet characters for different depths
var BULLETS = ['•', '◦', '▪', '▫'];

// Checkbox SVG icons
var CHECKBOX_UNCHECKED = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';

var CHECKBOX_CHECKED = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor"/><path d="M4 8L7 11L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function ListItem(props: ListItemProps) {
  var item = props.item;
  var index = props.index;
  var ordered = props.ordered;
  var start = props.start;
  var theme = props.theme;
  var width = props.width;
  var fontSizeMultiplier = props.fontSizeMultiplier;
  var depth = props.depth;

  var style = applyFontSizeMultiplier(textStyles.listItem, fontSizeMultiplier);
  var indentWidth = 24;
  var bulletWidth = 20;
  var contentWidth = width - indentWidth * depth - bulletWidth;

  var textContent = extractTextSegments({ type: 'text', raw: item.text, text: item.text });
  var isTask = item.task === true;
  var isChecked = item.checked === true;

  var firstText = textContent[0] ? textContent[0].text : '';
  var truncatedText = firstText.length > 40 ? firstText.substring(0, 40) + '...' : firstText;

  return (
    <AutoLayout
      name={'LI: ' + truncatedText}
      direction="vertical"
      width={width}
      padding={{ left: indentWidth * depth }}
    >
      <AutoLayout direction="horizontal" width="fill-parent" spacing={8} verticalAlignItems="start">
        {/* Bullet/Number/Checkbox */}
        <AutoLayout width={bulletWidth} height={style.fontSize * 1.5} verticalAlignItems="center">
          {isTask ? (
            <SVG
              src={isChecked ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED}
              width={16}
              height={16}
            />
          ) : ordered ? (
            <Text
              fontSize={style.fontSize}
              fontWeight={style.fontWeight}
              fill={theme.textMuted}
            >
              {(start + index) + '.'}
            </Text>
          ) : (
            <Text
              fontSize={style.fontSize}
              fontWeight={style.fontWeight}
              fill={theme.textMuted}
            >
              {BULLETS[depth % BULLETS.length]}
            </Text>
          )}
        </AutoLayout>

        {/* Content */}
        <AutoLayout direction="vertical" width={contentWidth}>
          {renderFormattedText({
            segments: textContent,
            baseStyle: {
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeightPercent: style.lineHeightPercent,
              color: isTask && isChecked ? 'textMuted' : style.color,
            },
            theme: theme,
            width: contentWidth,
          })}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}

export function List(props: ListProps) {
  var token = props.token;
  var theme = props.theme;
  var width = props.width;
  var fontSizeMultiplier = props.fontSizeMultiplier;
  var depth = props.depth || 0;

  var ordered = token.ordered || false;
  var start = token.start || 1;
  var items = token.items || [];

  var firstItem = items[0];
  var firstText = firstItem ? firstItem.text : '';
  var truncatedText = firstText.length > 30 ? firstText.substring(0, 30) + '...' : firstText;

  return (
    <AutoLayout
      name={(ordered ? 'OL' : 'UL') + ': ' + truncatedText}
      direction="vertical"
      width={width}
      spacing={4}
      padding={{ top: depth === 0 ? 4 : 0, bottom: depth === 0 ? 12 : 4 }}
    >
      {items.map(function(item, index) {
        return (
          <ListItem
            key={index}
            item={item}
            index={index}
            ordered={ordered}
            start={start}
            theme={theme}
            width={width}
            fontSizeMultiplier={fontSizeMultiplier}
            depth={depth}
          />
        );
      })}
    </AutoLayout>
  );
}
