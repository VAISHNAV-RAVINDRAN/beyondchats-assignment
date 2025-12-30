# BeyondChats Assignment - Full Stack Project

This repository contains a minimal implementation for the three-phase assignment:

- Backend: Node.js + Express + SQLite for storing articles and providing CRUD APIs.
- Phase 1: Scraper to fetch oldest 5 articles from BeyondChats blogs and save to DB.
- Phase 2: Updater script that finds top-2 Google references, scrapes them, calls OpenAI to re-write and publishes updates.
- Frontend: Small React (Vite) app to view original and updated articles.

## Quick Setup

1. Backend

```bash
cd backend
npm install
# copy .env.example to .env and set OPENAI_API_KEY
# optionally set PORT
npm start
```

2. Scrape BeyondChats (Phase 1)

```bash
cd backend
npm run scrape
```

3. Run the update script (Phase 2)

Make sure backend is running and `.env` has `OPENAI_API_KEY`.

```bash
cd backend
npm run update
```

4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend (default Vite URL) and ensure the backend is available at `http://localhost:4000` or set `VITE_API_BASE` in `frontend/.env`.

## Architecture / Data Flow

- Scraper script fetches the last page of `https://beyondchats.com/blogs/`, extracts article links and content, and inserts rows into SQLite (`backend/articles.db`).
- Express API exposes `GET /articles`, `GET /articles/:id`, `POST /articles`, `PUT /articles/:id`, `DELETE /articles/:id`.
- Update script fetches articles via `GET /articles`, uses `google-it` to retrieve top search results, scrapes their content (via `unfluff`), sends a prompt to OpenAI to rewrite the article, then PUTs the updated HTML back to the API.
- Frontend fetches `/articles` and displays both original and updated content (if present).

## Important Notes

- Do NOT commit your real `OPENAI_API_KEY` to the repo. Use `.env` and keep the key secret.
- This project uses simple content extraction heuristics — results may vary depending on target pages.

## Files of Interest

- Backend: `backend/index.js`, `backend/scraper.js`, `backend/update_script.js`, `backend/db.js`
- Frontend: `frontend/src/App.jsx`, `frontend/src/api.js`

## Live Link

If you host the frontend (e.g., Vercel) and backend (e.g., Heroku), include the link here.


