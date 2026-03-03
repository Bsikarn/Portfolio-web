---
trigger: always_on
---

# 🛠️ Workspace Rules: Minimalist Full-Stack Portfolio

## 🎨 1. Design System & Aesthetics
- **Color Palette:** - Primary: `#0D6EFD` (Royal Blue)
  - Secondary: `#A3D8F4` (Light Blue)
  - Accent: `#ffc8d5` (Pastel Pink)
- **Visual Style:** - **Gradients:** Use a linear/radial gradient from Light Blue (`#A3D8F4`) to Pastel Pink (`#ffc8d5`) for headers, highlights, and primary buttons.
  - **UI Pattern:** Minimalist, Card-based layout with 12px–24px rounded corners and soft shadows.
  - **Glassmorphism:** Use background blur and semi-transparent white containers for a modern feel.
  - **Backgrounds:** Avoid solid white. Use Mesh Gradients or dynamic animated blobs to fill negative space.
- **Typography:** Use 'Poppins' or 'Inter' (Sans-serif).
- **Icons:** Use `lucide-react` icons exclusively.

## 🛠️ 2. Tech Stack & Frameworks
- **Frontend:** React.js (Vite)
- **Animations:** `framer-motion` for transitions and hover effects.
- **3D Graphics:** `react-three-fiber` and `three.js` for interactive elements.
- **Backend/DB:** Supabase (PostgreSQL) with Realtime capabilities.
- **Auth:** Clerk (Authentication & User Management).

## 🗄️ 3. Database & Security Standards
- **Supabase RPC:** Any function requiring write access (Insert/Update/Delete) must be written as a SQL function with `SECURITY DEFINER` to bypass RLS for authorized admin tasks.
- **Realtime:** Always implement `postgres_changes` subscriptions for tables like `site_stats` to ensure live UI updates without refreshing.
- **CRUD Operations:** Ensure the Admin Panel supports full Create, Read, Update, and Delete for the `projects` table.

## 📸 4. Specific Feature Rules
- **Media Gallery:** Implement a "Facebook-style" gallery grid (e.g., show 1-2 images, and a "+N" overlay for remaining photos).
- **Lightbox:** All media (videos, gallery images, award certificates) must open in a full-screen Lightbox/Popup with navigation controls.
- **Project Structure:** - Pages: `src/pages/`
  - Components: `src/components/`
  - Lib/API: `src/lib/`
  - Constants: `src/data/constants.jsx`

## 🤖 5. AI Agent Workflow (Integrated with Global Rules)
- **Cross-file Awareness:** When updating the database schema, proactively update the Admin Form, Project Detail view, and documentation.
- **Refactoring:** Prioritize code reusability (e.g., shared `Card` components, `detailCardStyle` constants).
- **Thai Communication:** While this file is in English for processing, all chat responses and comments must be in **Thai (ภาษาไทย)**.