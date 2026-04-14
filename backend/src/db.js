// src/db.js
const Database = require('better-sqlite3');
const path = require('path');
const fs   = require('fs');

// On Render: DB_PATH=/var/data/notes.db (mounted persistent disk)
// Locally:   DB_PATH=./data/notes.db  (or default)
const DB_PATH = process.env.DB_PATH || './data/notes.db';

// Ensure directory exists
const dir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log(`📦 Database path: ${path.resolve(DB_PATH)}`);

const db = new Database(DB_PATH);

// Performance & integrity settings
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// Auto-migrate on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL DEFAULT 'Untitled',
    content    TEXT    NOT NULL DEFAULT '',
    tags       TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS note_versions (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    title    TEXT    NOT NULL,
    content  TEXT    NOT NULL,
    saved_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_notes_updated  ON notes(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_versions_note  ON note_versions(note_id, saved_at DESC);
`);

module.exports = db;
