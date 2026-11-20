# 🎵 Audix — AI-Powered Spotify Music Discovery & Intelligence Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=400&q=80" alt="Audix Banner" width="100%" style="border-radius: 16px; object-fit: cover; max-height: 320px;" />
</p>

<p align="center">
  <strong>Next-Generation Music Discovery, Conversational AI Curation, and Sonic Telemetry Integrated with Spotify</strong>
</p>

<p align="center">
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-19.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 19" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://developer.spotify.com"><img src="https://img.shields.io/badge/Spotify-Web_API-1DB954?style=for-the-badge&logo=spotify&logoColor=white" alt="Spotify Web API" /></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
</p>

---

## 🌟 Overview

**Audix** is a premium, AI-powered music intelligence and listening platform built on top of the **Spotify Web API**. It bridges the gap between passive music streaming and proactive, intelligent sonic curation.

Rather than acting merely as a basic API player wrapper, Audix analyzes your actual Spotify listening behavior to extract deep taste metrics, provides an interactive conversational AI musicologist, generates themed playlists using natural-language prompts, and gives you actionable insight into your music personality.

---

## 🚀 Key Features

### 🤖 1. Context-Aware AI Music Assistant
- **Real-Time Spotify Context**: The AI assistant has secure access to your top artists, recurring tracks, and recent listening history.
- **Natural Language Discovery**: Ask complex taste inquiries like:
  - *"Recommend songs based on my current vibe"*
  - *"Suggest underrated indie artists similar to Arctic Monkeys and The Weeknd"*
  - *"Give me upbeat French touch synthwave for focus"*
  - *"Suggest something completely wild and opposite to what I normally listen to"*
- **Verified Spotify Track Cards**: Song recommendations are parsed and validated against the Spotify API in real time to show high-res artwork, duration, preview URLs, direct Spotify links, and instant play buttons.

### ✨ 2. AI Playlist Generator with One-Click Spotify Sync
- **Prompt-to-Playlist**: Type natural prompts such as:
  > *"Create a 15-song playlist for late night coding in Tokyo"*
  > *"High energy cyberpunk gym workout with driving basslines"*
- **Sequenced Curation**: Produces a customized title, mood description, genre tags, and tracklist.
- **Direct Library Sync**: One-click **"Save to Spotify"** button automatically creates the playlist in your personal Spotify account and adds all verified Spotify URIs.

### 🧬 3. AI Sonic Taste Analysis & Personality Archetype
- **Musical Persona Dossier**: Generates your unique archetype (e.g., *The Atmospheric Sonic Explorer*).
- **Sonic Mood Breakdown**: Identifies dominant moods (Nocturnal, Euphoric, Contemplative) and acoustic aesthetics.
- **Horizon Suggestions**: Outlines sub-genres and music movements tailored for your next musical journey.

### 📊 4. Deep Acoustic Telemetry & Analytics
- **Multi-Scope History**: Analyze listening data across 4 Weeks (`short_term`), 6 Months (`medium_term`), or All Time (`long_term`).
- **Acoustic Genre Distribution**: Percentage breakdown of your recurring musical genres.
- **Release Decade Histogram**: Track distribution across the 1970s, 80s, 90s, 2000s, 2010s, and 2020s.
- **Obscurity Index**: Measures your mainstream vs. deep-cut underground preference ratio.
- **Repeat Play Velocity**: Tracks how frequently songs are replayed in your queue.

### 🎧 5. Persistent Music Player & Hybrid Engine
- **Global Docked Player**: Always accessible at the bottom of the dashboard with playback controls, progress scrubber, volume adjustment, and device selection.
- **Spotify Connect Remote Control**: Control active Spotify devices (desktop app, web, mobile, smart speakers).
- **Automatic Fallback Audio**: Seamlessly falls back to 30-second HTML5 preview streaming when Spotify Connect is not active or for Spotify Free users.

### 🔍 6. Complete Music Discovery & Search
- **Discovery Engine**: Editorial featured playlists, new album drops, and acoustic category exploration.
- **Unified Catalog Search**: Instant search across tracks, artists, albums, and playlists with category filter pills.
- **Artist & Album Spotlight**: Verified artist bios, top songs, discography, and fans-also-like recommendations.

### 🎨 7. Triple-Theme UI/UX
- **Amethyst Void**: Dark-mode canvas (`#060608`) with violet neon accents and glassmorphism.
- **Spotify Classic**: Iconic Spotify dark charcoal with emerald accents.
- **Ice Light**: Crisp, clean, daylight-friendly indigo aesthetic.

---

## 🏛 Architecture

```
                  ┌───────────────────────────────────────────┐
                  │          Audix Angular 19 Client          │
                  │   (Standalone, Tailwind, RxJS, Guards)    │
                  └─────────────────────┬─────────────────────┘
                                        │ HTTP / Bearer / Cookies
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          Audix Node/Express Backend       │
                  │   (ESM, Auth Middleware, Token Manager)   │
                  └─────────┬───────────────────────┬─────────┘
                            │                       │
               ┌────────────┴───────────┐     ┌─────┴──────────────────┐
               │    Spotify Web API     │     │   Google Gemini LLM    │
               │  - OAuth 2.0 PKCE      │     │  - Contextual Taste    │
               │  - Player & Connect    │     │  - Playlist Synthesis  │
               │  - Search & Discovery  │     │  - Personality Report  │
               │  - Playlists & Library │     └────────────────────────┘
               └────────────────────────┘
                            │
               ┌────────────┴───────────┐
               │     MongoDB Database   │
               │  - User & Auth Tokens  │
               │  - Generated Playlists │
               │  - Chat Message Log    │
               └────────────────────────┘
```

---

## 📁 Project Structure

```
Audix/
├── Backend/
│   ├── config/
│   │   ├── connect.DB.js            # MongoDB connection handler
│   │   └── spotifyScopes.js         # OAuth 2.0 scopes & credential builder
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT & session verification middleware
│   ├── models/
│   │   ├── user/user.models.js      # User identity & Spotify token model
│   │   ├── chat/chat.model.js       # AI chat history schema
│   │   └── playlist/generatedPlaylist.model.js  # Synthesized playlists
│   ├── modules/
│   │   ├── user/                    # Auth, Spotify OAuth callback, profile
│   │   ├── spotify/                 # Spotify Web API proxy controllers & routes
│   │   ├── ai/                      # Gemini LLM curation & playlist generator
│   │   └── analytics/               # Acoustic statistics & genre breakdown
│   ├── services/
│   │   └── spotifyToken.service.js  # Automatic token refresh & retry engine
│   ├── app.js                       # Express app configuration & middlewares
│   ├── routes.js                    # Primary API router
│   ├── server.js                    # Server entrypoint
│   └── .env.example                 # Environment configuration template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── cors/
│   │   │   │   ├── guards/          # AuthGuard protecting application routes
│   │   │   │   ├── interceptors/    # AuthInterceptor attaching tokens
│   │   │   │   └── services/        # AuthService, SpotifyService, PlayerService,
│   │   │   │                        # AiService, AnalyticsService, ThemeService
│   │   │   ├── features/
│   │   │   │   ├── home/            # Interactive landing page
│   │   │   │   ├── dashboard/       # Main user dashboard with live Spotify feeds
│   │   │   │   ├── discover/        # Featured playlists & new releases
│   │   │   │   ├── search/          # Unified catalog search
│   │   │   │   ├── artist-detail/   # Artist spotlight & top tracks
│   │   │   │   ├── album-detail/    # Album tracklist & metadata
│   │   │   │   ├── playlists/       # Personal playlists & create modal
│   │   │   │   ├── playlist-detail/ # Track management & playlist play
│   │   │   │   ├── liked-songs/     # Verified saved library songs
│   │   │   │   ├── recently-played/ # Listening history timeline
│   │   │   │   ├── analytics/       # Visual telemetry & acoustic charts
│   │   │   │   ├── ai-assistant/    # Conversational LLM assistant interface
│   │   │   │   ├── ai-playlist-generator/ # Prompt-based playlist generator
│   │   │   │   ├── profile/         # Identity dossier & taste report
│   │   │   │   └── settings/        # System preferences & theme selector
│   │   │   ├── layouts/
│   │   │   │   ├── home-layout/     # App shell with sidebar, topbar & player
│   │   │   │   └── public-layout/   # Unauthenticated shell
│   │   │   └── shard/
│   │   │       └── components/      # SideBar, TopBar, MusicPlayer
│   │   └── styles.css               # Global Tailwind CSS definitions
│   └── angular.json
└── README.md
```

---

## 🛠 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/audix`) or MongoDB Atlas URI
- **Spotify Developer Account**: Free account at [developer.spotify.com](https://developer.spotify.com)
- **Google AI Studio Account**: Free API key at [aistudio.google.com](https://aistudio.google.com) *(optional but recommended for LLM intelligence)*

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Panay5423/Audix.git
cd Audix
```

### 2. Configure Environment Variables
Copy `.env.example` in `Backend/` (or root):

```bash
cp Backend/.env.example Backend/.env
```

Fill in your configuration details:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# MongoDB
MONGODB_URI=mongodb://localhost:27017/audix

# JWT Secret
JWT_SECRET=audix_ultra_secure_jwt_secret_key_2026

# Spotify Developer Application Credentials
# Create app at https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/spotify/callback
SPOTIFY_AUTHORIZATION_URL=https://accounts.spotify.com/authorize

# AI / LLM Configuration (Google Gemini)
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
```

### 3. Configure Spotify Developer Dashboard
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an App named **Audix**.
3. Under **Settings -> Redirect URIs**, add:
   ```
   http://localhost:5000/api/auth/spotify/callback
   ```
4. Copy your **Client ID** and **Client Secret** into your `.env` file.
5. In **User Management**, add your Spotify email address while your app is in Developer Mode.

### 4. Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## 🖥 Running the Application

### Start the Backend Server
```bash
cd Backend
npm start
# Server starts on http://localhost:5000
```
*(Or use `npm run dev` for watch mode)*

### Start the Frontend Application
```bash
cd frontend
npm start
# Application serves on http://localhost:4200
```

Open your browser at **`http://localhost:4200`** and click **Connect Spotify** to experience Audix!

---

## 📡 API Reference Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `GET` | `/api/auth/authorization` | Get Spotify OAuth URL |
| | `GET` | `/api/auth/spotify/callback` | OAuth redirect & token exchange |
| | `GET` | `/api/auth/me` | Fetch authenticated user profile |
| | `POST`| `/api/auth/logout` | Disconnect session & clear cookies |
| **Spotify** | `GET` | `/api/spotify/top-tracks` | User's top tracks across time ranges |
| | `GET` | `/api/spotify/top-artists` | User's top artists across time ranges |
| | `GET` | `/api/spotify/recently-played` | Chronological listening history |
| | `GET` | `/api/spotify/saved-tracks` | Liked songs library |
| | `GET` | `/api/spotify/playlists` | User's playlists |
| | `POST`| `/api/spotify/playlists` | Create new Spotify playlist |
| | `GET` | `/api/spotify/search` | Unified search (tracks, artists, albums) |
| | `GET` | `/api/spotify/player/state` | Current active playback status |
| | `PUT` | `/api/spotify/player/play` | Remote play track/album/context |
| | `PUT` | `/api/spotify/player/pause` | Remote pause |
| **AI** | `POST`| `/api/ai/chat` | Contextual AI chat with track validation |
| | `GET` | `/api/ai/chat/history` | Retrieve conversation history |
| | `POST`| `/api/ai/generate-playlist` | Synthesize playlist from prompt |
| | `POST`| `/api/ai/save-playlist` | Sync generated playlist to Spotify account |
| | `GET` | `/api/ai/taste-analysis` | Sonic archetype and personality report |
| **Analytics**| `GET` | `/api/analytics` | Acoustic genres, decades & obscurity metrics |

---

## 🛡 Security & Best Practices

- **Token Protection**: Spotify client secrets and refresh tokens are strictly preserved on the backend and never passed to the browser.
- **HttpOnly Cookies**: Session authentication prefers secure `HttpOnly`, `SameSite=Lax` cookies.
- **Automatic Token Rotation**: Expired Spotify tokens refresh automatically behind the scenes with zero interruption to active user listening.
- **Zero Hallucinated Tracks**: AI music recommendations and generated playlists are searched and validated against Spotify's real catalog before presentation.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<p align="center">
  Crafted with ❤️ for music enthusiasts by <a href="https://github.com/Panay5423">Panay5423</a>
</p>
