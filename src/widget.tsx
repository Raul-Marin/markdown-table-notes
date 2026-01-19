// Markdown Table Notes Widget - With Full Markdown Support
var widgetAPI = figma.widget;

var lightTheme = {
  textPrimary: '#1a1a1a',
  textSecondary: '#333333',
  textMuted: '#666666',
  background: '#ffffff',
  backgroundCode: '#f6f8fa',
  backgroundTableHeader: '#f6f8fa',
  backgroundTableRow: '#ffffff',
  backgroundTableRowAlt: '#f9fafb',
  border: '#d0d7de',
  link: '#0969da',
  checkboxBg: '#ffffff',
  checkboxBorder: '#d0d7de',
  checkboxChecked: '#0969da',
};

var darkTheme = {
  textPrimary: '#f0f0f0',
  textSecondary: '#e0e0e0',
  textMuted: '#a0a0a0',
  background: '#1e1e1e',
  backgroundCode: '#2d2d2d',
  backgroundTableHeader: '#2d2d2d',
  backgroundTableRow: '#1e1e1e',
  backgroundTableRowAlt: '#252525',
  border: '#404040',
  link: '#58a6ff',
  checkboxBg: '#2d2d2d',
  checkboxBorder: '#404040',
  checkboxChecked: '#58a6ff',
};

var DEFAULT_MD = '# Markdown Table Notes\n\nThis is **Markdown Table Notes** - a Figma widget with full Markdown support!\n\n## Features\n\n- Visual tables\n- Checkboxes\n- Nested lists\n- Clickable links\n\n## Table Example\n\n| Feature | Status |\n|---------|--------|\n| Tables | ✅ |\n| Checkboxes | ✅ |\n| Links | ✅ |\n\n## Task List\n\n- [x] Implement tables\n- [x] Add checkbox support\n- [ ] Add more features\n\n## Links\n\nVisit [Figma Community](https://figma.com/community) for more widgets.\n\n---\n\nClick Edit to modify.';

var WIDTH_CYCLE = [400, 600, 800, 1200];

function parseMarkdown(md) {
  var blocks = [];
  var lines = md.split('\n');
  var i = 0;
  
  while (i < lines.length) {
    var line = lines[i];
    
    if (line.trim() === '') {
      i++;
      continue;
    }
    
    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ t: 'hr' });
      i++;
      continue;
    }
    
    // Heading
    var hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      blocks.push({ t: 'h', d: hm[1].length, x: hm[2] });
      i++;
      continue;
    }
    
    // Code block
    if (line.trim().indexOf('```') === 0) {
      var lang = line.trim().slice(3).trim();
      var codeLines = [];
      i++;
      while (i < lines.length && lines[i].trim().indexOf('```') !== 0) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ t: 'code', lang: lang, x: codeLines.join('\n') });
      i++;
      continue;
    }
    
    // Image: ![alt](url)
    var imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      blocks.push({ t: 'img', alt: imgMatch[1], url: imgMatch[2] });
      i++;
      continue;
    }
    
    // Table - check if current line has | and next line is separator
    if (line.indexOf('|') !== -1 && i + 1 < lines.length) {
      var nextLine = lines[i + 1];
      if (/^\|?[\s-:|]+\|?$/.test(nextLine) && nextLine.indexOf('-') !== -1) {
        // Parse table
        var headerCells = parseTableRow(line);
        i += 2; // Skip header and separator
        var rows = [];
        while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim() !== '') {
          rows.push(parseTableRow(lines[i]));
          i++;
        }
        blocks.push({ t: 'table', header: headerCells, rows: rows });
        continue;
      }
    }
    
    // Checkbox list item: - [ ] or - [x]
    var cbMatch = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/);
    if (cbMatch) {
      var indent = cbMatch[1].length;
      var checked = cbMatch[2].toLowerCase() === 'x';
      blocks.push({ t: 'cb', x: cbMatch[3], checked: checked, indent: indent });
      i++;
      continue;
    }
    
    // List item with indentation support
    var lm = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (lm) {
      var listIndent = lm[1].length;
      var level = Math.floor(listIndent / 2);
      blocks.push({ t: 'li', x: lm[2], level: level });
      i++;
      continue;
    }
    
    // Numbered list item
    var numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numMatch) {
      var numIndent = numMatch[1].length;
      var numLevel = Math.floor(numIndent / 2);
      blocks.push({ t: 'ol', x: numMatch[3], num: numMatch[2], level: numLevel });
      i++;
      continue;
    }
    
    // Paragraph (may contain inline links)
    blocks.push({ t: 'p', x: line });
    i++;
  }
  
  return blocks;
}

// Parse inline elements (links, bold, italic)
function parseInlineElements(text) {
  var elements = [];
  var remaining = text;
  
  while (remaining.length > 0) {
    // Check for link: [text](url)
    var linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/);
    if (linkMatch) {
      if (linkMatch[1]) {
        elements.push({ t: 'text', x: linkMatch[1] });
      }
      elements.push({ t: 'link', x: linkMatch[2], url: linkMatch[3] });
      remaining = linkMatch[4];
      continue;
    }
    
    // No more special elements, add rest as text
    elements.push({ t: 'text', x: remaining });
    break;
  }
  
  return elements;
}

function parseTableRow(line) {
  var trimmed = line.trim();
  if (trimmed.charAt(0) === '|') trimmed = trimmed.slice(1);
  if (trimmed.charAt(trimmed.length - 1) === '|') trimmed = trimmed.slice(0, -1);
  var cells = trimmed.split('|');
  var result = [];
  for (var i = 0; i < cells.length; i++) {
    result.push(cells[i].trim());
  }
  return result;
}

function PerfectMarkdown() {
  var useSyncedState = widgetAPI.useSyncedState;
  var usePropertyMenu = widgetAPI.usePropertyMenu;
  var AutoLayout = widgetAPI.AutoLayout;
  var Text = widgetAPI.Text;
  var Rectangle = widgetAPI.Rectangle;
  var h = widgetAPI.h;

  var mdState = useSyncedState('md', DEFAULT_MD);
  var md = mdState[0];
  var setMd = mdState[1];

  var wState = useSyncedState('w', 600);
  var w = wState[0];
  var setW = wState[1];

  var tState = useSyncedState('t', 'light');
  var tn = tState[0];
  var setT = tState[1];

  var theme = tn === 'light' ? lightTheme : darkTheme;
  var cw = w - 40;

  // Cycle width function
  function cycleWidth() {
    var currentIdx = -1;
    for (var i = 0; i < WIDTH_CYCLE.length; i++) {
      if (WIDTH_CYCLE[i] === w) {
        currentIdx = i;
        break;
      }
    }
    var nextIdx = (currentIdx + 1) % WIDTH_CYCLE.length;
    setW(WIDTH_CYCLE[nextIdx]);
  }

  // Get width label
  function getWidthLabel() {
    if (w === 400) return 'S';
    if (w === 600) return 'M';
    if (w === 800) return 'L';
    if (w === 1200) return 'XL';
    return w + '';
  }

  usePropertyMenu(
    [
      { itemType: 'action', propertyName: 'edit', tooltip: 'Edit Markdown' },
      { itemType: 'separator' },
      { itemType: 'action', propertyName: 'cycleWidth', tooltip: '↔ ' + getWidthLabel() },
      {
        itemType: 'dropdown',
        propertyName: 'width',
        tooltip: 'Width',
        selectedOption: String(w),
        options: [
          { option: '400', label: 'Small' },
          { option: '600', label: 'Medium' },
          { option: '800', label: 'Large' },
          { option: '1200', label: 'Full' },
        ],
      },
      {
        itemType: 'dropdown',
        propertyName: 'theme',
        tooltip: 'Theme',
        selectedOption: tn,
        options: [
          { option: 'light', label: 'Light' },
          { option: 'dark', label: 'Dark' },
        ],
      },
    ],
    function(ev) {
      if (ev.propertyName === 'edit') {
        return new Promise(function(resolve) {
          var esc = md.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          figma.showUI('<html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;padding:16px;height:100vh;display:flex;flex-direction:column;background:#f5f5f5}textarea{flex:1;width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;font-family:monospace;font-size:13px;resize:none}button{margin-top:12px;padding:10px 20px;background:#0066ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}</style></head><body><textarea id="e">' + esc + '</textarea><button onclick="parent.postMessage({pluginMessage:{t:\'s\',v:document.getElementById(\'e\').value}},\'*\')">Save</button></body></html>', { width: 500, height: 400 });
          figma.ui.onmessage = function(msg) {
            if (msg.t === 's') setMd(msg.v);
            figma.closePlugin();
            resolve();
          };
        });
      }
      if (ev.propertyName === 'cycleWidth') {
        cycleWidth();
      }
      if (ev.propertyName === 'width') {
        setW(parseInt(ev.propertyValue, 10));
      }
      if (ev.propertyName === 'theme') {
        setT(ev.propertyValue);
      }
    }
  );

  var blocks = parseMarkdown(md);
  var children = [];

  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    
    if (b.t === 'h') {
      var fs = 32 - (b.d - 1) * 4;
      children.push(
        h(AutoLayout, { key: 'h' + i, width: cw, padding: { top: 12, bottom: 8 } },
          h(Text, { fontSize: fs, fontWeight: 700, fill: theme.textPrimary, width: cw }, b.x)
        )
      );
    }
    
    if (b.t === 'p') {
      // Parse inline elements for links
      var inlineEls = parseInlineElements(b.x);
      var pChildren = [];
      for (var pi = 0; pi < inlineEls.length; pi++) {
        var el = inlineEls[pi];
        if (el.t === 'link') {
          pChildren.push(
            h(Text, {
              key: 'pl' + pi,
              fontSize: 14,
              fill: theme.link,
              textDecoration: 'underline',
              onClick: (function(url) {
                return function() {
                  return new Promise(function(resolve) {
                    figma.openExternal(url);
                    resolve();
                  });
                };
              })(el.url),
            }, el.x)
          );
        } else {
          pChildren.push(
            h(Text, { key: 'pt' + pi, fontSize: 14, fill: theme.textSecondary }, el.x)
          );
        }
      }
      children.push(
        h(AutoLayout, { key: 'p' + i, direction: 'horizontal', width: cw, padding: { bottom: 8 }, wrap: true }, pChildren)
      );
    }
    
    if (b.t === 'li') {
      var leftPad = (b.level || 0) * 16;
      children.push(
        h(AutoLayout, { key: 'l' + i, direction: 'horizontal', width: cw, spacing: 8, padding: { bottom: 4, left: leftPad } },
          h(Text, { fontSize: 14, fill: theme.textMuted }, '•'),
          h(Text, { fontSize: 14, fill: theme.textSecondary, width: cw - 20 - leftPad }, b.x)
        )
      );
    }
    
    // Numbered list
    if (b.t === 'ol') {
      var olLeftPad = (b.level || 0) * 16;
      children.push(
        h(AutoLayout, { key: 'ol' + i, direction: 'horizontal', width: cw, spacing: 8, padding: { bottom: 4, left: olLeftPad } },
          h(Text, { fontSize: 14, fill: theme.textMuted, width: 20 }, b.num + '.'),
          h(Text, { fontSize: 14, fill: theme.textSecondary, width: cw - 36 - olLeftPad }, b.x)
        )
      );
    }
    
    // Checkbox
    if (b.t === 'cb') {
      var cbLeftPad = (b.indent || 0) * 8;
      var checkboxIcon = b.checked
        ? h(AutoLayout, {
            width: 16,
            height: 16,
            fill: theme.checkboxChecked,
            cornerRadius: 3,
            horizontalAlignItems: 'center',
            verticalAlignItems: 'center',
          }, h(Text, { fontSize: 12, fill: '#fff', fontWeight: 700 }, '✓'))
        : h(AutoLayout, {
            width: 16,
            height: 16,
            fill: theme.checkboxBg,
            cornerRadius: 3,
            stroke: theme.checkboxBorder,
            strokeWidth: 1,
          });
      children.push(
        h(AutoLayout, { key: 'cb' + i, direction: 'horizontal', width: cw, spacing: 8, padding: { bottom: 4, left: cbLeftPad }, verticalAlignItems: 'center' },
          checkboxIcon,
          h(Text, {
            fontSize: 14,
            fill: b.checked ? theme.textMuted : theme.textSecondary,
            textDecoration: b.checked ? 'strikethrough' : 'none',
            width: cw - 32 - cbLeftPad,
          }, b.x)
        )
      );
    }
    
    // Image
    if (b.t === 'img') {
      children.push(
        h(AutoLayout, {
          key: 'img' + i,
          width: cw,
          padding: { top: 8, bottom: 16 },
          direction: 'vertical',
          spacing: 4,
        },
          h(AutoLayout, {
            width: cw,
            height: 200,
            fill: theme.backgroundCode,
            cornerRadius: 6,
            stroke: theme.border,
            strokeWidth: 1,
            horizontalAlignItems: 'center',
            verticalAlignItems: 'center',
          },
            h(Text, { fontSize: 12, fill: theme.textMuted }, '🖼 ' + (b.alt || 'Image') + ' (' + b.url + ')')
          ),
          b.alt ? h(Text, { fontSize: 12, fill: theme.textMuted, italic: true }, b.alt) : null
        )
      );
    }
    
    if (b.t === 'hr') {
      children.push(
        h(AutoLayout, { key: 'r' + i, width: cw, padding: { top: 12, bottom: 12 } },
          h(Rectangle, { width: cw, height: 1, fill: theme.border })
        )
      );
    }
    
    if (b.t === 'code') {
      var codeLines = b.x.split('\n');
      var codeChildren = [];
      for (var ci = 0; ci < codeLines.length; ci++) {
        codeChildren.push(
          h(Text, { key: 'cl' + ci, fontSize: 13, fontFamily: 'Source Code Pro', fill: theme.textSecondary, width: cw - 32 }, codeLines[ci] || ' ')
        );
      }
      children.push(
        h(AutoLayout, { key: 'c' + i, width: cw, padding: { top: 8, bottom: 16 } },
          h(AutoLayout, {
            direction: 'vertical',
            width: cw,
            padding: 16,
            fill: theme.backgroundCode,
            cornerRadius: 6,
            stroke: theme.border,
            strokeWidth: 1,
            spacing: 2,
          }, codeChildren)
        )
      );
    }
    
    // Table rendering
    if (b.t === 'table') {
      var colCount = b.header.length;
      var colWidth = Math.floor((cw - 2) / colCount);
      
      // Build header row
      var headerCells = [];
      for (var hi = 0; hi < b.header.length; hi++) {
        headerCells.push(
          h(AutoLayout, {
            key: 'th' + hi,
            width: colWidth,
            padding: 10,
            stroke: theme.border,
            strokeWidth: 1,
            strokeAlign: 'inside',
          },
            h(Text, { fontSize: 14, fontWeight: 600, fill: theme.textPrimary }, b.header[hi])
          )
        );
      }
      
      // Build data rows
      var tableRows = [];
      tableRows.push(
        h(AutoLayout, { key: 'thead', direction: 'horizontal', width: cw, fill: theme.backgroundTableHeader }, headerCells)
      );
      
      for (var ri = 0; ri < b.rows.length; ri++) {
        var rowCells = [];
        var row = b.rows[ri];
        for (var ci = 0; ci < row.length; ci++) {
          rowCells.push(
            h(AutoLayout, {
              key: 'td' + ri + '-' + ci,
              width: colWidth,
              padding: 10,
              stroke: theme.border,
              strokeWidth: 1,
              strokeAlign: 'inside',
            },
              h(Text, { fontSize: 14, fill: theme.textSecondary }, row[ci])
            )
          );
        }
        var rowFill = ri % 2 === 0 ? theme.backgroundTableRow : theme.backgroundTableRowAlt;
        tableRows.push(
          h(AutoLayout, { key: 'tr' + ri, direction: 'horizontal', width: cw, fill: rowFill }, rowCells)
        );
      }
      
      children.push(
        h(AutoLayout, { key: 'tbl' + i, direction: 'vertical', width: cw, padding: { top: 8, bottom: 16 } },
          h(AutoLayout, {
            direction: 'vertical',
            width: cw,
            stroke: theme.border,
            strokeWidth: 1,
            cornerRadius: 6,
            overflow: 'hidden',
          }, tableRows)
        )
      );
    }
  }

  return h(AutoLayout, {
    name: 'Markdown Table Notes',
    direction: 'vertical',
    width: w,
    fill: theme.background,
    cornerRadius: 8,
    effect: { type: 'drop-shadow', color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 2 }, blur: 8 },
  },
    h(AutoLayout, {
      direction: 'horizontal',
      width: 'fill-parent',
      padding: { horizontal: 12, vertical: 8 },
      fill: '#1a1a1a',
      cornerRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
      verticalAlignItems: 'center',
    },
      h(AutoLayout, { width: 'fill-parent' },
        h(Text, { fontSize: 13, fontWeight: 600, fill: '#a855f7' }, 'Md '),
        h(Text, { fontSize: 13, fill: '#fff' }, 'Markdown Table Notes')
      ),
      h(AutoLayout, {
        padding: { horizontal: 10, vertical: 6 },
        fill: '#333',
        cornerRadius: 4,
        hoverStyle: { fill: '#444' },
        onClick: function() {
          return new Promise(function(resolve) {
            var esc = md.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            figma.showUI('<html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;padding:16px;height:100vh;display:flex;flex-direction:column;background:#f5f5f5}textarea{flex:1;width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;font-family:monospace;font-size:13px;resize:none}button{margin-top:12px;padding:10px 20px;background:#0066ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px}</style></head><body><textarea id="e">' + esc + '</textarea><button onclick="parent.postMessage({pluginMessage:{t:\'s\',v:document.getElementById(\'e\').value}},\'*\')">Save</button></body></html>', { width: 500, height: 400 });
            figma.ui.onmessage = function(msg) {
              if (msg.t === 's') setMd(msg.v);
              figma.closePlugin();
              resolve();
            };
          });
        },
      },
        h(Text, { fontSize: 12, fill: '#fff' }, 'Edit')
      )
    ),
    h(AutoLayout, {
      direction: 'vertical',
      width: 'fill-parent',
      padding: 20,
    }, children)
  );
}

figma.widget.register(PerfectMarkdown);
