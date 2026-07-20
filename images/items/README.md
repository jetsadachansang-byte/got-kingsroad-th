# รูปไอเทม / ฐานข้อมูล (Database images)

ระบบแสดงรูปในหน้า Database ถูกเตรียมไว้พร้อมแล้ว — แค่วางไฟล์รูปในโฟลเดอร์นี้
แล้วผูกกับ entry ใน `js/database.js` รูปจะขึ้นทั้งการ์ด (หน้ารวม) และหน้ารายละเอียดทันที

## วิธีเพิ่มรูป

1. วางไฟล์รูปในโฟลเดอร์นี้ ตั้งชื่อไฟล์ = **id ของ entry** (ดูรายการด้านล่าง)
   ตัวอย่าง: เซ็ต Champion → `set-champion.webp`
2. ใน `js/database.js` ที่ entry นั้น เพิ่ม field `img`:
   ```js
   "set-champion": {
       cat: "eq-set", icon: IC.item, name: "Champion Set", ...
       img: "images/items/set-champion.webp",   // ← เพิ่มบรรทัดนี้
       ...
   }
   ```

## หมายเหตุสำคัญ (ความถูกต้อง)

- ใช้ **รูปจริงจากในเกม/แหล่งทางการเท่านั้น** (สกรีนช็อต/ไอคอนไอเทมจริง)
  ห้ามใช้รูปที่ AI สร้างขึ้นหรือรูปที่ไม่ตรงกับไอเทมจริง — ผิดหลัก Accuracy over Quantity
- ถ้ายังไม่มีรูป entry จะโชว์ไอคอน SVG เดิมเป็น placeholder โดยอัตโนมัติ
  (ถ้าใส่ path ไว้แต่ไฟล์ยังไม่มา ระบบจะซ่อนรูปที่พังแล้วตกกลับมาโชว์ไอคอน — ไม่มีรูปแตก)

## สเปกรูปที่แนะนำ

- ฟอร์แมต: `.webp` (เล็ก คมชัด) — รองรับ `.png` / `.jpg` ได้เช่นกัน
- ขนาด: สี่เหลี่ยมจัตุรัส ~256×256 ถึง 512×512 px (รูปถูกครอปแบบ cover)
- ตั้งชื่อไฟล์เป็นตัวพิมพ์เล็ก ตรงกับ id เป๊ะ

## รายชื่อ id ทั้งหมด (ตั้งชื่อไฟล์ตามนี้)

**อาวุธ/ระบบอุปกรณ์:** weapon-types, weapon-mastery, gear-tier, rarity-grade, equipment-slots, enhancement, refinement, reforging, forging, forging-steel, crafting, crafting-materials

**เซ็ตอุปกรณ์:** set-system, set-champion, set-sentinel, set-brute, set-crusher, set-duelist, set-marksman, set-mauler, set-savant

**เครื่องประดับ:** jewelry-system, necklace, ring, amulet-system, amulet-core, amulet-design, amulet-tiers, legendary-amulet

**ค่าสถานะ:** stat-mechanic, stat-offense, stat-defense, momentum-res

**วัสดุ/ทรัพยากร:** golden-dragons, faction-coins, resource-points, forging-steel, gear-tier

**บอส/มอนสเตอร์:** drogon, kraken, kraken-parts, kraken-raid, white-walkers, wights, ice-spiders, shadowcat, bandits, fantasy-beasts, beyond-the-wall

**ดันเจียน/พื้นที่:** wormwalks, crows-nest, elite-hideout, faction-hideout-db, stormlands, winterfell, last-hearth, beyond-the-wall-map, sunset-sea

**เควส:** main-quest, season-quest, bounty-quest

**ระบบอื่น ๆ:** world-difficulty, resource-points
