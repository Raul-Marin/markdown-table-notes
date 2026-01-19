const { widget } = figma;
const { AutoLayout, Text } = widget;

import { ThemeColors, textStyles, applyFontSizeMultiplier } from '../styles/theme';
import { Token, TableCell } from '../parser/markdown';

interface TableProps {
  token: Token;
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

function getCellText(cell: TableCell): string {
  return cell.text || '';
}

function getAlignment(align: 'left' | 'center' | 'right' | null | undefined): 'left' | 'center' | 'right' {
  return align || 'left';
}

export function Table({ token, theme, width, fontSizeMultiplier }: TableProps) {
  const headerStyle = applyFontSizeMultiplier(textStyles.tableHeader, fontSizeMultiplier);
  const cellStyle = applyFontSizeMultiplier(textStyles.tableCell, fontSizeMultiplier);

  const header = token.header || [];
  const rows = token.rows || [];
  const align = token.align || [];

  const columnCount = header.length;
  if (columnCount === 0) return null;

  const cellWidth = Math.floor((width - 2) / columnCount);
  const cellPadding = 10;

  const firstHeaderText = getCellText(header[0]);
  const tableName = firstHeaderText.length > 20 ? firstHeaderText.substring(0, 20) + '...' : firstHeaderText;

  return (
    <AutoLayout
      name={'TABLE: ' + tableName}
      direction="vertical"
      width={width}
      padding={{ top: 8, bottom: 16 }}
    >
      <AutoLayout
        direction="vertical"
        width={width}
        stroke={theme.border}
        strokeWidth={1}
        cornerRadius={6}
        overflow="hidden"
      >
        {/* Header Row */}
        <AutoLayout
          name="TR: Header"
          direction="horizontal"
          width="fill-parent"
          fill={theme.backgroundTableHeader}
        >
          {header.map(function(cell, colIndex) {
            return (
              <AutoLayout
                key={colIndex}
                name={'TH: ' + getCellText(cell)}
                direction="vertical"
                width={cellWidth}
                padding={cellPadding}
                stroke={theme.border}
                strokeWidth={1}
                strokeAlign="inside"
                horizontalAlignItems={
                  getAlignment(align[colIndex]) === 'center'
                    ? 'center'
                    : getAlignment(align[colIndex]) === 'right'
                    ? 'end'
                    : 'start'
                }
              >
                <Text
                  width="fill-parent"
                  fontSize={headerStyle.fontSize}
                  fontWeight={headerStyle.fontWeight}
                  lineHeight={{ unit: 'percent', value: headerStyle.lineHeightPercent }}
                  fill={theme[headerStyle.color]}
                  horizontalAlignText={getAlignment(align[colIndex])}
                >
                  {getCellText(cell)}
                </Text>
              </AutoLayout>
            );
          })}
        </AutoLayout>

        {/* Data Rows */}
        {rows.map(function(row, rowIndex) {
          return (
            <AutoLayout
              key={rowIndex}
              name={'TR: Row ' + (rowIndex + 1)}
              direction="horizontal"
              width="fill-parent"
              fill={rowIndex % 2 === 0 ? theme.backgroundTableRow : theme.backgroundTableRowAlt}
            >
              {row.map(function(cell, colIndex) {
                return (
                  <AutoLayout
                    key={colIndex}
                    name={'TD: ' + getCellText(cell)}
                    direction="vertical"
                    width={cellWidth}
                    padding={cellPadding}
                    stroke={theme.border}
                    strokeWidth={1}
                    strokeAlign="inside"
                    horizontalAlignItems={
                      getAlignment(align[colIndex]) === 'center'
                        ? 'center'
                        : getAlignment(align[colIndex]) === 'right'
                        ? 'end'
                        : 'start'
                    }
                  >
                    <Text
                      width="fill-parent"
                      fontSize={cellStyle.fontSize}
                      fontWeight={cellStyle.fontWeight}
                      lineHeight={{ unit: 'percent', value: cellStyle.lineHeightPercent }}
                      fill={theme[cellStyle.color]}
                      horizontalAlignText={getAlignment(align[colIndex])}
                    >
                      {getCellText(cell)}
                    </Text>
                  </AutoLayout>
                );
              })}
            </AutoLayout>
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
}
