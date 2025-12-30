# BeyondChats Assignment - Full Stack Project

A three-phase full-stack project that scrapes articles, updates them using AI, and displays them in a responsive UI.

## Project Overview

**Phase 1:** Scrape 5 oldest articles from BeyondChats blogs and store in a local JSON database.
**Phase 2:** Search Google for top references, scrape their content, use OpenAI GPT-3.5 to rewrite articles with similar formatting, and save updates.
**Phase 3:** React frontend displaying original and updated articles side-by-side.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  BeyondChats Articles                 │
│                   (Online Source)                     │
└────────────────────────┬─────────────────────────────┘
                         │
                    [Scraper.js]
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│             Local JSON Database                       │
│          (backend/articles.json)                      │
└───────┬──────────────────────────────┬────────────────┘
        │                              │
   [Phase 1]                      [Phase 2]
   (Scraper)             (Update Script + OpenAI)
        │                              │
        │                 ┌────────────┴──────────────┐
        │                 │                           │
        │            [Google Search]            [OpenAI API]
        │                 │                           │
        │                 └────────────┬──────────────┘
        │                              │
        └──────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│            Express Backend API                        │
│    (CRUD endpoints on port 4000)                     │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│          React Frontend (Vite)                        │
│    (Display articles, port 3000)                     │
└──────────────────────────────────────────────────────┘
```

## Data Flow

1. **Scraper** fetches last page of BeyondChats blogs, extracts article links and content, saves to `articles.json`.
2. **Update Script** reads articles from JSON DB, searches Google for top 2 references, scrapes their content, sends to OpenAI for rewriting, saves updated content back to JSON DB.
3. **Express API** provides GET/POST/PUT/DELETE endpoints for articles.
4. **React Frontend** fetches articles from API and displays original vs. updated versions in a responsive UI.

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your OpenAI API key:
```
OPENAI_API_KEY=sk-proj-xxxxx...
PORT=4000
API_BASE=http://localhost:4000
```

### 2. Start Backend Server

```bash
cd backend
node index.js
```

Server will run on `http://localhost:4000`.

### 3. Scrape Articles (Phase 1)

In a new terminal:
```bash
cd backend
node scraper.js
```

This fetches 5 oldest articles from https://beyondchats.com/blogs/ and saves them to `articles.json`.

### 4. Update Articles (Phase 2)

In a new terminal:
```bash
cd backend
node update_script.js
```

Script will:
- Search Google for each article title
- Scrape top 2 result pages
- Call OpenAI to rewrite articles based on references
- Includes retry logic for rate limits (exponential backoff)
- Save updated content back to database

**Note:** This step requires a valid OpenAI API key with available credits.

### 5. Frontend Setup (Phase 3)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`.

### 6. View Articles

Open browser to `http://localhost:3000` and select articles from the sidebar to view original and updated versions.

## Running All Steps

```bash
cd backend && node index.js &
sleep 2
cd backend && node scraper.js
cd backend && node update_script.js
cd frontend && npm run dev
```

## Project Structure

```
.
├── backend/
│   ├── index.js              # Express server with CRUD APIs
│   ├── db.js                 # JSON file-based database
│   ├── scraper.js            # Phase 1: Article scraper
│   ├── update_script.js       # Phase 2: Article updater with OpenAI
│   ├── articles.json         # Local database
│   ├── package.json
│   └── .env                  # Environment variables (git ignored)
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── api.js            # API client
│   │   ├── main.jsx          # React entry point
│   │   └── styles.css        # Styling
│   ├── index.html
│   ├── vite.config.js        # Vite configuration
│   ├── package.json
│   └── node_modules/
├── README.md
├── .gitignore
└── .git/

```

## Tech Stack

- **Backend:** Node.js + Express + Cheerio (scraping)
- **Database:** JSON file-based
- **AI:** OpenAI GPT-3.5-turbo
- **Frontend:** React 18 + Vite
- **Search:** google-it npm package

## Features

✅ Scrapes articles from target website
✅ Stores articles in local JSON DB
✅ CRUD REST API
✅ Google search integration
✅ Content scraping & extraction
✅ AI-powered article rewriting
✅ Rate limit handling with exponential backoff
✅ Responsive React UI
✅ Original + Updated article comparison

## Notes

- `.env` is git-ignored; use `.env.example` as template
- OpenAI API calls may incur costs
- Google search results may vary by region/time
- Scraping respects robots.txt and uses appropriate User-Agent headers

## Submission

This project is tracked in git with frequent commits. For submission:
- Push to public GitHub repo
- Include live frontend link (e.g., Vercel, Netlify)
- Backend can be deployed to Heroku, Railway, or similar


