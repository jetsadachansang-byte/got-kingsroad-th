/* ============================================================
   guides.js — ระบบคู่มือแบบแยกหมวดหมู่ (แก้เนื้อหาคู่มือที่นี่ที่เดียว)

   โครงสร้าง 2 ชั้น:
     guide.html          → หน้ารวม แยกเป็นหมวดหมู่ แต่ละหมวดมีการ์ดคู่มือ
     guide-article.html  → หน้าอ่านคู่มือแต่ละบท (อ่านค่า ?id=)

   ✏️ เพิ่มคู่มือใหม่: เพิ่มใน GUIDES แล้วใส่ id ลงในหมวดที่ต้องการใน CATEGORIES
============================================================ */

(function () {

    /* ---------- ไอคอน SVG ที่ใช้ซ้ำ ---------- */
    const IC = {
        start:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
        power:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
        gear:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/></svg>',
        boss:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="m12.5 17-.5-1-.5 1h1z"/></svg>',
        combat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
        gift:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8"/></svg>',
        sword:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>',
        shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
        map:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.1 6 9 3 4 5v13l5-2 5.9 3 5.1-2V4l-5 2Z"/><path d="M9 3v13"/><path d="M15 6v13"/></svg>',
        coin:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/><path d="m16.7 13.9.7.7-2.8 2.8"/></svg>',
        group:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        flame:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
        amulet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v5"/><path d="M8 5h8"/><path d="M12 8a6 6 0 1 0 6 6 6 6 0 0 0-6-6z"/><path d="m12 11 1.2 2.5 2.8.3-2 2 .5 2.7L12 19l-2.5 1.5.5-2.7-2-2 2.8-.3z"/></svg>',
        swap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 6h18"/><path d="m7 22-4-4 4-4"/><path d="M21 18H3"/></svg>',
        twitch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2z"/><path d="M11 11V7"/><path d="M16 11V7"/></svg>'
    };

    /* ---------- คู่มือทั้งหมด (เพิ่ม/แก้เนื้อหาที่นี่) ---------- */

    const GUIDES = {
        "intro": {
            icon: IC.start, tag: "เริ่มต้น", read: "5 นาที",
            title: "เริ่มต้นเล่น Game of Thrones: Kingsroad",
            summary: "ปูพื้นฐานทุกอย่างที่ผู้เล่นใหม่ต้องรู้ ตั้งแต่เนื้อเรื่อง อาชีพ ไปจนถึงค่าพลัง Momentum",
            body: [
                { p: "Game of Thrones: Kingsroad เป็นเกม Action RPG ที่ให้คุณสวมบทตัวละครในดินแดน Westeros เดินทางตามเส้นทางสายกษัตริย์ (Kingsroad) ผ่านเนื้อเรื่องหลักที่เชื่อมโยงกับตระกูลใหญ่ต่าง ๆ" },
                { h: "3 สิ่งที่ควรทำในวันแรก" },
                { list: [
                    "เดินเนื้อเรื่องหลัก (Main Quest) เป็นแกนหลัก เพราะให้ทั้งเลเวล อุปกรณ์ และปลดล็อกระบบต่าง ๆ",
                    "เลือกอาชีพให้เข้ากับสไตล์การเล่น: Knight (แทงก์/เล่นง่าย), Assassin (เร็ว/ดาเมจสูง), Sellsword (โจมตีหนัก)",
                    "เข้า Alliance ให้เร็วที่สุด เพื่อรับโบนัสตัวคูณ Momentum ช่วยให้โตไวขึ้น"
                ]},
                { h: "Momentum คืออะไร" },
                { p: "Momentum คือค่าพลังรวมของตัวละคร คำนวณจากคุณภาพอุปกรณ์ การตีบวก (Refinement) กระดาน Sigil, Artifact, เครื่องประดับ, Trait และ Skill รวมเป็นตัวเลขเดียว ใช้เป็นเงื่อนไขปลดล็อกคอนเทนต์เกือบทั้งหมด อ่านละเอียดในคู่มือ “เข้าใจระบบ Momentum”" }
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/beginner-guide" }
        },
        "choose-class": {
            icon: IC.sword, tag: "เริ่มต้น", read: "4 นาที",
            title: "เลือกอาชีพให้เหมาะกับคุณ",
            summary: "เทียบจุดแข็ง จุดอ่อน และสไตล์การเล่นของทั้ง 3 อาชีพ ก่อนตัดสินใจ",
            body: [
                { h: "Knight — Frontline / แทงก์" },
                { p: "อึดที่สุดในเกม เกราะหนา ยืนแนวหน้ารับดาเมจแทนทีม มีท่า Riposte Stance สวนกลับศัตรูมนุษย์อัตโนมัติ เล่นง่ายและครอบคลุมคอนเทนต์กว่า 90% ของเกม เหมาะกับมือใหม่" },
                { h: "Assassin — Burst Damage / ความเร็ว" },
                { p: "พลังโจมตีสูงที่สุด ใช้มีดคู่ระเบิดดาเมจใส่บอสในพริบตา ฟาร์มไว แต่ตัวบางต้องหลบให้แม่นยำ เหมาะกับผู้เล่นที่ชอบความเร็วและการทำคะแนน" },
                { h: "Sellsword — Heavy Hitter / คอมโบหนัก" },
                { p: "อาวุธใหญ่ ดาเมจต่อเป้าเดี่ยวมหาศาล คอมโบไม่ถูกขัดจังหวะด้วย Hit-Stun Immunity ช้าแต่ฟาดทีเดียวสะเทือน เหมาะกับคนชอบการต่อสู้แบบหนักแน่น" },
                { p: "ดูสกิลและแนวทางจัด Build เต็ม ๆ ได้ที่หน้าอาชีพ" }
            ],
            source: { label: "หน้าอาชีพในเว็บนี้", url: "classes.html" }
        },
        "combat-basics": {
            icon: IC.combat, tag: "เริ่มต้น", read: "5 นาที",
            title: "พื้นฐานการต่อสู้ที่ต้องเข้าใจ",
            summary: "ระบบต่อสู้ 3 อย่างที่เชื่อมกัน: ประเภทการโจมตี การป้องกัน และเกจ Daze",
            body: [
                { h: "ประเภทการโจมตีของศัตรู" },
                { list: [
                    "การโจมตีปกติ (สีขาว) — บล็อกหรือ Parry ได้",
                    "การโจมตีสีเหลือง — Parry ไม่ได้ตามปกติ ต้อง “หลบ (Dodge)” เท่านั้น (ยกเว้นบางบิลด์ เช่น Knight ชุด Sentinel)",
                    "การโจมตีสีแดง/พิเศษ — โจมตีหนัก ควรหลบให้พ้นระยะ"
                ]},
                { h: "การป้องกันและ Parry" },
                { p: "จับจังหวะ Parry ให้พอดีจะสวนกลับและเปิดช่องโจมตี ใช้ได้ผลดีมากกับศัตรูมนุษย์ ส่วนการหลบใช้กับการโจมตีที่ Parry ไม่ได้" },
                { h: "เกจ Daze (มึนงง)" },
                { p: "การโจมตีต่อเนื่องจะสะสมเกจ Daze ของศัตรู เมื่อเต็มศัตรูจะมึนงงเปิดโอกาสให้ปล่อยคอมโบหรือสกิลแรง ๆ ใส่เต็มที่ เข้าใจสามระบบนี้แล้วทุกการต่อสู้จะง่ายขึ้นมาก" }
            ],
            source: { label: "gamingonphone.com", url: "https://gamingonphone.com/guides/game-of-thrones-kingsroad-beginners-guide-and-tips/" }
        },
        "momentum": {
            icon: IC.power, tag: "การเติบโต", read: "6 นาที",
            title: "เข้าใจระบบ Momentum และวิธีทะลุกำแพง",
            summary: "Momentum คือค่าพลังรวมที่ควบคุมความคืบหน้าทั้งหมด รู้ทันก่อนชนกำแพงในสัปดาห์แรก",
            body: [
                { p: "Momentum รวมทุกอย่างของตัวละครเป็นตัวเลขเดียว ได้แก่ คุณภาพอุปกรณ์ การตีบวก (Refinement) กระดาน Sigil, Artifact, เครื่องประดับ, Trait และ Skill" },
                { h: "กำแพง Momentum (Momentum Wall)" },
                { p: "ผู้เล่นเกือบทุกคนจะเจอ “กำแพง Momentum” ภายในสัปดาห์แรก ซึ่งเกิดจากการที่เลเวลแซงหน้าอุปกรณ์ ทำให้ค่าพลังจริงตกและได้ Momentum จากการต่อสู้น้อยลง" },
                { h: "วิธีเพิ่ม Momentum อย่างมีประสิทธิภาพ" },
                { list: [
                    "อัปเกรด/เปลี่ยนอุปกรณ์ให้ทันเลเวลเสมอ อย่าให้ตกรุ่น",
                    "ตีบวก (Refinement) และใส่ Sigil / Artifact / เครื่องประดับให้ครบ",
                    "กระจาย Trait และ Skill point ตามอาชีพ",
                    "เข้า Alliance ที่แอ็กทีฟเพื่อรับตัวคูณ Momentum",
                    "เล่นคอนเทนต์ที่ให้วัสดุอัปเกรด เช่น World Boss และดันเจียนระดับสูง"
                ]}
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/how-to-level-fast" }
        },
        "level-fast": {
            icon: IC.power, tag: "การเติบโต", read: "4 นาที",
            title: "อัปเลเวลไว ไม่เสียเวลา",
            summary: "ใช้เนื้อเรื่องหลักเป็นแกน เก็บของข้างทาง และลดเวลาสูญเปล่า",
            body: [
                { h: "หลักการ" },
                { list: [
                    "เดินเนื้อเรื่องหลัก (Main Story) เป็นแกนความคืบหน้า",
                    "เก็บเป้าหมายเสริม (Side Objective) ที่อยู่ระหว่างทางเท่านั้น อย่าอ้อม",
                    "อย่าฟาร์มมั่วแบบสุ่ม เพราะได้ผลตอบแทนต่ำ",
                    "ลดเวลาสูญเปล่าจากการตาย การกลับไปจัดกระเป๋า และการตั้งค่าที่ไม่ดี",
                    "รักษาอุปกรณ์และ Momentum ไม่ให้ตามหลังเลเวล"
                ]},
                { p: "แนวคิดหลักคือ “เล่นสม่ำเสมอและมีประสิทธิภาพ” ดีกว่าการหักโหมฟาร์มแบบไร้ทิศทาง" }
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/how-to-level-fast" }
        },
        "gold-farm": {
            icon: IC.coin, tag: "การเติบโต", read: "4 นาที",
            title: "ฟาร์มทองและทรัพยากร",
            summary: "แหล่งรายได้หลัก การขายของใน Marketplace และการใช้เครื่องคำนวณ",
            body: [
                { h: "แหล่งทองหลัก" },
                { list: [
                    "เควสหลักและเควสรายวัน/รายสัปดาห์",
                    "ดันเจียนและ World Boss ที่ดรอปวัสดุมีค่า",
                    "ขายวัสดุส่วนเกินและของหายากใน Marketplace"
                ]},
                { h: "อย่าลืมเรื่องภาษี" },
                { p: "การขายใน Marketplace มีภาษีหัก ควรคำนวณกำไรสุทธิก่อนตั้งราคา ใช้เครื่องคำนวณในเว็บนี้ช่วยได้ทั้งภาษี เวลาฟาร์ม และกำไรการขาย" }
            ],
            source: { label: "เครื่องคำนวณในเว็บนี้", url: "calculator.html" }
        },
        "alliance": {
            icon: IC.group, tag: "การเติบโต", read: "3 นาที",
            title: "เข้า Alliance รับโบนัส Momentum",
            summary: "การอยู่ Alliance ที่แอ็กทีฟช่วยเร่งความคืบหน้าอย่างเห็นได้ชัด",
            body: [
                { p: "Alliance ให้โบนัสตัวคูณ Momentum ที่ช่วยให้เส้นทางการเติบโตราบรื่นขึ้น และปลดล็อกคอนเทนต์แบบร่วมมือ" },
                { h: "เคล็ดลับ" },
                { list: [
                    "เลือก Alliance ที่มีสมาชิกแอ็กทีฟและช่วยกิจกรรมประจำวัน",
                    "ร่วมกิจกรรม Alliance และ Co-op Mission เพื่อรับรางวัลเสริม",
                    "ใช้ Alliance Shop แลกไอเทมที่ต้องใช้เงื่อนไข (ระบบข้อความแจ้งเตือนถูกปรับให้ชัดเจนขึ้นในอัปเดต 21 ม.ค.)"
                ]}
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/beginner-guide" }
        },
        "gear": {
            icon: IC.gear, tag: "อุปกรณ์", read: "5 นาที",
            title: "อุปกรณ์ เซ็ต และการอัปเกรด",
            summary: "ทำความเข้าใจ Tier, Refinement และการเลือกเซ็ตให้เหมาะกับอาชีพ",
            body: [
                { h: "ระดับอุปกรณ์ (Tier)" },
                { p: "อุปกรณ์ปลายเกมเน้น Legendary Tier สูง ปัจจุบันมีถึง Tier 7 ซึ่งดรอปจากคอนเทนต์ยากอย่าง Hedge Knight III เก็บวัสดุคราฟและตีบวกอย่างสม่ำเสมอเพื่อไม่ให้ Momentum ตก" },
                { h: "เลือกเซ็ตตามอาชีพ" },
                { list: [
                    "Knight: Champion (คริติคอล) หรือ Sentinel (เพิ่ม Parry เมื่อเล่น Worm Walks)",
                    "Assassin: Sav ช่วงต้น แล้วเปลี่ยนเป็น Champion ช่วงท้าย",
                    "Sellsword: Champion (Critical Rate) หรือ Brute (PvE)"
                ]},
                { p: "ดูแนวทาง Build ละเอียดของแต่ละอาชีพได้ที่หน้าอาชีพ" }
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/equipment-gear-guide" }
        },
        "amulet": {
            icon: IC.amulet, tag: "อุปกรณ์", read: "3 นาที",
            title: "ระบบ Amulet (เครื่องราง)",
            summary: "ระบบเสริมพลังใหม่จากอัปเดต The Drowned God Wakes",
            body: [
                { p: "Amulet เป็นระบบเสริมความแข็งแกร่งและปรับแต่งบิลด์ที่เพิ่มเข้ามาพร้อม Kraken Raid" },
                { h: "รายละเอียด" },
                { list: [
                    "มีทั้งหมด 9 ชิ้น แบ่งเป็น Rare 3, Epic 3 และ Legendary 3",
                    "ทุกชิ้นมีเอฟเฟกต์ตายตัว (Fixed) หนึ่งอย่าง",
                    "และมีเอฟเฟกต์สุ่ม (Random) เพิ่มตามระดับความหายาก — ยิ่งหายากยิ่งได้เอฟเฟกต์สุ่มมาก",
                    "เลือกเอฟเฟกต์ให้เข้ากับอาชีพและบิลด์ของคุณเพื่อเพิ่ม Momentum"
                ]}
            ],
            source: { label: "6/26 Update Notes", url: "https://forum.netmarble.com/got/view/4/110" }
        },
        "build": {
            icon: IC.shield, tag: "อุปกรณ์", read: "4 นาที",
            title: "จัด Trait, Artifact และคอมโบ",
            summary: "หลักการกระจายค่าและเลือก Artifact ให้ดาเมจพุ่ง",
            body: [
                { h: "Trait" },
                { p: "เน้น Attack Power และ Critical Damage เป็นหลัก ปรับตามอาชีพ เช่น Knight เพิ่ม Parry เมื่อเล่น Worm Walks, Assassin เน้น Critical Rate/Combo Damage, Sellsword เน้น Critical Damage" },
                { h: "Artifact" },
                { list: [
                    "Legendary Active Artifact เพิ่มดาเมจระเบิด",
                    "Passive Artifact เลือกตามบิลด์ เช่น Life Steal สำหรับ Beyond the Wall หรือ Destruction Damage สำหรับ Sellsword"
                ]},
                { p: "คอมโบและสกิลเด่นของแต่ละอาชีพดูได้ครบที่หน้าอาชีพ" }
            ],
            source: { label: "หน้าอาชีพในเว็บนี้", url: "classes.html" }
        },
        "drogon": {
            icon: IC.boss, tag: "บอส", read: "4 นาที",
            title: "Drogon World Boss",
            summary: "บอสโลกที่เกิดเป็นเวลา ให้รางวัลสกุลเงินพรีเมียมและวัสดุหายาก",
            body: [
                { h: "ตำแหน่งและเวลาเกิด" },
                { p: "Drogon เป็น World Boss ที่เกิดทุก ๆ 2 ชั่วโมง บริเวณมุมตะวันออกเฉียงใต้ของ Winterfell เตรียมทีมให้พร้อมก่อนถึงเวลาเกิด" },
                { h: "รางวัล" },
                { list: [
                    "Golden Dragons (สกุลเงินพรีเมียม)",
                    "วัสดุคราฟหายาก",
                    "อุปกรณ์ระดับสูง"
                ]},
                { p: "อัปเดตล่าสุดยังเพิ่มระดับความยากใหม่ของ Drogon สำหรับผู้เล่นที่แข็งแกร่งขึ้น" }
            ],
            source: { label: "gamesofthrones.org", url: "https://www.gamesofthrones.org/guides/drogon-world-boss" }
        },
        "kraken": {
            icon: IC.map, tag: "บอส", read: "5 นาที",
            title: "Kraken Raid — บอสเรดตัวแรก",
            summary: "อสูรทะเลแห่ง Iron Islands ในโหมด Raid แบบร่วมมือจากอัปเดต The Drowned God Wakes",
            body: [
                { p: "Kraken คือ Raid Boss อย่างเป็นทางการตัวแรกของเกม อสูรทะเลขนาดมหึมาจากตำนาน A Song of Ice and Fire ที่สามารถจมเรือทั้งลำได้" },
                { h: "จุดเด่นของโหมด Raid" },
                { list: [
                    "เป็นความท้าทายแบบร่วมมือ (Co-op) รวมทีมเพื่อปราบ Kraken",
                    "ต่อสู้กลางทะเล ต้องอาศัยการประสานทีมและเข้าใจกลไกเฉพาะ",
                    "ให้รางวัลมีค่าสำหรับผู้เล่นปลายเกม"
                ]},
                { p: "มาพร้อมพื้นที่ใหม่และระบบ Amulet ในอัปเดตคอนเทนต์ใหญ่แรกของเกม" }
            ],
            source: { label: "gamingonphone.com", url: "https://gamingonphone.com/news/game-of-thrones-kingsroad-first-content-update-the-drowned-god-wakes" }
        },
        "hedge-knight": {
            icon: IC.shield, tag: "บอส", read: "3 นาที",
            title: "Hedge Knight III — ความยากระดับสูงสุด",
            summary: "ระดับความยากโลกใหม่จากอัปเดต 21 ม.ค. 2026 พร้อมดรอป Tier 7",
            body: [
                { h: "เงื่อนไขปลดล็อก" },
                { p: "ต้องมี Momentum ตั้งแต่ 280,000 ขึ้นไป จึงจะเข้าเล่นระดับความยากโลก Hedge Knight III ได้" },
                { h: "รางวัล" },
                { list: [
                    "เพิ่มโอกาสได้อุปกรณ์ Tier 7 Legendary",
                    "เพิ่มโอกาสได้วัสดุคราฟระดับสูง",
                    "เพิ่มโอกาสได้เครื่องประดับ (Jewelry) ระดับสูง",
                    "ได้รางวัลวัสดุเพิ่มเติมจากด่านปกติ"
                ]},
                { p: "อัปเดตเดียวกันยังเพิ่มภารกิจแบบ Co-op เข้ามาด้วย" }
            ],
            source: { label: "1/21 Update Notes", url: "https://forum.netmarble.com/got/view/4/226" }
        },
        "burning-spirit": {
            icon: IC.flame, tag: "ระบบใหม่", read: "3 นาที",
            title: "Burning Battle Spirit — กลไกต่อสู้ใหม่",
            summary: "ระบบสะสมพลังใจสู้รบเพื่อปลดปล่อยการระเบิดพลังในซีซัน 1",
            body: [
                { p: "Burning Battle Spirit เป็นกลไกการต่อสู้ใหม่ที่มาพร้อมซีซัน 1 ให้ผู้เล่นสะสม “Battle Spirit” จากการโจมตีศัตรู" },
                { h: "การทำงาน" },
                { list: [
                    "โจมตีศัตรูต่อเนื่องเพื่อสะสม Battle Spirit",
                    "สะสมอะดรีนาลีนจนถึงจุดสูงสุด",
                    "ปลดปล่อยการระเบิดพลังที่สร้างความเสียหายรุนแรงต่อศัตรูรอบข้าง"
                ]},
                { p: "เหมาะกับการเปิดวงหรือจัดการศัตรูเป็นกลุ่มในจังหวะสำคัญ" }
            ],
            source: { label: "screenrant.com", url: "https://screenrant.com/game-of-thrones-kingsroad-season-1-july-15/" }
        },
        "weapon-switching": {
            icon: IC.swap, tag: "ระบบใหม่", read: "3 นาที",
            title: "ระบบสลับอาวุธ (กำลังพัฒนา)",
            summary: "ฟีเจอร์ในแผนปี 2026 ที่จะเพิ่มจำนวนสกิลที่ใช้ได้อย่างมาก",
            body: [
                { p: "ระบบสลับอาวุธกลางการต่อสู้เป็นหนึ่งในฟีเจอร์ใหญ่ตามแผนพัฒนาปี 2026" },
                { h: "รายละเอียดที่ทีมงานเปิดเผย" },
                { list: [
                    "สลับอาวุธได้ระหว่างต่อสู้",
                    "อาวุธแต่ละชิ้นเปิดชุดสกิลแยกที่มีช่องและคูลดาวน์ของตัวเอง",
                    "เพิ่มจำนวนสกิลรวมที่ใช้ได้อย่างมาก เปิดแนวทางเล่นใหม่ ๆ"
                ]},
                { p: "ติดตามความคืบหน้าเพิ่มเติมได้ที่หน้า Roadmap" }
            ],
            source: { label: "Developer Note: 2026 Update Preview", url: "https://forum.netmarble.com/got/view/12/216" }
        },
        "events": {
            icon: IC.calendar, tag: "อีเวนต์", read: "4 นาที",
            title: "อีเวนต์ล่าสุด",
            summary: "รวมกิจกรรมที่กำลังจัดและกำลังจะมาถึง อัปเดตตามประกาศทางการ",
            body: [
                { h: "Season 1: The North Bannerman Qualifiers — Frost and Steel" },
                { p: "อัปเดตใหญ่ของซีซัน 1 เปิดตัว 15 ก.ค. 2026 นำมาซึ่งเนื้อเรื่อง ระบบ และคอนเทนต์ใหม่ พร้อมกลไกต่อสู้ Burning Battle Spirit" },
                { h: "North Bannerman Duel Festival" },
                { p: "กิจกรรมย่อยเริ่ม 22 ก.ค. 2026 ให้ผู้เล่นดวล 1v1 กับ NPC Bannerman Champion จากตระกูลอื่น ๆ เพื่อชิงรางวัล" },
                { h: "Battle Pass: Ripples of the Open Sea" },
                { p: "Battle Pass ประจำช่วง สะสมความคืบหน้าเพื่อรับรางวัลตามระดับ" },
                { p: "อีเวนต์และรางวัลอาจต่างกันตามภูมิภาคและช่วงเวลา ตรวจสอบประกาศทางการในเกมเสมอ" }
            ],
            source: { label: "Netmarble Events", url: "https://forum.netmarble.com/got/list/13/1" }
        },
        "codes": {
            icon: IC.gift, tag: "ทริก & ของฟรี", read: "3 นาที",
            title: "รับโค้ด/คูปองของฟรี",
            summary: "วิธีแลกโค้ดและแหล่งหาโค้ดล่าสุด รับ Golden Dragon และวัสดุฟรี",
            body: [
                { h: "แลกโค้ดยังไง" },
                { list: [
                    "เปิดเกม แตะไอคอนเมนู (Menu)",
                    "ไปที่ Options แล้วเลือกแท็บ Info",
                    "กดปุ่ม Coupon แล้วกรอกโค้ด จากนั้นกด Use รับรางวัลในเกมทันที",
                    "หรือแลกผ่านเว็บ coupon.netmarble.com/got"
                ]},
                { h: "รางวัลที่อาจได้" },
                { p: "Golden Dragon, Copper, Iron Bank Marks, ตั๋ว, วัสดุก่อสร้าง และไอเทมอื่น ๆ" },
                { h: "หาโค้ดจากไหน" },
                { p: "ผู้พัฒนามักปล่อยโค้ดในโอกาสพิเศษผ่านโซเชียลทางการ (Facebook, X, Discord, YouTube) โค้ดมีวันหมดอายุและอาจจำกัดตามภูมิภาค ควรรีบแลกทันทีที่เห็น" }
            ],
            source: { label: "coupon.netmarble.com/got", url: "https://coupon.netmarble.com/got" }
        },
        "twitch-drops": {
            icon: IC.twitch, tag: "ทริก & ของฟรี", read: "2 นาที",
            title: "Twitch Drops",
            summary: "ผูกบัญชีแล้วดูสตรีมเพื่อรับไอเทมฟรีในช่วงกิจกรรม",
            body: [
                { p: "ในช่วงกิจกรรม Twitch Drops ผู้เล่นสามารถรับไอเทมในเกมได้ฟรีเพียงรับชมสตรีมที่ร่วมรายการ" },
                { h: "ขั้นตอน" },
                { list: [
                    "ผูกบัญชี Netmarble เข้ากับบัญชี Twitch ที่หน้ากิจกรรมทางการ",
                    "รับชมสตรีมที่เปิด Drops ให้ครบเวลาที่กำหนด",
                    "กดเคลมรางวัลบน Twitch แล้วรับไอเทมในเกม"
                ]}
            ],
            source: { label: "Netmarble Twitch Drops", url: "https://gameofthrones.netmarble.com/en/drops" }
        }
    };

    /* ---------- หมวดหมู่ (จัดกลุ่มคู่มือ) ---------- */

    const CATEGORIES = [
        { id: "start",   icon: IC.start,  title: "เริ่มต้นเล่นเกม", desc: "พื้นฐานสำหรับผู้เล่นใหม่",       ids: ["intro", "choose-class", "combat-basics"] },
        { id: "progress",icon: IC.power,  title: "การเติบโต & Momentum", desc: "อัปเลเวล ฟาร์ม และค่าพลัง", ids: ["momentum", "level-fast", "gold-farm", "alliance"] },
        { id: "gear",    icon: IC.gear,   title: "อุปกรณ์ & บิลด์",  desc: "เซ็ตไอเทม Amulet และการจัด Build", ids: ["gear", "amulet", "build"] },
        { id: "boss",    icon: IC.boss,   title: "บอส & เรด",       desc: "World Boss, Raid และความยากสูง", ids: ["drogon", "kraken", "hedge-knight"] },
        { id: "systems", icon: IC.flame,  title: "ระบบใหม่ & อีเวนต์", desc: "กลไกใหม่และกิจกรรมล่าสุด",    ids: ["burning-spirit", "weapon-switching", "events"] },
        { id: "tips",    icon: IC.gift,   title: "ทริก & ของฟรี",    desc: "โค้ด คูปอง และของแจกฟรี",       ids: ["codes", "twitch-drops"] }
    ];

    /* ============================================================
       ด้านล่างนี้ไม่ต้องแก้ (ตัวเรนเดอร์)
    ============================================================ */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function cardHtml(id) {
        const g = GUIDES[id];
        if (!g) return "";
        return `<a href="guide-article.html?id=${encodeURIComponent(id)}" class="quick-card guide-card">
            <div class="quick-icon">${g.icon}</div>
            <span class="guide-read">${esc(g.read)}</span>
            <h3>${esc(g.title)}</h3>
            <p>${esc(g.summary)}</p>
            <span class="class-link">อ่านคู่มือ →</span>
        </a>`;
    }

    /* ---------- หน้ารวมคู่มือ ---------- */
    const hub = document.getElementById("guide-hub");
    if (hub) {
        hub.innerHTML = CATEGORIES.map(cat => `
            <div class="guide-cat" id="${cat.id}">
                <div class="guide-cat-head">
                    <span class="guide-cat-icon">${cat.icon}</span>
                    <div>
                        <h2>${esc(cat.title)}</h2>
                        <p>${esc(cat.desc)}</p>
                    </div>
                </div>
                <div class="quick-grid">
                    ${cat.ids.map(cardHtml).join("\n")}
                </div>
            </div>
        `).join("\n");
    }

    /* ---------- หน้าอ่านคู่มือ ---------- */
    const article = document.getElementById("guide-article");
    if (article) {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        const g = GUIDES[id];

        if (!g) {
            article.innerHTML = `<div class="container"><div class="ga-notfound">
                <h2>ไม่พบคู่มือที่ต้องการ</h2>
                <p>คู่มือนี้อาจถูกย้ายหรือลบไปแล้ว</p>
                <a href="guide.html" class="btn-primary">กลับไปหน้าคู่มือ</a>
            </div></div>`;
        } else {
            document.title = g.title + " | Game of Thrones: Kingsroad TH";
            const bodyHtml = g.body.map(block => {
                if (block.h) return `<h3 class="ga-h">${esc(block.h)}</h3>`;
                if (block.p) return `<p class="ga-p">${esc(block.p)}</p>`;
                if (block.list) return `<ul class="ga-list">${block.list.map(li => `<li>${esc(li)}</li>`).join("")}</ul>`;
                return "";
            }).join("\n");

            const others = Object.keys(GUIDES).filter(k => k !== id && GUIDES[k].tag === g.tag).slice(0, 3);
            const relatedHtml = others.length
                ? `<div class="ga-related"><h3 class="cls-block-title">คู่มือที่เกี่ยวข้อง</h3><div class="quick-grid">${others.map(cardHtml).join("")}</div></div>`
                : "";

            article.innerHTML = `<div class="container ga-wrap">
                <a href="guide.html" class="ga-back">← คู่มือทั้งหมด</a>
                <div class="ga-icon">${g.icon}</div>
                <span class="hero-badge">${esc(g.tag)} • อ่าน ${esc(g.read)}</span>
                <h1 class="ga-title">${esc(g.title)}</h1>
                <p class="ga-summary">${esc(g.summary)}</p>
                <article class="ga-body">${bodyHtml}</article>
                <div class="ga-source">ที่มา: <a href="${esc(g.source.url)}" target="_blank" rel="noopener">${esc(g.source.label)}</a></div>
                ${relatedHtml}
            </div>`;
        }
    }

})();
