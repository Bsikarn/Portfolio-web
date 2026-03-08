# พอร์ตโฟลิโอเว็บไซต์ (Portfolio Web)
> **⚠️ นโยบายลิขสิทธิ์ (Copyright Notice):** โปรเจคนี้เป็นโปรเจคส่วนบุคคลที่มีลิขสิทธิ์ ห้ามคัดลอก ดัดแปลง หรือนำไปเผยแพร่โดยไม่ได้รับอนุญาต กรุณาอ่านรายละเอียดเพิ่มเติมในไฟล์ [LICENSE](./LICENSE)

เว็บไซต์พอร์ตโฟลิโอส่วนตัวแบบ Full-Stack สไตล์ Minimalist

## 🛠️ เทคโนโลยีที่ใช้งาน (Tech Stack)
- **Languages**: JavaScript, SQL, HTML, CSS
- **Frontend**: React.js, Vite
- **Backend**: Supabase (PostgreSQL)
- **Libraries/Tools**: Supabase Auth (ยืนยันตัวตน), Framer Motion, Three.js, Lucide React, Playwright (E2E Testing)

## ✨ ฟีเจอร์ที่ใช้งานอยู่ในปัจจุบัน (Active Features)
- ดีไซน์สวยงามสไตล์ Minimalist รูปแบบการ์ด (Card-based Layout) พร้อมเอฟเฟกต์ Glassmorphism
- องค์ประกอบแอนิเมชัน 3 มิติ (Animated Blob) และพื้นหลังเคลื่อนไหว (Falling Emojis)
- ระบบจัดการผลงานและอัปเดตข้อมูลบนหน้า Admin Panel แบบเรียลไทม์ (ป้องกันความปลอดภัยด้วยระบบ Log in จาก Supabase)
- แชทบอท AI แจ้งตอบข้อมูลเบื้องต้นเกี่ยวกับเจ้าของโปรเจค (ผูกการทำงานกับ OpenRouter / Qwen)
- ระบบแกลเลอรีรูปภาพและวิดีโอแบบเต็มจอ (Full-screen Lightbox)

## 📁 โครงสร้างโปรเจค (Directory Structure)
- `src/` (✔️ **ปลอดภัย สามารถแก้ไขได้**): โค้ดสำหรับหน้าบ้านและฟังก์ชันการทำงานหลักของโปรเจค
  - `components/`: ส่วนประกอบย่อยหน้าเว็บ (Navbar, StackedCard, UI Cards ต่างๆ)
  - `pages/`: หน้าแสดงเนื้อหาหลักทิศทางต่างๆ (`HomePage`, `ProjectsPage`, `AdminPage`)
  - `data/`: ข้อมูลคงที่ (Static config/constants) สำหรับหน้าบ้าน
  - `lib/`: ข้อมูลการเชื่อมต่อ API (`supabase.js`)
  - `styles/`: โค้ดสไตล์ (JS Styling Dictionaries) ควบคุมรูปลักษณ์ของ Component
- `supabase/functions/` (✔️ **ปลอดภัย สามารถแก้ไขได้**): ส่วนโค้ดหลังบ้านสำหรับ Edge Functions
- `docs/private/` (❌ **ห้ามแก้ไขเด็ดขาด**): ถังความรู้ส่วนตัวสำหรับ AI Master Rules ห้ามยุ่งเพื่อป้องกัน Agent สับสน (`*-knowledge.md`, `*-trouble.md`)
- `NEW_setup.md` (✔️ **ปลอดภัย สามารถแก้ไขได้**): คู่มือวิธีการสร้างโปรเจคนี้กลับมาตั้งแต่ 0
- `public/` (✔️ **ปลอดภัย สามารถแก้ไขได้**): สื่อรูปภาพและ Assets คงที่
- `package.json` / `vite.config.js` / `.env.local`: ไฟล์ตั้งค่าและ Library ของโปรเจค
