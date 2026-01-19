const { widget } = figma;
const { AutoLayout } = widget;

import { ThemeColors } from '../styles/theme';
import { parseMarkdown, extractTextSegments, Token } from '../parser/markdown';
import { Heading } from './Heading';
import { Paragraph } from './Paragraph';
import { Blockquote } from './Blockquote';
import { Table } from './Table';
import { CodeBlock } from './CodeBlock';
import { List } from './List';
import { HorizontalRule } from './HorizontalRule';
import { ImagePlaceholder } from './Image';

interface MarkdownRendererProps {
  markdown: string;
  theme: ThemeColors;
  width: number;
  fontSizeMultiplier: number;
}

export function MarkdownRenderer(props: MarkdownRendererProps) {
  var markdown = props.markdown;
  var theme = props.theme;
  var width = props.width;
  var fontSizeMultiplier = props.fontSizeMultiplier;

  var parsed = parseMarkdown(markdown);
  var tokens = parsed.tokens;

  function renderToken(token: Token, index: number): FigmaDeclarativeNode | null {
    var tokenType = token.type;

    if (tokenType === 'heading') {
      var segments = extractTextSegments(token);
      return (
        <Heading
          key={index}
          level={(token.depth || 1) as 1 | 2 | 3 | 4 | 5 | 6}
          segments={segments}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'paragraph') {
      var segments = extractTextSegments(token);
      return (
        <Paragraph
          key={index}
          segments={segments}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'blockquote') {
      var segments = extractTextSegments(token);
      return (
        <Blockquote
          key={index}
          segments={segments}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'code') {
      return (
        <CodeBlock
          key={index}
          code={token.text || ''}
          language={token.lang}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'table') {
      return (
        <Table
          key={index}
          token={token}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'list') {
      return (
        <List
          key={index}
          token={token}
          theme={theme}
          width={width}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      );
    }

    if (tokenType === 'hr') {
      return <HorizontalRule key={index} theme={theme} width={width} />;
    }

    if (tokenType === 'image') {
      return (
        <ImagePlaceholder
          key={index}
          src={token.href || ''}
          alt={token.text}
          title={token.title || undefined}
          theme={theme}
          width={width}
        />
      );
    }

    return null;
  }

  var renderedTokens: FigmaDeclarativeNode[] = [];
  for (var i = 0; i < tokens.length; i++) {
    var rendered = renderToken(tokens[i], i);
    if (rendered !== null) {
      renderedTokens.push(rendered);
    }
  }

  return (
    <AutoLayout
      name="Markdown Content"
      direction="vertical"
      width={width}
      spacing={0}
    >
      {renderedTokens}
    </AutoLayout>
  );
}
