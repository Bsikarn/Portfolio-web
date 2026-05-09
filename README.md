# Beaut's Portfolio Website

A personal portfolio website for Sirikarn Phattharasirimongkol (Beaut), a full-stack developer and Computer Engineering student at KMUTNB.

## Tech Stack

### Languages
- JavaScript (JSX), TypeScript (Edge Functions), SQL

### Frontend
- React.js (Vite)
- Framer Motion (animations & transitions)
- Three.js + React Three Fiber (interactive 3D background)
- Tailwind CSS (utility classes)
- Lucide React (icons)

### Backend & Database
- Supabase (PostgreSQL, Realtime, Edge Functions, Auth)
- pgvector (vector similarity search for AI)

### AI Assistant (RAG Pipeline)
- Google Gemini API (`gemini-embedding-001`, 768-dim output) — Embedding
- OpenRouter (`google/gemma-4-26b-a4b-it:free` with fallback models) — Chat generation

### Tools
- Vite (build tool)
- ESLint
- Playwright (E2E tests)
- Git + GitHub Actions

## Active Features

- **Home Page** — About Me, Achievements, Activities, Tech Tags, Live Stats
- **Projects Page** — Filterable project cards with stacked detail view, back-to-top button
- **Contact Page** — Dynamic contact links from database
- **Admin Panel** — Full CRUD for projects, settings management (protected by Supabase Auth)
- **AI Assistant** — RAG-based chatbot using Gemini embeddings + OpenRouter free model
- **3D Background** — Interactive animated 3D model (lazy-loaded, code-split)
- **Cheer Up** — Falling emoji animation with live counter (Supabase Realtime)

## Directory Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── CategoryManager.jsx   # Admin: tab manager for project categories
│   │   └── SettingsPanel.jsx     # Admin: site settings editor
│   ├── AnimatedBlob.jsx          # 3D model animation using R3F
│   ├── Background3DScene.jsx     # Three.js Canvas wrapper (lazy-loaded)
│   ├── ChatBot.jsx               # AI Assistant chat UI
│   ├── FallingEmoji.jsx          # Cheer-up animation particle
│   ├── Hero.jsx                  # Landing hero section with resume PDF
│   ├── LoadingPage.jsx           # Full-screen loading placeholder
│   ├── MeshGradientBackground.jsx # Animated CSS gradient background
│   ├── Navbar.jsx                # Navigation bar
│   ├── ProjectDetailsCard.jsx    # Project detail modal card
│   ├── ProjectMiniCard.jsx       # Project list item card
│   ├── StackedCard.jsx           # Stacked scroll layout wrapper
│   └── ThreeDPreloader.jsx       # Glassmorphism placeholder while 3D loads
├── data/
│   └── constants.jsx             # ABOUT_ME, TECHNOLOGIES_TAGS, TOOLS_TAGS, EMOJIS
├── lib/
│   ├── supabase.js               # Supabase client singleton
│   └── worker.js                 # Web Worker: tag/language counting (off-thread)
├── pages/
│   ├── AdminPage.jsx             # Admin panel (protected route)
│   ├── ContactPage.jsx           # Contact links page
│   ├── HomePage.jsx              # Main portfolio page
│   ├── LoginPage.jsx             # Admin login form
│   └── ProjectsPage.jsx          # Projects explorer
├── styles/
│   ├── AdminPage.styles.js       # Inline style objects for AdminPage
│   ├── ContactPage.styles.js     # Inline style objects for ContactPage
│   ├── LoginPage.styles.js       # Inline style objects for LoginPage
│   └── ProjectsPage.styles.js    # Inline style objects for ProjectsPage
└── App.jsx                       # Root component, routing, global state

scripts/
└── seed-data.js                  # ⚠️ DO NOT MODIFY — Seeds AI documents table from live DB

supabase/
├── functions/
│   └── chat-with-qwen/
│       └── index.ts              # ⚠️ Edge Function — RAG AI pipeline
└── migrations/
    └── 20260510_recreate_documents_3072.sql  # Vector DB migration (run once)
```

## Environment Variables

```env
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon (public) key
SUPABASE_SERVICE_ROLE_KEY=  # Service role key (seed script only)
GEMINI_API_KEY=             # Google Gemini API key (embedding)
OPENROUTER_API_KEY=         # OpenRouter key (chat generation, $0 credit limit OK)
```
