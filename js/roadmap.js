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
        spark:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m18 6-2.5 2.5"/><path d="m8.5 15.5-2.5 2.5"/></svg>',
        flame:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        gem:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
        notes:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'
    };

    /* ============================================================
       ส่วนที่ 1 — ไทม์ไลน์ปัจจุบัน (เข้าเกมแล้ว)
    ============================================================ */

    const UPDATES = {
        "update-0815": {
            kind: "current", icon: IC.spark, date: "15 ส.ค. 2026", status: "ล่าสุด • สัปดาห์สุดท้ายของซีซัน",
            title: "โค้งสุดท้ายซีซัน 1 + อีเวนต์ Hot Time",
            subtitle: "Meca Ranking: Final Sprint of Season 1",
            summary: "Season 1 Frost and Steel เข้าสู่สัปดาห์สุดท้ายก่อนปิดซีซัน 19 ส.ค. 2026 ผู้เล่นกลุ่มบนไต่ทะลุ 30,000 คะแนนจากอีเวนต์ Hot Time เพิ่มคะแนนดันเจียน 50% พร้อมกลยุทธ์กักโทเคนไว้ทุ่มโค้งสุดท้าย",
            body: [
                { p: "Gamemeca รายงานว่าซีซันปกติแรกของเกม 'Northern Banner Selection: Frost and Steel' เข้าสู่สัปดาห์สุดท้ายแล้ว การแข่งขันดุเดือดขึ้นเรื่อย ๆ เพราะรางวัลผูกกับคะแนนสะสมตลอดซีซัน ผู้เล่นกลุ่มอันดับต้นของแต่ละตระกูลไต่ทะลุหลัก 30,000 คะแนนไปแล้ว" },
                { h: "อีเวนต์ Hot Time เพิ่มคะแนนดันเจียน 50%" },
                { p: "อีเวนต์ Hot Time ช่วงสุดสัปดาห์เพิ่มคะแนนที่ได้จากดันเจียน 50% ซึ่งคะแนนดันเจียนนับรวมเป็นคะแนนซีซันด้วย ทำให้ผู้เล่นได้ประโยชน์สองต่อจากการเล่นคอนเทนต์เดิม" },
                { h: "กักตุนโทเคนรอทุ่มท้ายเกม" },
                { p: "ผู้เล่นจำนวนมากเลือกกักตุนโทเคนสะสมไว้ก่อน แล้วทุ่มรวดเดียวช่วงวินาทีสุดท้ายของซีซัน เพื่อหลบการจับตาจากคู่แข่งในตระกูลเดียวกัน ทำให้กระดานอันดับยังพลิกได้ตลอดจนถึงวินาทีสุดท้าย" },
                { p: "ซีซันจะปิดฉากเวลา 6:00 น. ของวันที่ 19 ส.ค. 2026 ตามด้วยช่วงพัก 2 สัปดาห์ก่อนเริ่มซีซันถัดไป — ตรงกับวันอัปเดตใหญ่ Westerlands & Casterly Rock พอดี" },
                { p: "หมายเหตุ: เนื้อหาส่วนนี้สรุป/แปลจากรายงานของสื่อเกม (Gamemeca) ตัวเลขคะแนนและอันดับอาจเปลี่ยนแปลงได้จนถึงเวลาปิดซีซันจริง" }
            ],
            source: { label: "Gamemeca — Meca Ranking: Final Sprint of Season 1", url: "https://www.gamemeca.com/en/view.php?gid=1779018" }
        },
        "patch-0808": {
            kind: "current", icon: IC.notes, date: "8 ส.ค. 2026", status: "แก้บั๊ก",
            title: "แพตช์ย่อยแก้เกมแครชบน PC",
            subtitle: "8/7 Patch Notes (Hotfix)",
            summary: "แพตช์ย่อยจาก Netmarble มีผลตั้งแต่คืน 7 ส.ค. (เวลาไทยราวเที่ยง 8 ส.ค. 2026) แก้ปัญหาเกมแครชบนเวอร์ชัน PC มีผลทั้ง PC และมือถือ (iOS)",
            body: [
                { p: "Netmarble ปล่อยแพตช์ย่อย (hotfix) มีผลตั้งแต่ 7 ส.ค. 2026 เวลา 22:40 น. (PT) ซึ่งตรงกับราวเที่ยงวันที่ 8 ส.ค. 2026 ตามเวลาไทย" },
                { h: "รายละเอียดการแก้ไข" },
                { list: [
                    "แก้ปัญหาที่เกมอาจแครชในบางกรณีบนเวอร์ชัน PC",
                    "แพตช์มีผลกับทั้งเวอร์ชัน PC และมือถือ (iOS)"
                ]},
                { p: "หมายเหตุ: เป็นแพตช์ย่อยแก้บั๊กเฉพาะจุด ยังไม่มีรายละเอียดอื่นเพิ่มเติมในประกาศทางการ ณ ขณะอัปเดตหน้านี้ — ยังไม่พบประกาศฉบับเต็มบน Netmarble Forum TH" }
            ],
            source: { label: "Steam News — Game of Thrones: Kingsroad 8/7 Patch Notes", url: "https://store.steampowered.com/news/app/3183280/view/536609788663955893" }
        },
        "update-0807": {
            kind: "current", icon: IC.spark, date: "7 ส.ค. 2026", status: "วิเคราะห์เมต้า",
            title: "จัดกลุ่มอันดับใหม่ + เมต้า Elite Hideout สัปดาห์ 2-3",
            subtitle: "Meca Ranking: Banner Re-assembly & Elite Hideout Meta",
            summary: "หลังจัดกลุ่มอันดับใหม่ (Banner Re-assembly) ช่องว่างคะแนนผู้เล่นแคบลงชัดเจน ส่วน Elite Hideout คลาส Sellsword ไล่ตาม Knight/Assassin ทัน และวัตถุโบราณ Maester Corso's Letter กลายเป็นตัวเลือกเมต้ายอดนิยม",
            body: [
                { h: "จัดกลุ่มอันดับใหม่ (Banner Re-assembly) ช่องว่างแคบลง" },
                { p: "หลังกิจกรรมจัดกลุ่มอันดับใหม่ (Banner Re-assembly) ของระบบ House Allegiance ช่องว่างคะแนนระหว่างผู้เล่นกลุ่มบนและกลุ่มล่างของตารางแคบลงชัดเจน จุดตัดเข้ากลุ่ม Top 100 ขยับขึ้นไปอยู่ที่ 172,033 คะแนนโมเมนตัม ส่วนต่างระหว่างกลุ่ม Top 10% กับ Bottom 10% หดเหลือ 51,118 คะแนน สะท้อนว่าผู้เล่นไล่ตามกันสูสีขึ้นเมื่อเข้าสู่ช่วงสัปดาห์ที่ 2-3 ของซีซัน" },
                { p: "อันดับ 'Chief' (ระดับสูงสุด) ยังคงแข่งขันกันดุเดือด ในขณะที่อันดับ 'Greatsword' รองลงมาเริ่มไต่อันดับได้ช้าลงเมื่อเทียบกับสัปดาห์แรก" },
                { h: "วิเคราะห์เมต้า Elite Hideout: Sellsword ไล่ตามทัน" },
                { p: "รายงานวิเคราะห์อันดับ Elite Hideout ล่าสุดจาก Gamemeca ระบุว่าคลาส Sellsword (ต้นฉบับอังกฤษเรียก 'Mercenary') ไต่ขึ้นมาอีก 4 คนในกลุ่ม Top 100 จนสัดส่วนคลาสในกลุ่ม Top 100 เกือบสมดุล คือ Sellsword 34 คน, Knight 33 คน และ Assassin 33 คน โดยรวม Knight ยังครองความได้เปรียบในดันเจียน Raid ทั่วไป ส่วน Sellsword มาแรงในดันเจียน Elite Hideout" },
                { p: "ดันเจียน Elite Hideout ประจำสัปดาห์นี้คือ 'Old Town: Shaded Monastery' — ต้องเคลียร์ถึงชั้น 15 ภายใน 10 นาทีเพื่อติด Top 100 และเคลียร์ชั้น 20 ภายใน 5 นาทีเพื่อติด Top 10" },
                { h: "วัตถุโบราณเมต้า: Maester Corso's Letter" },
                { p: "วัตถุโบราณ (Artifact) 'Maester Corso's Letter' กำลังมาแรงเป็นตัวเลือกยอดนิยมของทุกคลาส เพิ่มอัตราสะสม Rage 1.0% และเพิ่มดาเมจสูงสุด 40% ตามปริมาณ Rage สะสม เหมาะกับบิลด์สายรุกที่รักษาค่า Rage ไว้สูงตลอดการต่อสู้ อัตราการใช้งานล่าสุด: Assassin ใช้มากสุดราว 50% ส่วน Knight และ Sellsword ใช้ราว 30% — เมื่อเทียบกับวัตถุโบราณใหม่ 'Broken Sword' จะแรงกว่าตอน Rage ต่ำกว่า 200 แต่ต่ำกว่านั้น Maester Corso's Letter ยังได้เปรียบอยู่" },
                { p: "หมายเหตุ: เนื้อหาส่วนนี้เป็นการวิเคราะห์อันดับ/เมต้าจากสื่อเกม (Gamemeca) ไม่ใช่ประกาศแพตช์ทางการจาก Netmarble ตัวเลขและอันดับอาจเปลี่ยนแปลงได้ตลอดช่วงที่เหลือของซีซัน" }
            ],
            source: { label: "Gamemeca — Meca Ranking (Group Reorganization / Elite Hideout)", url: "https://www.gamemeca.com/en/view.php?gid=1778123" }
        },
        "update-0801": {
            kind: "current", icon: IC.group, date: "1 ส.ค. 2026", status: "สรุปข่าว",
            title: "สรุปซีซัน 1 สัปดาห์แรก + ประกาศปรับสกุลเงิน",
            subtitle: "Week 1 House Ranking Recap & Currency Update",
            summary: "ผลจัดอันดับตระกูลสัปดาห์แรกของ Frost and Steel (House Hornwood ขึ้นนำ) และประกาศปรับระบบสกุลเงิน Iron Bank Marks เตรียมปิดช่องทางเติมเงิน 19 ส.ค. 2026",
            body: [
                { h: "ผลจัดอันดับตระกูลสัปดาห์แรก (House Allegiance)" },
                { p: "สัปดาห์แรกของระบบเลือกตระกูล (Banner Selection) ในซีซัน 1 Frost and Steel ปิดฉากลง โดย House Hornwood คว้าอันดับ 1 ด้วยคะแนนสะสม 591,705 คะแนน ตามด้วย House Umber และ House Manderly ตามลำดับ — Hornwood ยังเป็นตระกูลที่มีผู้เลือกมากที่สุดตั้งแต่วันแรกของอัปเดต คิดเป็นราว 50% ของผู้เล่นทั้งหมด ผู้เล่นหลายคนเริ่มปรับกลยุทธ์ 'กดคะแนนไว้' ก่อนทุ่มแต้มช่วงท้ายสัปดาห์เพื่อหลบการจับตาจากตระกูลคู่แข่ง" },
                { h: "ประกาศปรับระบบสกุลเงิน Iron Bank Marks" },
                { p: "ผู้พัฒนาประกาศปรับโครงสร้างระบบสกุลเงิน — ตั้งแต่ 19 ส.ค. 2026 จะปิดช่องทางเติมเงิน (top-up) ด้วย Iron Bank Marks และหยุดขายสินค้าบางส่วนที่ซื้อด้วยสกุลเงินนี้ โดยสินค้าที่ได้รับผลกระทบบางส่วนจะปรับให้ซื้อด้วย Golden Dragon (สกุลเงินพรีเมียมหลัก) แทน ผู้เล่นที่มี Iron Bank Marks สะสมอยู่ควรวางแผนใช้ให้หมดก่อนวันที่มีผล" },
                { h: "อีเวนต์สุดสัปดาห์: Hot Time เพิ่มอัตรา 'Bronze'" },
                { p: "มีการจัดอีเวนต์ Hot Time ช่วงสุดสัปดาห์ เพิ่มอัตราได้รับวัสดุ 'Bronze' (ใช้คราฟอุปกรณ์และอัปเกรดช่อง) จากการเคลียร์คอนเทนต์ฟิลด์ 4 ประเภท ได้แก่ Faction Hideout, Ferocious Animal, Memory of Weirwood และ Smoking Shack" },
                { p: "หมายเหตุ: เนื้อหาส่วนนี้สรุป/แปลจากรายงานของสื่อเกม (Gamemeca) ยังไม่มีประกาศทางการฉบับเต็มจาก Netmarble TH ในขณะที่อัปเดตหน้านี้ — โปรดตรวจสอบประกาศในเกมอีกครั้งก่อนตัดสินใจใช้จ่ายสกุลเงิน" }
            ],
            source: { label: "Gamemeca — House Rankings / Global Talk (สัปดาห์ 1 ส.ค. 2026)", url: "https://www.gamemeca.com/en/view.php?gid=1778233" }
        },
        "patch-0729": {
            kind: "current", icon: IC.notes, date: "29 ก.ค. 2026", status: "อัปเดต",
            title: "อัปเดต 29 ก.ค. 2026",
            subtitle: "ประกาศแจ้งรายละเอียดอัปเดต (Patch Notes)",
            summary: "ขยายระดับความยากเวิลด์ Lv.5, เปิดหน้าต่างเปลี่ยนตระกูลซีซัน, เพิ่ม 'พื้นที่ไร้ขอบเขต' ในวอร์มวอล์คซีซัน พร้อมรายการปรับปรุงและแก้บั๊กหลายรายการ",
            body: [
                { h: "📌 อัปเดตหลัก" },
                { h: "ขยายระดับความยากเวิลด์" },
                { list: [
                    "เพิ่มระดับความยากเวิลด์ [Lv.5 ทหารติดอาวุธ ขั้น 3] — เงื่อนไขปลดล็อก: เคลียร์ทะลุขีดจำกัด ขั้น 5",
                    "อัตราการรับอุปกรณ์ Tier 4 ระดับตำนานในระดับความยากเวิลด์ Lv.5 เพิ่มสูงขึ้น",
                    "ปรับเพิ่มรางวัลของเวิลด์บอส 'โดรกอน เงามืด' ตามการเพิ่มระดับความยากเวิลด์ Lv.5",
                    "เพิ่มทะลุขีดจำกัด ขั้น 5 — พลังต่อสู้ที่แนะนำ 132,000 ขึ้นไป"
                ]},
                { h: "เปลี่ยนตระกูลซีซัน" },
                { list: [
                    "เปลี่ยนตระกูลได้ 1 ครั้ง ระหว่างวันที่ 29–30 ก.ค. เวลา 06:59 น. (ICT)",
                    "เมื่อเปลี่ยนตระกูล พอยต์สะสมจะถูกหัก 5%"
                ]},
                { h: "เพิ่ม 'พื้นที่ไร้ขอบเขต' ในวอร์มวอล์คซีซัน" },
                { list: [
                    "เพิ่มสเตจสุดท้ายของวอร์มวอล์คซีซัน 'พื้นที่ไร้ขอบเขต'",
                    "ในพื้นที่ไร้ขอบเขต จะนับพอยต์จากจำนวนมอนสเตอร์ที่กำจัดได้ภายในเวลาที่กำหนด"
                ]},
                { h: "📌 รายการปรับปรุง" },
                { h: "ปรับปรุงฟิลด์" },
                { list: [
                    "ปรับให้สามารถกำจัดหมี มอนสเตอร์หายากได้ซ้ำทุกวัน",
                    "เพิ่มสูตรคราฟต์ 'ถุงเหรียญทองแดง' ที่ผลิตได้ด้วยหนังทนทานที่โรงงานช่างทำคอสตูม"
                ]},
                { h: "ปรับปรุงการต่อสู้" },
                { list: [
                    "เพิ่มท่าทางเตือนล่วงหน้าให้กับรูปแบบการโจมตีของมอนสเตอร์พลระเบิดบางส่วน",
                    "[แท่นบูชาแห่งห้วงลึก] ลบคัตซีนเมื่อโดนโจมตีด้วยหนวดบางรูปแบบของคราเคนแห่งชายหาดหมู่เกาะเหล็ก"
                ]},
                { h: "ปรับปรุงกิจกรรม" },
                { list: [
                    "ปรับเงื่อนไขปลดล็อกกิจกรรมบางรายการ จากเดิมที่ต้องมีตัวละครเลเวล 10 เป็นเคลียร์เควสต์หลักของบัญชี 'เอพพิโซด III: ผืนดินที่ถูกปกคลุมด้วยน้ำค้างแข็งสีเลือด'"
                ]},
                { h: "ปรับปรุงความสะดวกในการใช้งาน (UX/UI)" },
                { list: [
                    "เพิ่มข้อความแนะนำในทูลทิปไอเทมกล่องอะไหล่อุปกรณ์ว่า 'ได้รับอะไหล่อุปกรณ์ที่ตรงกับคลาสที่ใช้งานอยู่'",
                    "แก้ไขคำอธิบายสกิลของวัตถุโบราณ 'ไข่มังกรที่เย็นลง' ให้เงื่อนไขการทำงานเข้าใจง่ายและชัดเจนยิ่งขึ้น",
                    "เพิ่มฟังก์ชันปุ่มทางลัดไปยังมิชชันกิจกรรมพื้นที่ในเมนู [ซีซันพาส] > [มิชชันรายสัปดาห์]"
                ]},
                { h: "📌 รายการแก้ไขปัญหา" },
                { list: [
                    "แก้ไขปัญหาที่เมื่อตัวละครเสียชีวิตระหว่างเล่นแหล่งกบดานชั้นยอดซีซัน: เรดร็อกเซปทรี จะถูกย้ายไปยังพื้นที่ของบอสตัวสุดท้าย",
                    "แก้ไขปัญหาที่บางครั้งค่าพลังต่อสู้รวมในข้อมูลตัวละครแสดงผลไม่ตรงกับค่าจริง",
                    "แก้ไขปัญหาที่หน้าจอแรงก์ไม่แสดงผลในบางครั้ง",
                    "แก้ไขปัญหาที่ชื่อสินค้าการค้าและไอคอนแยกประเภทของกล่องเลือก/กล่องสุ่มในตลาดแลกเปลี่ยนแสดงผลซ้อนทับกัน"
                ]}
            ],
            source: { label: "Netmarble TH — ประกาศอัปเดต 29 ก.ค.", url: "https://forum.netmarble.com/got_th/view/4/211" }
        },
        "frost-and-steel": {
            kind: "current", icon: IC.season, date: "15 ก.ค. 2026", status: "ซีซัน • สัปดาห์สุดท้าย",
            title: "Season 1: Frost and Steel",
            subtitle: "The North Bannerman Qualifiers",
            summary: "ซีซันแรกอย่างเป็นทางการหลังเกมเปิด สงครามตระกูลกลางแดนเหนือขณะ Ironborn บุก รัน 6 สัปดาห์ พร้อมระบบ House Allegiance และกลไกต่อสู้ใหม่ — จบซีซัน 6:00 น. วันที่ 19 ส.ค. 2026",
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
                { h: "North Bannerman Duel Festival (เปิดแล้ว 22 ก.ค. 2026)" },
                { p: "เปิดให้เล่นแล้ววันนี้ — โหมดดวล 1v1 กับ NPC Bannerman Champion จากตระกูลอื่น — เป็นประสบการณ์แบบ 'PvE-like PvP' ที่ศัตรูเล่นต่างจาก NPC ทั่วไป ทั้งการหลบและ Parry รูปแบบเป็นทัวร์นาเมนต์ 3 รอบแบบ Time Attack เจอ House Champion หลายด่านแข่งกับเวลา พร้อมอีเวนต์ประจำภูมิภาครายวัน รางวัลเป็น Growth Rewards และ Season Token (หมายเหตุ: กิจกรรมนี้เปิดเฉพาะภูมิภาค APAC)" },
                { h: "กลไกต่อสู้ใหม่: Burning Battle Spirit" },
                { p: "สะสม Battle Spirit จากการโจมตีศัตรู สะสมอะดรีนาลีนจนเต็ม แล้วปลดปล่อยเป็นสกิลพิเศษพลังสูงที่สร้างความเสียหายรุนแรงและฟื้นฟูพลังชีวิต" },
                { h: "Battle Pass" },
                { p: "Battle Pass ประจำซีซัน “Ripples of the Open Sea” สะสมความคืบหน้าเพื่อปลดรางวัลตามระดับ" },
                { h: "จบซีซัน 19 ส.ค. 2026" },
                { p: "Season 1: Frost and Steel จะปิดฉากอย่างเป็นทางการเวลา 6:00 น. ของวันที่ 19 ส.ค. 2026 ตามด้วยช่วงพักซีซัน 2 สัปดาห์ก่อนเริ่มซีซันถัดไป — ตรงกับวันที่อัปเดตใหญ่ Westerlands & Casterly Rock (ดูหัวข้อ 'อัปเดตใหญ่ Westerlands & Casterly Rock' ในส่วนแผนพัฒนา)" }
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
            kind: "plan", icon: IC.scroll, date: "19 ส.ค. 2026 (ยืนยันวันที่แล้ว)", status: "ประกาศกำหนดการแล้ว",
            title: "อัปเดตใหญ่ Westerlands & Casterly Rock (19 ส.ค. 2026)",
            subtitle: "เนื้อเรื่องบทที่ 4 + ขยับเพดานเลเวล + ปรับสกุลเงิน",
            summary: "Netmarble ยืนยันวันที่อัปเดตใหญ่ถัดไป 19 ส.ค. 2026 — พื้นที่ใหม่ Westerlands (Lannisport, Casterly Rock) เนื้อเรื่องบทที่ 4 ตระกูล Lannister พบ Tywin, Jaime และ Tyrion ปลดล็อกระดับความยากเวิลด์ 6-7 อุปกรณ์ Tier 5 วอร์มโรดถาวรขยายเป็น 45 ชั้น พร้อมยกเลิก Iron Bank Coin เปลี่ยนเป็น Dragon Gold ที่หาได้จากการเล่น",
            body: [
                { p: "ตามสารจากผู้พัฒนา 'Developer Note: 2026 Update Preview' บน Netmarble Forum ยืนยันวันที่อัปเดตใหญ่ถัดไปคือ 19 ส.ค. 2026 (นับเป็นอัปเดตใหญ่หลัง Season 1: Frost and Steel) — ข้อมูลด้านล่างมาจากประกาศล่วงหน้าและรายงานสื่อเกม (Gamemeca) อาจมีรายละเอียดปลีกย่อยเปลี่ยนแปลงได้ก่อนแพตช์จริง" },
                { h: "พื้นที่ใหม่: Westerlands" },
                { p: "เปิดภูมิภาค Westerlands ดินแดนที่ร่ำรวยทองคำและเงินที่สุดของ Westeros มาพร้อมเมือง 'Lannisport' และป้อมปราการ 'Casterly Rock' ที่ไม่เคยถูกตีแตก" },
                { h: "เนื้อเรื่องบทที่ 4 — House Lannister" },
                { p: "เนื้อเรื่องบทใหม่เริ่มต้นด้วยฮีโร่ถูกจองจำใน Casterly Rock ภายใต้การปกครองของ House Lannister ปูทางความขัดแย้งใหม่ต่อจากเนื้อเรื่องหลักที่ผ่านมา ตัวละครสำคัญที่จะปรากฏตัว ได้แก่ Tywin Lannister (ผู้ปกครอง Westerlands), Jaime Lannister (Kingslayer ที่เคยเจอในเนื้อเรื่องก่อนหน้า) และ Tyrion Lannister — เกมจะเล่าเรื่องราวเบื้องหลังของ Tyrion ในมุมที่นิยายและซีรีส์ต้นฉบับไม่เคยพูดถึงมาก่อน" },
                { h: "ขยับเพดานเลเวล: Tier 5 + ระดับความยาก 6-7" },
                { list: [
                    "ปลดล็อกระดับความยากเวิลด์ (World Difficulty) 6 และ 7",
                    "เพิ่มอุปกรณ์ระดับ Tier 5 (จากปัจจุบันสูงสุด Tier 4)",
                    "คอนเทนต์ท้าทายใหม่: 'Challenge Worm Road' และดันเจียน Limit Break",
                    "วอร์มโรดถาวร (permanent Worm Road) ขยายเพิ่ม 10 ชั้น รวมเป็น 45 ชั้น — ทีมงานวางแผนเพิ่มชั้นวอร์มโรดอีก 5 ชั้นทุกครั้งที่ระดับความยากเวิลด์ขยับขึ้น 1 ระดับ"
                ]},
                { h: "ปรับระบบสกุลเงิน: เลิก Iron Bank Coin → Dragon Gold" },
                { p: "สอดคล้องกับประกาศปิดช่องทางเติมเงิน Iron Bank Marks ตั้งแต่ 19 ส.ค. 2026 ที่แจ้งไว้ก่อนหน้า — รายงานล่าสุดระบุว่า Iron Bank Coin (สกุลเงินที่เดิมได้จากการซื้อเท่านั้น) จะถูกยกเลิก แทนที่ด้วย 'Dragon Gold' ที่หาได้จากการเล่นเกม พร้อมปรับอัตราการได้รับ Dragon Gold ให้สูงขึ้น สินค้าบางส่วนที่เคยซื้อด้วย Iron Bank Coin เช่น ชุดคอสตูม 'Salt Reef', 'Scoundrel' และม้าอีก 3 แบบ จะย้ายมาซื้อด้วย Dragon Gold แทน" },
                { p: "รายงานล่าสุดยังยืนยันด้วยว่าซีซันปกติ (regular season) จะปรับให้สั้นลงเหลือ 4 สัปดาห์ (จากเดิม 6 สัปดาห์ของ Frost and Steel) เพื่อลดความล้าของผู้เล่น — ยังไม่มีประกาศทางการฉบับเต็มจาก Netmarble TH ณ ขณะอัปเดตหน้านี้ ควรตรวจสอบอีกครั้งเมื่อใกล้วันที่ 19 ส.ค." },
                { h: "เตรียมตัวก่อนอัปเดต" },
                { p: "คำแนะนำจากสื่อเกม: เก็บสะสม RP และโควตากิจกรรมรายวันไว้ล่วงหน้า เพราะระดับความยากที่สูงขึ้นต้องใช้ RP จำนวนมากในการฟาร์มอุปกรณ์ Tier 5 และควรเคลียร์ 'วอร์มวอล์คซีซัน' (Season Worm Road) ให้จบสเตจสุดท้าย 'พื้นที่ไร้ขอบเขต' (Infinite Space) ก่อนอัปเดต เพื่อรับพิมพ์เขียวอุปกรณ์ระดับตำนาน (Legendary) Tier 4" }
            ],
            source: { label: "Netmarble Forum — Developer Note: 2026 Update Preview / Gamemeca", url: "https://forum.netmarble.com/got/view/12/216" }
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
        },
        "hard-mode": {
            kind: "plan", icon: IC.flame, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "Hard Mode (โหมดยาก)",
            subtitle: "ความท้าทายสำหรับผู้เล่นระดับสูง",
            summary: "โหมดความยากใหม่ที่ออกแบบมาทดสอบฝีมือผู้เล่นที่ช่ำชอง ต้องวางแผนเชิงกลยุทธ์ระดับสูงเพื่อผ่าน",
            body: [
                { p: "ผู้พัฒนาประกาศเพิ่ม Hard Mode โหมดความยากใหม่ที่ออกแบบมาเพื่อทดสอบความชำนาญของผู้เล่นระดับสูงโดยเฉพาะ" },
                { p: "โหมดนี้จะต้องอาศัยการวางแผนเชิงกลยุทธ์ระดับสูงเพื่อเอาชนะ เหมาะกับผู้เล่นที่มองหาความท้าทายเพิ่มเติมหลังผ่านคอนเทนต์หลัก" }
            ],
            source: { label: "Developer Note: 2026 Update Preview", url: "https://forum.netmarble.com/got/view/12/216" }
        },
        "artifact-jewelry-rework": {
            kind: "plan", icon: IC.gem, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "รื้อระบบวัตถุโบราณ & เครื่องประดับ",
            subtitle: "Artifact & Jewelry Rework",
            summary: "ออกแบบวิธีได้มาและโครงสร้างของระบบ Artifact และ Jewelry ใหม่ทั้งหมด ให้เข้าใจเส้นทางการเติบโตได้ง่ายและเป็นระบบขึ้น",
            body: [
                { p: "ในสารจากผู้พัฒนา 'Major Update Plans and Updated Timeline' ทีมงานยอมรับถึงความล่าช้าของอัปเดตที่ผ่านมา และประกาศแผนหลักหลายอย่างพร้อมกรอบเวลาที่อัปเดตใหม่เป็นครั้งแรก" },
                { h: "ปรับโครงสร้างการเติบโตให้เข้าใจง่าย" },
                { p: "ทีมงานจะรื้อวิธีการได้มา (acquisition) และโครงสร้างของระบบวัตถุโบราณ (Artifact) และเครื่องประดับ (Jewelry) ใหม่ทั้งหมด เพื่อให้ผู้เล่นเข้าใจเส้นทางการเติบโตได้ชัดเจนและเป็นเหตุเป็นผลมากขึ้น" },
                { p: "รวมถึงการปรับปรุงระบบการรีไฟน์ (refining) และภาพรวมของโครงสร้างทั้งหมด" },
                { p: "หมายเหตุ: ทุกอย่างยังอยู่ระหว่างการพัฒนาและอาจเปลี่ยนแปลงก่อนปล่อยจริง รายละเอียดสุดท้ายจะประกาศผ่านประกาศทางการในภายหลัง" }
            ],
            source: { label: "Developer's Note: Major Update Plans and Updated Timeline", url: "https://store.steampowered.com/news/app/3183280/view/637963704478990405" }
        },
        "market-system": {
            kind: "plan", icon: IC.store, date: "แผนพัฒนา", status: "ยังไม่เข้าเกม",
            title: "ระบบตลาดซื้อขาย",
            subtitle: "Market System",
            summary: "ระบบตลาดเต็มรูปแบบ ให้ผู้เล่นซื้อขายแลกเปลี่ยนทรัพยากรและวัสดุระหว่างกันได้",
            body: [
                { p: "ผู้พัฒนาประกาศแผนเพิ่มระบบตลาด (Market System) เต็มรูปแบบ ที่ให้ผู้เล่นซื้อขายแลกเปลี่ยนทรัพยากรและวัสดุระหว่างกันได้" },
                { p: "ระบบนี้จะช่วยให้เศรษฐกิจในเกมมีชีวิตชีวาขึ้น ผู้เล่นสามารถหาของที่ขาดและปล่อยของที่เหลือได้สะดวกกว่าเดิม" },
                { p: "หมายเหตุ: ยังอยู่ระหว่างการพัฒนาและอาจเปลี่ยนแปลงก่อนปล่อยจริง" }
            ],
            source: { label: "Developer's Note: Major Update Plans and Updated Timeline", url: "https://store.steampowered.com/news/app/3183280/view/637963704478990405" }
        }
    };

    const CURRENT = ["update-0815", "patch-0808", "update-0807", "update-0801", "patch-0729", "frost-and-steel", "global-launch"];
    const PLAN = ["story-chapter-4", "artifact-jewelry-rework", "market-system", "harrenhal-pve", "graphics-rework", "hard-mode"];

    /* ============================================================
       ตัวเรนเดอร์ (ไม่ต้องแก้)
    ============================================================ */

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
            if (window.gkUpdatePageMeta) gkUpdatePageMeta({
                title: u.title + " | Game of Thrones: Kingsroad TH",
                description: u.summary,
                path: "roadmap-article.html?id=" + encodeURIComponent(id)
            });
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
