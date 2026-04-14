// src/components/Sidebar.jsx
import React, { useState, useCallback } from 'react';

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function formatDate(str) {
  const d = new Date(str);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Sidebar({ notes, activeId, onSelect, onCreate, onSearch, darkMode, onToggleDark }) {
  const [search, setSearch] = useState('');

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  }, [onSearch]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <NoteIcon />
          MarkNotes
        </div>
        <button className="btn-new" onClick={onCreate}>
          + New
        </button>
      </div>

      <div className="search-box">
        <div className="search-wrapper">
          <SearchIcon />
          <input
            className="search-input"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-state">
            {search ? 'No notes match your search.' : 'No notes yet. Create one!'}
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`note-item ${note.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(note.id)}
            >
              <div className="note-item-title">{note.title || 'Untitled'}</div>
              <div className="note-item-excerpt">{note.excerpt || 'No content'}</div>
              <div className="note-item-date">{formatDate(note.updated_at)}</div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="btn-icon"
          onClick={onToggleDark}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
      </div>
    </aside>
  );
}
