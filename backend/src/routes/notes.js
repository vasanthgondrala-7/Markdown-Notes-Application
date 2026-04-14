// src/routes/notes.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Helper: send validation errors
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  return null;
}

// Helper: snapshot a version
function saveVersion(noteId) {
  const note = db.prepare('SELECT title, content FROM notes WHERE id = ?').get(noteId);
  if (!note) return;
  db.prepare(
    'INSERT INTO note_versions (note_id, title, content) VALUES (?, ?, ?)'
  ).run(noteId, note.title, note.content);

  // Keep only last 10 versions per note
  const old = db.prepare(
    `SELECT id FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC LIMIT -1 OFFSET 10`
  ).all(noteId);
  if (old.length) {
    const ids = old.map(r => r.id);
    db.prepare(`DELETE FROM note_versions WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
  }
}

// ──────────────────────────────────────────────
// GET /notes?search=&tag=&page=&limit=
// ──────────────────────────────────────────────
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  (req, res) => {
    if (validate(req, res)) return;

    const { search, tag } = req.query;
    const page  = req.query.page  || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;

    let where  = [];
    let params = [];

    if (search) {
      where.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tag) {
      where.push('tags LIKE ?');
      params.push(`%${tag}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM notes ${whereClause}`
    ).get(...params).count;

    const notes = db.prepare(
      `SELECT id, title, substr(content, 1, 200) as excerpt, tags, created_at, updated_at
       FROM notes ${whereClause}
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    res.json({
      data: notes,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  }
);

// ──────────────────────────────────────────────
// GET /notes/:id
// ──────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  (req, res) => {
    if (validate(req, res)) return;
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ data: note });
  }
);

// ──────────────────────────────────────────────
// POST /notes
// ──────────────────────────────────────────────
router.post(
  '/',
  [
    body('title').optional().trim().isLength({ max: 255 }),
    body('content').optional().isString(),
    body('tags').optional().isString(),
  ],
  (req, res) => {
    if (validate(req, res)) return;

    const { title = 'Untitled', content = '', tags = '' } = req.body;
    const result = db.prepare(
      'INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)'
    ).run(title, content, tags);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: note });
  }
);

// ──────────────────────────────────────────────
// PUT /notes/:id
// ──────────────────────────────────────────────
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('title').optional().trim().isLength({ max: 255 }),
    body('content').optional().isString(),
    body('tags').optional().isString(),
  ],
  (req, res) => {
    if (validate(req, res)) return;

    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    // Save version before overwriting
    saveVersion(id);

    const title   = req.body.title   ?? existing.title;
    const content = req.body.content ?? existing.content;
    const tags    = req.body.tags    ?? existing.tags;

    db.prepare(
      `UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(title, content, tags, id);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    res.json({ data: note });
  }
);

// ──────────────────────────────────────────────
// DELETE /notes/:id
// ──────────────────────────────────────────────
router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  (req, res) => {
    if (validate(req, res)) return;
    const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.status(200).json({ message: 'Note deleted' });
  }
);

// ──────────────────────────────────────────────
// GET /notes/:id/versions
// ──────────────────────────────────────────────
router.get(
  '/:id/versions',
  [param('id').isInt({ min: 1 }).toInt()],
  (req, res) => {
    if (validate(req, res)) return;
    const versions = db.prepare(
      `SELECT id, note_id, title, substr(content,1,200) as excerpt, saved_at
       FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC`
    ).all(req.params.id);
    res.json({ data: versions });
  }
);

// ──────────────────────────────────────────────
// POST /notes/:id/restore/:versionId
// ──────────────────────────────────────────────
router.post(
  '/:id/restore/:versionId',
  [
    param('id').isInt({ min: 1 }).toInt(),
    param('versionId').isInt({ min: 1 }).toInt(),
  ],
  (req, res) => {
    if (validate(req, res)) return;

    const { id, versionId } = req.params;
    const version = db.prepare(
      'SELECT * FROM note_versions WHERE id = ? AND note_id = ?'
    ).get(versionId, id);

    if (!version) return res.status(404).json({ error: 'Version not found' });

    saveVersion(id); // snapshot current before restoring

    db.prepare(
      `UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(version.title, version.content, id);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    res.json({ data: note, message: 'Restored successfully' });
  }
);

module.exports = router;
