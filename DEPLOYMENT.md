# 🚀 Deployment Guide — GitHub + Render + Netlify

Complete step-by-step guide to push your code to GitHub and deploy
the backend on Render and the frontend on Netlify.

---

## PART 1 — Push to GitHub

### Step 1: Create a GitHub account (if you don't have one)
Go to https://github.com and sign up.

### Step 2: Create a new repository
1. Click the **+** icon (top right) → **New repository**
2. Name it: `markdown-notes-app`
3. Set it to **Public**
4. Do NOT tick "Add README" (we already have one)
5. Click **Create repository**

### Step 3: Push your code from terminal

Open terminal inside your `markdown-notes-app` folder and run:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "feat: initial commit — full-stack markdown notes app"

# 4. Set branch to main
git branch -M main

# 5. Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/markdown-notes-app.git

# 6. Push
git push -u origin main
```

> If asked for credentials, use your GitHub username and a
> **Personal Access Token** (not your password).
> Generate one at: https://github.com/settings/tokens
> → Click "Generate new token (classic)" → tick `repo` scope → copy it.

### Good commit message habits (they're watching your git history!)
```bash
git add .
git commit -m "feat: add debounced auto-save"

git add .
git commit -m "fix: cors config for production"

git add .
git commit -m "feat: version history with restore"
```

---

## PART 2 — Deploy Backend on Render (Free)

Render gives you a free Node.js web service with a persistent disk for SQLite.

### Step 1: Sign up at Render
Go to https://render.com → Sign up with GitHub (easiest).

### Step 2: Create a new Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub account and select `markdown-notes-app`
3. Fill in the settings:

| Field            | Value                    |
|------------------|--------------------------|
| Name             | `marknotes-backend`      |
| Root Directory   | `backend`                |
| Runtime          | `Node`                   |
| Build Command    | `npm install`            |
| Start Command    | `npm start`              |
| Instance Type    | **Free**                 |

### Step 3: Add environment variables
In the **Environment** section, add:

| Key        | Value              |
|------------|--------------------|
| NODE_ENV   | `production`       |
| PORT       | `5000`             |
| DB_PATH    | `/var/data/notes.db` |

### Step 4: Add a Persistent Disk (so SQLite data survives restarts)
1. Scroll to **Disks** section → Click **Add Disk**
2. Fill in:

| Field       | Value         |
|-------------|---------------|
| Name        | `notes-db`    |
| Mount Path  | `/var/data`   |
| Size        | `1 GB`        |

3. Click **Create Web Service**

### Step 5: Wait for deployment (~3-5 mins)
Once deployed, you'll get a URL like:
```
https://marknotes-backend.onrender.com
```

Test it by visiting:
```
https://marknotes-backend.onrender.com/health
```
You should see: `{"status":"ok",...}`

> ⚠️ Free tier services sleep after 15 mins of inactivity.
> First request after sleep takes ~30 seconds to wake up.
> This is fine for the assignment demo.

---

## PART 3 — Deploy Frontend on Netlify (Free)

### Step 1: Sign up at Netlify
Go to https://netlify.com → Sign up with GitHub.

### Step 2: Import your project
1. Click **Add new site** → **Import an existing project**
2. Choose **Deploy with GitHub**
3. Select your `markdown-notes-app` repository

### Step 3: Configure build settings

| Field             | Value               |
|-------------------|---------------------|
| Base directory    | `frontend`          |
| Build command     | `npm run build`     |
| Publish directory | `frontend/build`    |

### Step 4: Add environment variable
Click **Show advanced** → **New variable**:

| Key                   | Value                                          |
|-----------------------|------------------------------------------------|
| REACT_APP_API_URL     | `https://marknotes-backend.onrender.com`       |

> Replace with your actual Render backend URL from Part 2.

### Step 5: Deploy
Click **Deploy site**. Netlify will build and deploy (~2-3 mins).

You'll get a URL like:
```
https://marknotes-abc123.netlify.app
```

### Step 6: (Optional) Set a custom site name
Site settings → **Change site name** → e.g. `marknotes-app`
→ Your URL becomes: `https://marknotes-app.netlify.app`

---

## PART 4 — Update README with live links

Edit your `README.md` and add at the top:

```markdown
## 🌐 Live Demo
- **Frontend:** https://marknotes-app.netlify.app
- **Backend API:** https://marknotes-backend.onrender.com
- **GitHub:** https://github.com/YOUR_USERNAME/markdown-notes-app
```

Then push:
```bash
git add README.md
git commit -m "docs: add live deployment links"
git push
```

---

## PART 5 — Future Updates

Every time you make changes locally and want to redeploy:

```bash
git add .
git commit -m "fix: your change description"
git push
```

Both Render and Netlify watch your GitHub repo and **auto-redeploy** on every push. No manual steps needed.

---

## Troubleshooting

### Backend shows "Application error" on Render
- Check **Logs** tab in Render dashboard
- Make sure `DB_PATH` env var is set to `/var/data/notes.db`
- Make sure the Disk is mounted at `/var/data`

### Frontend shows blank page / cannot connect to backend
- Make sure `REACT_APP_API_URL` in Netlify env vars points to your Render URL (no trailing slash)
- Redeploy after changing env vars (Netlify → Deploys → Trigger deploy)

### CORS error in browser console
- Backend is already configured with `origin: '*'` for development
- If you want to restrict: change `origin: '*'` to `origin: 'https://your-netlify-url.netlify.app'` in `backend/src/index.js`

### Git push asks for password
- GitHub no longer accepts passwords — use a Personal Access Token
- Generate at: https://github.com/settings/tokens → tick `repo`
- Use it as your password when prompted

---

## Summary

| Service  | What it hosts   | URL pattern                          | Cost |
|----------|-----------------|--------------------------------------|------|
| GitHub   | Source code     | github.com/YOU/markdown-notes-app    | Free |
| Render   | Backend + DB    | marknotes-backend.onrender.com       | Free |
| Netlify  | React frontend  | marknotes-app.netlify.app            | Free |
