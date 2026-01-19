# Markdown Table Notes

Figma Widget for rendering Markdown with full support for tables, code blocks, and more.

## Features

- ✅ **Tables** - Full visual table rendering with headers, borders, and alternating row colors
- ✅ **Code Blocks** - Syntax highlighting for JavaScript, Python, and more
- ✅ **Lists** - Ordered, unordered, nested lists, and task checkboxes
- ✅ **Headings** - H1-H6 with proper sizing and weights
- ✅ **Text Formatting** - Bold, italic, inline code, strikethrough, links
- ✅ **Blockquotes** - Styled quote blocks
- ✅ **Horizontal Rules** - Section dividers
- ✅ **Light/Dark Themes** - Switchable color themes
- ✅ **Adjustable Width** - Small (400px), Medium (600px), Large (800px), Full (1200px), or custom

## Installation

### Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the widget:
   ```bash
   npm run build
   ```
4. In Figma Desktop, go to **Plugins > Development > Import plugin from manifest...**
5. Select the `manifest.json` file from this project

### Watch Mode

For development with auto-rebuild:
```bash
npm run watch
```

## Usage

1. In Figma, right-click on the canvas
2. Select **Widgets > Markdown Table Notes**
3. The widget will appear with sample content
4. Click **"Edit content"** in the toolbar to modify the Markdown
5. Use the **width toggle** (↔️ icon) to cycle through size presets
6. Right-click the widget for more options (theme, font size, custom width)

## Toolbar

- **Edit content** - Opens a modal to edit the Markdown content
- **Width toggle** - Cycles through Small → Medium → Large → Full

## Property Menu (Right-click)

- **Edit Markdown** - Same as toolbar edit button
- **Width** - Select preset or enter custom width (300-1600px)
- **Theme** - Switch between Light and Dark modes
- **Font Size** - Small, Medium, or Large

## Project Structure

```
perfect-markdown/
├── manifest.json              # Figma Widget manifest
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── src/
│   ├── widget.tsx             # Main widget entry
│   ├── types.ts               # TypeScript types
│   ├── components/
│   │   ├── MarkdownRenderer.tsx
│   │   ├── Heading.tsx
│   │   ├── Paragraph.tsx
│   │   ├── Table.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── List.tsx
│   │   ├── Blockquote.tsx
│   │   ├── HorizontalRule.tsx
│   │   ├── Image.tsx
│   │   └── FormattedText.tsx
│   ├── parser/
│   │   └── markdown.ts        # Markdown parser (using marked.js)
│   └── styles/
│       └── theme.ts           # Theme colors and text styles
└── dist/
    └── widget.js              # Built widget
```

## Tech Stack

- **Figma Widget API** - For creating the interactive widget
- **marked.js** - Markdown parsing (GFM support)
- **esbuild** - Fast bundling
- **TypeScript** - Type safety

## Layer Naming Convention

Generated layers follow an HTML-like naming convention:
- `H1: Title text...`
- `H2: Section heading...`
- `P: Paragraph content...`
- `UL: List content...`
- `OL: Ordered list...`
- `TABLE: Table header...`
- `PRE: code`
- `HR`
- `BLOCKQUOTE: Quote text...`

## License

MIT

