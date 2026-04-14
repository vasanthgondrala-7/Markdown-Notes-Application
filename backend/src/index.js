// src/index.js
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const notesRouter = require('./routes/notes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // handle preflight
app.use(bodyParser.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ──────────────────────────────────────
app.use('/notes', notesRouter);

// Root route — confirms server is alive
app.get('/', (_req, res) => {
  res.json({
    message: '📝 MarkNotes API is running',
    version: '1.0.0',
    endpoints: {
      notes:    'GET/POST /notes',
      note:     'GET/PUT/DELETE /notes/:id',
      versions: 'GET /notes/:id/versions',
      restore:  'POST /notes/:id/restore/:versionId',
      health:   'GET /health',
    },
  });
});

// Health check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   API docs: http://localhost:${PORT}/`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Notes:    http://localhost:${PORT}/notes`);
});
