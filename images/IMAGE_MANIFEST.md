# Image Manifest — Game of Thrones: Kingsroad TH

คู่มือ + รายการงานสำหรับเติม "รูปจริง" ให้ข้อมูลในเว็บ (Database / Content)
จัดทำจาก Source Code จริง (`js/database.js`) — อัปเดตล่าสุด: ก.ค. 2026

---

## ⚠️ ข้อจำกัดสำคัญ (อ่านก่อน)

**Agent ดาวน์โหลดรูปจากอินเทอร์เน็ตไม่ได้** — network policy ของ environment บล็อก
ทุก host รูปภาพ (ทดสอบแล้วได้ HTTP `000` ทั้งหมด):

```
000  gotkingsroad.netmarble.com     (เว็บทางการ)
000  guide.netmarble.com            (คู่มือทางการ)
000  cdn.netmarble.com
000  gamemeca.com
000  static.wikia.nocookie.net      (วิกิ)
```

เครื่องมือที่มี (WebFetch) ดึงได้แค่ "ข้อความ" ไม่สามารถบันทึกไฟล์รูป
ดังนั้นทุกรายการด้านล่างจึงเป็น **MANUAL_DOWNLOAD_REQUIRED** — เจ้าของเว็บต้อง
ดาวน์โหลด/แคปเอง แล้วนำไฟล์มาใส่ (หรือส่งรูปมาในแชต Claude จะ optimize + เชื่อมให้)

**กฎเหล็ก (จากโจทย์):** CORRECT IMAGE > BEAUTIFUL IMAGE · VERIFIED > RANDOM · **NO IMAGE > WRONG IMAGE**
ห้ามใช้รูปเกมอื่น/ซีรีส์ TV/House of the Dragon แทนของในเกม Kingsroad · ห้ามเดาจากหน้าตาคล้าย

---

## 1) Audit — ระบบรูปปัจจุบัน

**โครงสร้างโฟลเดอร์ (มีอยู่แล้ว — ใช้ต่อ ไม่สร้างซ้ำ):**

```
images/
  background/  hero-bg.webp
  classes/     knight.webp · assassin.webp · sellsword.webp      ← Classes มีรูปแล้ว ✅
  guides/      map-route-{beyond-wall,winterfell,hornwood,reach}.jpeg  ← ไกด์แผนที่ ✅
  items/       README.md  (โฟลเดอร์กลางของรูป Database — ยังว่าง)
  logo/        got-header.webp · got-logo.webp
  news/        update · event · guide · roadmap · devnotes · database (.jpg — แบนเนอร์ทั่วไป)
```

**การเชื่อมรูปในโค้ด (พร้อมใช้แล้ว — ทำไว้ก่อนหน้า):**
- ทุก record ใน `js/database.js` ใส่ field `img: "images/items/<id>.webp"` ได้
- มี **fallback อัตโนมัติ**: ถ้าไม่มี `img` หรือไฟล์โหลดไม่ได้ → แสดงไอคอน SVG ตามหมวดแทน
  (โค้ด `iconBox()` + `onerror` ใน `database.js` — ไม่มีทางเกิด "รูปแตก" และ build ไม่พัง)
- รูปขึ้นทั้ง **การ์ด** (หน้ารวม) และ **หน้ารายละเอียด** (กล่องรูปใหญ่)
- body ของ record รองรับ block `{ img, caption }` สำหรับภาพประกอบเพิ่ม (เช่น สกรีนช็อต/แผนที่)

**สรุปสถานะ:** 61 records ในฐานข้อมูล — มีรูปจริง **1** (map-run-routes) · อีก **60** ใช้ไอคอน SVG

---

## 2) Workflow — เติมรูป 1 รายการ (ง่ายมาก)

1. ได้ไฟล์รูปที่ **ยืนยันแล้ว** ว่าเป็นของ record นั้นจริง (ดูกฎ Matching ข้อ 4)
2. ตั้งชื่อไฟล์ = `id` ของ record (ดูตาราง) เช่น `drogon.webp`, `set-champion.webp`
3. วางไฟล์ที่ `images/items/`
4. เปิด `js/database.js` หา record นั้น เพิ่มบรรทัด:
   ```js
   img: "images/items/drogon.webp",
   ```
5. เสร็จ — รูปขึ้นทันที (หรือส่งรูปมาในแชต Claude ทำ 2–4 ให้)

> อยากได้แค่ "วางไฟล์ก็ขึ้น" โดยไม่แตะโค้ด? ส่งรูปมาให้ Claude เชื่อม `img` + commit ให้เป็นชุด

---

## 3) Source Priority (ลำดับแหล่งที่ควรใช้)

1. เว็บทางการ Kingsroad — https://gotkingsroad.netmarble.com/th/
2. Netmarble Official Guide — https://guide.netmarble.com/gotasia/
3. Netmarble Forum (Dev/Patch Notes + อาร์ตอัปเดต) — https://forum.netmarble.com/got_kr
4. Official YouTube / press / promotional art ของเกม
5. In-game screenshot ของตัวเอง (ชัดเจน ตรงรายการ) ← เชื่อถือได้สุดสำหรับ item icon
6. แผนที่ชุมชนที่ตรวจสอบได้ — https://got-kingsroad.com/
7. Gamemeca (สื่อที่อ้างอิงได้) — https://www.gamemeca.com/en/

เลี่ยง: รูปมี watermark เว็บอื่น · stock เสียเงิน · fan art ไม่ได้รับอนุญาต · รูปจากซีรีส์ TV

---

## 4) กฎการจับคู่รูป (Image Matching) — สำคัญที่สุด

ก่อนผูกรูปกับ record ต้องมีหลักฐานอย่างน้อย 1 อย่างที่น่าเชื่อถือ:
Caption · Page Title · คำอธิบายทางการ · Game UI ในรูป · ชื่อไฟล์ · context ของแหล่ง

ยืนยันไม่ได้ → **อย่าใส่** ปล่อยเป็นไอคอน SVG ไว้ (NO IMAGE > WRONG IMAGE)

**หมายเหตุตามชนิดข้อมูล:**
- `type: CREATURE / LOCATION / ITEM ICON` → ควรหา "รูปจริง" (คนเห็นบ่อย เห็นภาพช่วยได้มาก)
- `type: SYSTEM/UI` (เช่น Refinement, Tier, Crafting, Stats, Quest) → เป็น "ระบบ/แนวคิด"
  ไม่มีไอคอนไอเทมตายตัว **ไอคอน SVG เพียงพอแล้ว** ถ้าจะใส่ให้ใช้ UI screenshot เท่านั้น (ทางเลือก ไม่บังคับ)

---

## 5) Inventory + Manual-Download Manifest (เรียงตาม Priority)

> **P1 · Classes — ✅ เสร็จแล้ว** (`images/classes/knight|assassin|sellsword.webp`)

### P2 · Accessories  (3 รายการ · type: ITEM ICON)

Aspect ที่แนะนำ: **1:1** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Jewelry System** — ระบบเครื่องประดับ | `images/items/jewelry-system.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Ring** — แหวน | `images/items/ring.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Necklace** — สร้อยคอ | `images/items/necklace.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P2 · Equipment System  (9 รายการ · type: SYSTEM/UI)

Aspect ที่แนะนำ: **1:1 (icon) หรือ UI screenshot** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Rarity & Grade** — ระดับความหายาก (Grade) | `images/items/rarity-grade.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Gear Tier** — รุ่นของอุปกรณ์ (Tier) | `images/items/gear-tier.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Equipment Slots** — ช่องสวมใส่อุปกรณ์ | `images/items/equipment-slots.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Class Weapons** — อาวุธประจำอาชีพ | `images/items/weapon-types.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Crafting** — การคราฟอุปกรณ์ | `images/items/crafting.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Forging** — การตีอัปค่าพื้นฐาน | `images/items/forging.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Reforging** — การเพิ่มเอฟเฟกต์เสริม | `images/items/reforging.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Enhancement** — การเสริมช่อง (Slot Enhancement) | `images/items/enhancement.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Refinement** — การตีบวก (Refine) | `images/items/refinement.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P3 · Equipment Sets  (9 รายการ · type: ITEM ICON / SET)

Aspect ที่แนะนำ: **1:1 (icon)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Set System** — ระบบเซ็ตอุปกรณ์ | `images/items/set-system.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Champion Set** — เซ็ตสาย Active Skill / คริติคอล | `images/items/set-champion.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Sentinel Set** — เซ็ตสาย Parry | `images/items/set-sentinel.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Brute Set** — เซ็ตเพิ่มดาเมจ + ลดดาเมจ | `images/items/set-brute.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Crusher Set** — เซ็ตสาย Stagger | `images/items/set-crusher.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Mauler Set** — เซ็ตสาย Rage / ตีเร็ว | `images/items/set-mauler.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Savant Set** — เซ็ตสาย Active Skill / Rage | `images/items/set-savant.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Duelist Set** — เซ็ตสาย Parry / ดวล | `images/items/set-duelist.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Marksman Set** — เซ็ต (ยังไม่ยืนยันเอฟเฟกต์) | `images/items/set-marksman.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P4 · Amulets  (3 รายการ · type: ITEM ICON)

Aspect ที่แนะนำ: **1:1** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Amulet System** — ระบบเครื่องราง Amulet | `images/items/amulet-system.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Amulet Rarities** — ความหายากของ Amulet | `images/items/amulet-tiers.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Legendary Amulet** — Amulet ระดับตำนาน | `images/items/legendary-amulet.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P5 · Bosses  (3 รายการ · type: CREATURE)

Aspect ที่แนะนำ: **3:4 หรือ 1:1 (ตาม asset จริง)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Drogon** — มังกรของ Daenerys Targaryen | `images/items/drogon.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Kraken** — อสูรทะเลแห่ง Iron Islands | `images/items/kraken.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Shadowcat** — เสือเงาแห่ง The Crow's Nest | `images/items/shadowcat.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P6 · Monsters  (5 รายการ · type: CREATURE)

Aspect ที่แนะนำ: **3:4 หรือ 1:1** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **White Walkers** — ไวต์วอล์คเกอร์ | `images/items/white-walkers.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Wights** — ศพคืนชีพ | `images/items/wights.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Ice Spiders** — แมงมุมน้ำแข็ง | `images/items/ice-spiders.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Fantasy Beasts** — อสูรแฟนตาซี (Griffin/Unicorn/Basilisk) | `images/items/fantasy-beasts.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Human Enemies** — ศัตรูมนุษย์ (โจร/นักรบ) | `images/items/bandits.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P7 · Maps / Locations  (7 รายการ · type: LOCATION)

Aspect ที่แนะนำ: **16:9 (landscape)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Winterfell** — วินเทอร์เฟล — ที่มั่น House Stark | `images/items/winterfell.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Last Hearth** — ที่มั่นของ House Umber | `images/items/last-hearth.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Beyond the Wall** — ดินแดนเหนือกำแพง | `images/items/beyond-the-wall-map.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Stormlands** — แคว้นสตอร์มแลนด์ส | `images/items/stormlands.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **The Crow's Nest** — พื้นที่ในแคว้น Stormlands | `images/items/crows-nest.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Sunset Sea** — ทะเลตะวันตก (พื้นที่เรด Kraken) | `images/items/sunset-sea.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Map Run Routes** — รูทเส้นทางวิ่งเช็ค Maps (เก็บ Object) | `images/items/map-run-routes.webp` | ✅ มีรูปแล้ว |

### P8 · Dungeons  (6 รายการ · type: LOCATION)

Aspect ที่แนะนำ: **16:9 (landscape)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Worm Walks** — ดันเจียนศัตรูมนุษย์ | `images/items/wormwalks.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Beyond the Wall Expedition** — การเดินทางเหนือกำแพง | `images/items/beyond-the-wall.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Elite Hideout** — รังศัตรูระดับ Elite | `images/items/elite-hideout.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Faction Hideout** — ฐานที่มั่นกลุ่มใน Stormlands | `images/items/faction-hideout-db.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Kraken Raid** — โหมดเรดปราบ Kraken | `images/items/kraken-raid.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **World Difficulty** — ระดับความยากโลก | `images/items/world-difficulty.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P9 · Materials  (4 รายการ · type: ITEM ICON)

Aspect ที่แนะนำ: **1:1** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Legendary Amulet Design** — แบบพิมพ์ Amulet ตำนาน | `images/items/amulet-design.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Kraken Parts** — ชิ้นส่วน Kraken | `images/items/kraken-parts.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **RP (Resource Points)** — แต้มทรัพยากร | `images/items/resource-points.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Crafting Materials** — วัสดุคราฟทั่วไป | `images/items/crafting-materials.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P9 · Resources  (6 รายการ · type: ITEM ICON)

Aspect ที่แนะนำ: **1:1** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Golden Dragons** — สกุลเงินพรีเมียม | `images/items/golden-dragons.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Faction Coins** — เหรียญกลุ่ม | `images/items/faction-coins.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Forging Steel** — เหล็กหลอม (วัสดุอัปเกรด) | `images/items/forging-steel.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Amulet Core** — แกนเครื่องราง | `images/items/amulet-core.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Weapon Mastery Points** — แต้มความชำนาญอาวุธ | `images/items/weapon-mastery.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Momentum** — ค่าพลังรวม | `images/items/momentum-res.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P10 · Quests  (3 รายการ · type: SYSTEM/UI)

Aspect ที่แนะนำ: **— (icon เพียงพอ)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Main Quest** — เนื้อเรื่องหลัก | `images/items/main-quest.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Season & Relic Quest** — เควสประจำซีซันและเรลิก | `images/items/season-quest.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Bounty Hunt** — ภารกิจล่าค่าหัว | `images/items/bounty-quest.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

### P— · Stats  (3 รายการ · type: SYSTEM/UI)

Aspect ที่แนะนำ: **— (icon เพียงพอ)** · Target: `images/items/<id>.webp`

| Record | id / ชื่อไฟล์ | สถานะ |
|---|---|---|
| **Offensive Stats** — ค่าสถานะฝ่ายรุก | `images/items/stat-offense.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Defensive Stats** — ค่าสถานะฝ่ายรับ | `images/items/stat-defense.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |
| **Special Stats & Engraving** — ค่าพิเศษและ Engraving | `images/items/stat-mechanic.webp` | ⬜ MANUAL_DOWNLOAD_REQUIRED |

---

## 6) สรุปจำนวน (Final Image Report)

| หมวด | จำนวน | มีรูป | ต้องเติม | หมายเหตุ |
|---|---|---|---|---|
| Classes | 3 | 3 | 0 | ✅ เสร็จ (character banner) |
| Bosses | 3 | 0 | 3 | CREATURE — ควรหารูปจริง |
| Monsters | 5 | 0 | 5 | CREATURE |
| Maps/Locations | 7 | 1 | 6 | LOCATION |
| Dungeons | 6 | 0 | 6 | LOCATION |
| Equipment Sets | 9 | 0 | 9 | ITEM ICON |
| Amulets | 3 | 0 | 3 | ITEM ICON |
| Accessories | 3 | 0 | 3 | ITEM ICON |
| Materials | 4 | 0 | 4 | ITEM ICON |
| Resources | 6 | 0 | 6 | ITEM ICON |
| Equipment System | 9 | 0 | 9 | SYSTEM/UI — ไอคอนพอ |
| Stats | 3 | 0 | 3 | SYSTEM/UI — ไอคอนพอ |
| Quests | 3 | 0 | 3 | SYSTEM/UI — ไอคอนพอ |
| **รวม (DB records)** | **61** | **1** | **60** | + Classes 3 (แยกจาก records) |

**แนะนำโฟกัสก่อน (คนเห็นบ่อย + มีอาร์ตทางการชัด):**
Bosses (Drogon/Kraken/Shadowcat) → Locations (Winterfell/Stormlands/Beyond the Wall) →
Equipment Sets → Amulets → Resources/Materials

**ทางเลือกภาพประกอบ (ทำได้เลยถ้ามีรูป):** News/Guides ใช้ promotional art ทางการตามหัวข้อ
(ปัจจุบัน News ใช้แบนเนอร์ทั่วไป 6 แบบ — เปลี่ยนเป็นอาร์ตตรงหัวข้อได้)
