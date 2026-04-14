# 📝 MarkNotes — Markdown Notes App

A full-stack Markdown Notes application with real-time split-screen preview, CRUD operations, debounced auto-save, full-text search, tags, dark mode, and version history.

---

## 🏗️ Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18, react-markdown, axios |
| Backend  | Node.js + Express               |
| Database | SQLite (via better-sqlite3)     |

---

## 📁 Project Structure

```
markdown-notes-app/
├── backend/
│   ├── src/
│   │   ├── index.js        ← Express server entry
│   │   ├── db.js           ← SQLite connection + auto-migrate
│   │   ├── migrate.js      ← Standalone migration script
│   │   └── routes/
│   │       └── notes.js    ← CRUD + search + versioning routes
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx                      ← Root component
    │   ├── index.js                     ← ReactDOM entry
    │   ├── components/
    │   │   ├── Sidebar.jsx              ← Note list + search
    │   │   ├── Editor.jsx               ← Split-screen editor + preview
    │   │   └── VersionDrawer.jsx        ← Version history panel
    │   ├── hooks/
    │   │   └── useDebounce.js           ← Debounced auto-save hook
    │   ├── services/
    │   │   └── api.js                   ← Axios API service layer
    │   └── styles/
    │       └── globals.css              ← Full styling + dark mode
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ ([download](https://nodejs.org))
- npm v9+

---

### 1. Clone / Extract the Project

```bash
# If cloned from GitHub:
git clone <your-repo-url>
cd markdown-notes-app

# Or extract the ZIP and cd into the folder
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if needed (default PORT=5000, DB saved to ./data/notes.db)

# Run database migrations (creates tables automatically)
npm run migrate

# Start the server
npm start

# OR for development with hot reload:
npm run dev
```

The backend will be running at: **http://localhost:5000**

---

### 3. Frontend Setup

Open a **new terminal tab**, then:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000 (default, no change needed)

# Start the React dev server
npm start
```

The app will open at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| GET    | `/notes`                         | List all notes (paginated)      |
| GET    | `/notes?search=keyword`          | Full-text search                |
| GET    | `/notes?tag=tagname`             | Filter by tag                   |
| GET    | `/notes/:id`                     | Get single note                 |
| POST   | `/notes`                         | Create note                     |
| PUT    | `/notes/:id`                     | Update note                     |
| DELETE | `/notes/:id`                     | Delete note                     |
| GET    | `/notes/:id/versions`            | List version history            |
| POST   | `/notes/:id/restore/:versionId`  | Restore a previous version      |
| GET    | `/health`                        | Health check                    |

**Query parameters for GET /notes:**
- `search` — full-text search across title and content
- `tag` — filter by tag
- `page` — page number (default: 1)
- `limit` — results per page (default: 20, max: 100)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable   | Default              | Description                   |
|------------|----------------------|-------------------------------|
| `PORT`     | `5000`               | Server port                   |
| `NODE_ENV` | `development`        | Environment mode              |
| `DB_PATH`  | `./data/notes.db`    | Path to SQLite database file  |

### Frontend (`frontend/.env`)

| Variable              | Default                  | Description       |
|-----------------------|--------------------------|-------------------|
| `REACT_APP_API_URL`   | `http://localhost:5000`  | Backend API URL   |

---

## 🗄️ Database Schema

```sql
CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL DEFAULT 'Untitled',
  content    TEXT    NOT NULL DEFAULT '',
  tags       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE note_versions (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title    TEXT    NOT NULL,
  content  TEXT    NOT NULL,
  saved_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

Migrations run automatically on server start — no manual step required beyond the initial `npm run migrate` (which is optional since db.js auto-migrates).

---

## ✅ Features Implemented

### Core (Required)
- [x] Create, edit, delete, list notes
- [x] Markdown rendering: headings, bold/italic, lists, inline code, fenced code blocks, links, tables, blockquotes
- [x] Live split-screen preview (updates on every keystroke)
- [x] Persistent SQLite database

### Bonus
- [x] **Debounced auto-save** — saves 900ms after you stop typing (no API spam)
- [x] **Full-text search** — searches title + content in real time
- [x] **Tags / categories** — add comma-separated tags per note
- [x] **Dark mode** — toggle in sidebar, persisted to localStorage
- [x] **Version history** — every save snapshots the previous state; restore any version
- [x] **Pagination** — backend supports page & limit params
- [x] **Input validation** — express-validator on all routes
- [x] **Proper HTTP status codes** — 201 on create, 404 on not found, 400 on validation error

---

## 🏛️ Architecture Decisions & Trade-offs

**SQLite over PostgreSQL** — SQLite requires zero infrastructure setup, which is ideal for a local-first note-taking app. For production at scale, swapping `better-sqlite3` for `pg` (PostgreSQL) in `db.js` would take ~10 minutes.

**Debounced auto-save over explicit save button** — Auto-save gives a smoother UX and demonstrates understanding of debouncing. The 900ms delay avoids hammering the API on every keystroke.

**better-sqlite3 over sqlite3** — Synchronous API simplifies route handlers; WAL mode provides concurrency for reads. This is a deliberate trade-off: slightly more opinionated but significantly cleaner code.

**react-markdown + remark-gfm** — Handles the full GFM spec (tables, strikethrough, task lists) with minimal code. Rehype plugins available for syntax highlighting if needed.

**Version limit of 10** — Keeps the database lean while providing meaningful history. Easily configurable via the `OFFSET 10` in `saveVersion()`.

---

## 🚢 Deployment

### Render (Recommended)

**Backend:**
1. Create a new Web Service on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env var: `NODE_ENV=production`

**Frontend:**
1. Create a new Static Site on Render
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `build`
5. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com`

### Vercel (Frontend only)

```bash
cd frontend
npx vercel --prod
```

---

## 📹 Demo Video Checklist

- [ ] Show creating a new note
- [ ] Type Markdown — demonstrate live preview updates
- [ ] Show heading, bold, italic, code block, list, link rendering
- [ ] Show debounced auto-save status indicator
- [ ] Search for a note
- [ ] Edit and delete a note
- [ ] Open version history and restore a version
- [ ] Toggle dark mode
- [ ] Briefly walk through code structure (routes → db → components → api service)
- [ ] Explain SQLite + debounce trade-offs

---

## 📬 Questions

Reach out before the deadline, not at it. 🙂
