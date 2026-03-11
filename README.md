# Portfolio Web

A Minimalist Full-Stack Personal Portfolio Website focusing on premium aesthetics and smooth user experiences.

## 🛠️ Tech Stack

- **Languages:** JavaScript, HTML, CSS
- **Frontend:** React.js, Vite
- **Backend:** Supabase (PostgreSQL, Realtime, Auth)
- **Libraries/Tools:** `framer-motion` (Animations), `three.js` & `@react-three/fiber` & `@react-three/drei` (3D Graphics), `lucide-react` (Icons), `@supabase/supabase-js` (Database/Auth Client)

## ✨ Active Features

- **Minimalist Design:** Card-based Layout with glassmorphism effects and a soft color palette.
- **3D & Animations:** Interactive 3D Background, Animated Blobs, and falling emoji reactions.
- **Custom Routing Transition:** Framer Motion based slide transitions between pages without using React Router.
- **Realtime Dashboard:** An Admin Panel to manage projects that updates live via Supabase Realtime subscriptions.
- **Authentication:** Protected Admin routes using Supabase Auth.
- **AI ChatBot:** An integrated chatbot interface powered by an AI backend (Edge Functions/OpenRouter).
- **Performance Optimized:** Lazy loading for 3D components and nested pages with a Glassmorphism Preloader.

## 📁 Directory Structure

- `src/` (✔️ **SAFE TO MODIFY**): The main application source code.
  - `components/`: UI components such as Navbar, Cards, Background3D, and ChatBot.
  - `pages/`: Main content views including HomePage, ProjectsPage, ContactPage, LoginPage, and AdminPage.
  - `data/`: Static configuration and constant strings.
  - `lib/`: Configuration files and service initializations (e.g., `supabase.js`).
  - `styles/`: Additional styling definitions.
- `docs/private/` (❌ **DO NOT TOUCH**): The private knowledge repository and troubleshooting guidelines for the AI Agent. Includes `*-knowledge.md` and `*-trouble.md`.
- `NEW_setup.md` (✔️ **SAFE TO MODIFY**): Step-by-step from-scratch setup guide and granular code structure logic explanation.
- `public/` (✔️ **SAFE TO MODIFY**): Static assets such as images and fonts.
- `package.json` / `vite.config.js` (✔️ **SAFE TO MODIFY**): Project configuration and package dependencies.
