# Game of Thrones: Kingsroad TH — คู่มือโปรเจกต์ (สำหรับ Claude)

เว็บไซต์แฟนคอมมูนิตี้ภาษาไทยของเกม **Game of Thrones: Kingsroad**
Static site (HTML/CSS/JS ล้วน ไม่มี framework/build) โฮสต์บน Cloudflare Workers
ที่ `https://got-kingsroad-th.jcgameservice.workers.dev`

## ⭐ แหล่งข่าว/คอนเทนต์อย่างเป็นทางการ (canonical sources)

เมื่อผู้ใช้สั่งทำนอง **"เช็คข่าว / คอนเทนต์อัปเดตวันนี้"** ให้ค้นหา + cross-check
จาก 3 แหล่งนี้เป็นหลักเสมอ แล้วอัปเดตลงเว็บ + commit + push ให้อัตโนมัติ:

1. **Netmarble Forum (KR):** https://forum.netmarble.com/got_kr
2. **Gamemeca:** https://www.gamemeca.com/en/trees.php?p=1
3. **เว็บทางการไทย:** https://gotkingsroad.netmarble.com/th/?nm_to=main

> หมายเหตุ: เว็บทางการ (Netmarble/official) มักบล็อกการดึงหน้าโดยตรง (HTTP 403)
> ให้ใช้ `WebSearch` (เจาะ `allowed_domains` ได้) ประกอบกับข่าว/สื่อรองที่ตรวจสอบได้
> **ยึดหลัก Accuracy over Quantity — ห้ามแต่งข้อมูล/ตัวเลข อ้างอิงแหล่งได้เสมอ**

## ขั้นตอนเมื่อสั่ง "เช็คข่าววันนี้"

1. WebSearch หาข่าว/อัปเดตล่าสุดจาก 3 แหล่งข้างบน (+ cross-check สื่ออื่น)
2. คัดเฉพาะของ **เซิร์ฟเวอร์ปัจจุบัน** (ดูหัวข้อ Version ด้านล่าง) — แยกข้อมูลเก่าออก
3. เรียบเรียงภาษาไทย (คงชื่อเฉพาะภาษาอังกฤษถ้าไม่มีคำแปลทางการ)
4. อัปเดตลงหน้าที่เกี่ยวข้อง (news / roadmap / guide / database — ดูโครงสร้างด้านล่าง)
5. commit + push ตามขั้นตอน Git ด้านล่าง (Cloudflare deploy จาก `main` อัตโนมัติ)
6. สรุปให้ผู้ใช้: อัปเดตอะไรบ้าง + แหล่งอ้างอิง

## ⚠️ Version ของข้อมูลเกม (สำคัญมาก)

- **เซิร์ฟเวอร์ปัจจุบันเปิด Global Launch: 21 พ.ค. 2026** — ทุกอย่าง "เริ่มใหม่หมด"
- ปัจจุบันอุปกรณ์สูงสุดอยู่ที่ **Legendary Tier 4** (คอนเทนต์/Tier ทยอยเพิ่มตามอัปเดต)
- ข้อมูลปี 2025 (เช่น The Drowned God Wakes มิ.ย. 2025, World Level 3 Tier 6,
  Hedge Knight III Tier 7) = ไทม์ไลน์เซิร์ฟเวอร์รุ่นก่อน → **ห้ามปนกับปัจจุบัน**
- ซีซันปัจจุบัน: **Season 1 "Frost and Steel"** (15 ก.ค. 2026)

## โครงสร้างเว็บ (data-driven — แก้ที่ไฟล์ data ที่เดียว)

- `js/layout.js` — header/footer/เมนู กลาง (แก้เมนูที่นี่) + โหลด `visitors.js`
- `news.html` — การ์ดข่าว (แบนเนอร์ผูกตามตำแหน่ง nth-child: DEV NOTES / PATCH
  UPDATE / ROADMAP / EVENT / GUIDE / DATABASE — เนื้อหาในการ์ดต้องตรงกับแบนเนอร์)
- `roadmap.html` + `js/roadmap.js` — ไทม์ไลน์ปัจจุบัน (CURRENT) + แผนผู้พัฒนา (PLAN)
- `guide.html` + `guide-article.html` + `js/guides.js` — คู่มือแยกหมวด (`?id=`)
- `database.html` + `database-detail.html` + `js/database.js` — ฐานข้อมูล (`?id=`)
  แต่ละ record มี field `sources` + `confidence` + `version` + `verified`
- `classes.html` — หน้าอาชีพ (Knight/Assassin/Sellsword)
- `css/style.css` — ธีม "The North / Winterfell" (cold blue-black + antique gold +
  frost accent) มี CSS variables ใน `:root` — **ห้าม redesign theme เว้นแต่สั่ง**
- `js/visitors.js` — ตัวนับผู้เข้าชม (Abacus สำหรับ total/unique, Firebase RTDB
  presence สำหรับ online-now — databaseURL ตั้งไว้แล้ว)

## Git / Deploy

- พัฒนาบน branch: `claude/got-kingsroad-data-update-92tfnq`
- ขึ้นเว็บจริง: merge เข้า `main` (fast-forward) แล้ว `git push origin main`
  → Cloudflare Workers deploy อัตโนมัติ (1–3 นาที)
- ห้ามสร้าง branch ใหม่ / ห้าม force push
- Commit message ภาษาอังกฤษชัดเจน; เนื้อหาเว็บเป็นภาษาไทย
