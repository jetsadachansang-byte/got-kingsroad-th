/* ============================================================
   roadmap.js — ไทม์ไลน์อัปเดตที่ "เข้าเกมแล้ว" (เฉพาะของปัจจุบัน)

   โครงสร้าง 2 ชั้น:
     roadmap.html          → หน้ารวม การ์ดอัปเดต เรียงล่าสุดขึ้นก่อน
     roadmap-article.html  → หน้าอ่านรายละเอียดแต่ละอัปเดต (อ่านค่า ?id=)

   ✏️ เพิ่มอัปเดตใหม่เมื่อเข้าเกมจริง: เพิ่มใน UPDATES แล้ววาง id ไว้บนสุดของ ORDER
============================================================ */

(function () {

    const IC = {
        season:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
        world:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        kraken:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5z"/><path d="M9.5 9h.01"/><path d="M14.5 9h.01"/><path d="M7 12c-1.5 1-2 3-2 5"/><path d="M10 13c-1 1.5-1 4-2.5 6"/><path d="M14 13c1 1.5 1 4 2.5 6"/><path d="M17 12c1.5 1 2 3 2 5"/></svg>',
        launch:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'
    };

    /* ---------- อัปเดตที่เข้าเกมแล้วเท่านั้น (เพิ่ม/แก้ที่นี่) ---------- */

    const UPDATES = {
        "frost-and-steel": {
            icon: IC.season, date: "15 ก.ค. 2026", status: "ล่าสุด • กำลังจัด",
            title: "Season 1: Frost and Steel",
            subtitle: "The North Bannerman Qualifiers",
            summary: "ซีซันแรกอย่างเป็นทางการ สงครามตระกูลกลางแดนเหนือขณะ Ironborn บุก รัน 6 สัปดาห์ พร้อมระบบ House Allegiance และกลไกต่อสู้ใหม่",
            body: [
                { p: "อัปเดตซีซันใหญ่ที่สุดของเกม เปิดตัว 15 ก.ค. 2026 และจัดต่อเนื่อง 6 สัปดาห์ ธีมสงครามระหว่างตระกูล (faction warfare) ในแดนเหนือ ท่ามกลางการรุกรานของชาว Ironborn" },
                { h: "เลือกตระกูลและประกาศตัวเป็น Bannerman" },
                { p: "เมื่อเริ่มซีซัน ผู้เล่นเลือกสวามิภักดิ์ต่อ 1 ใน 3 ตระกูลแห่งแดนเหนือ:" },
                { list: [
                    "House Umber — ผู้พิทักษ์แห่ง The Gift คติ “ป่าเถื่อนและไม่มีวันแตกสลาย”",
                    "House Hornwood — โล่แห่งแดนเหนือ คติ “เกียรติยศและความภักดี”",
                    "House Manderly — ผู้ปกครอง White Harbor คติ “ปัญญาและความรุ่งเรือง”"
                ]},
                { h: "ระบบจัดอันดับซีซัน (Seasonal Ranking)" },
                { list: [
                    "แข่งขันเฉพาะกับสมาชิกตระกูลเดียวกัน",
                    "มีอันดับรายสัปดาห์และอันดับสะสมตลอดทั้งซีซัน แบ่งเป็น 5 ระดับ (Tier)",
                    "ผู้เล่น 5 คนที่ขึ้นอันดับสูงสุด “Top Bannermen” จะถูกบันทึกใน Hall of Fame ของเกมอย่างถาวร",
                    "มีรางวัลพิเศษเฉพาะผู้ทำอันดับสูง"
                ]},
                { h: "คอนเทนต์ใหม่ในซีซัน" },
                { list: [
                    "Season Quests และ Relic Quests",
                    "แปลง 5 ดันเจียนใหญ่ให้เป็นดันเจียนธีมซีซัน 1",
                    "ดันเจียนซีซันใหม่ 3 แบบ: Wormwalks, Beyond the Wall Expedition และ Elite Hideout เวอร์ชันใหม่ ความท้าทายปลายเกม",
                    "เก็บ Season Points จาก Raid Defense, Northern Bannerman Duel Festival และการสำรวจพื้นที่",
                    "เก็บ Season Token จาก expedition, อีเวนต์ตามพื้นที่, World Boss และคอนเทนต์ทำซ้ำได้"
                ]},
                { h: "North Bannerman Duel Festival (เริ่ม 22 ก.ค. 2026)" },
                { p: "โหมดทัวร์นาเมนต์ PvE ดวล 1v1 กับแชมป์เปี้ยน AI ระดับสูงที่เลียนแบบการเล่นแบบ PvP ของมนุษย์ ทั้งการหลบ การ Parry และการโจมตีระยะไกล เป็นหนึ่งในกิจกรรมหลักของซีซัน" },
                { h: "กลไกต่อสู้ใหม่: Burning Battle Spirit" },
                { p: "สะสม Battle Spirit จากการโจมตีศัตรู สะสมอะดรีนาลีนจนเต็ม แล้วปลดปล่อยการระเบิดพลังที่สร้างความเสียหายรุนแรงต่อศัตรูรอบข้าง เปิดมิติใหม่ของการวางจังหวะต่อสู้" },
                { h: "Battle Pass" },
                { p: "Battle Pass ประจำซีซัน “Ripples of the Open Sea” สะสมความคืบหน้าเพื่อปลดรางวัลตามระดับ" }
            ],
            source: { label: "Inven Global — Frost and Steel", url: "https://www.invenglobal.com/articles/23790/game-of-thrones-kingsroad-season-1-frost-and-steel-update" }
        },
        "hedge-knight-3": {
            icon: IC.world, date: "21 ม.ค. 2026", status: "เข้าเกมแล้ว",
            title: "World Difficulty: Hedge Knight III",
            subtitle: "และภารกิจ Co-op",
            summary: "ระดับความยากโลกใหม่สำหรับผู้เล่นปลายเกม พร้อมภารกิจแบบร่วมมือและดรอปอุปกรณ์ Tier 7",
            body: [
                { p: "อัปเดต 21 ม.ค. 2026 เพิ่มระดับความยากโลกใหม่ [Hedge Knight III] สำหรับผู้เล่นที่แข็งแกร่งขึ้น พร้อมภารกิจแบบ Co-op และการปรับปรุงระบบต่าง ๆ" },
                { h: "เงื่อนไขปลดล็อก" },
                { p: "ต้องมีค่า Momentum ตั้งแต่ 280,000 ขึ้นไปจึงจะเข้าเล่น Hedge Knight III ได้" },
                { h: "รางวัลที่เพิ่มขึ้น" },
                { list: [
                    "เพิ่มโอกาสได้อุปกรณ์ Tier 7 Legendary",
                    "เพิ่มโอกาสได้วัสดุคราฟระดับสูง",
                    "เพิ่มโอกาสได้เครื่องประดับ (Jewelry) ระดับสูง",
                    "ได้รางวัลวัสดุเพิ่มเติมจากด่านปกติ"
                ]},
                { h: "ภารกิจ Co-op และการปรับปรุง" },
                { list: [
                    "เพิ่มภารกิจแบบร่วมมือ (Co-op Missions)",
                    "ปรับข้อความแจ้งเตือนเมื่อซื้อของใน Alliance Shop โดยยังไม่ครบเงื่อนไขให้ชัดเจนขึ้น",
                    "ปรับการแสดงข้อมูลเมื่อได้รับรางวัล House Pin ซ้ำให้เข้าใจง่ายขึ้น"
                ]}
            ],
            source: { label: "1/21 Update Notes — Netmarble", url: "https://forum.netmarble.com/got/view/4/226" }
        },
        "world-level-3": {
            icon: IC.world, date: "22 ต.ค. 2025", status: "เข้าเกมแล้ว",
            title: "World Level 3",
            subtitle: "ยกระดับความท้าทายปลายเกม",
            summary: "เพิ่มระดับโลก World Level 3 พร้อมรางวัลที่สูงขึ้นและโอกาสได้อุปกรณ์ Tier 6 Legendary",
            body: [
                { p: "อัปเดต 22 ต.ค. 2025 เปิดระดับโลก World Level 3 ยกระดับความท้าทายและผลตอบแทนสำหรับผู้เล่นที่เติบโตขึ้น" },
                { h: "จุดเด่น" },
                { list: [
                    "เพิ่มระดับความยากโลก World Level 3",
                    "รางวัลจากการเล่นสูงขึ้น",
                    "เพิ่มโอกาสได้อุปกรณ์ Tier 6 Legendary",
                    "เพิ่ม Achievement ใหม่"
                ]},
                { p: "เป็นขั้นบันไดสู่ระดับความยากที่สูงขึ้นอย่าง Hedge Knight III ในอัปเดตถัดมา" }
            ],
            source: { label: "10/22 Update Notes — Steam", url: "https://store.steampowered.com/news/app/3183280/view/519728266793189576" }
        },
        "drowned-god-wakes": {
            icon: IC.kraken, date: "26 มิ.ย. 2025", status: "เข้าเกมแล้ว",
            title: "The Drowned God Wakes",
            subtitle: "คอนเทนต์ใหญ่แรกหลังเปิดเกม",
            summary: "พื้นที่ใหม่ The Crow's Nest, โหมด Raid ปราบ Kraken, ระบบ Amulet และความยากใหม่ของ Drogon",
            body: [
                { p: "อัปเดตคอนเทนต์ใหญ่ครั้งแรกนับตั้งแต่เปิดเกม เปิดตัว 26 มิ.ย. 2025 นำพื้นที่ใหม่ โหมดเล่นใหม่ และระบบเสริมพลังเข้ามาพร้อมกัน" },
                { h: "พื้นที่ใหม่: แคว้น Stormlands (The Crow's Nest)" },
                { p: "เปิดแคว้นใหม่ Stormlands พร้อมพื้นที่ The Crow's Nest และดินแดนโดยรอบ มีเควสหลัก เควสย่อย ซากปรักหักพัง (Ruins), ระบบล่าค่าหัว (Bounty Hunt — ล่าอาชญากร 15 ราย รับ 26 แต้ม Weapon Mastery) และ Faction Hideout ที่มีบอสและ Elite ให้เก็บลูท ผู้เล่นจะได้พบ Stannis Baratheon ผู้อ้างสิทธิ์ในบัลลังก์เหล็ก ท่ามกลางการทรยศ เมื่อทหารรับจ้างที่จ้างมาเสริมทัพกลับยึด Griffin's Roost" },
                { h: "โหมด Raid: Kraken" },
                { list: [
                    "Raid Boss ร่วมมือตัวแรกของเกม — Kraken อสูรทะเลแห่ง Iron Islands",
                    "ต่อสู้กลางทะเล ต้องประสานทีมและเข้าใจกลไกเฉพาะเพื่อรับมือการโจมตีรุนแรง",
                    "ปราบสำเร็จมีโอกาสได้วัสดุคราฟ Amulet Core",
                    "เพิ่มกระดานจัดอันดับ Kraken Raid และ Achievement ใหม่"
                ]},
                { h: "ระบบ Amulet (เครื่องราง)" },
                { p: "ระบบเสริมความแข็งแกร่งและปรับแต่งบิลด์ใหม่ มีทั้งหมด 9 ชิ้น (Rare 3 / Epic 3 / Legendary 3) ทุกชิ้นมีเอฟเฟกต์ตายตัว พร้อมเอฟเฟกต์สุ่มเพิ่มตามความหายาก" },
                { h: "เพิ่มเติม" },
                { list: [
                    "เพิ่มระดับความยากใหม่ของ World Boss Drogon",
                    "คอนเทนต์ตามฤดูกาล: Wormwalk, Beyond the Wall Expeditions, Bounties, Sub-quests และอีเวนต์"
                ]}
            ],
            source: { label: "gamingonphone.com", url: "https://gamingonphone.com/news/game-of-thrones-kingsroad-first-content-update-the-drowned-god-wakes" }
        },
        "global-launch": {
            icon: IC.launch, date: "21 พ.ค. 2025", status: "เข้าเกมแล้ว",
            title: "เปิดตัวเกมอย่างเป็นทางการ",
            subtitle: "Global Launch",
            summary: "จุดเริ่มต้นของ Game of Thrones: Kingsroad — Action RPG ในโลก Westeros พร้อม 3 อาชีพและเนื้อเรื่องหลัก",
            body: [
                { p: "Game of Thrones: Kingsroad เปิดให้บริการอย่างเป็นทางการเมื่อ 21 พ.ค. 2025 บนมือถือ (Android/iOS) และ PC (Steam, Epic Games Store) นับเป็นจุดเริ่มต้นของไทม์ไลน์อัปเดตทั้งหมด" },
                { h: "แนวเกมและเนื้อเรื่อง" },
                { p: "เกม Action RPG ที่พาผู้เล่นเดินทางในดินแดน Westeros ตามเส้นทางสายกษัตริย์ (Kingsroad) ผ่านเนื้อเรื่องหลักที่เชื่อมโยงกับตระกูลใหญ่ เริ่มต้นในแดนเหนือ (The North) พื้นที่บทนำ (Prologue) และดินแดนเหนือกำแพง (Beyond the Wall)" },
                { h: "3 อาชีพให้เลือก" },
                { list: [
                    "Knight — แนวหน้าสายแทงก์ อึดที่สุด เล่นง่าย",
                    "Assassin — ดาเมจระเบิดสูงสุด เร็วแต่ตัวบาง",
                    "Sellsword — อาวุธใหญ่ โจมตีหนัก คอมโบไม่ถูกขัดจังหวะ"
                ]},
                { h: "ระบบหลักตั้งแต่เปิดเกม" },
                { list: [
                    "Momentum — ค่าพลังรวมที่ควบคุมความคืบหน้า",
                    "ระบบอุปกรณ์ การตีบวก (Refinement) และการจัด Build",
                    "ดันเจียนและ World Boss Drogon",
                    "ระบบ Alliance และการเล่นร่วมกับผู้อื่น"
                ]},
                { p: "ดูรายละเอียดอาชีพและการจัด Build ได้ที่หน้าอาชีพ" }
            ],
            source: { label: "Wikipedia — Game of Thrones: Kingsroad", url: "https://en.wikipedia.org/wiki/Game_of_Thrones:_Kingsroad" }
        }
    };

    // เรียงลำดับการแสดง (ล่าสุดขึ้นก่อน)
    const ORDER = ["frost-and-steel", "hedge-knight-3", "world-level-3", "drowned-god-wakes", "global-launch"];

    /* ============================================================
       ตัวเรนเดอร์ (ไม่ต้องแก้)
    ============================================================ */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function cardHtml(id) {
        const u = UPDATES[id];
        if (!u) return "";
        const cur = /ล่าสุด/.test(u.status) ? " rm-current" : "";
        return `<a href="roadmap-article.html?id=${encodeURIComponent(id)}" class="quick-card guide-card rm-card${cur}">
            <div class="rm-top">
                <span class="quick-icon rm-icon">${u.icon}</span>
                <span class="rm-badge">${esc(u.status)}</span>
            </div>
            <span class="rm-date">${esc(u.date)}</span>
            <h3>${esc(u.title)}</h3>
            <p>${esc(u.summary)}</p>
            <span class="class-link">อ่านรายละเอียด →</span>
        </a>`;
    }

    /* ---------- หน้ารวม ---------- */
    const hub = document.getElementById("roadmap-hub");
    if (hub) {
        hub.innerHTML = `<div class="quick-grid rm-grid">${ORDER.map(cardHtml).join("\n")}</div>`;
    }

    /* ---------- หน้าอ่านรายละเอียด ---------- */
    const article = document.getElementById("roadmap-article");
    if (article) {
        const id = new URLSearchParams(location.search).get("id");
        const u = UPDATES[id];

        if (!u) {
            article.innerHTML = `<div class="container"><div class="ga-notfound">
                <h2>ไม่พบข้อมูลอัปเดต</h2>
                <p>อัปเดตนี้อาจถูกย้ายหรือลบไปแล้ว</p>
                <a href="roadmap.html" class="btn-primary">กลับไปหน้า Roadmap</a>
            </div></div>`;
        } else {
            document.title = u.title + " | Game of Thrones: Kingsroad TH";
            const bodyHtml = u.body.map(b => {
                if (b.h) return `<h3 class="ga-h">${esc(b.h)}</h3>`;
                if (b.p) return `<p class="ga-p">${esc(b.p)}</p>`;
                if (b.list) return `<ul class="ga-list">${b.list.map(li => `<li>${esc(li)}</li>`).join("")}</ul>`;
                return "";
            }).join("\n");

            const idx = ORDER.indexOf(id);
            const prev = ORDER[idx + 1]; // เก่ากว่า
            const next = ORDER[idx - 1]; // ใหม่กว่า
            const navHtml = `<div class="ga-pager">
                ${next ? `<a href="roadmap-article.html?id=${next}" class="ga-pager-link"><span>อัปเดตใหม่กว่า</span><strong>${esc(UPDATES[next].title)} →</strong></a>` : "<span></span>"}
                ${prev ? `<a href="roadmap-article.html?id=${prev}" class="ga-pager-link right"><span>อัปเดตก่อนหน้า</span><strong>← ${esc(UPDATES[prev].title)}</strong></a>` : "<span></span>"}
            </div>`;

            article.innerHTML = `<div class="container ga-wrap">
                <a href="roadmap.html" class="ga-back">← อัปเดตทั้งหมด</a>
                <div class="ga-icon">${u.icon}</div>
                <span class="hero-badge">${esc(u.status)} • ${esc(u.date)}</span>
                <h1 class="ga-title">${esc(u.title)}</h1>
                ${u.subtitle ? `<p class="rm-subtitle">${esc(u.subtitle)}</p>` : ""}
                <p class="ga-summary">${esc(u.summary)}</p>
                <article class="ga-body">${bodyHtml}</article>
                <div class="ga-source">ที่มา: <a href="${esc(u.source.url)}" target="_blank" rel="noopener">${esc(u.source.label)}</a></div>
                ${navHtml}
            </div>`;
        }
    }

})();
