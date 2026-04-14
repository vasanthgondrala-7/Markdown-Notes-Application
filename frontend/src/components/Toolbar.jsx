// src/components/Toolbar.jsx
import React from 'react';

const tools = [
  { label: 'B',      title: 'Bold',        wrap: ['**', '**'],   style: { fontWeight: 'bold' } },
  { label: 'I',      title: 'Italic',      wrap: ['*', '*'],     style: { fontStyle: 'italic' } },
  { label: 'H1',     title: 'Heading 1',   prefix: '# ' },
  { label: 'H2',     title: 'Heading 2',   prefix: '## ' },
  { label: 'H3',     title: 'Heading 3',   prefix: '### ' },
  { label: '`  `',   title: 'Inline code', wrap: ['`', '`'],     style: { fontFamily: 'monospace' } },
  { label: '```',    title: 'Code block',  block: '```\n\n```' },
  { label: '—',      title: 'Divider',     block: '\n---\n' },
  { label: '[]',     title: 'Link',        wrap: ['[', '](url)'] },
  { label: '• List', title: 'Bullet list', prefix: '- ' },
  { label: '1. List',title: 'Ordered list',prefix: '1. ' },
  { label: '> Quote',title: 'Blockquote',  prefix: '> ' },
];

export default function Toolbar({ textareaRef, onChange }) {
  function applyFormat(tool) {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const val   = ta.value;
    const sel   = val.slice(start, end);

    let newVal, newStart, newEnd;

    if (tool.wrap) {
      const [open, close] = tool.wrap;
      newVal   = val.slice(0, start) + open + sel + close + val.slice(end);
      newStart = start + open.length;
      newEnd   = newStart + sel.length;
    } else if (tool.prefix) {
      // Apply to each selected line
      const before   = val.slice(0, start);
      const selected = val.slice(start, end) || '';
      const after    = val.slice(end);
      const lined    = selected.split('\n').map(l => tool.prefix + l).join('\n');
      newVal   = before + lined + after;
      newStart = start + tool.prefix.length;
      newEnd   = start + lined.length;
    } else if (tool.block) {
      newVal   = val.slice(0, start) + tool.block + val.slice(end);
      newStart = start + tool.block.length;
      newEnd   = newStart;
    }

    onChange(newVal);
    // Restore focus + selection after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.title}
          className="toolbar-btn"
          title={tool.title}
          style={tool.style || {}}
          onMouseDown={e => { e.preventDefault(); applyFormat(tool); }}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
