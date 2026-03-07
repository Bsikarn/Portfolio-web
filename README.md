# Portfolio Web
> **⚠️ Copyright Notice:** This is a proprietary project. All rights reserved. You may view the code for reference, but copying, modification, or distribution is strictly prohibited. See the [LICENSE](./LICENSE) file for more details.

A Minimalist Full-Stack Portfolio.

## Tech Stack
- **Languages**: JavaScript, SQL, HTML, CSS
- **Frontend**: React.js, Vite
- **Backend**: Supabase (PostgreSQL)
- **Libraries/Tools**: Clerk (Authentication), Framer Motion, React Three Fiber, Three.js, Lucide React

## Active Features
- Minimalist Card-based Layout with Glassmorphism
- 3D Interactive Elements (Animated Blob) & Background Animations (Falling Emojis, Floating Stars)
- Realtime Admin Panel for Project Management (Secured by Clerk)
- AI Chatbot Assistant for visitor inquiries (Claude 3 powered)
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

4. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Database Setup (Supabase):**
   - Execute the SQL commands listed in `docs/private/supabase-knowledge.md` to create the necessary tables.
   - Run the functions listed in `docs/private/supabase-knowledge.md` in the SQL Editor to enable RPC tasks like tracking views and managing projects.

## Directory Structure

Here is the breakdown of the project layout:

- `src/` (Safe to modify)
  - `components/`: UI components such as Navbar, ChatBot, ProjectMiniCard, ProjectDetailsCard, StackedCard.
  - `pages/`: Main application views like HomePage, ProjectsPage, ContactPage, AdminPage.
  - `data/`: Contains `constants.jsx` with static site text, arrays, and configurations.
  - `lib/`: API integrations, like `supabase.js`.
  - `styles/`: Shared specific inline-styles extraction (`Navbar.styles.js`, `HomePage.styles.js`).
  - `App.jsx`: Root router and layout wrapper with Clerk Authentication boundaries.
  - `main.jsx`: Initialization script.
- `docs/private/` (DO NOT TOUCH randomly. Keep synced manually for private AI logs):
  - Contains all the agent logs, knowledge bases (`*-knowledge.md`), and debugging records (`*-trouble.md`).
- `public/` (Safe to modify):
  - Static assets like images and fonts.
- `package.json` / `vite.config.js` / `.env.local`: Application configuration files. (Modify with caution)
