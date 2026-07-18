/* ============================================================
   database.js — ฐานข้อมูล Game of Thrones: Kingsroad (ภาษาไทย)

   สถาปัตยกรรมเดียวกับ guides.js / roadmap.js:
     database.html          → หน้ารวม แยกหมวดหมู่ + ค้นหา/กรอง
     database-detail.html   → หน้ารายละเอียดแต่ละรายการ (อ่านค่า ?id=)

   หลักการ: "Accuracy over Quantity" — ทุก record อ้างอิงแหล่งข้อมูล
   (เก็บใน field `sources`) ข้อมูลอิงเซิร์ฟเวอร์ปัจจุบัน (เปิด 21 พ.ค. 2026)
   และคอนเทนต์ที่เข้าเกมแล้ว หากยังยืนยันไม่ได้จะระบุสถานะแทนการเดา

   ✏️ เพิ่มรายการใหม่: เพิ่มใน DB แล้ววาง id ลงในหมวดที่ต้องการใน CATEGORIES
============================================================ */

(function () {

    /* ---------- ไอคอน SVG ---------- */
    const IC = {
        boss:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="m12.5 17-.5-1-.5 1h1z"/></svg>',
        dungeon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M18 11V4H6v7"/><path d="M15 22v-4a3 3 0 0 0-6 0v4"/><path d="M6 4V2"/><path d="M10 4V2"/><path d="M14 4V2"/><path d="M18 4V2"/></svg>',
        map:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.1 6 9 3 4 5v13l5-2 5.9 3 5.1-2V4l-5 2Z"/><path d="M9 3v13"/><path d="M15 6v13"/></svg>',
        item:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
        resource:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
        monster: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6C6 4.5 5 3 5 3s-1 3 0 5"/><path d="M17 6c1-1.5 2-3 2-3s1 3 0 5"/><path d="M6 10a6 6 0 0 1 12 0v4a6 6 0 0 1-12 0Z"/><path d="M9.5 11h.01"/><path d="M14.5 11h.01"/><path d="m9 16 1.5 1.5L12 16l1.5 1.5L15 16"/></svg>',
        quest:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>',
        cls:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>'
    };

    /* ---------- แหล่งอ้างอิงที่ใช้บ่อย ---------- */
    const SRC = {
        drogon:   { label: "gamesofthrones.org — Drogon World Boss", url: "https://www.gamesofthrones.org/guides/drogon-world-boss" },
        dgw:      { label: "gamingonphone.com — The Drowned God Wakes", url: "https://gamingonphone.com/news/game-of-thrones-kingsroad-first-content-update-the-drowned-god-wakes" },
        notes626: { label: "Netmarble — 6/26 Update Notes", url: "https://forum.netmarble.com/got/view/4/110" },
        frost:    { label: "Inven Global — Frost and Steel", url: "https://www.invenglobal.com/articles/23790/game-of-thrones-kingsroad-season-1-frost-and-steel-update" },
        creatures:{ label: "WinterIsComing / BleedingCool — Creatures", url: "https://winteriscoming.net/check-out-the-monsters-and-bosses-you-ll-fight-in-game-of-thrones-kingsroad" },
        gmKnight: { label: "Gamemeca — Class/Combat Tips", url: "https://www.gamemeca.com/en/view.php?gid=1777355" },
        gmHide:   { label: "Gamemeca — Faction Hideout", url: "https://www.gamemeca.com/en/view.php?gid=1777780" },
        map:      { label: "got-kingsroad.com — Interactive Map", url: "https://got-kingsroad.com/" }
    };

    /* ============================================================
       ข้อมูลทั้งหมด (แต่ละ record อ้างอิงแหล่งใน sources)
    ============================================================ */

    const DB = {

        /* ---------------- บอส ---------------- */
        "drogon": {
            cat: "boss", icon: IC.boss, name: "Drogon", nameTh: "มังกรของ Daenerys Targaryen",
            tags: ["World Boss", "Winterfell", "Dragon"],
            summary: "World Boss มังกรดำของ Daenerys Targaryen เกิดเป็นเวลาใกล้ Winterfell ให้รางวัลสกุลเงินพรีเมียมและวัสดุหายาก",
            meta: [
                { k: "ประเภท", v: "World Boss" },
                { k: "พื้นที่", v: "มุมตะวันออกเฉียงใต้ของ Winterfell" },
                { k: "เวลาเกิด", v: "ทุก ๆ ประมาณ 2 ชั่วโมง" },
                { k: "รูปแบบ", v: "เล่นร่วมกับผู้เล่นอื่นในแมป (open-world)" }
            ],
            body: [
                { p: "Drogon คือ World Boss ตัวหลักของเซิร์ฟเวอร์ปัจจุบัน เป็นมังกรดำของ Daenerys Targaryen ที่ปรากฏตามเวลาบริเวณมุมตะวันออกเฉียงใต้ของ Winterfell ผู้เล่นหลายคนสามารถร่วมกันโจมตีได้" },
                { h: "รางวัล" },
                { list: [
                    "Golden Dragons (สกุลเงินพรีเมียม)",
                    "วัสดุคราฟหายาก",
                    "อุปกรณ์ระดับสูง"
                ]},
                { h: "เทคนิค" },
                { p: "มีเทคนิค 'channel-hopping' คือปราบ Drogon ในช่องหนึ่งแล้วสลับไปช่องถัดไปเพื่อสู้ซ้ำและเก็บรางวัลเพิ่ม รวมทีมให้พร้อมก่อนถึงเวลาเกิด ปัจจุบันยังมีระดับความยากเพิ่มที่เข้าได้จาก Scorched Plain ในแคว้น Stormlands" }
            ],
            sources: [SRC.drogon, SRC.dgw]
        },
        "kraken": {
            cat: "boss", icon: IC.boss, name: "Kraken", nameTh: "อสูรทะเลแห่ง Iron Islands",
            tags: ["Raid Boss", "Sunset Sea", "Co-op"],
            summary: "Raid Boss ตัวแรกของเกม อสูรทะเลขนาดมหึมาใน Sunset Sea ต่อสู้แบบร่วมมือกลางทะเล",
            meta: [
                { k: "ประเภท", v: "Raid Boss (บอสเรดตัวแรก)" },
                { k: "พื้นที่", v: "ทางเหนือของ Sunset Sea" },
                { k: "รูปแบบ", v: "โหมด Raid ร่วมมือ บังคับเรือเข้าปะทะ" },
                { k: "ดรอปเด่น", v: "วัสดุคราฟ Amulet Core" }
            ],
            body: [
                { p: "Kraken เป็น Raid Boss อย่างเป็นทางการตัวแรกของเกม อสูรทะเลจากตำนาน A Song of Ice and Fire ที่สามารถจมเรือทั้งลำได้ อยู่ทางเหนือของ Sunset Sea เพิ่มเข้ามาพร้อมอัปเดต The Drowned God Wakes" },
                { h: "การต่อสู้" },
                { list: [
                    "รวมทีมและบังคับเรือเข้าปะทะกลางทะเล",
                    "ต้องเข้าใจกลไกเฉพาะและประสานทีมเพื่อรับมือการโจมตีรุนแรง",
                    "มีกระดานจัดอันดับและ Achievement"
                ]},
                { h: "รางวัล" },
                { p: "ปราบสำเร็จมีโอกาสได้วัสดุคราฟ Amulet Core ซึ่งใช้กับระบบ Amulet โปรดตรวจสอบเงื่อนไข/Power ที่แนะนำในเกมก่อนเข้าเรด" }
            ],
            sources: [SRC.dgw, SRC.notes626]
        },
        "shadowcat": {
            cat: "boss", icon: IC.boss, name: "Shadowcat", nameTh: "เสือเงาแห่ง The Crow's Nest",
            tags: ["Field Boss", "Stormlands"],
            summary: "อสูรร้ายในพื้นที่ The Crow's Nest แคว้น Stormlands (ข้อมูลรายละเอียดยังจำกัด)",
            meta: [
                { k: "ประเภท", v: "Field Boss / อสูรประจำพื้นที่" },
                { k: "พื้นที่", v: "The Crow's Nest (Stormlands)" }
            ],
            body: [
                { p: "Shadowcat เป็นอสูรร้ายที่ผู้เล่นได้พบในพื้นที่ใหม่ The Crow's Nest แคว้น Stormlands ซึ่งเปิดพร้อมอัปเดต The Drowned God Wakes" },
                { p: "หมายเหตุ: ข้อมูลกลไก/รางวัลของ Shadowcat ที่ยืนยันได้ยังจำกัด จึงยังไม่ระบุ Attack Pattern และ Drop อย่างเป็นข้อเท็จจริง จะอัปเดตเมื่อมีแหล่งข้อมูลที่ตรวจสอบได้" }
            ],
            sources: [SRC.dgw]
        },

        /* ---------------- ดันเจียน & เรด ---------------- */
        "wormwalks": {
            cat: "dungeon", icon: IC.dungeon, name: "Worm Walks", nameTh: "ดันเจียนศัตรูมนุษย์",
            tags: ["Dungeon", "PvE"],
            summary: "ดันเจียนที่ศัตรูเป็นมนุษย์เป็นหลัก เหมาะกับสาย Parry โดยเฉพาะ Knight",
            meta: [
                { k: "ประเภท", v: "Dungeon (PvE)" },
                { k: "ศัตรูหลัก", v: "มนุษย์ (จรกลุ่มโจร/นักรบ)" },
                { k: "อาชีพแนะนำ", v: "Knight (Riposte Stance/Parry ได้เปรียบ)" }
            ],
            body: [
                { p: "Worm Walks เป็นดันเจียนที่ศัตรูส่วนใหญ่เป็นมนุษย์ จึงเหมาะกับคลาสที่ Parry เก่งอย่าง Knight (ใช้ Riposte Stance ร่วมกับชุด Sentinel เพื่อ Parry การโจมตีสีเหลือง)" },
                { p: "ในซีซัน 1 Frost and Steel ดันเจียนใหญ่หลายแห่งรวมถึง Wormwalks ถูกแปลงเป็นเวอร์ชันประจำซีซันเพื่อความท้าทายและการจัดอันดับ" }
            ],
            sources: [SRC.gmKnight, SRC.frost]
        },
        "beyond-the-wall": {
            cat: "dungeon", icon: IC.dungeon, name: "Beyond the Wall Expedition", nameTh: "การเดินทางเหนือกำแพง",
            tags: ["Expedition", "PvE", "Beyond the Wall"],
            summary: "คอนเทนต์สำรวจดินแดนเหนือกำแพง หนึ่งในดันเจียนซีซันของ Frost and Steel",
            meta: [
                { k: "ประเภท", v: "Expedition / Dungeon" },
                { k: "พื้นที่", v: "Beyond the Wall (เหนือกำแพง)" }
            ],
            body: [
                { p: "Beyond the Wall Expedition เป็นคอนเทนต์สำรวจดินแดนเหนือกำแพงอันหนาวเหน็บ เป็นหนึ่งในดันเจียนที่ถูกทำเป็นเวอร์ชันประจำซีซัน 1 Frost and Steel สำหรับความท้าทายปลายเกม" },
                { p: "บิลด์ที่มี Life Steal (เช่น Passive Artifact) ช่วยให้ยืนระยะในพื้นที่นี้ได้ดีขึ้น" }
            ],
            sources: [SRC.frost]
        },
        "elite-hideout": {
            cat: "dungeon", icon: IC.dungeon, name: "Elite Hideout", nameTh: "รังศัตรูระดับ Elite",
            tags: ["Dungeon", "Elite", "PvE"],
            summary: "ดันเจียนที่เต็มไปด้วยศัตรูระดับ Elite หนึ่งในดันเจียนซีซันของ Frost and Steel",
            meta: [
                { k: "ประเภท", v: "Dungeon (PvE)" },
                { k: "ศัตรู", v: "ศัตรูระดับ Elite" }
            ],
            body: [
                { p: "Elite Hideout (บางบริบทเรียก Last Hideout) เป็นดันเจียนที่เน้นศัตรูระดับ Elite เหมาะกับคลาสที่อึดหรือมี Hit-Stun Immunity อย่าง Sellsword ในการต่อคอมโบ และเป็นหนึ่งในดันเจียนที่ทำเป็นเวอร์ชันประจำซีซัน 1" }
            ],
            sources: [SRC.frost, SRC.gmKnight]
        },
        "faction-hideout-db": {
            cat: "dungeon", icon: IC.dungeon, name: "Faction Hideout", nameTh: "ฐานที่มั่นกลุ่มใน Stormlands",
            tags: ["Dungeon", "Stormlands", "Farm"],
            summary: "ฐานที่มั่นในแคว้น Stormlands ปราบบอสสุดท้าย + Elite เก็บกล่องลูท มีปุ่ม Shortcut",
            meta: [
                { k: "ประเภท", v: "Dungeon (ทำซ้ำได้)" },
                { k: "พื้นที่", v: "Stormlands (เช่น Fortress of Pain, Ravensrock Fortress)" },
                { k: "เป้าหมาย", v: "ปราบบอสสุดท้าย + Elite อย่างน้อย 2 ตัว" }
            ],
            body: [
                { h: "เป้าหมาย" },
                { p: "ทุก Faction Hideout ใน Stormlands มีเป้าหมายเหมือนกัน: ปราบบอสสุดท้าย และกำจัดศัตรูระดับ Elite ที่ซ่อนตามทางเดินอย่างน้อย 2 ตัว" },
                { h: "โครงสร้าง" },
                { list: [
                    "ครั้งแรกต้องสำรวจปลดล็อกประตูและปล่อยบันได เพื่อให้รอบต่อไปเร็วขึ้น",
                    "ผ่าน Phase 1 แล้วจะมีปุ่ม 'Shortcut' มุมซ้ายบนพาไปหาบอสทันที",
                    "Fortress of Pain และ Ravensrock Fortress อยู่ใต้ดินลึก (Ravensrock เดินง่ายกว่า)",
                    "เก็บ 'หีบอุปกรณ์หลัก' (มีไอคอนเหนือหีบ) ก่อนเป็นอันดับแรก"
                ]},
                { p: "ดูเทคนิคฟาร์มแบบไม่เสีย RP ได้ในคู่มือ Box Run" }
            ],
            sources: [SRC.gmHide]
        },
        "kraken-raid": {
            cat: "dungeon", icon: IC.dungeon, name: "Kraken Raid", nameTh: "โหมดเรดปราบ Kraken",
            tags: ["Raid", "Co-op", "Sunset Sea"],
            summary: "โหมด Raid แบบร่วมมือกลางทะเล ปราบ Kraken เพื่อชิงวัสดุ Amulet Core",
            meta: [
                { k: "ประเภท", v: "Raid (ร่วมมือ)" },
                { k: "พื้นที่", v: "Sunset Sea" },
                { k: "บอส", v: "Kraken" }
            ],
            body: [
                { p: "Kraken Raid เป็นโหมดเรดร่วมมือตัวแรกของเกม ผู้เล่นรวมทีมบังคับเรือเข้าปะทะ Kraken กลางทะเล ต้องอาศัยการประสานทีมและเข้าใจกลไกเฉพาะ" },
                { p: "รางวัลเด่นคือวัสดุ Amulet Core สำหรับระบบ Amulet ดูหน้าบอส Kraken สำหรับรายละเอียดการต่อสู้" }
            ],
            sources: [SRC.dgw, SRC.notes626]
        },
        "world-difficulty": {
            cat: "dungeon", icon: IC.dungeon, name: "World Difficulty", nameTh: "ระดับความยากโลก",
            tags: ["Difficulty", "Endgame"],
            summary: "ระบบระดับความยากของโลกที่เพิ่มความท้าทายและคุณภาพดรอปเมื่อผู้เล่นแข็งแกร่งขึ้น",
            meta: [
                { k: "ประเภท", v: "ระบบความยาก (Endgame)" },
                { k: "ผลของการยกระดับ", v: "ศัตรูแข็งขึ้น + รางวัล/ดรอปคุณภาพสูงขึ้น" }
            ],
            body: [
                { p: "เกมมีระบบยกระดับความยากของโลก (World Level / World Difficulty) เพื่อเพิ่มความท้าทายและคุณภาพของรางวัลสำหรับผู้เล่นที่พัฒนา Momentum สูงขึ้น" },
                { p: "หมายเหตุเวอร์ชัน: ระดับความยากขั้นสูงบางระดับ (เช่น Hedge Knight III ที่ต้องใช้ Momentum สูงมากและดรอป Tier สูง) เคยปรากฏบนไทม์ไลน์เซิร์ฟเวอร์รุ่นก่อน สำหรับเซิร์ฟเวอร์ปัจจุบันที่อุปกรณ์สูงสุดยังอยู่ที่ Tier 4 ระดับความยากจะทยอยเปิดตามอัปเดต" }
            ],
            sources: [SRC.frost]
        },

        /* ---------------- แผนที่ / สถานที่ ---------------- */
        "winterfell": {
            cat: "map", icon: IC.map, name: "Winterfell", nameTh: "วินเทอร์เฟล — ที่มั่น House Stark",
            tags: ["The North", "Region", "เริ่มต้น"],
            summary: "ที่มั่นของ House Stark ในแดนเหนือ พื้นที่หลักช่วงต้นเกม และจุดเกิดของ World Boss Drogon",
            meta: [
                { k: "ภูมิภาค", v: "The North (แดนเหนือ)" },
                { k: "ตระกูล", v: "House Stark" },
                { k: "คอนเทนต์เด่น", v: "World Boss Drogon (มุมตะวันออกเฉียงใต้)" }
            ],
            body: [
                { p: "Winterfell คือที่มั่นของ House Stark และหนึ่งในพื้นที่หลักช่วงต้นเกมบนเส้นทางสายกษัตริย์ (Kingsroad) ในแดนเหนือ" },
                { p: "จุดเด่นด้านคอนเทนต์คือ World Boss Drogon ที่ปรากฏตามเวลาบริเวณมุมตะวันออกเฉียงใต้ของแมป" }
            ],
            sources: [SRC.drogon, SRC.map]
        },
        "last-hearth": {
            cat: "map", icon: IC.map, name: "Last Hearth", nameTh: "ที่มั่นของ House Umber",
            tags: ["The North", "Region", "House Umber"],
            summary: "พื้นที่ในแดนเหนือ เกี่ยวข้องกับ House Umber ผู้พิทักษ์แห่ง The Gift",
            meta: [
                { k: "ภูมิภาค", v: "The North (แดนเหนือ)" },
                { k: "ตระกูล", v: "House Umber" }
            ],
            body: [
                { p: "Last Hearth เป็นหนึ่งในพื้นที่ของแดนเหนือที่มีในเกม (ปรากฏในระบบแผนที่ตามภูมิภาค) เกี่ยวข้องกับ House Umber ตระกูลผู้พิทักษ์แห่ง The Gift ซึ่งเป็นหนึ่งในสามตระกูลที่เลือกได้ในซีซัน 1 Frost and Steel" }
            ],
            sources: [SRC.map, SRC.frost]
        },
        "beyond-the-wall-map": {
            cat: "map", icon: IC.map, name: "Beyond the Wall", nameTh: "ดินแดนเหนือกำแพง",
            tags: ["Region", "Expedition"],
            summary: "ดินแดนหนาวเหน็บเหนือกำแพง พื้นที่ต้นเกมและคอนเทนต์สำรวจ (Expedition)",
            meta: [
                { k: "ประเภท", v: "ภูมิภาค / พื้นที่สำรวจ" },
                { k: "คอนเทนต์", v: "Beyond the Wall Expedition" }
            ],
            body: [
                { p: "Beyond the Wall คือดินแดนหนาวเหน็บทางเหนือของกำแพง เป็นหนึ่งในพื้นที่เริ่มต้นของเกมและมีคอนเทนต์สำรวจ (Expedition) เป็นดันเจียนประจำซีซัน 1" }
            ],
            sources: [SRC.frost, SRC.map]
        },
        "stormlands": {
            cat: "map", icon: IC.map, name: "Stormlands", nameTh: "แคว้นสตอร์มแลนด์ส",
            tags: ["Region", "The Drowned God Wakes"],
            summary: "แคว้นใหม่จากอัปเดต The Drowned God Wakes มีพื้นที่ย่อยหลายแห่งและคอนเทนต์ปลายเกม",
            meta: [
                { k: "ประเภท", v: "ภูมิภาค (เพิ่มใหม่)" },
                { k: "พื้นที่ย่อย", v: "The Crow's Nest, Scorched Plain, Griffin's Roost" },
                { k: "คอนเทนต์", v: "Bounty Hunt, Faction Hideout, Drogon ระดับใหม่" }
            ],
            body: [
                { p: "Stormlands เป็นแคว้นใหม่ที่เปิดพร้อมอัปเดตคอนเทนต์ใหญ่ The Drowned God Wakes ประกอบด้วยพื้นที่ย่อยหลายแห่ง เช่น The Crow's Nest, Scorched Plain และ Griffin's Roost" },
                { h: "คอนเทนต์ในพื้นที่" },
                { list: [
                    "ระบบล่าค่าหัว (Bounty Hunt) — ล่าอาชญากร 15 ราย รับแต้ม Weapon Mastery",
                    "Faction Hideout (เช่น Fortress of Pain, Ravensrock Fortress)",
                    "ทางเข้าระดับความยากใหม่ของ World Boss Drogon จาก Scorched Plain"
                ]}
            ],
            sources: [SRC.dgw, SRC.gmHide]
        },
        "crows-nest": {
            cat: "map", icon: IC.map, name: "The Crow's Nest", nameTh: "พื้นที่ในแคว้น Stormlands",
            tags: ["Stormlands", "Area"],
            summary: "พื้นที่หลักในแคว้น Stormlands มีเควส ซากปรักหักพัง อสูร Shadowcat และเนื้อเรื่องเกี่ยวกับ Stannis Baratheon",
            meta: [
                { k: "ภูมิภาค", v: "Stormlands" },
                { k: "อสูรประจำพื้นที่", v: "Shadowcat" },
                { k: "เนื้อเรื่อง", v: "เกี่ยวข้องกับ Stannis Baratheon และการยึด Griffin's Roost" }
            ],
            body: [
                { p: "The Crow's Nest เป็นพื้นที่หลักของแคว้น Stormlands มีเควสหลัก เควสย่อย ซากปรักหักพัง (Ruins) และภารกิจตามล่า ผู้เล่นจะได้พบ Stannis Baratheon ผู้อ้างสิทธิ์ในบัลลังก์เหล็ก ท่ามกลางการทรยศเมื่อทหารรับจ้างยึด Griffin's Roost" },
                { p: "พื้นที่นี้ยังเป็นถิ่นของอสูร Shadowcat" }
            ],
            sources: [SRC.dgw]
        },
        "sunset-sea": {
            cat: "map", icon: IC.map, name: "Sunset Sea", nameTh: "ทะเลตะวันตก (พื้นที่เรด Kraken)",
            tags: ["Raid", "Ocean"],
            summary: "ท้องทะเลทางตะวันตกของ Westeros จุดที่ต่อสู้กับ Raid Boss Kraken",
            meta: [
                { k: "ประเภท", v: "พื้นที่ทะเล (Raid)" },
                { k: "บอส", v: "Kraken (ทางเหนือของ Sunset Sea)" }
            ],
            body: [
                { p: "Sunset Sea คือท้องทะเลทางตะวันตกของ Westeros ในเกมนี้เป็นสถานที่ต่อสู้กับ Raid Boss Kraken (บริเวณทางเหนือของทะเล) ในโหมดเรดร่วมมือแบบบังคับเรือ" }
            ],
            sources: [SRC.dgw]
        },

        /* ---------------- ไอเทม ---------------- */
        "gear-tier": {
            cat: "item", icon: IC.item, name: "Gear Rarity & Tier", nameTh: "ระดับความหายากและ Tier ของอุปกรณ์",
            tags: ["System", "Gear"],
            summary: "ระบบระดับอุปกรณ์ที่ไล่จากธรรมดาไปจนถึง Legendary และแบ่งเป็น Tier",
            meta: [
                { k: "ประเภท", v: "ระบบอุปกรณ์" },
                { k: "Tier สูงสุด (เซิร์ฟปัจจุบัน)", v: "Legendary Tier 4" }
            ],
            body: [
                { p: "อุปกรณ์ในเกมไล่ระดับความหายากขึ้นไปจนถึง Legendary และแบ่งเป็น Tier ยิ่ง Tier สูงยิ่งแรง บนเซิร์ฟเวอร์ปัจจุบัน (เปิด 21 พ.ค. 2026) อุปกรณ์ระดับสูงสุดอยู่ที่ Legendary Tier 4 และคอนเทนต์/Tier ที่สูงขึ้นจะทยอยเพิ่มตามอัปเดต" },
                { p: "ควรตีบวก (Refinement) และอัปเกรดให้ทันเลเวลเสมอ เพื่อไม่ให้ค่าพลังรวม (Momentum) ตกหลัง" }
            ],
            sources: [SRC.gmKnight]
        },
        "champion-set": {
            cat: "item", icon: IC.item, name: "Champion Set", nameTh: "เซ็ตเน้นคริติคอล",
            tags: ["Armor Set", "Critical"],
            summary: "เซ็ตเกราะยอดนิยมที่เน้นเพิ่มอัตราคริติคอล ใช้ได้หลายอาชีพ",
            meta: [
                { k: "ประเภท", v: "Armor Set" },
                { k: "จุดเด่น", v: "เพิ่มอัตราคริติคอล (Critical Rate)" },
                { k: "เหมาะกับ", v: "Knight, Assassin (ปลายเกม), Sellsword" }
            ],
            body: [
                { p: "Champion Set เป็นเซ็ตเกราะที่เน้นเพิ่มอัตราคริติคอล เป็นตัวเลือกยอดนิยมสำหรับหลายอาชีพ โดยเฉพาะสาย DPS เช่น Sellsword และ Assassin ช่วงท้ายเกม รวมถึง Knight สายโจมตี" }
            ],
            sources: [SRC.gmKnight]
        },
        "sentinel-set": {
            cat: "item", icon: IC.item, name: "Sentinel Set", nameTh: "เซ็ตเพิ่มการ Parry",
            tags: ["Armor Set", "Parry", "Knight"],
            summary: "เซ็ตที่ช่วยเพิ่มการ Parry เหมาะกับ Knight เมื่อเล่นดันเจียนศัตรูมนุษย์",
            meta: [
                { k: "ประเภท", v: "Armor Set" },
                { k: "จุดเด่น", v: "เพิ่มความสามารถในการ Parry" },
                { k: "เหมาะกับ", v: "Knight (เช่นใน Worm Walks)" }
            ],
            body: [
                { p: "Sentinel Set ช่วยเพิ่มการ Parry เมื่อใช้ร่วมกับสกิล Riposte Stance ของ Knight จะ Parry การโจมตีสีเหลืองของศัตรูมนุษย์ได้ เหมาะกับดันเจียนอย่าง Worm Walks" }
            ],
            sources: [SRC.gmKnight]
        },
        "amulet-db": {
            cat: "item", icon: IC.item, name: "Amulet", nameTh: "ระบบเครื่องราง",
            tags: ["System", "Amulet"],
            summary: "ระบบเสริมพลังจาก The Drowned God Wakes มีทั้งหมด 9 ชิ้น (Rare/Epic/Legendary อย่างละ 3)",
            meta: [
                { k: "ประเภท", v: "ระบบเสริมพลัง (เครื่องราง)" },
                { k: "จำนวน", v: "9 ชิ้น (Rare 3 / Epic 3 / Legendary 3)" },
                { k: "วัสดุคราฟ", v: "Amulet Core (จาก Kraken Raid)" }
            ],
            body: [
                { p: "Amulet เป็นระบบเสริมความแข็งแกร่งและปรับแต่งบิลด์ มีทั้งหมด 9 ชิ้น แบ่งเป็น Rare 3, Epic 3 และ Legendary 3" },
                { list: [
                    "ทุกชิ้นมีเอฟเฟกต์ตายตัว (Fixed) หนึ่งอย่าง",
                    "และมีเอฟเฟกต์สุ่ม (Random) เพิ่มตามความหายาก ยิ่งหายากยิ่งได้เอฟเฟกต์สุ่มมาก",
                    "เชื่อมโยงกับ Kraken Raid ผ่านวัสดุ Amulet Core"
                ]}
            ],
            sources: [SRC.dgw, SRC.notes626]
        },
        "class-weapons": {
            cat: "item", icon: IC.item, name: "Class Weapons", nameTh: "อาวุธประจำอาชีพ",
            tags: ["Weapon", "Class"],
            summary: "อาวุธหลักของแต่ละอาชีพ: Knight (ดาบใหญ่/ดาบคู่), Assassin (มีดคู่), Sellsword (อาวุธหนัก)",
            meta: [
                { k: "Knight", v: "Greatsword (ดาบสองมือ) และ Dual Blades (ดาบคู่)" },
                { k: "Assassin", v: "Dagger (มีดคู่)" },
                { k: "Sellsword", v: "อาวุธหนัก เช่น Axe / Gauntlet" }
            ],
            body: [
                { p: "อาวุธหลักของแต่ละอาชีพต่างกันตามสไตล์: Knight ใช้ดาบสองมือ (Greatsword) และดาบคู่ (Dual Blades) โดยคอมโบชุดแรกของ Dual Blades ใช้ง่ายและคล่องตัว, Assassin ใช้มีดคู่เน้น Burst และสถานะพิษ/Bloodrage, ส่วน Sellsword ใช้อาวุธหนักที่สะสมสถานะ Shock สู่ Destruction" },
                { p: "ดูแนวทางคอมโบและบิลด์ละเอียดได้ที่หน้าอาชีพและหน้าคู่มือ" }
            ],
            sources: [SRC.gmKnight]
        },

        /* ---------------- ทรัพยากร ---------------- */
        "golden-dragons": {
            cat: "resource", icon: IC.resource, name: "Golden Dragons", nameTh: "สกุลเงินพรีเมียม",
            tags: ["Currency", "Premium"],
            summary: "สกุลเงินพรีเมียมหลักของเกม ได้จาก World Boss Drogon และช่องทางอื่น ๆ",
            meta: [
                { k: "ประเภท", v: "สกุลเงินพรีเมียม" },
                { k: "แหล่งได้", v: "World Boss Drogon, กิจกรรม, โค้ด/คูปอง" }
            ],
            body: [
                { p: "Golden Dragons เป็นสกุลเงินพรีเมียมของเกม ใช้กับร้านค้าและระบบต่าง ๆ ได้จากการปราบ World Boss Drogon กิจกรรมในเกม และการแลกโค้ด/คูปอง" }
            ],
            sources: [SRC.drogon]
        },
        "faction-coins": {
            cat: "resource", icon: IC.resource, name: "Faction Coins", nameTh: "เหรียญกลุ่ม",
            tags: ["Currency", "Stormlands"],
            summary: "เหรียญที่ได้จาก Faction Hideout ใช้แลกของในร้านของกลุ่ม",
            meta: [
                { k: "ประเภท", v: "สกุลเงินกลุ่ม" },
                { k: "แหล่งได้", v: "Faction Hideout (เลือก Basic Reward)" }
            ],
            body: [
                { p: "Faction Coins ได้จากการเคลียร์ Faction Hideout ในแคว้น Stormlands โดยเลือกรางวัล 'Basic Reward' จะได้ Faction Coins โดยไม่เสีย RP ใช้แลกไอเทมในร้านของกลุ่ม" }
            ],
            sources: [SRC.gmHide]
        },
        "forging-steel": {
            cat: "resource", icon: IC.resource, name: "Forging Steel", nameTh: "เหล็กหลอม (วัสดุอัปเกรด)",
            tags: ["Material", "Upgrade"],
            summary: "วัสดุที่ได้จากการแยกชิ้นส่วนเครื่องประดับ Legendary ที่ตีบวกแล้ว",
            meta: [
                { k: "ประเภท", v: "วัสดุ (Upgrade Material)" },
                { k: "วิธีได้", v: "แยกชิ้นส่วนเครื่องประดับ Legendary ที่ตีบวก (refine) แล้ว" }
            ],
            body: [
                { p: "Forging Steel เป็นวัสดุที่ได้จากการแยกชิ้นส่วน (dismantle) เครื่องประดับ Legendary — ต้องตีบวก (refine) ก่อนอย่างน้อย 1 ครั้งจึงจะได้ Forging Steel (ตีบวกมากขึ้นได้มากขึ้น) ดูรายละเอียดในคู่มือ 'ตีบวกเครื่องประดับก่อนแยกชิ้นส่วน'" }
            ],
            sources: [{ label: "Gamemeca — Refine Before Dismantle", url: "https://www.gamemeca.com/en/view.php?gid=1776814" }]
        },
        "amulet-core": {
            cat: "resource", icon: IC.resource, name: "Amulet Core", nameTh: "แกนเครื่องราง",
            tags: ["Material", "Amulet", "Raid"],
            summary: "วัสดุคราฟระบบ Amulet ได้จากการปราบ Kraken Raid",
            meta: [
                { k: "ประเภท", v: "วัสดุคราฟ (Amulet)" },
                { k: "แหล่งได้", v: "Kraken Raid" }
            ],
            body: [
                { p: "Amulet Core เป็นวัสดุสำหรับระบบ Amulet ได้จากการปราบ Raid Boss Kraken ใน Sunset Sea" }
            ],
            sources: [SRC.dgw]
        },
        "weapon-mastery": {
            cat: "resource", icon: IC.resource, name: "Weapon Mastery Points", nameTh: "แต้มความชำนาญอาวุธ",
            tags: ["Progression"],
            summary: "แต้มสำหรับปลดล็อก Mastery ของคอมโบ ได้จากการล่าค่าหัวใน Stormlands และอื่น ๆ",
            meta: [
                { k: "ประเภท", v: "แต้มความก้าวหน้า" },
                { k: "แหล่งได้", v: "Bounty Hunt ใน Stormlands (15 ราย = 26 แต้ม) และคอนเทนต์อื่น" }
            ],
            body: [
                { p: "Weapon Mastery Points ใช้ปลดล็อก Mastery ของคอมโบอาวุธ ในแคว้น Stormlands ล่าอาชญากรที่ไม่ซ้ำกัน 15 ราย จะได้รวม 26 แต้ม" }
            ],
            sources: [{ label: "Gamemeca — Stormlands Bounty Hunt", url: "https://www.gamemeca.com/en/view.php?gid=1776551" }]
        },
        "momentum-res": {
            cat: "resource", icon: IC.resource, name: "Momentum", nameTh: "ค่าพลังรวม",
            tags: ["System", "Power"],
            summary: "ค่าพลังรวมของตัวละครที่ควบคุมความคืบหน้า คำนวณจากอุปกรณ์ การตีบวก Sigil, Artifact ฯลฯ",
            meta: [
                { k: "ประเภท", v: "ค่าพลังรวม (Power Rating)" },
                { k: "ประกอบด้วย", v: "อุปกรณ์, Refinement, Sigil, Artifact, เครื่องประดับ, Trait, Skill" }
            ],
            body: [
                { p: "Momentum คือค่าพลังรวมที่รวมทุกอย่างของตัวละครเป็นตัวเลขเดียว ใช้เป็นเงื่อนไขปลดล็อกคอนเทนต์เกือบทั้งหมด และเป็นตัวชี้วัดความแข็งแกร่ง อ่านวิธีเพิ่ม Momentum และการทะลุ 'กำแพง Momentum' ได้ในหน้าคู่มือ" }
            ],
            sources: [{ label: "gamesofthrones.org — Level/Momentum", url: "https://www.gamesofthrones.org/guides/how-to-level-fast" }]
        },

        /* ---------------- มอนสเตอร์ ---------------- */
        "white-walkers": {
            cat: "monster", icon: IC.monster, name: "White Walkers", nameTh: "ไวต์วอล์คเกอร์",
            tags: ["Undead", "Beyond the Wall"],
            summary: "ศัตรูน้ำแข็งจากดินแดนไกลเหนือ ผู้ควบคุมกองทัพศพ (Wights)",
            meta: [
                { k: "ประเภท", v: "ศัตรูน้ำแข็ง (Undead)" },
                { k: "พื้นที่", v: "Beyond the Wall / ดินแดนไกลเหนือ" }
            ],
            body: [
                { p: "White Walkers เป็นศัตรูรูปลักษณ์น้ำแข็งที่มุ่งทำลายโลกมนุษย์ และควบคุมกองทัพศพคืนชีพ (Wights) ปรากฏในธีมดินแดนเหนือกำแพงของเกม" }
            ],
            sources: [SRC.creatures]
        },
        "wights": {
            cat: "monster", icon: IC.monster, name: "Wights", nameTh: "ศพคืนชีพ",
            tags: ["Undead", "Beyond the Wall"],
            summary: "ศพคืนชีพที่ White Walkers ควบคุม จุดอ่อนคือไฟ",
            meta: [
                { k: "ประเภท", v: "ศพคืนชีพ (Undead)" },
                { k: "จุดอ่อน", v: "ไฟ (Fire)" }
            ],
            body: [
                { p: "Wights คือศพคืนชีพที่ถูก White Walkers ควบคุมให้เป็นทหารในกองทัพอสูร จุดอ่อนสำคัญคือไฟ" }
            ],
            sources: [SRC.creatures]
        },
        "ice-spiders": {
            cat: "monster", icon: IC.monster, name: "Ice Spiders", nameTh: "แมงมุมน้ำแข็ง",
            tags: ["Creature", "Beyond the Wall"],
            summary: "แมงมุมน้ำแข็งขนาดใหญ่เท่าสุนัขล่าเนื้อ พาหนะของ White Walkers ตามตำนาน",
            meta: [
                { k: "ประเภท", v: "อสูร (Creature)" },
                { k: "ขนาด", v: "ใหญ่เท่าสุนัขล่าเนื้อ" }
            ],
            body: [
                { p: "Ice Spiders เป็นอสูรน้ำแข็งขนาดใหญ่ 'เท่าสุนัขล่าเนื้อ' ตามตำนานเป็นพาหนะของ White Walkers เมื่อกวาดล้างดินแดน เป็นหนึ่งในอสูรที่ผู้เล่นได้เผชิญในเกม" }
            ],
            sources: [SRC.creatures]
        },
        "fantasy-beasts": {
            cat: "monster", icon: IC.monster, name: "Fantasy Beasts", nameTh: "อสูรแฟนตาซี (Griffin/Unicorn/Basilisk)",
            tags: ["Creature"],
            summary: "นอกจากโจรและ White Walkers ยังมีอสูรแฟนตาซี เช่น กริฟฟิน ยูนิคอร์นดุร้าย และบาซิลิสก์",
            meta: [
                { k: "ตัวอย่าง", v: "Griffin, Unicorn (ดุร้าย), Basilisk, แมงมุมยักษ์, Dragon" }
            ],
            body: [
                { p: "ในเกมผู้เล่นจะได้ต่อสู้กับศัตรูหลากหลายนอกเหนือจากโจรมนุษย์และ White Walkers รวมถึงอสูรแฟนตาซีอย่างกริฟฟิน (Griffin), ยูนิคอร์นดุร้าย (Unicorn), บาซิลิสก์ (Basilisk), แมงมุมยักษ์ และมังกร (Dragon)" }
            ],
            sources: [SRC.creatures]
        },
        "bandits": {
            cat: "monster", icon: IC.monster, name: "Human Enemies", nameTh: "ศัตรูมนุษย์ (โจร/นักรบ)",
            tags: ["Human", "Dungeon"],
            summary: "ศัตรูมนุษย์ที่พบทั่วไป โดยเฉพาะในดันเจียนอย่าง Worm Walks — Parry ได้ผลดี",
            meta: [
                { k: "ประเภท", v: "ศัตรูมนุษย์" },
                { k: "พบใน", v: "พื้นที่ทั่วไปและดันเจียน เช่น Worm Walks" }
            ],
            body: [
                { p: "ศัตรูมนุษย์ (โจร นักรบ ทหารรับจ้าง) เป็นศัตรูพื้นฐานที่พบบ่อย โดยเฉพาะในดันเจียน Worm Walks การ Parry (เช่น Riposte Stance ของ Knight) ได้ผลดีมากกับศัตรูประเภทนี้" }
            ],
            sources: [SRC.gmKnight, SRC.creatures]
        },

        /* ---------------- เควส ---------------- */
        "main-quest": {
            cat: "quest", icon: IC.quest, name: "Main Quest", nameTh: "เนื้อเรื่องหลัก",
            tags: ["Story", "Main"],
            summary: "เนื้อเรื่องหลักในช่วงพลบค่ำของสงครามห้ากษัตริย์ ผู้เล่นฟื้นฟูตระกูลและเดินทางบน Kingsroad",
            meta: [
                { k: "ประเภท", v: "Main Quest (เนื้อเรื่องหลัก)" },
                { k: "ฉากหลัง", v: "ปลายสงครามห้ากษัตริย์ (War of the Five Kings)" }
            ],
            body: [
                { p: "เนื้อเรื่องหลักดำเนินในช่วงพลบค่ำของสงครามห้ากษัตริย์ ขณะที่บัลลังก์เหล็กใน King's Landing อยู่ในมือของ Tommen Baratheon โดยมี Cersei Lannister หนุนหลัง ผู้เล่นสวมบทเป็นทายาทที่ต้องฟื้นฟูตระกูลของตนและเดินทางบนเส้นทางสายกษัตริย์ในแดนเหนือ" },
                { p: "หมายเหตุ: รายชื่อเควสย่อยแต่ละบทยังรวบรวมไม่ครบในเวอร์ชันนี้ จะทยอยเพิ่มเมื่อมีแหล่งข้อมูลที่ตรวจสอบได้" }
            ],
            sources: [{ label: "Gamemeca — Storyboard (Lannister)", url: "https://www.gamemeca.com/en/view.php?gid=1776473" }]
        },
        "season-quest": {
            cat: "quest", icon: IC.quest, name: "Season & Relic Quest", nameTh: "เควสประจำซีซันและเรลิก",
            tags: ["Season", "Frost and Steel"],
            summary: "เควสประจำซีซัน 1 Frost and Steel รวมถึง Relic Quest และการสะสม Season Points",
            meta: [
                { k: "ประเภท", v: "Season Quest / Relic Quest" },
                { k: "ซีซัน", v: "Season 1: Frost and Steel" }
            ],
            body: [
                { p: "ซีซัน 1 Frost and Steel เปิด Season Quests และ Relic Quests พร้อมระบบสะสม Season Points/Token จาก Raid Defense, Duel Festival, การสำรวจพื้นที่ และคอนเทนต์ทำซ้ำได้ ดูรายละเอียดซีซันได้ที่หน้า Roadmap" }
            ],
            sources: [SRC.frost]
        },
        "bounty-quest": {
            cat: "quest", icon: IC.quest, name: "Bounty Hunt", nameTh: "ภารกิจล่าค่าหัว",
            tags: ["Stormlands", "Side"],
            summary: "ภารกิจล่าอาชญากรในแคว้น Stormlands เพื่อรับแต้ม Weapon Mastery",
            meta: [
                { k: "ประเภท", v: "ภารกิจเสริม (Bounty)" },
                { k: "พื้นที่", v: "Stormlands" },
                { k: "รางวัล", v: "แต้ม Weapon Mastery (15 ราย = 26 แต้ม)" }
            ],
            body: [
                { p: "Bounty Hunt เป็นภารกิจตามล่าอาชญากรในแคว้น Stormlands ตัวเลือกระหว่างทางมีผลต่อผลลัพธ์ ล่าอาชญากรที่ไม่ซ้ำกัน 15 ราย จะได้รวม 26 แต้ม Weapon Mastery" }
            ],
            sources: [{ label: "Gamemeca — Stormlands Bounty Hunt", url: "https://www.gamemeca.com/en/view.php?gid=1776551" }]
        }
    };

    /* ============================================================
       หมวดหมู่ (จัดกลุ่ม + ระบุความสมบูรณ์)
    ============================================================ */

    const CLASS_LINKS = [
        { name: "Knight", nameTh: "อัศวินสายแทงก์", href: "classes.html#knight", tags: ["Class", "Tank"], summary: "แนวหน้าเกราะหนัก อึดที่สุด เล่นง่าย ครอบคลุมคอนเทนต์ส่วนใหญ่", icon: IC.cls },
        { name: "Assassin", nameTh: "นักลอบสังหาร", href: "classes.html#assassin", tags: ["Class", "DPS"], summary: "ดาเมจระเบิดสูงสุด เร็ว แต่ตัวบางต้องหลบแม่น", icon: IC.cls },
        { name: "Sellsword", nameTh: "ทหารรับจ้าง", href: "classes.html#sellsword", tags: ["Class", "DPS"], summary: "อาวุธหนัก คอมโบไม่ถูกขัดจังหวะ ดาเมจต่อเป้าเดี่ยวสูง", icon: IC.cls }
    ];

    const CATEGORIES = [
        { id: "class",    icon: IC.cls,     title: "อาชีพ",           desc: "Knight / Assassin / Sellsword", status: "สมบูรณ์", classLinks: true },
        { id: "boss",     icon: IC.boss,    title: "บอส",             desc: "World Boss, Raid Boss และ Field Boss", status: "สมบูรณ์", ids: ["drogon", "kraken", "shadowcat"] },
        { id: "dungeon",  icon: IC.dungeon, title: "ดันเจียน & เรด",   desc: "Dungeon, Raid และระดับความยาก", status: "สมบูรณ์", ids: ["wormwalks", "beyond-the-wall", "elite-hideout", "faction-hideout-db", "kraken-raid", "world-difficulty"] },
        { id: "map",      icon: IC.map,     title: "แผนที่ / สถานที่",  desc: "ภูมิภาคและพื้นที่ในเกม", status: "สมบูรณ์", ids: ["winterfell", "last-hearth", "beyond-the-wall-map", "stormlands", "crows-nest", "sunset-sea"] },
        { id: "item",     icon: IC.item,    title: "ไอเทม",           desc: "อุปกรณ์ เซ็ตเกราะ และระบบ Amulet", status: "สมบูรณ์", ids: ["gear-tier", "champion-set", "sentinel-set", "amulet-db", "class-weapons"] },
        { id: "resource", icon: IC.resource,title: "ทรัพยากร",         desc: "สกุลเงิน วัสดุ และค่าพลัง", status: "สมบูรณ์", ids: ["golden-dragons", "faction-coins", "forging-steel", "amulet-core", "weapon-mastery", "momentum-res"] },
        { id: "monster",  icon: IC.monster, title: "มอนสเตอร์",        desc: "ศัตรูและอสูรในเกม", status: "สมบูรณ์", ids: ["white-walkers", "wights", "ice-spiders", "fantasy-beasts", "bandits"] },
        { id: "quest",    icon: IC.quest,   title: "เควส",            desc: "เนื้อเรื่องหลัก ซีซัน และภารกิจเสริม", status: "กำลังรวบรวม", ids: ["main-quest", "season-quest", "bounty-quest"] }
    ];

    const CAT_BY_ID = {};
    CATEGORIES.forEach(c => CAT_BY_ID[c.id] = c);

    /* ============================================================
       ตัวเรนเดอร์
    ============================================================ */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function tagsHtml(tags) {
        return (tags || []).map(t => `<span class="db-tag">${esc(t)}</span>`).join("");
    }

    function entryCard(id) {
        const e = DB[id];
        if (!e) return "";
        const search = (e.name + " " + e.nameTh + " " + (e.tags || []).join(" ")).toLowerCase();
        return `<a href="database-detail.html?id=${encodeURIComponent(id)}" class="quick-card guide-card db-card" data-search="${esc(search)}">
            <div class="quick-icon">${e.icon}</div>
            <h3>${esc(e.name)}</h3>
            <span class="db-nameth">${esc(e.nameTh)}</span>
            <p>${esc(e.summary)}</p>
            <div class="db-tags">${tagsHtml(e.tags)}</div>
            <span class="class-link">ดูรายละเอียด →</span>
        </a>`;
    }

    function classCard(c) {
        const search = (c.name + " " + c.nameTh + " " + c.tags.join(" ")).toLowerCase();
        return `<a href="${c.href}" class="quick-card guide-card db-card" data-search="${esc(search)}">
            <div class="quick-icon">${c.icon}</div>
            <h3>${esc(c.name)}</h3>
            <span class="db-nameth">${esc(c.nameTh)}</span>
            <p>${esc(c.summary)}</p>
            <div class="db-tags">${tagsHtml(c.tags)}</div>
            <span class="class-link">เปิดหน้าอาชีพ →</span>
        </a>`;
    }

    /* ---------- หน้ารวมฐานข้อมูล ---------- */
    const hub = document.getElementById("database-hub");
    if (hub) {
        const nav = `<div class="guide-nav db-nav">${CATEGORIES.map(c => `<a href="#cat-${c.id}">${esc(c.title)}</a>`).join("")}</div>`;

        const search = `<div class="db-search-wrap">
            <input type="text" id="dbSearch" class="db-search" placeholder="ค้นหาในฐานข้อมูล เช่น Drogon, Amulet, Winterfell..." autocomplete="off">
            <p class="db-noresult" id="dbNoResult" hidden>ไม่พบรายการที่ตรงกับคำค้น ลองใช้คำอื่นดูนะ</p>
        </div>`;

        const sections = CATEGORIES.map(cat => {
            const cards = cat.classLinks
                ? CLASS_LINKS.map(classCard).join("")
                : (cat.ids || []).map(entryCard).join("");
            const statusCls = cat.status === "สมบูรณ์" ? "db-status-done" : "db-status-wip";
            return `<div class="guide-cat db-cat" id="cat-${cat.id}">
                <div class="guide-cat-head">
                    <span class="guide-cat-icon">${cat.icon}</span>
                    <div>
                        <h2>${esc(cat.title)} <span class="db-status ${statusCls}">${esc(cat.status)}</span></h2>
                        <p>${esc(cat.desc)}</p>
                    </div>
                </div>
                <div class="quick-grid db-grid">${cards}</div>
            </div>`;
        }).join("");

        hub.innerHTML = nav + search + sections;

        /* ค้นหา/กรอง (client-side) */
        const input = document.getElementById("dbSearch");
        const noResult = document.getElementById("dbNoResult");
        if (input) {
            input.addEventListener("input", function () {
                const q = this.value.trim().toLowerCase();
                let total = 0;
                document.querySelectorAll(".db-cat").forEach(cat => {
                    let shown = 0;
                    cat.querySelectorAll(".db-card").forEach(card => {
                        const match = !q || card.dataset.search.includes(q);
                        card.style.display = match ? "" : "none";
                        if (match) shown++;
                    });
                    cat.style.display = shown ? "" : "none";
                    total += shown;
                });
                if (noResult) noResult.hidden = total !== 0;
            });
        }
    }

    /* ---------- หน้ารายละเอียด ---------- */
    const detail = document.getElementById("database-detail");
    if (detail) {
        const id = new URLSearchParams(location.search).get("id");
        const e = DB[id];

        if (!e) {
            detail.innerHTML = `<div class="container"><div class="ga-notfound">
                <h2>ไม่พบข้อมูล</h2>
                <p>รายการนี้อาจถูกย้ายหรือลบไปแล้ว</p>
                <a href="database.html" class="btn-primary">กลับไปหน้าฐานข้อมูล</a>
            </div></div>`;
        } else {
            const cat = CAT_BY_ID[e.cat] || { title: "ฐานข้อมูล" };
            document.title = e.name + " | ฐานข้อมูล Game of Thrones: Kingsroad TH";

            const metaHtml = (e.meta || []).map(m =>
                `<div class="db-meta-row"><span class="db-meta-k">${esc(m.k)}</span><span class="db-meta-v">${esc(m.v)}</span></div>`
            ).join("");

            const bodyHtml = (e.body || []).map(b => {
                if (b.h) return `<h3 class="ga-h">${esc(b.h)}</h3>`;
                if (b.p) return `<p class="ga-p">${esc(b.p)}</p>`;
                if (b.list) return `<ul class="ga-list">${b.list.map(li => `<li>${esc(li)}</li>`).join("")}</ul>`;
                return "";
            }).join("");

            const srcHtml = (e.sources || []).map(s =>
                `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
            ).join(" · ");

            const related = (cat.ids || []).filter(x => x !== id).slice(0, 3);
            const relatedHtml = related.length
                ? `<div class="ga-related"><h3 class="cls-block-title">ในหมวดเดียวกัน</h3><div class="quick-grid db-grid">${related.map(entryCard).join("")}</div></div>`
                : "";

            detail.innerHTML = `<div class="container ga-wrap">
                <nav class="db-crumb"><a href="database.html">ฐานข้อมูล</a> <span>/</span> <a href="database.html#cat-${e.cat}">${esc(cat.title)}</a> <span>/</span> <strong>${esc(e.name)}</strong></nav>
                <div class="ga-icon">${e.icon}</div>
                <span class="hero-badge">${esc(cat.title)}</span>
                <h1 class="ga-title">${esc(e.name)}</h1>
                <p class="rm-subtitle">${esc(e.nameTh)}</p>
                <p class="ga-summary">${esc(e.summary)}</p>
                <div class="db-tags db-tags-lg">${tagsHtml(e.tags)}</div>
                ${metaHtml ? `<div class="db-meta">${metaHtml}</div>` : ""}
                <article class="ga-body">${bodyHtml}</article>
                ${srcHtml ? `<div class="ga-source">ที่มา: ${srcHtml}</div>` : ""}
                ${relatedHtml}
            </div>`;
        }
    }

})();
