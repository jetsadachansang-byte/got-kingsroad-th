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
        cls:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>',
        gear:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/></svg>',
        hammer:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h.86c.85 0 1.65.33 2.25.93l1.25 1.25"/></svg>',
        gem:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
        ring:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6"/><path d="m9 6 1.5-3h3L15 6"/><path d="M12 9V6"/></svg>',
        chart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>',
        amulet:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v5"/><path d="M8 5h8"/><path d="M12 8a6 6 0 1 0 6 6 6 6 0 0 0-6-6z"/><path d="m12 11 1.2 2.5 2.8.3-2 2 .5 2.7L12 19l-2.5 1.5.5-2.7-2-2 2.8-.3z"/></svg>'
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
        map:      { label: "got-kingsroad.com — Interactive Map", url: "https://got-kingsroad.com/" },
        eqGuide:  { label: "gamesofthrones.org — Equipment & Gear Guide", url: "https://www.gamesofthrones.org/guides/equipment-gear-guide" },
        setBonus: { label: "CoffeeGamer — Gearset Bonuses", url: "https://coffeegamer.com/game-of-thrones-kingsroad-quick-guide-to-gearset-bonuses/" },
        nmEquip:  { label: "Netmarble Official Guide — Equipment", url: "https://guide.netmarble.com/gotasia/27" },
        nmEnh:    { label: "Netmarble Official Guide — Enhancement", url: "https://guide.netmarble.com/got/87" },
        nmSet:    { label: "Netmarble Official Guide — Set Research", url: "https://guide.netmarble.com/got/46" },
        ldEquip:  { label: "LDPlayer — Equipment Crafting Guide", url: "https://www.ldplayer.net/blog/game-of-thrones-kingsroad-equipment-crafting-guide.html" },
        amuletSteam: { label: "Steam Community — Amulet / Kraken", url: "https://steamcommunity.com/app/3183280/discussions/0/603034244395111668/" },
        traits:   { label: "GamingonPhone — Traits Guide", url: "https://gamingonphone.com/guides/game-of-thrones-kingsroad-the-complete-traits-guide-and-how-to-use-them/" }
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
                { k: "พื้นที่ย่อย", v: "The Crow's Nest, Scorched Plain, Griffin's Roost, Storm's End (ปราสาทของ Stannis)" },
                { k: "คอนเทนต์", v: "Bounty Hunt, Faction Hideout, Drogon ระดับใหม่" }
            ],
            body: [
                { p: "Stormlands เป็นแคว้นใหม่ที่มีสภาพอากาศพายุ เป็นฐานที่มั่นของ Stannis Baratheon ตัวละครจากต้นฉบับ ผู้เล่นได้สำรวจปราสาทของเขา Storm's End ประกอบด้วยพื้นที่ย่อยหลายแห่ง เช่น The Crow's Nest, Scorched Plain และ Griffin's Roost" },
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
                { k: "เนื้อเรื่อง", v: "Stannis Baratheon (ฐานที่มั่น: ปราสาท Storm's End) และการยึด Griffin's Roost" }
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
        "map-run-routes": {
            cat: "map", icon: IC.map, name: "Map Run Routes", nameTh: "รูทเส้นทางวิ่งเช็ค Maps (เก็บ Object)",
            tags: ["Map", "Exploration", "Farming"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            img: "images/guides/map-route-winterfell.jpeg",
            summary: "แผนที่รูทวิ่งสำรวจเก็บม้วนคัมภีร์ แร่ และสมุด ครบ 4 โซนแดนเหนือ–รีช พร้อมจุดเริ่ม เส้นทาง และทิศทางการวิ่ง",
            meta: [
                { k: "ระยะตรวจจับ Object", v: "วิ่งเข้าใกล้ ~50–70 เมตร Object จะโผล่บนมินิแมป" },
                { k: "สัญลักษณ์", v: "🟡 จุดเริ่ม (sign post) · 🟥 เส้นทางสำรวจ · ⬆️ ทิศทางการวิ่ง" },
                { k: "ครอบคลุม", v: "4 โซน: สุดแดนเหนือ, วินเทอร์เฟล, ฮอร์นวูด, รีช" }
            ],
            body: [
                { p: "จากการลองวิ่งเช็ค Maps พบว่าแค่วิ่งเข้าใกล้ Object ประมาณ 50–70 เมตรในเกม ไม่ว่าจะเป็นม้วนคัมภีร์ แร่ หรือสมุด มันก็จะปรากฏขึ้นในมินิแมปแล้ว ไกด์นี้จึงวางเส้นทางวิ่งให้เก็บของครบโดยไม่งงว่าเริ่มตรงไหนหรือเหลือตรงไหน" },
                { h: "สัญลักษณ์ในไกด์ (อ่านก่อนใช้แผนที่)" },
                { list: [
                    "🟡 จุดสีเหลือง = จุดเริ่ม โดยใช้ sign post (จุดวาร์ป) เป็นจุดเริ่มต้นเพื่อลดการสับสน ถ้าวิ่งแล้วไม่เจอ ให้กลับมาจุดเริ่มแล้ววิ่งสำรวจอีกเส้นทางต่อได้เลย",
                    "🟥 เส้นสีแดง = รูทเส้นทางสำรวจ",
                    "⬆️ ลูกศรสีฟ้า = ทิศทางการวิ่ง"
                ]},
                { h: "เคล็ดลับก่อนออกวิ่ง" },
                { list: [
                    "กดปุ่มลูกตา (สแกน) บ่อย ๆ เผื่อมองไม่เห็น Object ที่อยู่รอบตัว",
                    "แนะนำอัปสกิลทักษะพิเศษ 'การคราฟต์ลูกธนู' ให้เต็ม (อยู่ในเมนูทักษะพิเศษ หมวดสนับสนุน แถวแรกซ้ายสุด) จะได้ไม่ต้องกลับเมืองไปซื้อลูกธนูบ่อย เพราะม้วนคัมภีร์มักอยู่ที่สูงมาก ต้องยิงเก็บ"
                ]},
                { h: "รูทวิ่งทั้ง 4 โซน (กดที่รูปเพื่อดูเต็ม)" },
                { img: "images/guides/map-route-beyond-wall.jpeg", caption: "โซนสุดแดนเหนือ (Beyond the Wall)" },
                { img: "images/guides/map-route-winterfell.jpeg", caption: "แดนเหนือ เขตวินเทอร์เฟล (Winterfell)" },
                { img: "images/guides/map-route-hornwood.jpeg", caption: "แดนเหนือ เขตฮอร์นวูด (Hornwood)" },
                { img: "images/guides/map-route-reach.jpeg", caption: "แคว้นรีช (The Reach)" },
                { p: "หมายเหตุ: ไกด์นี้จัดทำโดยเพจ JC Online Game เพื่อช่วยเพื่อน ๆ ที่อยากวิ่งสำรวจแต่ไม่รู้จะเริ่มตรงไหน หรือเก็บยังไม่ครบแล้วลืมว่าเหลือตรงไหนบ้าง หากมีข้อผิดพลาดประการใดต้องขออภัย และอ้างอิงตำแหน่งแผนที่จากเว็บแผนที่ชุมชน got-kingsroad.com" }
            ],
            sources: [{ label: "JC Online Game · แผนที่อ้างอิง got-kingsroad.com", url: "https://got-kingsroad.com/#share/2.99/-13474/-676439" }]
        },

        /* ================= ระบบอุปกรณ์ (Equipment System) ================= */
        "rarity-grade": {
            cat: "eq-system", icon: IC.gear, name: "Rarity & Grade", nameTh: "ระดับความหายาก (Grade)",
            tags: ["System", "Rarity"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "อุปกรณ์แบ่งเป็นระดับ (Grade) แสดงด้วยสี ยิ่งสูงยิ่งค่าสถานะดีและได้เอฟเฟกต์ Engraving เพิ่ม",
            meta: [
                { k: "ลำดับความหายาก", v: "Common → Uncommon → Rare → Epic → Legendary" },
                { k: "ผลของ Grade สูง", v: "ค่าสถานะสูงขึ้น + ได้เอฟเฟกต์ Engraving เพิ่ม" },
                { k: "Reforge ได้ตั้งแต่", v: "Grade Uncommon ขึ้นไป" }
            ],
            body: [
                { p: "อุปกรณ์ทุกชิ้นมี 'Grade' (ระดับความหายาก) ที่แสดงด้วยสีต่างกัน ยิ่ง Grade สูงยิ่งได้ค่าสถานะพื้นฐานดีขึ้น และปลดล็อกเอฟเฟกต์สลัก (Engraving) เพิ่มเติม" },
                { p: "Grade เป็นคนละแกนกับ 'Tier' — Grade คือความหายาก ส่วน Tier คือรุ่นของอุปกรณ์ (ดูรายการ Tier ของอุปกรณ์)" }
            ],
            sources: [SRC.ldEquip, SRC.nmEquip]
        },
        "gear-tier": {
            cat: "eq-system", icon: IC.gear, name: "Gear Tier", nameTh: "รุ่นของอุปกรณ์ (Tier)",
            tags: ["System", "Tier"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน (หลัง 21 พ.ค. 2026)", verified: "ก.ค. 2026",
            summary: "อุปกรณ์แบ่งเป็น Tier ยิ่งสูงยิ่งแรง บนเซิร์ฟเวอร์ปัจจุบันสูงสุดอยู่ที่ Legendary Tier 4",
            meta: [
                { k: "ประเภท", v: "ระบบอุปกรณ์" },
                { k: "Tier สูงสุด (เซิร์ฟปัจจุบัน)", v: "Legendary Tier 4" }
            ],
            body: [
                { p: "นอกจาก Grade แล้ว อุปกรณ์ยังแบ่งเป็น Tier ยิ่ง Tier สูงยิ่งแรง บนเซิร์ฟเวอร์ปัจจุบัน (เปิด 21 พ.ค. 2026) อุปกรณ์ระดับสูงสุดอยู่ที่ Legendary Tier 4 และ Tier ที่สูงขึ้นจะทยอยเพิ่มตามอัปเดต" },
                { p: "ควรอัปเกรด/Refine ให้ทันเลเวลเสมอ เพื่อไม่ให้ค่าพลังรวม (Momentum) ตกหลัง" }
            ],
            sources: [SRC.gmKnight, SRC.eqGuide]
        },
        "equipment-slots": {
            cat: "eq-system", icon: IC.gear, name: "Equipment Slots", nameTh: "ช่องสวมใส่อุปกรณ์",
            tags: ["System", "Slot"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ช่องสวมใส่หลัก: อาวุธ หมวก เกราะ ถุงมือ รองเท้า เครื่องประดับ (สร้อย/แหวน) และ Amulet",
            meta: [
                { k: "อาวุธ", v: "Weapon (อาวุธหลักตามอาชีพ)" },
                { k: "เกราะ", v: "Helmet (หมวก), Chest/Armor (เกราะ), Gloves (ถุงมือ), Boots (รองเท้า)" },
                { k: "เครื่องประดับ", v: "Necklace (สร้อยคอ), Ring (แหวน)" },
                { k: "อื่น ๆ", v: "Amulet (เครื่องราง)" }
            ],
            body: [
                { p: "เกมมีช่องสวมใส่หลายช่อง ได้แก่ อาวุธ (Weapon), หมวก (Helmet), เกราะ (Chest), ถุงมือ (Gloves), รองเท้า (Boots), เครื่องประดับ (Necklace / Ring ในช่อง Accessory) และ Amulet" },
                { p: "ค่าสถานะที่ปรากฏต่างกันตามช่อง เช่น อาวุธเน้นค่าโจมตี เกราะเน้นค่าป้องกัน/HP ส่วนเครื่องประดับและ Amulet ให้ค่าเสริมและเอฟเฟกต์พิเศษ ดูระบบ Enhancement ที่เป็นแบบ 'ต่อช่อง'" }
            ],
            sources: [SRC.ldEquip, SRC.eqGuide]
        },
        "weapon-types": {
            cat: "eq-system", icon: IC.cls, name: "Class Weapons", nameTh: "อาวุธประจำอาชีพ",
            tags: ["Weapon", "Class"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "อาวุธหลักของแต่ละอาชีพ: Knight (ดาบใหญ่/ดาบคู่), Assassin (มีดคู่), Sellsword (อาวุธหนัก)",
            meta: [
                { k: "Knight", v: "Greatsword (ดาบสองมือ) และ Dual Blades (ดาบคู่)" },
                { k: "Assassin", v: "Dagger (มีดคู่)" },
                { k: "Sellsword", v: "อาวุธหนัก เช่น Axe / Gauntlet" }
            ],
            body: [
                { p: "อาวุธหลักของแต่ละอาชีพต่างกันตามสไตล์: Knight ใช้ดาบสองมือ (Greatsword) และดาบคู่ (Dual Blades) โดยคอมโบชุดแรกของ Dual Blades ใช้ง่ายและคล่องตัว, Assassin ใช้มีดคู่ (Dagger) เน้น Burst และสถานะพิษ/Bloodrage, ส่วน Sellsword ใช้อาวุธหนักที่สะสมสถานะ Shock สู่ Destruction" },
                { p: "ดูแนวทางคอมโบและบิลด์ละเอียดได้ที่หน้าอาชีพและหน้าคู่มือ" }
            ],
            sources: [SRC.gmKnight]
        },
        "crafting": {
            cat: "eq-system", icon: IC.hammer, name: "Crafting", nameTh: "การคราฟอุปกรณ์",
            tags: ["Upgrade", "Craft"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "คราฟอุปกรณ์ใหม่ที่ Forge โดยใช้วัสดุตามที่กำหนด",
            meta: [
                { k: "สถานที่", v: "Forge (โรงตีเหล็ก)" },
                { k: "ต้องใช้", v: "วัสดุคราฟตามสูตรของอุปกรณ์" }
            ],
            body: [
                { p: "ระบบ Crafting ให้ผู้เล่นใช้วัสดุที่กำหนดคราฟอุปกรณ์ชิ้นใหม่ที่ Forge เป็นวิธีหลักในการได้อุปกรณ์ Tier สูงขึ้น" },
                { p: "เคล็ดลับ: Refine อุปกรณ์เดิมให้เต็มก่อนคราฟชิ้นใหม่ เพราะค่าจากการ Refine ส่งต่อได้ (ดูระบบ Refinement)" }
            ],
            sources: [SRC.eqGuide, SRC.nmEquip]
        },
        "forging": {
            cat: "eq-system", icon: IC.hammer, name: "Forging", nameTh: "การตีอัปค่าพื้นฐาน",
            tags: ["Upgrade", "Forge"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เพิ่มค่าสถานะพื้นฐานของอุปกรณ์ สำเร็จค่าจะเพิ่ม ล้มเหลวค่าคงเดิม (ไม่ลดลง)",
            meta: [
                { k: "เพิ่ม", v: "ค่าสถานะพื้นฐาน (Base Stats)" },
                { k: "สำเร็จ", v: "ค่าสถานะเพิ่มขึ้น" },
                { k: "ล้มเหลว", v: "ค่าสถานะคงเดิม (ไม่ลดระดับ)" }
            ],
            body: [
                { p: "Forging ใช้เพิ่มค่าสถานะพื้นฐานที่ได้จากอุปกรณ์ เมื่อตีสำเร็จค่าจะเพิ่มขึ้น เมื่อล้มเหลวค่าปัจจุบันจะคงเดิมโดยไม่ลดลง จึงเป็นการอัปเกรดที่ไม่มีความเสี่ยงเสียค่าสถานะ" }
            ],
            sources: [SRC.eqGuide]
        },
        "reforging": {
            cat: "eq-system", icon: IC.hammer, name: "Reforging", nameTh: "การเพิ่มเอฟเฟกต์เสริม",
            tags: ["Upgrade", "Reforge"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เพิ่มเอฟเฟกต์เสริมให้อุปกรณ์ ใช้ได้ตั้งแต่ Grade Uncommon ขึ้นไป",
            meta: [
                { k: "เพิ่ม", v: "เอฟเฟกต์เสริม (Additional Effects)" },
                { k: "เงื่อนไข", v: "อุปกรณ์ Grade Uncommon ขึ้นไป" }
            ],
            body: [
                { p: "Reforging ใช้เพิ่มเอฟเฟกต์เสริมให้กับอุปกรณ์ที่เลือก สามารถ Reforge ได้ตั้งแต่อุปกรณ์ Grade Uncommon ขึ้นไป ต่างจาก Forging ที่เพิ่มค่าพื้นฐาน" }
            ],
            sources: [SRC.eqGuide]
        },
        "enhancement": {
            cat: "eq-system", icon: IC.hammer, name: "Enhancement", nameTh: "การเสริมช่อง (Slot Enhancement)",
            tags: ["Upgrade", "Slot"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เสริมค่าที่ 'ช่อง' อุปกรณ์ ค่าคงอยู่แม้เปลี่ยนชิ้นอุปกรณ์ในช่องนั้น",
            meta: [
                { k: "ผูกกับ", v: "ช่องอุปกรณ์ (Slot) ไม่ใช่ตัวไอเทม" },
                { k: "คงอยู่", v: "แม้สลับไอเทมในช่องนั้น ค่ายังอยู่" }
            ],
            body: [
                { p: "Enhancement (บางที่เรียก Slot Enhancement) เป็นการเสริมค่าสถานะให้กับ 'ช่อง' อุปกรณ์เพื่อให้ได้ค่าสูงขึ้น จุดเด่นคือค่าที่ได้จากการเสริมช่องจะคงอยู่แม้เปลี่ยนไอเทมในช่องนั้นเป็นชิ้นใหม่" },
                { p: "แนะนำให้กระจายการเสริมช่องอย่างสม่ำเสมอทุกช่องเพื่อความคุ้มค่า" }
            ],
            sources: [SRC.eqGuide, SRC.nmEnh]
        },
        "refinement": {
            cat: "eq-system", icon: IC.hammer, name: "Refinement", nameTh: "การตีบวก (Refine)",
            tags: ["Upgrade", "Refine"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ตีบวกอุปกรณ์เพื่อเพิ่มค่า ค่าที่ได้ส่งต่อได้บางส่วน และจำเป็นก่อนแยกเครื่องประดับเป็น Forging Steel",
            meta: [
                { k: "ผล", v: "เพิ่มค่าสถานะ (ส่งต่อได้บางส่วนเมื่อเปลี่ยนชิ้น)" },
                { k: "เกี่ยวข้อง", v: "ต้อง Refine เครื่องประดับ Legendary ก่อนแยกจึงได้ Forging Steel" }
            ],
            body: [
                { p: "Refinement (ตีบวก) เพิ่มค่าสถานะให้อุปกรณ์ และค่าที่ได้ส่งต่อได้อย่างมีนัยสำคัญ จึงควร Refine ของเดิมให้เต็มก่อนคราฟชิ้นใหม่" },
                { p: "นอกจากนี้ต้อง Refine เครื่องประดับ Legendary อย่างน้อย 1 ครั้งก่อนแยกชิ้นส่วน (dismantle) จึงจะได้วัสดุ Forging Steel" }
            ],
            sources: [SRC.eqGuide, { label: "Gamemeca — Refine Before Dismantle", url: "https://www.gamemeca.com/en/view.php?gid=1776814" }]
        },

        /* ================= เซ็ตอุปกรณ์ (Equipment Sets) ================= */
        "set-system": {
            cat: "eq-set", icon: IC.item, name: "Set System", nameTh: "ระบบเซ็ตอุปกรณ์",
            tags: ["System", "Set"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "จัด Main Set + Sub Set โบนัสสองเซ็ตซ้อนกันได้ มีโบนัส 3 ชิ้น และ 6 ชิ้น ปลดผ่าน Set Research",
            meta: [
                { k: "โครงสร้าง", v: "Main Set + Sub Set (โบนัสซ้อนกันได้)" },
                { k: "ระดับโบนัส", v: "3 ชิ้น และ 6 ชิ้น" },
                { k: "เงื่อนไข", v: "3-Set ~ Research Level 10, 6-Set ~ Research Level 20" }
            ],
            body: [
                { p: "ระบบเซ็ตให้จัด 'Main Set' และ 'Sub Set' พร้อมกัน โดยโบนัสของทั้งสองเซ็ตซ้อนกันได้ Main Set ควรตรงกับบทบาทของอาชีพและเป็นเซ็ตที่เล็งโบนัส 6 ชิ้น" },
                { p: "โบนัสเซ็ตปลดล็อกผ่านระบบ Set Research (จากข้อมูลชุมชน: โบนัส 3 ชิ้นต้อง Research Level 10, โบนัส 6 ชิ้นต้อง Research Level 20)" },
                { p: "หมายเหตุสำคัญ: ในเกมแสดงคำอธิบายโบนัสเซ็ตแบบคร่าว ๆ ในหน้า Set Research ไม่โชว์ตัวเลขเป๊ะทุกจุด ค่าตัวเลขในหน้ารายการเซ็ตด้านล่างส่วนหนึ่งมาจากชุมชนและอาจต่างกันตามแหล่ง โปรดยืนยันในเกม" }
            ],
            sources: [SRC.eqGuide, SRC.setBonus, SRC.nmSet]
        },
        "set-champion": {
            cat: "eq-set", icon: IC.item, name: "Champion Set", nameTh: "เซ็ตสาย Active Skill / คริติคอล",
            tags: ["Armor Set", "Active Skill", "Critical"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ตยอดนิยมสายโจมตี เน้น Active Skill และคริติคอล เหมาะกับหลายอาชีพ",
            meta: [
                { k: "โบนัส 3 ชิ้น (ชุมชน)", v: "ใช้ Active Skill เพิ่ม Attack Power ชั่วคราว, +15.0% Rage Gain" },
                { k: "โบนัส 6 ชิ้น (ชุมชน)", v: "Active Skill Damage +12.0%, มีโอกาสได้ Rage และลดคูลดาวน์สกิลทั้งหมดเมื่อสังหารศัตรู" },
                { k: "เหมาะกับ", v: "สาย DPS (Sellsword, Assassin ปลายเกม), Knight สายโจมตี" }
            ],
            body: [
                { p: "Champion Set เป็นเซ็ตยอดนิยมสำหรับสายโจมตี เน้นการเล่นรอบ Active Skill และคริติคอล" },
                { p: "ค่าโบนัสด้านบนอ้างอิงจากคู่มือชุมชน (เกมโชว์คำอธิบายแบบคร่าวในหน้า Set Research) และบางแหล่งจับคู่ชื่อ-เอฟเฟกต์ต่างกัน โปรดตรวจสอบในเกมก่อนตัดสินใจจัดบิลด์" }
            ],
            sources: [SRC.setBonus, SRC.gmKnight]
        },
        "set-sentinel": {
            cat: "eq-set", icon: IC.item, name: "Sentinel Set", nameTh: "เซ็ตสาย Parry",
            tags: ["Armor Set", "Parry", "Knight"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ตสายตั้งรับ/Parry เหมาะกับ Knight โดยเฉพาะดันเจียนศัตรูมนุษย์",
            meta: [
                { k: "โบนัส 3 ชิ้น (ชุมชน)", v: "เพิ่มระยะเวลา Parry, +15 Rage Gain เมื่อ Parry สำเร็จ" },
                { k: "เหมาะกับ", v: "Knight (เช่นใน Worm Walks)" }
            ],
            body: [
                { p: "Sentinel Set ช่วยด้านการ Parry เมื่อใช้ร่วมกับ Riposte Stance ของ Knight จะรับมือการโจมตีสีเหลืองของศัตรูมนุษย์ได้ดี เหมาะกับดันเจียนอย่าง Worm Walks" },
                { p: "หมายเหตุ: บางแหล่งระบุโบนัส Parry นี้กับเซ็ต Duelist ด้วย เนื่องจากทั้งสองเป็นเซ็ตสายตั้งรับ โปรดยืนยันชื่อ-เอฟเฟกต์ในเกม" }
            ],
            sources: [SRC.setBonus, SRC.gmKnight]
        },
        "set-brute": {
            cat: "eq-set", icon: IC.item, name: "Brute Set", nameTh: "เซ็ตเพิ่มดาเมจ + ลดดาเมจ",
            tags: ["Armor Set", "PvE"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ต PvE สมดุล เพิ่มดาเมจและลดความเสียหายที่ได้รับ",
            meta: [
                { k: "โบนัส 3 ชิ้น (ชุมชน)", v: "+10% ดาเมจ และ +10% ลดความเสียหายที่ได้รับ" },
                { k: "เหมาะกับ", v: "Sellsword และสาย PvE ที่ต้องการความอึด" }
            ],
            body: [
                { p: "Brute Set เป็นเซ็ตสาย PvE ที่ให้ทั้งดาเมจและความทนทาน เหมาะกับผู้เล่นที่ต้องยืนสู้นาน" },
                { p: "ค่าตัวเลขอ้างอิงจากคู่มือชุมชน โปรดยืนยันในหน้า Set Research ในเกม" }
            ],
            sources: [SRC.setBonus]
        },
        "set-crusher": {
            cat: "eq-set", icon: IC.item, name: "Crusher Set", nameTh: "เซ็ตสาย Stagger",
            tags: ["Armor Set", "Stagger"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ตเน้น Stagger เพิ่มดาเมจต่อศัตรูที่มึน และมีโอกาสดูดเลือด",
            meta: [
                { k: "โบนัส (ชุมชน)", v: "+13.5% Stagger Damage, เพิ่มดาเมจต่อศัตรูที่ Stagger (6 ชิ้น), มีโอกาส Life Steal" }
            ],
            body: [
                { p: "Crusher Set เน้นการทำ Stagger (ทำให้ศัตรูมึน) เพิ่มดาเมจต่อศัตรูที่อยู่ในสถานะ Stagger และมีโอกาสดูดเลือด ค่าตัวเลขอ้างอิงจากคู่มือชุมชน โปรดยืนยันในเกม" }
            ],
            sources: [SRC.setBonus]
        },
        "set-mauler": {
            cat: "eq-set", icon: IC.item, name: "Mauler Set", nameTh: "เซ็ตสาย Rage / ตีเร็ว",
            tags: ["Armor Set", "Rage"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "หลังใช้สกิลจะเข้าสถานะ Rage เพิ่มความเร็วโจมตีและดาเมจการโจมตีเบา/คอมโบ แต่ใช้ Active ไม่ได้ตอนอยู่ใน Rage",
            meta: [
                { k: "โบนัส (ชุมชน)", v: "หลังใช้สกิลเข้าสถานะ Rage: เพิ่มความเร็วโจมตีมาก + ดาเมจ Light Attack/Strike Combo" },
                { k: "ข้อแลก", v: "ใช้ Active Skill ไม่ได้ระหว่างอยู่ในสถานะ Rage" }
            ],
            body: [
                { p: "Mauler Set ทำให้หลังใช้ความสามารถแล้วเข้าสถานะ Rage ที่เพิ่มความเร็วโจมตีอย่างมากและเพิ่มดาเมจการโจมตีเบาและ Strike Combo แต่แลกกับการใช้ Active Skill ไม่ได้ระหว่างอยู่ในสถานะนี้ เหมาะกับสายคอมโบ/Auto-attack" }
            ],
            sources: [SRC.setBonus]
        },
        "set-savant": {
            cat: "eq-set", icon: IC.item, name: "Savant Set", nameTh: "เซ็ตสาย Active Skill / Rage",
            tags: ["Armor Set", "Active Skill"], confidence: "อยู่ระหว่างตรวจสอบ", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ตธีม Active Skill / Rage (รายละเอียดโบนัสยังมีข้อมูลขัดแย้งกันระหว่างแหล่ง)",
            meta: [
                { k: "ธีม", v: "Active Skill / Rage" },
                { k: "สถานะข้อมูล", v: "โบนัสยังไม่ยืนยัน (บางแหล่งสลับกับ Champion)" }
            ],
            body: [
                { p: "Savant Set เป็นหนึ่งในเซ็ตที่ปรากฏในเกม ธีมเน้น Active Skill / Rage แต่คำอธิบายโบนัสจากแหล่งชุมชนยังขัดแย้งกัน (บางแหล่งระบุเอฟเฟกต์เดียวกับ Champion) จึงยังไม่นำตัวเลขมาแสดงเป็นข้อเท็จจริง — ข้อมูลส่วนนี้อยู่ระหว่างการตรวจสอบ" }
            ],
            sources: [SRC.setBonus]
        },
        "set-duelist": {
            cat: "eq-set", icon: IC.item, name: "Duelist Set", nameTh: "เซ็ตสาย Parry / ดวล",
            tags: ["Armor Set", "Parry"], confidence: "อยู่ระหว่างตรวจสอบ", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เซ็ตสายตั้งรับ/Parry (คำอธิบายโบนัสทับซ้อนกับ Sentinel ในบางแหล่ง)",
            meta: [
                { k: "ธีม", v: "Parry / ตั้งรับ" },
                { k: "สถานะข้อมูล", v: "โบนัสยังไม่ยืนยัน (ทับซ้อนกับ Sentinel)" }
            ],
            body: [
                { p: "Duelist Set เป็นเซ็ตสายตั้งรับ/Parry แต่คำอธิบายโบนัสจากแหล่งชุมชนทับซ้อนกับเซ็ต Sentinel จึงยังไม่ยืนยันตัวเลข — ข้อมูลส่วนนี้อยู่ระหว่างการตรวจสอบ" }
            ],
            sources: [SRC.setBonus]
        },
        "set-marksman": {
            cat: "eq-set", icon: IC.item, name: "Marksman Set", nameTh: "เซ็ต (ยังไม่ยืนยันเอฟเฟกต์)",
            tags: ["Armor Set"], confidence: "อยู่ระหว่างตรวจสอบ", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ชื่อเซ็ตที่พบในเกม แต่ยังไม่มีข้อมูลโบนัสที่ยืนยันได้",
            meta: [
                { k: "สถานะข้อมูล", v: "พบชื่อเซ็ต แต่ยังไม่ยืนยันโบนัส" }
            ],
            body: [
                { p: "Marksman เป็นหนึ่งในชื่อเซ็ตที่พบในรายการเซ็ตของเกม แต่ยังไม่มีข้อมูลโบนัสที่ตรวจสอบได้ชัดเจน — ข้อมูลส่วนนี้อยู่ระหว่างการตรวจสอบ จะเพิ่มเมื่อมีแหล่งยืนยัน" }
            ],
            sources: [SRC.setBonus]
        },

        /* ================= เครื่องประดับ (Jewelry / Accessories) ================= */
        "jewelry-system": {
            cat: "eq-accessory", icon: IC.ring, name: "Jewelry System", nameTh: "ระบบเครื่องประดับ",
            tags: ["System", "Jewelry"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เครื่องประดับ (สร้อย/แหวน) คราฟที่ Jeweler's Workshop หรือได้จาก Echoes of the Past และ Drogon",
            meta: [
                { k: "ประเภท", v: "Necklace (สร้อยคอ), Ring (แหวน)" },
                { k: "สถานที่คราฟ", v: "Jeweler's Workshop" },
                { k: "วิธีได้", v: "Echoes of the Past, ปราบ Drogon, หรือคราฟ (ใช้ RP / Token / วัสดุ / Golden Dragons)" },
                { k: "ตีบวก", v: "เสริม/ตีบวกได้สูงสุดถึง +14 (ตามรายงานชุมชน)" }
            ],
            body: [
                { p: "เครื่องประดับในเกมมีสร้อยคอและแหวน ใช้ในช่อง Accessory คราฟได้ที่ Jeweler's Workshop หรือได้จากคอนเทนต์ Echoes of the Past และการปราบ World Boss Drogon" },
                { p: "การคราฟใช้ RP, Token, วัสดุ หรือ Golden Dragons และสามารถตีบวกเครื่องประดับได้ (มีรายงานถึง +14) ตัวเลขระดับสูงสุดโปรดยืนยันในเกม" }
            ],
            sources: [SRC.amuletSteam, { label: "Steam — Jewelry +14", url: "https://steamcommunity.com/app/3183280/discussions/0/603037628133054065/" }]
        },
        "ring": {
            cat: "eq-accessory", icon: IC.ring, name: "Ring", nameTh: "แหวน",
            tags: ["Accessory", "Ring"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เครื่องประดับประเภทแหวน สวมในช่อง Accessory ให้ค่าเสริม",
            meta: [
                { k: "ช่อง", v: "Accessory" },
                { k: "ได้จาก", v: "คราฟที่ Jeweler / Echoes of the Past / Drogon" }
            ],
            body: [
                { p: "แหวน (Ring) เป็นเครื่องประดับที่ให้ค่าสถานะเสริม คราฟหรือได้จากคอนเทนต์เดียวกับเครื่องประดับอื่น รายการชื่อแหวนแต่ละชิ้นและค่าสถานะเฉพาะยังรวบรวมไม่ครบในเวอร์ชันนี้" }
            ],
            sources: [SRC.amuletSteam]
        },
        "necklace": {
            cat: "eq-accessory", icon: IC.ring, name: "Necklace", nameTh: "สร้อยคอ",
            tags: ["Accessory", "Necklace"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "เครื่องประดับประเภทสร้อยคอ เช่น Epic Turquoise Necklace",
            meta: [
                { k: "ช่อง", v: "Accessory" },
                { k: "ตัวอย่าง", v: "Epic Turquoise Necklace" }
            ],
            body: [
                { p: "สร้อยคอ (Necklace) เป็นเครื่องประดับที่ให้ค่าสถานะเสริม มีหลายระดับความหายาก เช่นตัวอย่าง Epic Turquoise Necklace รายการชื่อและค่าสถานะเฉพาะแต่ละชิ้นยังรวบรวมไม่ครบในเวอร์ชันนี้" }
            ],
            sources: [SRC.amuletSteam]
        },

        /* ================= Amulet ================= */
        "amulet-system": {
            cat: "eq-amulet", icon: IC.amulet, name: "Amulet System", nameTh: "ระบบเครื่องราง Amulet",
            tags: ["System", "Amulet"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ระบบเสริมพลังจาก The Drowned God Wakes คราฟ/ขัดเงาที่ Amulet Workshop มี 9 แบบ (Rare/Epic/Legendary อย่างละ 3)",
            meta: [
                { k: "จำนวน", v: "9 แบบ (Rare 3 / Epic 3 / Legendary 3)" },
                { k: "เอฟเฟกต์", v: "เอฟเฟกต์ตายตัว (Fixed) + เอฟเฟกต์สุ่ม (Random) ตามความหายาก" },
                { k: "สถานที่", v: "Amulet Workshop (Renan's Rest) หรือผ่าน Raven Messenger" },
                { k: "ปรับแต่ง", v: "คราฟ และ 'Polish' (ขัดเงา) เพื่อปรับเอฟเฟกต์สุ่ม" }
            ],
            body: [
                { p: "Amulet เป็นระบบเสริมความแข็งแกร่งและปรับแต่งบิลด์ที่มาพร้อมอัปเดต The Drowned God Wakes ปัจจุบันมี 9 แบบ แบ่งเป็น Rare 3, Epic 3 และ Legendary 3" },
                { list: [
                    "แต่ละแบบมีเอฟเฟกต์ตายตัว (Fixed) หนึ่งอย่าง",
                    "และเอฟเฟกต์สุ่ม (Random) เพิ่มตามความหายาก ยิ่งหายากยิ่งได้เอฟเฟกต์สุ่มมาก",
                    "คราฟและ 'Polish' (ขัดเงา เพื่อปรับเอฟเฟกต์สุ่ม) ได้ที่ Amulet Workshop ใน Renan's Rest หรือผ่าน Raven Messenger"
                ]}
            ],
            sources: [SRC.dgw, SRC.notes626, SRC.amuletSteam]
        },
        "amulet-tiers": {
            cat: "eq-amulet", icon: IC.amulet, name: "Amulet Rarities", nameTh: "ความหายากของ Amulet",
            tags: ["Amulet", "Rarity"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "Amulet มี 3 ระดับความหายาก อย่างละ 3 แบบ ยิ่งหายากยิ่งได้เอฟเฟกต์สุ่มมากขึ้น",
            meta: [
                { k: "Rare", v: "3 แบบ" },
                { k: "Epic", v: "3 แบบ" },
                { k: "Legendary", v: "3 แบบ (ดูรายการ Legendary Amulet)" }
            ],
            body: [
                { p: "Amulet ทั้ง 9 แบบแบ่งเป็น 3 ระดับความหายาก อย่างละ 3 แบบ: Rare, Epic และ Legendary ทุกแบบมีเอฟเฟกต์ตายตัว และจำนวนเอฟเฟกต์สุ่มจะเพิ่มตามความหายาก" },
                { p: "หมายเหตุ: รายชื่อ Amulet แต่ละแบบและค่าเอฟเฟกต์เป๊ะ ๆ ยังรวบรวมไม่ครบในเวอร์ชันนี้ จะเพิ่มเมื่อมีแหล่งข้อมูลที่ตรวจสอบได้" }
            ],
            sources: [SRC.dgw, SRC.amuletSteam]
        },
        "legendary-amulet": {
            cat: "eq-amulet", icon: IC.amulet, name: "Legendary Amulet", nameTh: "Amulet ระดับตำนาน",
            tags: ["Amulet", "Legendary", "Kraken"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ได้ Design จากอันดับ Top 3 ของ Kraken Raid คราฟด้วยวัสดุ 4 อย่าง หนึ่งในนั้นคือ Kraken parts",
            meta: [
                { k: "Legendary Amulet Design", v: "ได้จากการติดอันดับ Top 3 ของ Kraken Raid (Ranking Reward)" },
                { k: "การคราฟ", v: "ใช้วัสดุ 4 อย่าง หนึ่งในนั้นคือ Kraken parts + นำ Design ไปที่ผู้คราฟ Amulet" },
                { k: "ที่ตั้งผู้คราฟ", v: "Amulet Workshop (Renan's Rest)" }
            ],
            body: [
                { p: "Legendary Amulet เป็น Amulet ระดับสูงสุด การจะได้ 'Legendary Amulet Design' ต้องติดอันดับ Top 3 ของ Kraken Raid (เป็น Ranking Reward)" },
                { p: "การคราฟ Legendary Amulet ใช้วัสดุ 4 อย่าง โดยหนึ่งในนั้นคือ Kraken parts เมื่อมี Design และวัสดุครบจึงนำไปคราฟที่ Amulet Workshop" },
                { p: "หมายเหตุ: ข้อมูลนี้ส่วนหนึ่งมาจากชุมชน (Steam) การเข้าร่วม Kraken Raid ทั้งทีมต้องมีดาเมจ/เลเวลเพียงพอ (ผู้เล่นเลเวล 30-38 ยังไม่แนะนำ) โปรดยืนยันเงื่อนไขล่าสุดในเกม" }
            ],
            sources: [SRC.amuletSteam, SRC.dgw]
        },

        /* ================= ค่าสถานะ (Stats) ================= */
        "stat-offense": {
            cat: "eq-stat", icon: IC.chart, name: "Offensive Stats", nameTh: "ค่าสถานะฝ่ายรุก",
            tags: ["Stat", "Offense"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ค่าโจมตีหลักที่พบบนอุปกรณ์: Attack Power, Critical Rate/Damage, Combo/Active Skill Damage ฯลฯ",
            meta: [
                { k: "Attack Power", v: "พลังโจมตีพื้นฐาน" },
                { k: "Critical Rate / Critical Damage", v: "อัตราคริติคอล / ความเสียหายคริติคอล" },
                { k: "Attack Speed", v: "ความเร็วโจมตี" },
                { k: "Combo Damage / Active Skill Damage", v: "ดาเมจคอมโบ / ดาเมจสกิล Active" },
                { k: "Penetrating Power / Stagger Damage", v: "พลังเจาะเกราะ / ดาเมจทำ Stagger" }
            ],
            body: [
                { p: "ค่าสถานะฝ่ายรุกที่พบบนอุปกรณ์และ Trait ได้แก่ Attack Power, Critical Rate, Critical Damage, Attack Speed, Combo Damage, Active Skill Damage, Penetrating Power และ Stagger Damage อุปกรณ์ Legendary Tier สูงมักเน้น Critical Damage, Attack Power และ Active Skill Damage" }
            ],
            sources: [SRC.eqGuide, SRC.traits]
        },
        "stat-defense": {
            cat: "eq-stat", icon: IC.chart, name: "Defensive Stats", nameTh: "ค่าสถานะฝ่ายรับ",
            tags: ["Stat", "Defense"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ค่าป้องกันหลัก: Defense, HP, Damage Reduction และ Life Steal",
            meta: [
                { k: "Defense", v: "ค่าป้องกัน" },
                { k: "HP", v: "พลังชีวิต" },
                { k: "Damage Reduction", v: "ลดความเสียหายที่ได้รับ" },
                { k: "Life Steal", v: "ดูดเลือดจากการโจมตี (จากบางเซ็ต/Artifact)" }
            ],
            body: [
                { p: "ค่าสถานะฝ่ายรับได้แก่ Defense, HP, Damage Reduction และ Life Steal สาย DPS ที่พึ่ง Hit-Stun Immunity มักลงค่าป้องกันน้อย ส่วนสายอึด/แทงก์จะเน้นค่าเหล่านี้มากขึ้น" }
            ],
            sources: [SRC.eqGuide, SRC.setBonus]
        },
        "stat-mechanic": {
            cat: "eq-stat", icon: IC.chart, name: "Special Stats & Engraving", nameTh: "ค่าพิเศษและ Engraving",
            tags: ["Stat", "Engraving", "Skill+"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ค่าพิเศษ เช่น Rage Gain, โบนัสดาเมจสกิลหลัง Guard/Parry, Engraving และเอฟเฟกต์ Skill+",
            meta: [
                { k: "Rage Gain", v: "อัตราการสะสม Rage" },
                { k: "Guard / Parry", v: "Guard สำเร็จ: สกิล Active ถัดไป +20% ดาเมจ, Parry สำเร็จ: +40%" },
                { k: "Engraving", v: "เอฟเฟกต์สลักที่ได้จาก Grade สูง เช่น 'Exploit Weakness' (+ดาเมจต่อเป้าที่ติด debuff)" },
                { k: "Skill+", v: "เอฟเฟกต์อัปเกรดสกิล เช่น Boost Morale+, Merciless Strike+, Weaken+" }
            ],
            body: [
                { p: "นอกจากค่ารุก/รับพื้นฐาน อุปกรณ์และระบบยังมีค่าพิเศษ เช่น Rage Gain, โบนัสดาเมจสกิล Active หลัง Guard (+20%) หรือ Parry (+40%), เอฟเฟกต์สลัก (Engraving) จากอุปกรณ์ Grade สูง และเอฟเฟกต์ 'Skill+' ที่ยกระดับสกิลเฉพาะ" },
                { p: "ระบบเหล่านี้เชื่อมโยง อุปกรณ์ → ค่าสถานะ → สกิล → อาชีพ ซึ่งเป็นพื้นฐานของการจัด Build" }
            ],
            sources: [SRC.eqGuide, SRC.gmKnight]
        },

        /* ================= วัสดุอุปกรณ์ (Equipment Materials) ================= */
        "amulet-design": {
            cat: "eq-material", icon: IC.gem, name: "Legendary Amulet Design", nameTh: "แบบพิมพ์ Amulet ตำนาน",
            tags: ["Material", "Amulet", "Kraken"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "แบบพิมพ์สำหรับคราฟ Legendary Amulet ได้จากอันดับ Top 3 ของ Kraken Raid",
            meta: [
                { k: "ใช้สำหรับ", v: "คราฟ Legendary Amulet" },
                { k: "แหล่งได้", v: "Ranking Reward — Top 3 ของ Kraken Raid" }
            ],
            body: [
                { p: "Legendary Amulet Design เป็นวัสดุแบบพิมพ์ที่จำเป็นในการคราฟ Legendary Amulet ตามข้อมูลชุมชน วิธีเดียวที่ได้คือการติดอันดับ Top 3 ในการจัดอันดับของ Kraken Raid โปรดยืนยันในเกม" }
            ],
            sources: [SRC.amuletSteam]
        },
        "kraken-parts": {
            cat: "eq-material", icon: IC.gem, name: "Kraken Parts", nameTh: "ชิ้นส่วน Kraken",
            tags: ["Material", "Amulet", "Kraken"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "วัสดุจาก Kraken Raid หนึ่งในส่วนประกอบของการคราฟ Legendary Amulet",
            meta: [
                { k: "ใช้สำหรับ", v: "คราฟ Legendary Amulet (1 ใน 4 วัสดุ)" },
                { k: "แหล่งได้", v: "Kraken Raid" }
            ],
            body: [
                { p: "Kraken parts เป็นวัสดุที่ได้จาก Kraken Raid ใช้เป็นหนึ่งในสี่วัสดุสำหรับคราฟ Legendary Amulet" },
                { p: "หมายเหตุ: บางแหล่ง (อัปเดตโน้ต) เรียกวัสดุจาก Kraken ว่า 'Amulet Core' อาจเป็นวัสดุที่เกี่ยวข้องกันหรือคนละชิ้น โปรดยืนยันชื่อในเกม" }
            ],
            sources: [SRC.amuletSteam, SRC.dgw]
        },
        "resource-points": {
            cat: "eq-material", icon: IC.gem, name: "RP (Resource Points)", nameTh: "แต้มทรัพยากร",
            tags: ["Material", "Craft"], confidence: "Community Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "ทรัพยากรที่ใช้ในการคราฟ/เข้าคอนเทนต์ เช่น การคราฟเครื่องประดับและการฟาร์มบางอย่าง",
            meta: [
                { k: "ใช้สำหรับ", v: "คราฟเครื่องประดับ และค่าใช้จ่ายในคอนเทนต์บางอย่าง" }
            ],
            body: [
                { p: "RP (Resource Points) เป็นทรัพยากรที่ใช้ในหลายระบบ เช่น การคราฟเครื่องประดับที่ Jeweler และการเข้าทำคอนเทนต์บางประเภท (เช่น Faction Hideout ที่มีเทคนิค 'Box Run' เพื่อประหยัด RP)" }
            ],
            sources: [SRC.amuletSteam, SRC.gmHide]
        },
        "crafting-materials": {
            cat: "eq-material", icon: IC.gem, name: "Crafting Materials", nameTh: "วัสดุคราฟทั่วไป",
            tags: ["Material", "Craft"], confidence: "Verified", version: "เซิร์ฟปัจจุบัน", verified: "ก.ค. 2026",
            summary: "วัสดุคราฟที่แบ่งตามระดับความหายาก (Rare/Epic/Legendary) ใช้คราฟและอัปเกรดอุปกรณ์",
            meta: [
                { k: "ระดับ", v: "แบ่งตามความหายาก เช่น Rare / Epic / Legendary" },
                { k: "ใช้สำหรับ", v: "คราฟและอัปเกรดอุปกรณ์ที่ Forge" },
                { k: "แหล่งได้", v: "World Boss (Drogon), ดันเจียน, การแยกชิ้นส่วน" }
            ],
            body: [
                { p: "วัสดุคราฟทั่วไปแบ่งตามระดับความหายากและใช้ในการคราฟ/อัปเกรดอุปกรณ์ที่ Forge ได้จาก World Boss, ดันเจียน และการแยกชิ้นส่วนอุปกรณ์ (ดู Forging Steel ในหมวดทรัพยากร)" }
            ],
            sources: [SRC.eqGuide, SRC.drogon]
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
        { name: "Knight", nameTh: "อัศวินสายแทงก์", href: "classes.html#knight", tags: ["Class", "Tank"], summary: "แนวหน้าเกราะหนัก อึดที่สุด เล่นง่าย ครอบคลุมคอนเทนต์ส่วนใหญ่", icon: IC.cls, img: "images/classes/knight.webp" },
        { name: "Assassin", nameTh: "นักลอบสังหาร", href: "classes.html#assassin", tags: ["Class", "DPS"], summary: "ดาเมจระเบิดสูงสุด เร็ว แต่ตัวบางต้องหลบแม่น", icon: IC.cls, img: "images/classes/assassin.webp" },
        { name: "Sellsword", nameTh: "ทหารรับจ้าง", href: "classes.html#sellsword", tags: ["Class", "DPS"], summary: "อาวุธหนัก คอมโบไม่ถูกขัดจังหวะ ดาเมจต่อเป้าเดี่ยวสูง", icon: IC.cls, img: "images/classes/sellsword.webp" }
    ];

    const CATEGORIES = [
        { id: "class",    icon: IC.cls,     title: "อาชีพ",           desc: "Knight / Assassin / Sellsword", status: "สมบูรณ์", classLinks: true },
        { id: "boss",     icon: IC.boss,    title: "บอส",             desc: "World Boss, Raid Boss และ Field Boss", status: "สมบูรณ์", ids: ["drogon", "kraken", "shadowcat"] },
        { id: "dungeon",  icon: IC.dungeon, title: "ดันเจียน & เรด",   desc: "Dungeon, Raid และระดับความยาก", status: "สมบูรณ์", ids: ["wormwalks", "beyond-the-wall", "elite-hideout", "faction-hideout-db", "kraken-raid", "world-difficulty"] },
        { id: "map",      icon: IC.map,     title: "แผนที่ / สถานที่",  desc: "ภูมิภาคและพื้นที่ในเกม", status: "สมบูรณ์", ids: ["map-run-routes", "winterfell", "last-hearth", "beyond-the-wall-map", "stormlands", "crows-nest", "sunset-sea"] },
        { id: "eq-system",   icon: IC.gear,   title: "อุปกรณ์: ระบบ",     desc: "Grade, Tier, ช่องสวมใส่, อาวุธ และระบบอัปเกรด", status: "สมบูรณ์", ids: ["rarity-grade", "gear-tier", "equipment-slots", "weapon-types", "crafting", "forging", "reforging", "enhancement", "refinement"] },
        { id: "eq-set",      icon: IC.item,   title: "อุปกรณ์: เซ็ต",     desc: "ระบบเซ็ต Main/Sub และโบนัสเซ็ต", status: "บางส่วน", ids: ["set-system", "set-champion", "set-sentinel", "set-brute", "set-crusher", "set-mauler", "set-savant", "set-duelist", "set-marksman"] },
        { id: "eq-accessory",icon: IC.ring,   title: "อุปกรณ์: เครื่องประดับ", desc: "Jewelry — แหวนและสร้อยคอ", status: "บางส่วน", ids: ["jewelry-system", "ring", "necklace"] },
        { id: "eq-amulet",   icon: IC.amulet, title: "อุปกรณ์: Amulet",   desc: "ระบบเครื่องราง ความหายาก และ Legendary Amulet", status: "สมบูรณ์", ids: ["amulet-system", "amulet-tiers", "legendary-amulet"] },
        { id: "eq-stat",     icon: IC.chart,  title: "อุปกรณ์: ค่าสถานะ",  desc: "ค่ารุก ค่ารับ และค่าพิเศษ/Engraving", status: "สมบูรณ์", ids: ["stat-offense", "stat-defense", "stat-mechanic"] },
        { id: "eq-material", icon: IC.gem,    title: "อุปกรณ์: วัสดุ",     desc: "วัสดุคราฟ อัปเกรด และ Amulet", status: "สมบูรณ์", ids: ["amulet-design", "kraken-parts", "resource-points", "crafting-materials"] },
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

    function cardTags(tags) { return " " + (tags || []).join(" ").toLowerCase() + " "; }

    /* กล่องไอคอน/รูปไอเทม: ถ้ามี obj.img จะโชว์รูปจริง ถ้าโหลดไม่ได้ (ไฟล์ยังไม่มี)
       จะซ่อนรูปแล้วตกกลับไปโชว์ไอคอน SVG เดิมอัตโนมัติ — ปลอดภัยแม้ไฟล์ยังไม่ถูกส่งมา */
    function iconBox(baseClass, obj) {
        const svg = obj.icon || "";
        if (obj.img) {
            return `<div class="${baseClass} db-icon-wrap">` +
                `<img src="${esc(obj.img)}" alt="${esc(obj.name || "")}" class="db-thumb" loading="lazy" onerror="this.style.display='none'">` +
                svg +
            `</div>`;
        }
        return `<div class="${baseClass}">${svg}</div>`;
    }

    /* ป้ายสถานะความน่าเชื่อถือของข้อมูล (ใช้ค่าจริงจาก field confidence) */
    const CONF_MAP = {
        "Official":           { cls: "conf-official",  short: "Official" },
        "Verified":           { cls: "conf-verified",  short: "Verified" },
        "Community Verified": { cls: "conf-community", short: "Community" },
        "อยู่ระหว่างตรวจสอบ":   { cls: "conf-wip",       short: "กำลังตรวจ" }
    };
    function confChip(conf, small) {
        if (!conf) return "";
        const m = CONF_MAP[conf] || { cls: "conf-wip", short: conf };
        return `<span class="db-conf ${m.cls}${small ? " db-conf-sm" : ""}">${esc(small ? m.short : conf)}</span>`;
    }
    function cardConf(conf) {
        if (!conf) return "";
        const m = CONF_MAP[conf] || { cls: "conf-wip", short: conf };
        return `<span class="db-conf db-conf-sm db-card-conf ${m.cls}">${esc(m.short)}</span>`;
    }

    function entryCard(id) {
        const e = DB[id];
        if (!e) return "";
        const search = (e.name + " " + e.nameTh + " " + (e.tags || []).join(" ")).toLowerCase();
        return `<a href="database-detail.html?id=${encodeURIComponent(id)}" class="quick-card guide-card db-card db-entry" data-search="${esc(search)}" data-tags="${esc(cardTags(e.tags))}" data-name="${esc(e.name)}">
            ${cardConf(e.confidence)}
            ${iconBox("quick-icon", e)}
            <h3>${esc(e.name)}</h3>
            <span class="db-nameth">${esc(e.nameTh)}</span>
            <p>${esc(e.summary)}</p>
            <div class="db-tags">${tagsHtml(e.tags)}</div>
            <span class="class-link">ดูรายละเอียด →</span>
        </a>`;
    }

    function classCard(c) {
        const search = (c.name + " " + c.nameTh + " " + c.tags.join(" ")).toLowerCase();
        const head = c.img
            ? `<div class="cls-banner"><img src="${esc(c.img)}" alt="${esc(c.name)}" class="cls-banner-img" loading="lazy" onerror="this.closest('.cls-banner').style.display='none'"></div>`
            : iconBox("quick-icon", c);
        return `<a href="${c.href}" class="quick-card guide-card db-card${c.img ? " cls-card" : ""}" data-search="${esc(search)}" data-tags="${esc(cardTags(c.tags))}">
            ${head}
            <h3>${esc(c.name)}</h3>
            <span class="db-nameth">${esc(c.nameTh)}</span>
            <p>${esc(c.summary)}</p>
            <div class="db-tags">${tagsHtml(c.tags)}</div>
            <span class="class-link">เปิดหน้าอาชีพ →</span>
        </a>`;
    }

    /* ---------- หน้ารวมฐานข้อมูล — "The Kingsroad Codex" ---------- */
    const hub = document.getElementById("database-hub");
    if (hub) {
        const IC_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
        const IC_GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
        const IC_LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>';

        /* สถิติจากข้อมูลจริง */
        const catCount = c => c.classLinks ? CLASS_LINKS.length : (c.ids || []).length;
        const totalEntries = CATEGORIES.reduce((n, c) => n + catCount(c), 0);
        const VERIFIED = { "Official": 1, "Verified": 1, "Community Verified": 1 };
        let verifiedCount = 0;
        CATEGORIES.forEach(c => (c.ids || []).forEach(id => { if (DB[id] && VERIFIED[DB[id].confidence]) verifiedCount++; }));

        const stats = [
            { n: totalEntries, l: "รายการข้อมูล" },
            { n: CATEGORIES.length, l: "หมวดหมู่" },
            { n: verifiedCount, l: "ยืนยันแล้ว" }
        ];
        const statsHtml = stats.map(s =>
            `<div class="codex-stat"><span class="codex-stat-n">${s.n}</span><span class="codex-stat-l">${esc(s.l)}</span></div>`
        ).join('<span class="codex-stat-div" aria-hidden="true"></span>');

        const header = `<header class="codex-head" id="top">
            <div class="codex-head-frost" aria-hidden="true"></div>
            <span class="codex-eyebrow">The Kingsroad Codex</span>
            <h1 class="codex-title">คลังข้อมูลแห่งเวสเทอรอส</h1>
            <p class="codex-sub">ศูนย์รวมข้อมูล Game of Thrones: Kingsroad ภาษาไทย — ค้นหาอุปกรณ์ เซ็ต Amulet บอส มอนสเตอร์ แผนที่ ดันเจียน เควส และทรัพยากร จากที่เดียว</p>
            <div class="codex-search">
                <span class="codex-search-ic" aria-hidden="true">${IC_SEARCH}</span>
                <input type="text" id="dbSearch" class="codex-search-input" placeholder="ค้นหา เช่น Drogon, Champion Set, Amulet, Winterfell..." autocomplete="off" aria-label="ค้นหาในฐานข้อมูล">
                <button type="button" class="codex-search-clear" id="dbClear" aria-label="ล้างการค้นหา" hidden>&times;</button>
            </div>
            <p class="codex-result" id="dbResult" hidden></p>
            <div class="codex-stats">${statsHtml}</div>
        </header>`;

        /* ดัชนีหมวดหมู่ (Category Index) */
        const indexHtml = `<div class="codex-index" role="navigation" aria-label="ดัชนีหมวดหมู่">${CATEGORIES.map(c =>
            `<a href="#cat-${c.id}" class="codex-tile ${c.status === "สมบูรณ์" ? "is-done" : "is-wip"}">
                <span class="codex-tile-ic">${c.icon}</span>
                <span class="codex-tile-body">
                    <span class="codex-tile-name">${esc(c.title)}</span>
                    <span class="codex-tile-desc">${esc(c.desc)}</span>
                </span>
                <span class="codex-tile-count">${catCount(c)}</span>
            </a>`
        ).join("")}</div>`;

        /* Toolbar: quick filter + sort + view */
        const FILTERS = [
            { l: "ทั้งหมด", q: "" }, { l: "อาวุธ", q: "weapon" }, { l: "เซ็ต", q: "set" },
            { l: "เครื่องประดับ", q: "accessory" }, { l: "Amulet", q: "amulet" }, { l: "ค่าสถานะ", q: "stat" },
            { l: "วัสดุ", q: "material" }, { l: "บอส", q: "boss" }
        ];
        const chips = FILTERS.map((f, i) =>
            `<button type="button" class="db-chip${i === 0 ? " active" : ""}" data-q="${esc(f.q)}">${esc(f.l)}</button>`
        ).join("");
        const toolbar = `<div class="codex-toolbar">
            <div class="db-filters" role="group" aria-label="กรองด่วน">${chips}</div>
            <div class="codex-tools">
                <label class="codex-sort"><span>เรียง</span>
                    <select id="dbSort" aria-label="เรียงลำดับ">
                        <option value="cat">ตามหมวด</option>
                        <option value="name">ชื่อ A–Z</option>
                    </select>
                </label>
                <div class="codex-view" role="group" aria-label="รูปแบบการแสดง">
                    <button type="button" class="codex-view-btn is-active" data-view="grid" aria-label="มุมมองการ์ด">${IC_GRID}</button>
                    <button type="button" class="codex-view-btn" data-view="list" aria-label="มุมมองรายการ">${IC_LIST}</button>
                </div>
            </div>
        </div>`;

        const sections = CATEGORIES.map(cat => {
            const cards = cat.classLinks
                ? CLASS_LINKS.map(classCard).join("")
                : (cat.ids || []).map(entryCard).join("");
            const statusCls = cat.status === "สมบูรณ์" ? "db-status-done" : "db-status-wip";
            return `<section class="guide-cat db-cat" id="cat-${cat.id}">
                <div class="guide-cat-head db-cat-head">
                    <span class="guide-cat-icon">${cat.icon}</span>
                    <div class="db-cat-head-txt">
                        <h2>${esc(cat.title)} <span class="db-count">${catCount(cat)}</span> <span class="db-status ${statusCls}">${esc(cat.status)}</span></h2>
                        <p>${esc(cat.desc)}</p>
                    </div>
                    <a href="#top" class="db-cat-top" aria-label="กลับขึ้นบนสุด">↑</a>
                </div>
                <div class="quick-grid db-grid">${cards}</div>
            </section>`;
        }).join("");

        const empty = `<div class="codex-empty" id="dbNoResult" hidden>
            <span class="codex-empty-ic" aria-hidden="true">${IC_SEARCH}</span>
            <h3>ไม่พบข้อมูลที่ตรงกับการค้นหา</h3>
            <p>ลองใช้คำอื่น หรือกลับไปดูข้อมูลทั้งหมดในคลัง</p>
            <button type="button" class="btn-primary codex-empty-btn" id="dbReset">ล้างการค้นหา</button>
        </div>`;

        hub.innerHTML = header + indexHtml + toolbar + `<div class="codex-sections" id="dbSections">${sections}</div>` + empty;

        /* ---------- ตรรกะ ค้นหา / กรอง / เรียง / มุมมอง ---------- */
        const input = document.getElementById("dbSearch");
        const clearBtn = document.getElementById("dbClear");
        const resultEl = document.getElementById("dbResult");
        const noResult = document.getElementById("dbNoResult");
        const sectionsWrap = document.getElementById("dbSections");

        function setAllChip() {
            document.querySelectorAll(".db-chip").forEach((c, i) => c.classList.toggle("active", i === 0));
        }

        function applyFilter(q, field) {
            q = (q || "").trim().toLowerCase();
            let total = 0;
            document.querySelectorAll(".db-cat").forEach(cat => {
                let shown = 0;
                cat.querySelectorAll(".db-card").forEach(card => {
                    let match = !q;
                    if (q) {
                        if (field === "tags") match = (card.dataset.tags || "").includes(" " + q + " ");
                        else match = (card.dataset.search || "").includes(q);
                    }
                    card.style.display = match ? "" : "none";
                    if (match) shown++;
                });
                cat.style.display = shown ? "" : "none";
                total += shown;
            });
            if (noResult) noResult.hidden = total !== 0;
            if (resultEl) {
                const active = q && field !== "tags-empty";
                resultEl.hidden = !active;
                if (active) resultEl.textContent = total ? ("พบ " + total + " รายการ") : "ไม่พบรายการที่ตรงกับคำค้น";
            }
            if (clearBtn) clearBtn.hidden = !q || field === "tags";
        }

        if (input) {
            input.addEventListener("input", function () {
                setAllChip();
                applyFilter(this.value, "search");
            });
        }
        if (clearBtn) clearBtn.addEventListener("click", function () {
            if (input) { input.value = ""; input.focus(); }
            setAllChip();
            applyFilter("", "search");
        });
        const resetBtn = document.getElementById("dbReset");
        if (resetBtn) resetBtn.addEventListener("click", function () {
            if (input) input.value = "";
            setAllChip();
            applyFilter("", "search");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        document.querySelectorAll(".db-chip").forEach(chip => {
            chip.addEventListener("click", function () {
                document.querySelectorAll(".db-chip").forEach(c => c.classList.remove("active"));
                this.classList.add("active");
                if (input) input.value = "";
                applyFilter(this.dataset.q, "tags");
            });
        });

        /* เรียงลำดับ (ภายในแต่ละหมวด) */
        document.querySelectorAll(".db-grid").forEach(grid =>
            Array.prototype.slice.call(grid.children).forEach((card, i) => { card.dataset.order = i; })
        );
        const sortSel = document.getElementById("dbSort");
        if (sortSel) sortSel.addEventListener("change", function () {
            const byName = this.value === "name";
            document.querySelectorAll(".db-grid").forEach(grid => {
                const cards = Array.prototype.slice.call(grid.children);
                cards.sort((a, b) => byName
                    ? (a.dataset.name || a.querySelector("h3").textContent).localeCompare(b.dataset.name || b.querySelector("h3").textContent, "en")
                    : (a.dataset.order - b.dataset.order));
                cards.forEach(c => grid.appendChild(c));
            });
        });

        /* มุมมอง Grid / List (จำค่าใน localStorage) */
        const VIEW_KEY = "gk-db-view";
        function setView(v) {
            if (sectionsWrap) sectionsWrap.classList.toggle("is-list", v === "list");
            document.querySelectorAll(".codex-view-btn").forEach(b => b.classList.toggle("is-active", b.dataset.view === v));
            try { localStorage.setItem(VIEW_KEY, v); } catch (e) {}
        }
        document.querySelectorAll(".codex-view-btn").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
        let savedView = "grid";
        try { savedView = localStorage.getItem(VIEW_KEY) || "grid"; } catch (e) {}
        setView(savedView);
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
                if (b.img) return `<figure class="ga-figure">
                    <a href="${esc(b.img)}" target="_blank" rel="noopener">
                        <img src="${esc(b.img)}" alt="${esc(b.caption || e.name)}" loading="lazy">
                    </a>
                    ${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ""}
                </figure>`;
                return "";
            }).join("");

            const srcHtml = (e.sources || []).map(s =>
                `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
            ).join(" · ");

            const confBadge = confChip(e.confidence, false);

            const statusRows = [];
            if (e.confidence) statusRows.push(["สถานะข้อมูล", confChip(e.confidence, false)]);
            if (e.version)    statusRows.push(["เวอร์ชันเกม", esc(e.version)]);
            if (e.verified)   statusRows.push(["ตรวจสอบล่าสุด", esc(e.verified)]);
            if (e.sources && e.sources.length) statusRows.push(["แหล่งอ้างอิง", e.sources.length + " แหล่ง"]);
            const statusHtml = statusRows.length
                ? `<aside class="db-datastatus"><h3 class="db-ds-title">สถานะข้อมูล</h3><div class="db-ds-rows">${statusRows.map(r =>
                    `<div class="db-ds-row"><span class="db-ds-k">${r[0]}</span><span class="db-ds-v">${r[1]}</span></div>`).join("")}</div></aside>`
                : "";

            const related = (cat.ids || []).filter(x => x !== id).slice(0, 3);
            const relatedHtml = related.length
                ? `<div class="ga-related"><h3 class="cls-block-title">ในหมวดเดียวกัน</h3><div class="quick-grid db-grid">${related.map(entryCard).join("")}</div></div>`
                : "";

            detail.innerHTML = `<div class="container ga-wrap db-detail">
                <nav class="db-crumb"><a href="database.html">ฐานข้อมูล</a> <span>/</span> <a href="database.html#cat-${e.cat}">${esc(cat.title)}</a> <span>/</span> <strong>${esc(e.name)}</strong></nav>
                <div class="db-detail-head">
                    ${iconBox("ga-icon", e)}
                    <div class="db-detail-head-txt">
                        <div class="db-detail-badges"><span class="hero-badge">${esc(cat.title)}</span>${confBadge}</div>
                        <h1 class="ga-title">${esc(e.name)}</h1>
                        <p class="rm-subtitle">${esc(e.nameTh)}</p>
                    </div>
                </div>
                <p class="ga-summary">${esc(e.summary)}</p>
                <div class="db-tags db-tags-lg">${tagsHtml(e.tags)}</div>
                ${metaHtml ? `<div class="db-meta">${metaHtml}</div>` : ""}
                <article class="ga-body">${bodyHtml}</article>
                <div class="db-detail-foot">
                    ${srcHtml ? `<div class="ga-source">แหล่งอ้างอิง: ${srcHtml}</div>` : ""}
                    ${statusHtml}
                </div>
                ${relatedHtml}
            </div>`;
        }
    }

})();
