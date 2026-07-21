/* ============================================================
   build-planner.js — เครื่องจำลองบิลด์ (Build Planner)

   จัดบิลด์จาก "ข้อมูลจริง" ในฐานข้อมูล: อาชีพ + อาวุธ + เซ็ต Main/Sub + Amulet
   แล้วสรุปเอฟเฟกต์รวมที่ตรวจสอบแล้ว + คำแนะนำความเข้ากัน + แชร์ลิงก์บิลด์ได้

   ⚠️ ไม่คำนวณตัวเลข/สเตตัสรวม เพราะสูตรจริงของเกมยังไม่ยืนยัน — แสดงเฉพาะ
   เอฟเฟกต์เชิงบรรยายที่มาจาก record จริง (อ้างอิงหน้า Database)
============================================================ */

(function () {
    const root = document.getElementById("build-planner");
    if (!root) return;

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    /* ---------- ข้อมูล (อ้างอิงจาก js/database.js) ---------- */
    const CLASSES = {
        knight:    { name: "Knight",    nameTh: "อัศวินสายแทงก์", role: "Frontline / Tank", weapon: "Greatsword / Dual Blades", play: "อึดที่สุด ยืนแนวหน้ารับดาเมจแทนทีม มีท่า Riposte Stance สวนกลับศัตรูมนุษย์ เล่นง่ายครอบคลุมคอนเทนต์กว่า 90%" },
        assassin:  { name: "Assassin",  nameTh: "นักลอบสังหาร",   role: "Burst DPS / Speed", weapon: "Dagger (มีดคู่)",       play: "พลังโจมตีสูงสุด ระเบิดดาเมจใส่บอสในพริบตา ฟาร์มไว แลกกับตัวบางที่ต้องหลบให้แม่น" },
        sellsword: { name: "Sellsword", nameTh: "ทหารรับจ้าง",     role: "Heavy Hitter",     weapon: "Axe / Gauntlet (อาวุธหนัก)", play: "ดาเมจต่อเป้าเดี่ยวมหาศาล คอมโบไม่ถูกขัดจังหวะด้วย Hit-Stun Immunity ช้าแต่ฟาดหนัก" }
    };

    const SETS = {
        "set-champion": { name: "Champion Set", nameTh: "สาย Active Skill / คริติคอล", theme: "DPS / Active Skill", status: "community", fit: ["knight", "assassin", "sellsword"],
            b3: "ใช้ Active Skill เพิ่ม Attack Power ชั่วคราว, +15.0% Rage Gain",
            b6: "Active Skill Damage +12.0%, มีโอกาสได้ Rage และลดคูลดาวน์สกิลทั้งหมดเมื่อสังหารศัตรู" },
        "set-sentinel": { name: "Sentinel Set", nameTh: "สาย Parry", theme: "Parry / ตั้งรับ", status: "community", fit: ["knight"],
            b3: "เพิ่มระยะเวลา Parry, +15 Rage Gain เมื่อ Parry สำเร็จ", b6: "" },
        "set-brute": { name: "Brute Set", nameTh: "เพิ่มดาเมจ + ลดดาเมจ", theme: "PvE สมดุล", status: "community", fit: ["sellsword"],
            b3: "+10% ดาเมจ และ +10% ลดความเสียหายที่ได้รับ", b6: "" },
        "set-crusher": { name: "Crusher Set", nameTh: "สาย Stagger", theme: "Stagger", status: "community", fit: ["knight", "assassin", "sellsword"],
            b3: "+13.5% Stagger Damage, มีโอกาส Life Steal", b6: "เพิ่มดาเมจต่อศัตรูที่อยู่ในสถานะ Stagger" },
        "set-mauler": { name: "Mauler Set", nameTh: "สาย Rage / ตีเร็ว", theme: "Rage / Auto-attack", status: "community", fit: ["assassin", "sellsword"],
            b3: "หลังใช้สกิลเข้าสถานะ Rage: เพิ่มความเร็วโจมตีมาก + ดาเมจ Light Attack/Strike Combo", b6: "",
            note: "ข้อแลก: ใช้ Active Skill ไม่ได้ระหว่างอยู่ในสถานะ Rage" },
        "set-savant": { name: "Savant Set", nameTh: "สาย Active Skill / Rage", theme: "Active Skill / Rage", status: "wip", fit: [], b3: "", b6: "" },
        "set-duelist": { name: "Duelist Set", nameTh: "สาย Parry / ดวล", theme: "Parry / ดวล", status: "wip", fit: ["knight"], b3: "", b6: "" },
        "set-marksman": { name: "Marksman Set", nameTh: "ยังไม่ยืนยันเอฟเฟกต์", theme: "—", status: "wip", fit: [], b3: "", b6: "" }
    };

    const AMULETS = {
        "none": { name: "— ไม่ใส่ —" },
        "legendary-amulet": { name: "Legendary Amulet", nameTh: "Amulet ระดับตำนาน", id: "legendary-amulet",
            note: "ได้ Design จากอันดับ Top 3 ของ Kraken Raid คราฟด้วยวัสดุ 4 อย่าง (รวม Kraken parts) ที่ Amulet Workshop" },
        "amulet-system": { name: "Amulet ทั่วไป (ระบบ 9 แบบ)", nameTh: "Rare / Epic / Legendary อย่างละ 3", id: "amulet-system",
            note: "ระบบ Amulet มี 9 แบบ แต่ละแบบมีเอฟเฟกต์ตายตัว (Fixed) + สุ่ม (Random) ตามความหายาก" }
    };

    const SET_KEYS = Object.keys(SETS);
    const CLASS_KEYS = Object.keys(CLASSES);
    const AMULET_KEYS = Object.keys(AMULETS);

    /* ---------- state (อ่านจาก URL ถ้ามี) ---------- */
    const qs = new URLSearchParams(location.search);
    const state = {
        cls:  CLASSES[qs.get("c")] ? qs.get("c") : "knight",
        main: SETS[qs.get("m")] ? qs.get("m") : "set-champion",
        sub:  SETS[qs.get("s")] ? qs.get("s") : "set-sentinel",
        am:   AMULETS[qs.get("a")] ? qs.get("a") : "none"
    };

    const STATUS_LABEL = {
        community: '<span class="bp-badge bp-badge-comm">Community Verified</span>',
        wip: '<span class="bp-badge bp-badge-wip">ยังไม่ยืนยัน</span>'
    };

    function setOptions(selected) {
        return SET_KEYS.map(k => `<option value="${k}"${k === selected ? " selected" : ""}>${esc(SETS[k].name)} — ${esc(SETS[k].nameTh)}</option>`).join("");
    }
    function amuletOptions(selected) {
        return AMULET_KEYS.map(k => `<option value="${k}"${k === selected ? " selected" : ""}>${esc(AMULETS[k].name)}</option>`).join("");
    }
    function classChips(selected) {
        return CLASS_KEYS.map(k => {
            const c = CLASSES[k];
            return `<button type="button" class="bp-class${k === selected ? " is-active" : ""}" data-cls="${k}">
                <span class="bp-class-name">${esc(c.name)}</span>
                <span class="bp-class-role">${esc(c.role)}</span>
            </button>`;
        }).join("");
    }

    /* ---------- เรนเดอร์เปลือก (ครั้งเดียว) ---------- */
    root.innerHTML = `
        <div class="bp-grid">
            <div class="bp-panel bp-controls">
                <h2 class="bp-h">1 · เลือกอาชีพ</h2>
                <div class="bp-classes">${classChips(state.cls)}</div>

                <h2 class="bp-h">2 · เซ็ตอุปกรณ์</h2>
                <label class="bp-field">
                    <span>Main Set <em>(เล็งโบนัส 6 ชิ้น)</em></span>
                    <select id="bp-main" class="bp-select">${setOptions(state.main)}</select>
                </label>
                <label class="bp-field">
                    <span>Sub Set <em>(โบนัส 3 ชิ้น ผ่าน Set Research)</em></span>
                    <select id="bp-sub" class="bp-select">${setOptions(state.sub)}</select>
                </label>

                <h2 class="bp-h">3 · Amulet</h2>
                <label class="bp-field">
                    <span>เครื่องราง</span>
                    <select id="bp-amulet" class="bp-select">${amuletOptions(state.am)}</select>
                </label>

                <div class="bp-actions">
                    <button type="button" id="bp-share" class="btn-primary">คัดลอกลิงก์บิลด์</button>
                    <button type="button" id="bp-reset" class="btn-secondary">รีเซ็ต</button>
                </div>
            </div>

            <div class="bp-panel bp-result" id="bp-result"></div>
        </div>`;

    const selMain = document.getElementById("bp-main");
    const selSub = document.getElementById("bp-sub");
    const selAm = document.getElementById("bp-amulet");
    const resultEl = document.getElementById("bp-result");

    function fitNote(setKey, cls) {
        const s = SETS[setKey];
        if (s.status === "wip") return `<span class="bp-fit bp-fit-wip">ℹ เอฟเฟกต์ยังไม่ยืนยัน — โปรดตรวจสอบในเกม</span>`;
        if (!s.fit.length) return "";
        if (s.fit.indexOf(cls) !== -1) return `<span class="bp-fit bp-fit-ok">✓ เข้ากับบทบาทของ ${esc(CLASSES[cls].name)}</span>`;
        return `<span class="bp-fit bp-fit-warn">⚠ เซ็ตนี้เน้น ${esc(s.theme)} — อาจไม่ตรงกับบทบาทหลักของ ${esc(CLASSES[cls].name)}</span>`;
    }

    function setBlock(role, setKey, cls, showSix) {
        const s = SETS[setKey];
        const bonuses = [];
        if (s.b3) bonuses.push(`<div class="bp-bonus"><span class="bp-bonus-k">3 ชิ้น</span><span>${esc(s.b3)}</span></div>`);
        if (showSix && s.b6) bonuses.push(`<div class="bp-bonus"><span class="bp-bonus-k">6 ชิ้น</span><span>${esc(s.b6)}</span></div>`);
        if (!bonuses.length) bonuses.push(`<div class="bp-bonus bp-bonus-empty">ยังไม่มีข้อมูลโบนัสที่ยืนยัน</div>`);
        return `<div class="bp-slot">
            <div class="bp-slot-head">
                <span class="bp-slot-role">${role}</span>
                <a class="bp-slot-name" href="database-detail.html?id=${esc(setKey)}">${esc(s.name)} <span>${esc(s.nameTh)}</span></a>
                ${STATUS_LABEL[s.status] || ""}
            </div>
            ${bonuses.join("")}
            ${s.note ? `<div class="bp-slot-note">${esc(s.note)}</div>` : ""}
            ${fitNote(setKey, cls)}
        </div>`;
    }

    function amuletBlock(amKey) {
        const a = AMULETS[amKey];
        if (amKey === "none") return `<div class="bp-slot bp-slot-muted"><div class="bp-slot-head"><span class="bp-slot-role">Amulet</span><span class="bp-slot-name">— ไม่ใส่ —</span></div></div>`;
        return `<div class="bp-slot">
            <div class="bp-slot-head">
                <span class="bp-slot-role">Amulet</span>
                <a class="bp-slot-name" href="database-detail.html?id=${esc(a.id)}">${esc(a.name)}${a.nameTh ? ` <span>${esc(a.nameTh)}</span>` : ""}</a>
            </div>
            <div class="bp-slot-note">${esc(a.note)}</div>
        </div>`;
    }

    function update() {
        const c = CLASSES[state.cls];
        resultEl.innerHTML = `
            <div class="bp-hero">
                <span class="bp-hero-eyebrow">Build Summary</span>
                <h2 class="bp-hero-name">${esc(c.name)}</h2>
                <p class="bp-hero-role">${esc(c.nameTh)} · ${esc(c.role)}</p>
                <div class="bp-hero-meta">
                    <div><span>อาวุธ</span><strong>${esc(c.weapon)}</strong></div>
                </div>
                <p class="bp-hero-play">${esc(c.play)}</p>
                <a class="bp-hero-link" href="classes.html#${esc(state.cls)}">ดูข้อมูลอาชีพเต็ม →</a>
            </div>
            ${setBlock("Main Set", state.main, state.cls, true)}
            ${setBlock("Sub Set", state.sub, state.cls, false)}
            ${amuletBlock(state.am)}
            <p class="bp-disclaimer">ข้อมูลโบนัสอ้างอิงจากคู่มือชุมชน/หน้า Database — เกมแสดงคำอธิบายแบบคร่าวในหน้า Set Research โปรดยืนยันในเกมก่อนตัดสินใจจัดบิลด์จริง</p>`;

        // sync URL (ไม่เพิ่ม history)
        const p = new URLSearchParams({ c: state.cls, m: state.main, s: state.sub, a: state.am });
        history.replaceState(null, "", location.pathname + "?" + p.toString());
    }

    /* ---------- events ---------- */
    root.querySelectorAll(".bp-class").forEach(btn => btn.addEventListener("click", function () {
        state.cls = this.dataset.cls;
        root.querySelectorAll(".bp-class").forEach(b => b.classList.toggle("is-active", b === this));
        update();
    }));
    selMain.addEventListener("change", function () { state.main = this.value; update(); });
    selSub.addEventListener("change", function () { state.sub = this.value; update(); });
    selAm.addEventListener("change", function () { state.am = this.value; update(); });

    document.getElementById("bp-reset").addEventListener("click", function () {
        state.cls = "knight"; state.main = "set-champion"; state.sub = "set-sentinel"; state.am = "none";
        selMain.value = state.main; selSub.value = state.sub; selAm.value = state.am;
        root.querySelectorAll(".bp-class").forEach(b => b.classList.toggle("is-active", b.dataset.cls === "knight"));
        update();
    });

    document.getElementById("bp-share").addEventListener("click", function () {
        const btn = this;
        const url = location.href;
        const done = () => { const t = btn.textContent; btn.textContent = "คัดลอกแล้ว ✓"; setTimeout(() => btn.textContent = t, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
            const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch (e) {}
            document.body.removeChild(ta); done();
        }
    });

    update();
})();
