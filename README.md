# Portfolio Web
> **⚠️ Copyright Notice:** This is a proprietary project. All rights reserved. You may view the code for reference, but copying, modification, or distribution is strictly prohibited. See the [LICENSE](./LICENSE) file for more details.

A Minimalist Full-Stack Portfolio.

## Tech Stack
- **Languages**: JavaScript, SQL, HTML, CSS
- **Frontend**: React.js, Vite
- **Backend**: Supabase (PostgreSQL)
- **Libraries/Tools:** Clerk (Auth), Framer Motion, Three.js, Lucide React, Supabase-js, Playwright (E2E Testing)

## Active Features
- Minimalist Card-based Layout with Glassmorphism
- 3D Interactive Elements (Animated Blob) & Background Animations (Falling Emojis, Floating Stars)
- Realtime Admin Panel for Project Management (Secured by Clerk)
- AI Chatbot Assistant for visitor inquiries (OpenRouter / Qwen powered)
- Media Gallery & Full-screen Lightbox

## Setup & Installation Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd portfolio-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```
   *(For Supabase Edge Functions and local testing, ensure `OPENROUTER_API_KEY` is loaded in Supabase Secrets)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Database Setup (Supabase):**
   - Execute the SQL commands listed in `docs/private/supabase-knowledge.md` to create the necessary tables.
   - Run the functions listed in `docs/private/supabase-knowledge.md` in the SQL Editor to enable RPC tasks like tracking views and managing projects.

6. **Edge Function Deployments (Supabase RAG):**
   - Setup your `OPENROUTER_API_KEY` as a secret via `npx supabase secrets set OPENROUTER_API_KEY=your_key`.
   - Deploy via `npx supabase functions deploy chat-with-qwen --no-verify-jwt`.

## Directory Structure

Explain what each key file and folder does. Explicitly state which folders/files are safe to modify and which ones are strictly "DO NOT TOUCH".

- `src/` (✔️ **Safe to modify**): Core logic and UI.
  - `components/`: Isolated UI elements (Navbar, StackedCard, Cards).
  - `pages/`: Main application views (`HomePage`, `AdminPage`).
  - `data/`: Constant static data mapping.
  - `lib/`: Configuration API (`supabase.js`).
  - `styles/`: JS Styling Dictionaries (`HomePage.styles.js`).
- `supabase/functions/` (✔️ **Safe to modify**): Deno Edge Functions logic.
- `docs/private/` (❌ **DO NOT TOUCH**):
  - Retained for private AI Master Rule logs (`*-knowledge.md`, `*-trouble.md`).
- `NEW_setup.md` (✔️ **Safe to modify**):
  - Step-by-Step recreation guide without using git clone.
- `public/` (✔️ **Safe to modify**): Static media.
- `package.json` / `vite.config.js` / `.env.local`: Application configuration files.
