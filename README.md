# Beaut.Portfolio

A personal portfolio website for Sikarn Pattarasirimongkol, a Full-Stack Developer focusing on Data Engineering and Software Engineering.

## Tech Stack

### Languages
- JavaScript (JSX)
- TypeScript

### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- React Three Fiber / Three.js

### Backend & Database
- Supabase (PostgreSQL + Realtime)
- Supabase Storage (image hosting + transformation)

### Auth
- Supabase Auth (email/password)

### Tools
- Vite
- Playwright (E2E tests)
- ESLint
- Google Gemini 1.5 Flash (RAG Chatbot)

---

## Active Features

- **Hero Section** — Profile photo, name, role badge, stat bar (projects, views, cheers), action buttons (PDF, Contact)
- **Sticky Hero Layout** — Hero stays sticky while content scrolls beneath with blur mask gradient
- **Achievements & Activities** — Card list with certificate/photo lightbox; hidden items accessible via "more" popup
- **Technologies & Tools** — Manual skill badges grouped by Languages / Technologies / Tools
- **Projects Page** — Expandable search box (hides category filters when active), filter unselect support, drag-scroll selector, 3-card separated detail view with Flow Architecture diagram, gallery, award, video, language bar; deep-link via `localStorage.targetProjectId` to auto-select a specific project on page load
- **Unified Image Viewer** — Component (`ImageModal.jsx`) providing image/video lightbox across all pages, next/prev navigation adjacent to counter text, zoom toggle with pan/drag support
- **Fluid Typography** — Responsive font scaling across all devices using `clamp()` based on PC 1440px reference width with minimum limits
- **Navbar Interactions** — Glassmorphism bar with single click (Home) and double click (Admin) logo navigation; mobile capsule menu with blur gradient backdrop
- **Experiences Page** — Timeline-style list fetched directly from dedicated `experiences` table
- **Admin Panel** — CRUD across separated tables (`projects`, `achievements`, `activities`, `experiences`), Settings, Category Manager, batch save
- **Sorting** — Projects ordered by `sort_order` DB column; Admin has order input + ▲▼ move buttons
- **ChatBot** — RAG AI assistant (Gemini 1.5 Flash) draggable on desktop, modal on mobile
- **Realtime Stats** — Live view/cheer counts via Supabase Realtime subscription
- **Skeleton Loaders** — Shimmer placeholders for all data-loading states
- **Scroll Progress Bar** — Gradient progress bar at bottom with section tick marks
- **Cute Spoon Cursor** — Custom CSS spoon cursor 🥄; rotates 35° when hovering clickable elements
- **Back-to-Top Button** — Floating button appears after 300px scroll
- **Web Performance Optimization** — Non-blocking Google Fonts loading, granular code splitting (`vendor`, `motion`, `icons`, `supabase`), IntersectionObserver reflow prevention (Hero + ProjectsPage), eager LCP profile image loading with explicit dimensions, resilient Supabase realtime connection error handling
- **Codebase Health** — Dead code removed (`worker.js`, `TagButton`, `workerRef`, `techCounts`, `activeTag`); DRY violations fixed: shared `getSortOrder` and `isItemHidden` helpers in `adminHelpers.js`; `TechSection.jsx` modularized from `HomePage.jsx`

---

## Directory Structure

```
portfolio-web/
├── public/                     # Static assets
├── src/
│   ├── App.jsx                 # Root layout, routing, emoji effect, scroll bar
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global Tailwind + custom CSS
│   ├── assets/                 # Static image assets
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CategoryManager.jsx   # Collapsible category CRUD panel
│   │   │   ├── ContentForm.jsx       # Add/Edit content form (all types)
│   │   │   ├── ProjectList.jsx       # Existing content list with order controls
│   │   │   └── SettingsPanel.jsx     # Personal info & contact links form
│   │   ├── ChatBot.jsx          # RAG AI chatbot (draggable desktop / modal mobile)
│   │   ├── ContactPopup.jsx     # Contact form modal
│   │   ├── FallingEmoji.jsx     # Cheer-up falling emoji animation
│   │   ├── Hero.jsx             # Hero section (name, profile, buttons, stats)
│   │   ├── HiddenContentModal.jsx   # "More" popup for hidden items
│   │   ├── ImageModal.jsx           # Reusable image/video viewer modal with zoom & nav controls
│   │   ├── LoadingPage.jsx      # Full-screen spinner overlay
│   │   ├── MeshGradientBackground.jsx  # Animated CSS mesh gradient background
│   │   ├── Navbar.jsx           # Top navigation bar (desktop + mobile capsule menu)
│   │   ├── ProjectDetailsCard.jsx  # Full project detail view component
│   │   ├── ProjectMiniCard.jsx  # Mini card in projects selector grid
│   │   ├── RainbowSprinkles.jsx # Floating decorative sparkle particles
│   │   ├── ScrollDownIndicator.jsx # Global reusable scroll-down arrow & text indicator
│   │   ├── ScrollSection.jsx    # IntersectionObserver wrapper for blur context
│   │   ├── SkeletonLoader.jsx   # Shimmer skeleton components (Home, Experiences)
│   │   ├── SpoonCursor.jsx      # CSS-only cursor (returns null; cursor managed via index.css)
│   │   └── TechSection.jsx      # TechBadge, ContentSection, MediaRow, TechSkillsSection for HomePage
│   ├── context/
│   │   └── BackgroundBlurContext.jsx  # Global blur amount context (driven by scroll)
│   ├── data/
│   │   └── constants.jsx        # ABOUT_ME fallback data, EMOJIS array
│   ├── lib/
│   │   ├── adminHelpers.js      # Shared helpers: isSpecialType, getTableName, sortByOrder, filterByContentType, parseLanguages, getSortOrder, isItemHidden
│   │   ├── portfolioChat.ts     # RAG chatbot logic (Gemini API + Supabase vector search)
│   │   └── supabase.js          # Supabase client + getTransformedUrl helper
│   ├── pages/
│   │   ├── AdminPage.jsx        # Admin dashboard (state + logic only; uses admin/ components)
│   │   ├── ExperiencesPage.jsx  # Experiences timeline page
│   │   ├── HomePage.jsx         # Home page (hero + achievements + activities + skills)
│   │   ├── LoginPage.jsx        # Admin login page
│   │   └── ProjectsPage.jsx     # Projects selector + detail view page
│   └── styles/
│       ├── AdminPage.styles.js   # Inline style object map for AdminPage components
│       ├── LoginPage.styles.js   # Inline style object map for LoginPage components
│       └── ProjectsPage.styles.js # Inline style object map for ProjectsPage components
├── docs/                       # Private documentation & database snapshots
│   └── private/
│       ├── database_snapshot.json # ⚠️ Real-time Supabase JSON snapshot backup
│       ├── database_snapshot.md   # Human-readable Supabase data & schema summary
│       ├── knowledge_portfolio-web.md # Comprehensive source code logic docs (Thai)
│       └── setup_portfolio-web.md # Setup guide & exhaustive file mapping (Thai)
├── scripts/                    # Helper & administration scripts
│   ├── export-database-snapshot.js # Script to export real-time Supabase snapshot
│   ├── ingest-portfolio.ts     # ⚠️ RAG vector embedding generator script
│   └── seed-data.js            # ⚠️ Initial database seed script (DO NOT TOUCH)
├── supabase/                   # ⚠️ DO NOT TOUCH — Supabase migration files
├── tests/
│   └── portfolio.spec.js       # Playwright E2E tests
├── .env.local                  # ⚠️ DO NOT TOUCH — Environment variables (not committed)
├── .env.example                # Environment variables template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── playwright.config.js
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
VITE_ENABLE_SUPABASE_TRANSFORMATIONS=true
```
