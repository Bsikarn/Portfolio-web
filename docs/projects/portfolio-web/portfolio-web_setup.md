# Portfolio Web — Setup Guide (ไทย)

## ข้อมูลโปรเจค
- **เจ้าของ:** นางสาวสิการย์ ภัทรสิริมงคล (ชื่อเล่น: บิ๊วท์)
- **Stack:** React.js (Vite) + Supabase + Gemini API + OpenRouter
- **AI Assistant:** RAG Pipeline (Gemini Embedding + OpenRouter free model)

---

## ขั้นตอนตั้งต้นจากศูนย์

### 1. สร้างโปรเจค Vite
```bash
npm create vite@latest portfolio-web -- --template react
cd portfolio-web
npm install
```

### 2. ติดตั้ง Dependencies
```bash
npm install @supabase/supabase-js framer-motion lucide-react
npm install @react-three/fiber @react-three/drei three
npm install tailwindcss @tailwindcss/vite
```

### 3. ตั้งค่า Environment Variables (`.env.local`)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ใช้สำหรับ seed script เท่านั้น
GEMINI_API_KEY=AIza...             # จาก aistudio.google.com/apikey
OPENROUTER_API_KEY=sk-or-v1-...   # จาก openrouter.ai (credit limit $0 ได้)
```

### 4. ตั้งค่า Supabase
รัน SQL ใน Supabase SQL Editor:
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table for AI RAG
CREATE TABLE documents (
  id        bigserial PRIMARY KEY,
  content   text,
  metadata  jsonb,
  embedding vector(768)
);
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- match_documents RPC
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 5
) RETURNS TABLE (id bigint, content text, metadata jsonb, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT id, content, metadata, 1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### 5. Seed ข้อมูล AI
```bash
node scripts/seed-data.js
```

### 6. Deploy Edge Function
```bash
npx supabase secrets set GEMINI_API_KEY=... --project-ref <ref>
npx supabase secrets set OPENROUTER_API_KEY=... --project-ref <ref>
npx supabase functions deploy chat-with-qwen --project-ref <ref>
```

### 7. รัน Development Server
```bash
npm run dev
```

---

## โครงสร้างโค้ด

### `src/App.jsx`
- **Purpose:** Root component — จัดการ routing แบบ custom (state-based), global auth state, cheer-up feature
- **Routing:** ใช้ `page` state + `setPage` function แทน react-router
- **Auth:** ฟัง Supabase auth session เพื่อ protect `/admin` route

### `src/components/ChatBot.jsx`
- **Purpose:** AI Assistant chat UI
- **API:** เรียก Edge Function `chat-with-qwen` ผ่าน `fetch()` โดยตรง (ไม่ใช้ `supabase.functions.invoke`)
- **Greeting:** แสดง welcome message ก่อน user พิมพ์อะไร

### `src/lib/worker.js`
- **Purpose:** Web Worker — นับ tag/language counts จากโปรเจคทั้งหมด ไม่ block main thread
- **Message:** รับ `PROCESS_PROJECT_TAGS` → ส่งกลับ `PROCESS_PROJECT_TAGS_RESULT`

### `supabase/functions/chat-with-qwen/index.ts`
- **Purpose:** RAG Edge Function
- **Step 1:** สร้าง query embedding (Gemini, 768 dim)
- **Step 2:** ค้นหา context ที่เกี่ยวข้องใน `documents` table ด้วย pgvector
- **Step 3:** ส่ง context + คำถาม → OpenRouter (ลอง 3 models อัตโนมัติถ้า rate-limited)
- **Models (fallback order):** `google/gemma-4-26b-a4b-it:free` → `nvidia/nemotron-3-super-120b-a12b:free` → `minimax/minimax-m2.5:free`

### `scripts/seed-data.js`
- **Purpose:** ดึงข้อมูลจาก Supabase DB จริง → สร้าง embeddings → บันทึกใน `documents` table
- **⚠️ รัน manual เมื่อ:** มีการเพิ่ม/แก้โปรเจค, achievements, หรือข้อมูล portfolio

### `src/data/constants.jsx`
- **Purpose:** ค่าคงที่ที่ใช้ทั่วแอป
- **Exports:** `ABOUT_ME`, `TECHNOLOGIES_TAGS`, `TOOLS_TAGS`, `EMOJIS`
