// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './styles/globals.css';
import Sidebar from './components/Sidebar';
import Editor  from './components/Editor';
import { getNotes, createNote, getNote } from './services/api';

export default function App() {
  const [notes,      setNotes]      = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [search,     setSearch]     = useState('');
  const [darkMode,   setDarkMode]   = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [apiError,   setApiError]   = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load notes list
  const loadNotes = useCallback(async (q = '') => {
    try {
      const res = await getNotes(q ? { search: q } : {});
      setNotes(res.data || []);
      setApiError(false);
    } catch (err) {
      console.error('Failed to load notes:', err.message);
      setApiError(true);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // Debounced search re-fetch
  useEffect(() => {
    const t = setTimeout(() => loadNotes(search), 300);
    return () => clearTimeout(t);
  }, [search, loadNotes]);

  async function handleSelect(id) {
    try {
      const note = await getNote(id);
      setActiveNote(note);
    } catch (err) {
      console.error('Failed to load note:', err.message);
    }
  }

  async function handleCreate() {
    try {
      const note = await createNote({ title: 'Untitled', content: '' });
      setNotes(prev => [note, ...prev]);
      setActiveNote(note);
    } catch (err) {
      console.error('Failed to create note:', err.message);
    }
  }

  function handleSaved(updated) {
    setNotes(prev =>
      prev.map(n => n.id === updated.id ? { ...n, ...updated } : n)
    );
    setActiveNote(updated);
  }

  function handleDeleted(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
    setActiveNote(null);
  }

  // Backend not reachable
  if (apiError) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', gap: 12, padding: 24,
        background: '#1e1e2e', color: '#cdd6f4'
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ margin: 0 }}>Cannot connect to backend</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: 400 }}>
          Make sure the backend is running on <code style={{
            background: '#313145', padding: '2px 8px', borderRadius: 4
          }}>http://localhost:5000</code>
        </p>
        <p style={{ color: '#6c7086', fontSize: 13 }}>
          Run: <code>cd backend &amp;&amp; npm start</code>
        </p>
        <button
          onClick={() => { setApiError(false); loadNotes(); }}
          style={{
            marginTop: 8, background: '#7c3aed', color: 'white',
            border: 'none', borderRadius: 8, padding: '10px 24px',
            fontSize: 14, cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        activeId={activeNote?.id}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onSearch={setSearch}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <Editor
        note={activeNote}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
