// src/components/Editor.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { updateNote, deleteNote } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import VersionDrawer from './VersionDrawer';
import Toolbar from './Toolbar';

const SAVE_DELAY = 900; // ms after last keystroke

export default function Editor({ note, onSaved, onDeleted }) {
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [tags,    setTags]    = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | saving | saved | error
  const [showVersions, setShowVersions] = useState(false);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef(null);

  // Sync local state when note prop changes
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || '');
    setContent(note.content || '');
    setTags(note.tags || '');
    setStatus('idle');
    setDirty(false);
  }, [note?.id]);

  // Debounced auto-save — fires 900ms after last change
  const doSave = useCallback(async () => {
    if (!note || !dirty) return;
    setStatus('saving');
    try {
      const updated = await updateNote(note.id, { title, content, tags });
      onSaved(updated);
      setStatus('saved');
      setDirty(false);
    } catch {
      setStatus('error');
    }
  }, [note, dirty, title, content, tags, onSaved]);

  useDebounce(doSave, `${title}||${content}||${tags}`, SAVE_DELAY);

  function markDirty() {
    setDirty(true);
    setStatus('idle');
  }

  async function handleDelete() {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    await deleteNote(note.id);
    onDeleted(note.id);
  }

  function handleRestore(restoredNote) {
    setTitle(restoredNote.title);
    setContent(restoredNote.content);
    setTags(restoredNote.tags || '');
    onSaved(restoredNote);
  }

  if (!note) {
    return (
      <div className="editor-area">
        <div className="welcome">
          <div className="welcome-icon">📝</div>
          <h2>MarkNotes</h2>
          <p>Select a note on the left, or create a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-area">
      {/* Top bar */}
      <div className="editor-topbar">
        <input
          className="title-input"
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={e => { setTitle(e.target.value); markDirty(); }}
        />

        <input
          className="tag-input"
          type="text"
          placeholder="tags, comma separated"
          value={tags}
          onChange={e => { setTags(e.target.value); markDirty(); }}
          title="Tags (comma separated)"
        />

        <div className="topbar-actions">
          {status === 'saving' && (
            <span className="save-status saving">⏳ Saving…</span>
          )}
          {status === 'saved' && (
            <span className="save-status saved">✓ Saved</span>
          )}
          {status === 'error' && (
            <span className="save-status" style={{ color: 'var(--danger)' }}>⚠ Error</span>
          )}

          <button
            className="btn-action"
            onClick={() => setShowVersions(true)}
            title="Version history"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            History
          </button>

          <button className="btn-action danger" onClick={handleDelete} title="Delete note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Split screen */}
      <div className="split-screen">
        {/* Left: raw Markdown editor */}
        <div className="panel">
          <div className="panel-header">
            <span>✏️ Editor</span>
            <span style={{ fontSize: 10 }}>{content.length} chars</span>
          </div>
          <Toolbar
            textareaRef={textareaRef}
            onChange={val => { setContent(val); markDirty(); }}
          />
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={content}
            onChange={e => { setContent(e.target.value); markDirty(); }}
            placeholder={`# Your note title\n\nWrite **Markdown** here...\n\n- Item one\n- Item two\n\n\`\`\`js\nconsole.log('hello')\n\`\`\``}
            spellCheck="true"
          />
        </div>

        {/* Right: rendered preview */}
        <div className="panel">
          <div className="panel-header">
            <span>👁 Preview</span>
            <span style={{ fontSize: 10 }}>Live</span>
          </div>
          <div className="preview-content">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Start typing in the editor to see the preview…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Version history drawer */}
      {showVersions && (
        <VersionDrawer
          noteId={note.id}
          onClose={() => setShowVersions(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}
