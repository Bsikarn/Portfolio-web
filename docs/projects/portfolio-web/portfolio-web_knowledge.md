# Portfolio Web — Project Knowledge (ไทย)

## ข้อมูลเจ้าของ
- **ชื่อจริง:** นางสาวสิการย์ ภัทรสิริมงคล
- **ชื่อภาษาอังกฤษ:** Sikarn Pattarasirimongkol
- **ชื่อเล่น:** บิ๊วท์ (Beaut)
- **มหาวิทยาลัย:** KMUTNB (King Mongkut's University of Technology North Bangkok)
- **สาขา:** Computer Engineering

---

## Techniques In Use

### 1. RAG (Retrieval-Augmented Generation)
เทคนิคที่ให้ AI ค้นหาข้อมูลที่เกี่ยวข้องจาก database ก่อน แล้วนำมาเป็น context ให้ AI ตอบคำถาม
- **Embedding Model:** `gemini-embedding-001` (768 dim ผ่าน `outputDimensionality: 768`)
- **Vector Search:** pgvector HNSW index, cosine similarity
- **Chat Model:** OpenRouter free models (fallback chain)
- **Flow:** User query → Embed → pgvector RPC → Context → LLM → Reply

### 2. Multi-Model Fallback
เมื่อ model หนึ่ง rate-limited (HTTP 429) จะลอง model ถัดไปใน array อัตโนมัติ ไม่ให้ user เห็น error
```ts
const FREE_MODELS = [
  "google/gemma-4-26b-a4b-it:free",     // ~3s
  "nvidia/nemotron-3-super-120b-a12b:free",  // ~4s backup
  "minimax/minimax-m2.5:free",           // last resort
];
for (const model of FREE_MODELS) { ... if (429) continue; }
```

### 3. Web Worker (Off-Thread Processing)
ย้าย heavy computation (นับ tags จากโปรเจคทั้งหมด) ไปทำใน background thread ไม่ block UI
```js
workerRef.current = new Worker(new URL("../lib/worker.js", import.meta.url), { type: "module" });
workerRef.current.postMessage({ type: "PROCESS_PROJECT_TAGS", payload: projects });
workerRef.current.onmessage = (e) => setTechCounts(e.data.payload.counts);
```

### 4. Code Splitting + Lazy Loading
โหลด 3D scene และ pages เฉพาะตอนจำเป็น ลด initial bundle size
```jsx
const Background3DScene = lazy(() => import("./components/Background3DScene"));
const ChatBot = lazy(() => import("./components/ChatBot"));
```

### 5. Supabase Realtime Subscription
รับ live update จาก database โดยไม่ต้อง refresh หน้า
```js
supabase.channel("site_stats_channel")
  .on("postgres_changes", { event: "UPDATE", table: "site_stats" }, handler)
  .subscribe();
```

### 6. Supabase Edge Functions (Deno)
รัน server-side code บน Deno runtime ที่ edge ของ Supabase (ไม่ต้องมี server)
- ใช้ `Deno.env.get()` อ่าน secrets
- Deploy ด้วย `npx supabase functions deploy <name>`

### 7. Stacked Card Layout
ใช้ CSS `position: sticky` เพื่อสร้าง effect ที่ cards ซ้อนกันเมื่อ scroll
```jsx
<StackedCard stickyTop="64px" zIndex={1}>
  <Hero />
</StackedCard>
```

### 8. Protected Routes (Custom)
ใช้ Supabase auth session ร่วมกับ state-based routing แทน react-router
```jsx
if (newPage === "Admin" && !session) newPage = "Login";
```

### 9. pgvector HNSW Index
Index สำหรับค้นหา vector ที่ใกล้เคียง (approximate nearest neighbor)
- รองรับสูงสุด 2000 dimensions ต่อ column
- เหตุนี้จึงใช้ `outputDimensionality: 768` แทน 3072 (Gemini full)

---

## Known Constraints

| ข้อจำกัด | รายละเอียด |
|---------|----------|
| Gemini `generateContent` ไม่ทำงานในไทย | Free tier limit = 0 สำหรับ region ไทย ใช้ OpenRouter แทน |
| OpenRouter free models unstable | ลอง 3 models อัตโนมัติ (fallback chain) |
| HNSW max 2000 dim | ใช้ `outputDimensionality: 768` แก้ปัญหา |
| Supabase Edge Function cold start | ครั้งแรกอาจช้า 2-5 วินาที |

---

## Re-seed AI Trigger Checklist
ต้องรัน `node scripts/seed-data.js` ใหม่เมื่อ:
- [ ] เพิ่ม / แก้ / ลบ โปรเจค
- [ ] แก้ About Me ใน portfolio_settings
- [ ] เพิ่ม Achievement หรือ Activity ใหม่
- [ ] แก้ contact_links
