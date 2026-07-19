# Beaut's Portfolio Website

A personal portfolio website for Sikarn Pattarasirimongkol (Beaut), a full-stack developer and Computer Engineering student at KMUTNB.

## Tech Stack

### Languages
- JavaScript
- TypeScript (Edge Functions)
- SQL

### Frontend
- React.js (Vite)
- Framer Motion (Page and Section Fade Transitions)
- Three.js + React Three Fiber (3D Background scene)
- Tailwind CSS (Utility classes)
- Lucide React (Icons)
- Supabase Image Transformations (Dynamic WebP rendering & sizing)
- JavaScript Image Preloading (Asynchronous next/prev image pre-fetching)

### Backend & Database
- Supabase (PostgreSQL database, Realtime subscriptions, Edge Functions, Authentication)
- pgvector (Vector embeddings storage)

### AI Assistant (RAG Pipeline)
- Google Gemini API (`gemini-embedding-001` or compatible) — Text embeddings
- OpenRouter (`google/gemma-4-26b-a4b-it:free` or similar fallback model) — Conversational chat response generation

### Tools
- Vite (Build runner)
- ESLint (Code checking)
- Playwright (E2E testing)
- Git & GitHub Actions (CI/CD workflows)

## Active Features

- **Home Page** — Clean portfolio dashboard presenting About Me info, Academic Achievements, Student Activities, Skill Tags, and Live profile counter.
- **Projects Page** — Showcases developer works with filter tools, search capabilities, horizontal drag project catalog, and full-screen lightbox detail view.
- **Contact Page** — Direct links to Social platforms retrieved dynamically from the backend settings.
- **Admin Panel** — Comprehensive backend console for CRUD database entries, file assets uploading, and configuration controls.
- **AI Assistant Overlay** — RAG chatbot powered by vector search matching portfolio details with Gemini embedding vectors.
- **Fixed 3D Background** — Permanently locked and non-scrolling animated 3D Blob scene overlaying soft mesh gradients.
- **Scroll-Triggered Blur** — Smooth central background blur (Bokeh effect) automatically adjusting focus as users scroll down content sections.
- **Simple Fade Transitions** — Unified, lightweight fade transitions (0.5s duration) applied consistently to section containers and page routes.
- **Cheer Up Action** — Interactive floating emoji animations triggered by realtime postgres channel updates.
- **Scroll Progress Bar** — Eye-catching gradient progress indicator tracking scroll depth at the very bottom of Home and Projects screens.
- **Active Section Indicator** — A floating glassmorphism badge centered at the bottom of the Home page displaying the name of the active content section.
- **Performance Throttling (3D Scene)** — Dynamic WebGL saving feature disabling Canvas render loop and hiding DOM elements when not viewing the 3D model in focus.
- **Dual-Row Project Catalog** — Spacious 2-row horizontal grid selector layout for projects with desktop drag and swipe interactivity.
- **Image Optimization** — Dynamic resizing and webp conversion utilizing Supabase Image Transformations combined with `loading="lazy"` and JavaScript-based async preloading of next/prev gallery assets.

## Directory Structure

```text
src/
├── components/
│   ├── admin/
│   │   ├── CategoryManager.jsx
│   │   └── SettingsPanel.jsx
│   ├── AnimatedBlob.jsx
│   ├── Background3DScene.jsx
│   ├── ChatBot.jsx
│   ├── FallingEmoji.jsx
│   ├── Hero.jsx
│   ├── LoadingPage.jsx
│   ├── MeshGradientBackground.jsx
│   ├── Navbar.jsx
│   ├── ProjectDetailsCard.jsx
│   ├── ProjectMiniCard.jsx
│   ├── ScrollSection.jsx          # ⚠️ Scroll observer with fade logic
│   └── ThreeDPreloader.jsx
├── context/
│   └── BackgroundBlurContext.jsx  # ⚠️ Central background blur manager
├── data/
│   └── constants.jsx
├── lib/
│   ├── supabase.js           # ⚠️ Supabase instance and image transformation helpers
│   └── worker.js
├── pages/
│   ├── AdminPage.jsx
│   ├── ContactPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── ProjectsPage.jsx
├── styles/
│   ├── AdminPage.styles.js
│   ├── ContactPage.styles.js
│   ├── LoginPage.styles.js
│   └── ProjectsPage.styles.js
└── App.jsx

scripts/
└── seed-data.js                  # ⚠️ DO NOT TOUCH (Data seeder)

supabase/
├── functions/
│   └── chat-with-qwen/
│       └── index.ts              # ⚠️ DO NOT TOUCH (Edge RAG handler)
└── migrations/
```

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

## Testing

This project uses Playwright for End-to-End (E2E) testing. The test suite covers core functionalities including navbar page routing, interactive emoji triggers, AI Assistant Chatbot toggles, and projects category filtering.

Run the test suite:
```bash
npx playwright test
```
