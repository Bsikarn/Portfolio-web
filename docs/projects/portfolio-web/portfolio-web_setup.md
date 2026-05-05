# Portfolio Web Setup Guide

## การติดตั้งและการรันโปรเจกต์ (Setup Guide)

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   สร้างไฟล์ `.env.local` ที่ root directory และเพิ่มค่าต่างๆ ดังนี้:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Supabase CLI Setup**
   การใช้งาน Edge Functions ในการรันบน Local
   ```bash
   npx supabase start
   ```

4. **การนำเข้าข้อมูล RAG (Data Ingestion)**
   ใช้คำสั่งเพื่อรันสคริปต์ที่ทำหน้าที่แปลง `portfolio-data.json` ให้กลายเป็น Vector Embeddings
   ```bash
   node scripts/seed-data.js
   ```

5. **Start Dev Server**
   ```bash
   npm run dev
   ```

---

## โครงสร้างและหน้าที่ของไฟล์หลัก (Code Structure Breakdown)

- `scripts/seed-data.js`
  - **Purpose:** สคริปต์สำหรับนำข้อมูลโปรเจกต์เข้าสู่ฐานข้อมูลและสร้าง Vector Embeddings สำหรับ RAG
  - **Section 1:** โหลดค่าคอนฟิกจาก `.env.local` และเชื่อมต่อ Supabase Client กับ Google Generative AI
  - **Section 2:** อ่านข้อมูลจาก `portfolio-data.json`, ลูปสร้าง Embedding ด้วย `text-embedding-004`, และ Insert ลงตาราง `documents`

- `supabase/functions/chat/index.ts`
  - **Purpose:** Supabase Edge Function ที่ทำหน้าที่เป็น Backend ให้กับ AI Assistant
  - **Section 1:** รับค่าจาก Request (ข้อความผู้ใช้) และทำการแปลงข้อความเป็น Vector ผ่าน Gemini `text-embedding-004`
  - **Section 2:** นำ Vector ไปค้นหา context ที่สอดคล้องในตาราง `documents` โดยการเรียก Supabase RPC `match_documents`
  - **Section 3:** สร้าง Prompt พิเศษที่เอา context ผสานกับคำถามผู้ใช้ แล้วส่งต่อให้ Gemini `gemini-1.5-flash` จัดการสร้างคำตอบเพื่อส่งกลับไปให้ Frontend
