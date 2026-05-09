# Portfolio Web Knowledge

## Techniques In Use

### 1. Retrieval-Augmented Generation (RAG)
เทคนิคที่ใช้ผสานข้อมูลในฐานข้อมูลของเรา (Context) เพื่อส่งให้ AI Model ช่วยตอบคำถาม โดยในโปรเจกต์นี้ใช้สำหรับการดึงประวัติและผลงานในพอร์ตโฟลิโอมาเพื่อให้ AI ตอบในฐานะ "ผู้ช่วยของ Sikarn"

### 2. Edge Computing (Supabase Edge Functions)
การรันโค้ด Backend อย่างรวดเร็วบน Edge (ผ่าน Deno Runtime) แทนการใช้เซิร์ฟเวอร์แบบเดิม (Node.js/Express) ในระบบเราจะใช้เพื่อรับ HTTP Request จากหน้าเว็บ ไปจัดการสร้าง Embeddings ด้วย Google Gemini และคุยกับ Supabase RPC ได้อย่างมีประสิทธิภาพ

### 3. Vector Embeddings
การนำข้อความมาตีความเป็นตัวเลขในมิติต่างๆ (Array of Floats) เพื่อใช้ในการค้นหาความคล้ายคลึงของข้อความ (Semantic Search) ในโปรเจกต์ใช้โมเดล `text-embedding-004` ของ Google เพื่อเก็บข้อมูลพอร์ตโฟลิโอลงในคอลัมน์ที่เป็นแบบ `vector` ในตาราง `documents` ของ Supabase (pgvector)

### 4. Global Loading State (Framer Motion)
การใช้เทคนิคสร้าง Loading Component แบบ Full-screen overlay โดยใช้งานร่วมกับ `framer-motion` เพื่อแอนิเมชันให้ดูพรีเมียม (Glowing effects, Pulses) ในระหว่างที่รอการดึงข้อมูลจาก Database ผ่าน `useEffect` ในแต่ละหน้า (เช่น HomePage, ProjectsPage)
