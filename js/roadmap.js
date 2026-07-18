/* ============================================================
   roadmap.js — แบ่ง 2 ส่วน

   1) ไทม์ไลน์ปัจจุบัน (CURRENT) — เฉพาะที่เข้าเกมแล้ว
      ตั้งแต่ Global Launch 21 พ.ค. 2026 เป็นต้นมาเท่านั้น
      (ไม่รวมข้อมูลเซิร์ฟเวอร์เก่าก่อนหน้านี้)
   2) แผน Roadmap ของผู้พัฒนา (PLAN) — ยังไม่เข้าเกม แยกเป็นอีกส่วน

   โครงสร้าง 2 ชั้น:
     roadmap.html          → หน้ารวม 2 ส่วน
     roadmap-article.html  → หน้าอ่านรายละเอียด (อ่านค่า ?id=)

   ✏️ เมื่อมีอัปเดตใหม่เข้าเกมจริง: ย้าย id จาก PLAN ขึ้นไปไว้บนสุดของ CURRENT
============================================================ */

(function () {

    const IC = {
        season:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
        launch:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        scroll:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>',
        swap:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 6h18"/><path d="m7 22-4-4 4-4"/><path d="M21 18H3"/></svg>',
        group:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        store:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1-4H4L3 9z"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 22V12h6v10"/></svg>',
        spark:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m18 6-2.5 2.5"/><path d="m8.5 15.5-2.5 2.5"/></svg>'
    };

    /* ============================================================
       ส่วนที่ 1 — ไทม์ไลน์ปัจจุบัน (เข้าเกมแล้ว)
    ============================================================ */

    const UPDATES = {
        "frost-and-steel": {
            kind: "current", icon: IC.season, date: "15 ก.ค. 2026", status: "ล่าสุด • กำลังจัด",
            title: "Season 1: Frost and Steel",
            subtitle: "The North Bannerman Qualifiers",
            summary: "ซีซันแรกอย่างเป็นทางการหลังเกมเปิด สงครามตระกูลกลางแดนเหนือขณะ Ironborn บุก รัน 6 สัปดาห์ พร้อมระบบ House Allegiance และกลไกต่อสู้ใหม่",
            body: [
                { p: "อัปเดตซีซันใหญ่แรกหลัง Global Launch เปิดตัว 15 ก.ค. 2026 และจัดต่อเนื่อง 6 สัปดาห์ ธีมสงครามระหว่างตระกูล (faction warfare) ในแดนเหนือ ท่ามกลางการรุกรานของชาว Ironborn" },
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
                    "ดันเจียนซีซันใหม่: Wormwalks, Beyond the Wall Expedition และ Elite Hideout เวอร์ชันใหม่",
                    "เก็บ Season Points จาก Raid Defense, Northern Bannerman Duel Festival และการสำรวจพื้นที่",
                    "เก็บ Season Token จาก expedition, อีเวนต์ตามพื้นที่, World Boss และคอนเทนต์ทำซ้ำได้"
                ]},
                { h: "North Bannerman Duel Festival (เริ่ม 22 ก.ค. 2026)" },
                { p: "โหมดทัวร์นาเมนต์ PvE ดวล 1v1 กับแชมป์เปี้ยน AI ระดับสูงที่เลียนแบบการเล่นแบบ PvP ของมนุษย์ ทั้งการหลบ การ Parry และการโจมตีระยะไกล เป็นหนึ่งในกิจกรรมหลักของซีซัน" },
                { h: "กลไกต่อสู้ใหม่: Burning Battle Spirit" },
                { p: "สะสม Battle Spirit จากการโจมตีศัตรู สะสมอะดรีนาลีนจนเต็ม แล้วปลดปล่อยเป็นสกิลพิเศษพลังสูงที่สร้างความเสียหายรุนแรงและฟื้นฟูพลังชีวิต" },
                { h: "Battle Pass" },
                { p: "Battle Pass ประจำซีซัน “Ripples of the Open Sea” สะสมความคืบหน้าเพื่อปลดรางวัลตามระดับ" }
            ],
            source: { label: "Inven Global — Frost and Steel", url: "https://www.invenglobal.com/articles/23790/game-of-thrones-kingsroad-season-1-frost-and-steel-update" }
        },
        "global-launch": {
            kind: "current", icon: IC.launch, date: "21 พ.ค. 2026", status: "จุดเริ่มต้น",
            title: "เปิดเกมอย่างเป็นทางการ",
            subtitle: "Global Launch",
            summary: "จุดเริ่มต้นของเซิร์ฟเวอร์ปัจจุบัน ทุกอย่างเริ่มใหม่หมด — Action RPG ในโลก Westeros พร้อม 3 อาชีพและเนื้อเรื่องหลัก",
            body: [
                { p: "Game of Thrones: Kingsroad เปิดให้บริการอย่างเป็นทางการเมื่อ 21 พ.ค. 2026 บนมือถือ (Android/iOS) และ PC (Steam, Epic Games Store) แบบเล่นฟรี นับเป็นจุดเริ่มต้นของไทม์ไลน์และความคืบหน้าทั้งหมดบนเซิร์ฟเวอร์ปัจจุบัน" },
                { h: "สถานะปัจจุบัน" },
                { p: "เนื่องจากเพิ่งเปิดเกม อุปกรณ์ระดับสูงสุดในตอนนี้ยังอยู่ที่ Tier 4 และคอนเทนต์จะทยอยเพิ่มตามอัปเดตถัดไป ข้อมูลของเซิร์ฟเวอร์รุ่นก่อนหน้าจึงไม่นับรวมในไทม์ไลน์นี้" },
                { h: "แนวเกมและเนื้อเรื่อง" },
                { p: "Action RPG ที่พาผู้เล่นเดินทางในดินแดน Westeros ตามเส้นทางสายกษัตริย์ (Kingsroad) ผ่านเนื้อเรื่องหลักที่เชื่อมโยงกับตระกูลใหญ่ เริ่มต้นในแดนเหนือ (The North) พื้นที่บทนำ (Prologue) และดินแดนเหนือกำแพง (Beyond the Wall)" },
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
            source: { label: "GameSpot — Kingsroad Free-to-Play May 21", url: "https://www.gamespot.com/articles/game-of-thrones-kingsroad-will-go-free-to-play-may-21/1100-6531233/" }
        },

        /* ============================================================
           ส่วนที่ 2 — แผน Roadmap ของผู้พัฒนา (ยังไม่เข้าเกม)
           ที่มา: Developer Note — 2026 Update Preview
        ============================================================ */

        "story-chapter-4": {
            kind: "plan", icon: IC.scroll, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "บทที่ 4: Casterly Rock",
            subtitle: "เนื้อเรื่องบทใหม่",
            summary: "เนื้อเรื่องบทที่ 4 เริ่มเมื่อฮีโร่ถูกจองจำใน Casterly Rock ภายใต้ House Lannister",
            body: [
                { p: "เกมจะได้รับเนื้อเรื่องบทที่ 4 โดยเรื่องราวใหม่เริ่มต้นด้วยการที่ฮีโร่ถูกจองจำใน Casterly Rock ภายใต้การปกครองของ House Lannister" },
                { p: "เหตุการณ์นี้จะกลายเป็นจุดเริ่มต้นของความขัดแย้งใหม่และทางแยกของเนื้อเรื่อง ต่อยอดจากเนื้อเรื่องหลักที่ผ่านมา" }
            ],
            source: { label: "Developer Note: 2026 Update Preview", url: "https://forum.netmarble.com/got/view/12/216" }
        },
        "harrenhal-pve": {
            kind: "plan", icon: IC.group, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "Harrenhal Co-op PvE",
            subtitle: "โหมดหลายผู้เล่นใหม่",
            summary: "โหมด PvE ร่วมมือธีมซากปรักหักพัง Harrenhal รวมทีมปราบศัตรูทรงพลัง",
            body: [
                { p: "คอนเทนต์ PvE หลายผู้เล่นใหม่ ธีมซากปรักหักพังของ Harrenhal สำหรับผู้ที่ชอบเล่นแบบร่วมมือ" },
                { list: [
                    "เน้นเล่นเป็นทีม รวมกำลังกับผู้เล่นคนอื่นเพื่อปราบศัตรูทรงพลัง",
                    "รับรางวัลจากการเล่นร่วมกัน",
                    "เป็นคอนเทนต์ PvE ไม่มี PvP โดยตรง"
                ]}
            ],
            source: { label: "Developer Note: 2026 Update Preview", url: "https://forum.netmarble.com/got/view/12/216" }
        },
        "graphics-rework": {
            kind: "plan", icon: IC.spark, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "ปรับปรุงกราฟิกและคัตซีน",
            subtitle: "Visual Rework",
            summary: "รีเวิร์กคัตซีนและกราฟิกในหลายพื้นที่ พร้อมเอฟเฟกต์การต่อสู้ใหม่",
            body: [
                { h: "รีเวิร์กภาพและคัตซีน" },
                { p: "ปรับปรุงคัตซีนและกราฟิกทั่วไปในบางพื้นที่ เช่น Prologue และ Beyond the Wall ให้ดูดีขึ้น" },
                { h: "เอฟเฟกต์การต่อสู้" },
                { p: "ปรับเอฟเฟกต์ระหว่างต่อสู้และตอนสังหารศัตรู เพื่อถ่ายทอดบรรยากาศมืดหม่นและโหดร้ายของต้นฉบับ George R. R. Martin ได้สมจริงและดื่มด่ำยิ่งขึ้น" }
            ],
            source: { label: "Developer Note: 2026 Update Preview", url: "https://forum.netmarble.com/got/view/12/216" }
        }
    };

    const CURRENT = ["frost-and-steel", "global-launch"];
    const PLAN = ["story-chapter-4", "harrenhal-pve", "graphics-rework"];

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
        const plan = u.kind === "plan" ? " rm-plan" : "";
        return `<a href="roadmap-article.html?id=${encodeURIComponent(id)}" class="quick-card guide-card rm-card${cur}${plan}">
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

    const hub = document.getElementById("roadmap-hub");
    if (hub) hub.innerHTML = `<div class="quick-grid rm-grid">${CURRENT.map(cardHtml).join("\n")}</div>`;

    const planHub = document.getElementById("roadmap-plan");
    if (planHub) planHub.innerHTML = `<div class="quick-grid rm-grid">${PLAN.map(cardHtml).join("\n")}</div>`;

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

            const list = u.kind === "plan" ? PLAN : CURRENT;
            const idx = list.indexOf(id);
            const older = list[idx + 1];
            const newer = list[idx - 1];
            const navHtml = (newer || older) ? `<div class="ga-pager">
                ${newer ? `<a href="roadmap-article.html?id=${newer}" class="ga-pager-link"><span>${u.kind === "plan" ? "หัวข้อก่อนหน้า" : "อัปเดตใหม่กว่า"}</span><strong>${esc(UPDATES[newer].title)} →</strong></a>` : "<span></span>"}
                ${older ? `<a href="roadmap-article.html?id=${older}" class="ga-pager-link right"><span>${u.kind === "plan" ? "หัวข้อถัดไป" : "อัปเดตก่อนหน้า"}</span><strong>← ${esc(UPDATES[older].title)}</strong></a>` : "<span></span>"}
            </div>` : "";

            const planNote = u.kind === "plan"
                ? `<div class="rm-plan-note">หัวข้อนี้เป็น <strong>แผนพัฒนา</strong> ที่ผู้พัฒนาประกาศไว้ ยังไม่เข้าเกมในเซิร์ฟเวอร์ปัจจุบัน</div>`
                : "";

            article.innerHTML = `<div class="container ga-wrap">
                <a href="roadmap.html" class="ga-back">← กลับหน้า Roadmap</a>
                <div class="ga-icon${u.kind === "plan" ? " rm-plan-icon" : ""}">${u.icon}</div>
                <span class="hero-badge">${esc(u.status)} • ${esc(u.date)}</span>
                <h1 class="ga-title">${esc(u.title)}</h1>
                ${u.subtitle ? `<p class="rm-subtitle">${esc(u.subtitle)}</p>` : ""}
                <p class="ga-summary">${esc(u.summary)}</p>
                ${planNote}
                <article class="ga-body">${bodyHtml}</article>
                <div class="ga-source">ที่มา: <a href="${esc(u.source.url)}" target="_blank" rel="noopener">${esc(u.source.label)}</a></div>
                ${navHtml}
            </div>`;
        }
    }

})();
