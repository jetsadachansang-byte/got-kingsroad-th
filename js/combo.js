/* ============================================================
   combo.js — ระบบ Combo & Build จากผู้เล่น (แชร์/แก้ไขร่วมกันได้)

   • 3 อาชีพ: Knight / Assassin / Sellsword (แท็บแยก)
   • ทุกคนแชร์คอมโบและเซตบิลด์ + ข้อความ + รูปภาพได้ (ไม่ต้องล็อกอิน)
   • ข้อมูลเก็บบน Firebase Realtime Database (ตัวเดียวกับตัวนับผู้เข้าชม)
   • รูปภาพ: อัปโหลดไฟล์ (ย่อ+บีบอัดในเครื่องก่อนส่ง) หรือวางลิงก์รูป
   • ผู้เขียนลบ/แก้โพสต์ตัวเองได้ (เก็บ token ไว้ใน localStorage ของเครื่อง)

   ⚠️ ความปลอดภัย: การป้องกันฝั่งเบราว์เซอร์กันได้แค่การใช้งานทั่วไป
      ความปลอดภัยจริงต้องตั้ง Rules ใน Firebase Console — ดู
      docs/FIREBASE_RULES.md
============================================================ */
(function () {

    const root = document.getElementById("combo");
    if (!root) return;

    /* ---------- ตั้งค่า ---------- */
    const FIREBASE = {
        databaseURL: "https://online-89559-default-rtdb.asia-southeast1.firebasedatabase.app"
    };
    const SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
    // path ใน RTDB คงชื่อเดิมไว้ ไม่เปลี่ยนตามชื่อระบบ
    // เพราะข้อมูลที่ผู้เล่นโพสต์ไว้แล้วอยู่ใต้ path นี้
    const DB_PATH = "skilltree";

    const MAX_IMG_PX    = 1100;      // ย่อรูปด้านยาวสุดไม่เกินนี้
    const MAX_IMG_BYTES = 260 * 1024; // ขนาดรูปหลังบีบอัด (~260KB)
    const MAX_TITLE     = 120;
    const MAX_BODY      = 4000;
    const MAX_AUTHOR    = 40;
    const MAX_BLOCKS      = 10;               // จำนวนภาพ/ขั้นตอนต่อโพสต์
    const MAX_TOTAL_BYTES = 2.6 * 1024 * 1024; // ขนาดรวมทั้งโพสต์ กันเขียนก้อนใหญ่เกิน

    const CLASSES = [
        { id: "knight",    name: "Knight",    nameTh: "อัศวิน",       role: "Frontline · แทงก์",        img: "images/classes/knight.webp" },
        { id: "assassin",  name: "Assassin",  nameTh: "นักลอบสังหาร", role: "Burst Damage · ความเร็ว",  img: "images/classes/assassin.webp" },
        { id: "sellsword", name: "Sellsword", nameTh: "ทหารรับจ้าง",  role: "Heavy Hitter · คอมโบหนัก", img: "images/classes/sellsword.webp" }
    ];

    /* ---------- utils ---------- */
    const esc = window.escHtml;

    // ยอมเฉพาะ https: และ data:image/ เพื่อกัน javascript: / XSS
    function safeImgSrc(u) {
        const s = String(u || "").trim();
        if (/^https:\/\/[^\s"']+$/i.test(s)) return s;
        if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(s)) return s;
        return "";
    }

    function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

    function timeAgo(ts) {
        if (!ts) return "";
        const d = Date.now() - ts, m = Math.floor(d / 60000);
        if (m < 1) return "เมื่อสักครู่";
        if (m < 60) return m + " นาทีที่แล้ว";
        const h = Math.floor(m / 60);
        if (h < 24) return h + " ชั่วโมงที่แล้ว";
        const day = Math.floor(h / 24);
        if (day < 30) return day + " วันที่แล้ว";
        try { return new Date(ts).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }); }
        catch (e) { return ""; }
    }

    function lsGet(k, dflt) {
        try { return JSON.parse(localStorage.getItem(k)) || dflt; } catch (e) { return dflt; }
    }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

    function myTokens() { return lsGet("gk_st_tokens", {}); }
    function rememberToken(id, tok) { const t = myTokens(); t[id] = tok; lsSet("gk_st_tokens", t); }
    function ownsEntry(id, tok) { return tok && myTokens()[id] === tok; }
    function newToken() {
        try {
            const a = new Uint8Array(16); crypto.getRandomValues(a);
            return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
        } catch (e) { return String(Date.now()) + Math.random().toString(16).slice(2); }
    }

    /* ---------- เส้นทางในหน้า ----------
       #knight          → รายการการ์ดของอาชีพนั้น
       #knight/<id>     → หน้าอ่านโพสต์นั้นแบบเต็ม (แชร์ลิงก์ได้) */
    let current = "knight";
    let viewId = null;

    function readHash() {
        const parts = (location.hash || "").replace(/^#/, "").split("/");
        const cls = parts[0];
        current = CLASSES.some(c => c.id === cls) ? cls : "knight";
        viewId = parts[1] ? decodeURIComponent(parts[1]) : null;
    }
    readHash();

    function goto(cls, id) {
        const h = "#" + cls + (id ? "/" + encodeURIComponent(id) : "");
        if (location.hash === h) return;
        location.hash = h;   // ให้ hashchange จัดการต่อ (ปุ่ม back ใช้งานได้)
    }

    function shell() {
        const tabs = CLASSES.map(c => {
            const on = c.id === current;
            return `<button class="st-tab${on ? " is-on" : ""}" data-cls="${c.id}" type="button"
                    role="tab" id="st-tab-${c.id}" aria-selected="${on}" aria-controls="st-list" tabindex="${on ? "0" : "-1"}">
                <span class="st-tab-name">${esc(c.name)}</span>
                <span class="st-tab-sub">${esc(c.nameTh)}</span>
            </button>`;
        }).join("");

        root.innerHTML = `
            <div class="st-tabs" role="tablist" aria-label="เลือกอาชีพ">${tabs}</div>
            <div class="st-classhead" id="st-classhead"></div>
            <div class="st-toolbar">
                <button class="btn-primary st-add" id="st-add" type="button">+ แชร์คอมโบ / บิลด์</button>
                <span class="st-count" id="st-count"></span>
            </div>
            <div class="st-status" id="st-status" role="status" aria-live="polite">กำลังโหลดข้อมูล…</div>
            <div class="st-list" id="st-list" role="tabpanel" aria-labelledby="st-tab-${current}"></div>
            <div class="st-editor" id="st-editor" hidden></div>
            <div class="st-ownerbar" id="st-ownerbar"></div>`;

        root.querySelectorAll(".st-tab").forEach(b =>
            b.addEventListener("click", () => switchTo(b.dataset.cls)));
        root.querySelector(".st-tabs").addEventListener("keydown", onTabKeydown);

        document.getElementById("st-add").addEventListener("click", () => openEditor(null));
        renderHead();
    }

    function onTabKeydown(ev) {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key)) return;
        ev.preventDefault();
        const idx = CLASSES.findIndex(c => c.id === current);
        let next = idx;
        if (ev.key === "ArrowLeft") next = (idx - 1 + CLASSES.length) % CLASSES.length;
        else if (ev.key === "ArrowRight") next = (idx + 1) % CLASSES.length;
        else if (ev.key === "Home") next = 0;
        else if (ev.key === "End") next = CLASSES.length - 1;
        switchTo(CLASSES[next].id);
        const btn = document.getElementById("st-tab-" + CLASSES[next].id);
        if (btn) btn.focus();
    }

    function renderHead() {
        const c = CLASSES.find(x => x.id === current);
        const head = document.getElementById("st-classhead");
        if (!head || !c) return;
        head.innerHTML = `
            <div class="st-classcard" style="--stbg:url('/${esc(c.img)}')">
                <div class="st-classcard-body">
                    <h2>${esc(c.name)} <span>${esc(c.nameTh)}</span></h2>
                    <p class="st-classrole">${esc(c.role)}</p>
                    <div class="st-classlinks">
                        <a href="classes.html#${esc(c.id)}">ข้อมูลอาชีพ →</a>
                        <a href="database.html#cat-skill">ระบบสกิลในฐานข้อมูล →</a>
                        <a href="guide.html">คู่มือทั้งหมด →</a>
                    </div>
                </div>
            </div>`;
    }

    function switchTo(id) {
        if (!CLASSES.some(c => c.id === id)) return;
        if (id === current && !viewId) return;
        goto(id, null);
    }

    // ซิงก์แท็บ/หัวข้อให้ตรงกับ current แล้วโหลดข้อมูลของอาชีพนั้น
    function applyClass(reload) {
        root.querySelectorAll(".st-tab").forEach(b => {
            const on = b.dataset.cls === current;
            b.classList.toggle("is-on", on);
            b.setAttribute("aria-selected", on);
            b.tabIndex = on ? 0 : -1;
        });
        const list = document.getElementById("st-list");
        if (list) list.setAttribute("aria-labelledby", "st-tab-" + current);
        renderHead();
        closeEditor();
        if (reload) watch();
    }

    function onHashChange() {
        const prev = current;
        readHash();
        applyClass(prev !== current);
        if (prev === current) render();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("hashchange", onHashChange);

    /* ---------- แสดงรายการ ---------- */
    let entries = [];
    let loaded = false;   // โหลดข้อมูลของอาชีพปัจจุบันครบแล้วหรือยัง

    // ข้อความย่อสำหรับการ์ดในรายการ
    function excerpt(e, n) {
        let s = String(e.body || "");
        if (!s) {
            const b = normalizeBlocks(e.blocks).find(x => x.text);
            s = b ? b.text : "";
        }
        s = s.replace(/\s+/g, " ").trim();
        return s.length > n ? s.slice(0, n).trim() + "…" : s;
    }

    // ภาพแรกที่ใช้ได้ ใช้เป็นรูปย่อบนการ์ด
    function coverOf(e) {
        const b = normalizeBlocks(e.blocks).find(x => safeImgSrc(x.img));
        return b ? safeImgSrc(b.img) : safeImgSrc(e.img);
    }

    function render() {
        const wrap = document.getElementById("st-list");
        if (!wrap) return;

        // เปิดอ่านโพสต์เดียว
        if (viewId) {
            const e = entries.find(x => x.id === viewId);
            if (e) { renderDetail(wrap, e); return; }
            // ยังโหลดข้อมูลไม่เสร็จ ให้รอ listener เรียก render อีกรอบ
            // (ต้องเช็ก loaded ไม่ใช่ entries.length ไม่งั้นคลาสที่ยังว่างจะค้างหน้าเปล่า)
            if (!loaded) { wrap.innerHTML = ""; return; }
            wrap.innerHTML = `<div class="st-empty">
                <h3>ไม่พบโพสต์นี้</h3>
                <p>โพสต์อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
                <button class="st-act" id="st-back-empty" type="button">← กลับไปรายการทั้งหมด</button>
            </div>`;
            const back = document.getElementById("st-back-empty");
            if (back) back.addEventListener("click", () => goto(current, null));
            return;
        }

        renderList(wrap);
    }

    function renderList(wrap) {
        const count = document.getElementById("st-count");
        if (count) count.textContent = entries.length ? entries.length + " รายการ" : "";

        const add = document.getElementById("st-add");
        if (add) add.style.display = "";

        if (!entries.length) {
            wrap.innerHTML = `<div class="st-empty">
                <h3>ยังไม่มีคอมโบหรือบิลด์ของอาชีพนี้</h3>
                <p>เป็นคนแรกที่แชร์คอมโบ เซตอุปกรณ์ หรือแนวทางลงสกิลของ ${esc(CLASSES.find(c => c.id === current).name)}
                   กด “แชร์คอมโบ / บิลด์” ด้านบนได้เลย</p>
            </div>`;
            return;
        }

        wrap.innerHTML = `<div class="st-cards">` + entries.map(e => {
            const cover = coverOf(e);
            const n = normalizeBlocks(e.blocks).length;
            const mine = ownsEntry(e.id, e.tok);
            return `<a class="st-card" href="#${esc(current)}/${encodeURIComponent(e.id)}">
                <span class="st-card-thumb">
                    ${cover ? `<img src="${esc(cover)}" alt="" loading="lazy"
                                onerror="this.parentNode.classList.add('is-blank');this.remove()">`
                            : `<span class="st-card-noimg">ไม่มีรูป</span>`}
                    ${n > 1 ? `<span class="st-card-count">${n} ภาพ</span>` : ""}
                </span>
                <span class="st-card-body">
                    <span class="st-card-title">${esc(e.title)}</span>
                    <span class="st-card-meta">
                        <span class="st-author">${esc(e.author || "ผู้เล่นนิรนาม")}</span>
                        <span class="st-dot">·</span>${esc(timeAgo(e.ts))}
                        ${e.edited ? '<span class="st-dot">·</span><span class="st-edited">แก้ไขแล้ว</span>' : ""}
                        ${mine ? '<span class="st-dot">·</span><span class="st-mine">โพสต์ของคุณ</span>' : ""}
                    </span>
                    <span class="st-card-excerpt">${esc(excerpt(e, 110))}</span>
                    <span class="st-card-more">อ่านต่อ →</span>
                </span>
            </a>`;
        }).join("") + `</div>`;
    }

    function renderDetail(wrap, e) {
        const count = document.getElementById("st-count");
        if (count) count.textContent = "";
        const add = document.getElementById("st-add");
        if (add) add.style.display = "none";   // ในหน้าอ่าน ไม่ต้องมีปุ่มเขียนใหม่

        const mine = ownsEntry(e.id, e.tok);
        const legacyImg = safeImgSrc(e.img);
        const blocks = normalizeBlocks(e.blocks);

        const blocksHtml = blocks.map((b, i) => {
            const src = safeImgSrc(b.img);
            if (!src && !b.text) return "";
            return `<div class="st-block">
                ${src ? `<div class="st-entry-img"><img src="${esc(src)}" alt="${esc(e.title)} — ภาพที่ ${i + 1}" loading="lazy"
                          onerror="this.closest('.st-entry-img').style.display='none'"></div>` : ""}
                ${b.text ? `<div class="st-entry-body">${nl2br(b.text)}</div>` : ""}
            </div>`;
        }).join("");

        wrap.innerHTML = `
            <button class="st-back" id="st-back" type="button">← กลับไปรายการทั้งหมด</button>
            <article class="st-entry st-entry-full" id="e-${esc(e.id)}">
                <header class="st-entry-head">
                    <h3>${esc(e.title)}</h3>
                    <div class="st-meta">
                        <span class="st-author">${esc(e.author || "ผู้เล่นนิรนาม")}</span>
                        <span class="st-dot">·</span>
                        <span>${esc(timeAgo(e.ts))}</span>
                        ${blocks.length ? `<span class="st-dot">·</span><span>${blocks.length} ภาพ/ขั้นตอน</span>` : ""}
                        ${e.edited ? '<span class="st-dot">·</span><span class="st-edited">แก้ไขแล้ว</span>' : ""}
                    </div>
                </header>
                ${legacyImg && !blocks.length ? `<div class="st-entry-img"><img src="${esc(legacyImg)}" alt="${esc(e.title)}" loading="lazy"
                          onerror="this.closest('.st-entry-img').style.display='none'"></div>` : ""}
                ${e.body ? `<div class="st-entry-body st-lead">${nl2br(e.body)}</div>` : ""}
                ${blocksHtml}
                <footer class="st-entry-foot">
                    ${mine ? `<button class="st-act" data-edit="${esc(e.id)}" type="button">แก้ไข</button>`
                           : `<span class="st-byline">แชร์โดยผู้เล่นในชุมชน</span>`}
                    ${isOwner ? `<button class="st-act st-act-del" data-del="${esc(e.id)}" type="button">ลบ (ผู้ดูแล)</button>` : ""}
                </footer>
            </article>`;

        document.getElementById("st-back").addEventListener("click", () => goto(current, null));
        wrap.querySelectorAll("[data-edit]").forEach(b =>
            b.addEventListener("click", () => openEditor(entries.find(x => x.id === b.dataset.edit))));
        wrap.querySelectorAll("[data-del]").forEach(b =>
            b.addEventListener("click", () => removeEntry(b.dataset.del)));
    }

    /* ---------- ฟอร์มเพิ่ม/แก้ไข ----------
       เนื้อหาเก็บเป็น "บล็อก" เรียงกัน: แต่ละบล็อกมีรูป 1 ภาพ + ข้อความของภาพนั้น
       ใช้อธิบายคอมโบทีละขั้นได้ (ภาพ 1 → คำอธิบาย → ภาพ 2 → คำอธิบาย …) */
    let blocks = [];

    // แปลงข้อมูลจากฐานข้อมูลให้เป็นอาร์เรย์เสมอ (RTDB อาจคืนเป็น object ที่คีย์เป็นเลข)
    function normalizeBlocks(raw) {
        if (!raw) return [];
        const arr = Array.isArray(raw) ? raw : Object.keys(raw).sort((a, b) => a - b).map(k => raw[k]);
        return arr.filter(b => b && (b.img || b.text))
                  .map(b => ({ img: String(b.img || ""), text: String(b.text || "") }));
    }

    function openEditor(entry) {
        const box = document.getElementById("st-editor");
        if (!box) return;

        blocks = entry ? normalizeBlocks(entry.blocks) : [];
        // โพสต์รุ่นเก่าที่มีรูปเดียว → ย้ายมาเป็นบล็อกแรกให้อัตโนมัติ
        if (entry && !blocks.length && entry.img) blocks = [{ img: entry.img, text: "" }];
        if (!blocks.length) blocks = [{ img: "", text: "" }];

        box.hidden = false;
        box.innerHTML = `
            <div class="st-editor-inner">
                <h3>${entry ? "แก้ไขข้อมูล" : "แชร์คอมโบ / บิลด์"} — ${esc(CLASSES.find(c => c.id === current).name)}</h3>

                <label class="st-label" for="st-f-title">หัวข้อ <span class="st-req">*</span></label>
                <input class="st-input" id="st-f-title" maxlength="${MAX_TITLE}" placeholder="เช่น คอมโบดาบใหญ่สายเลือดเดือด / เซตบิลด์ตีบอสสายคริ"
                       value="${entry ? esc(entry.title) : ""}">

                <label class="st-label" for="st-f-body">เกริ่นนำ <span class="st-req">*</span></label>
                <textarea class="st-input st-textarea" id="st-f-body" rows="5" maxlength="${MAX_BODY}"
                          placeholder="สรุปภาพรวม เช่น บิลด์นี้เหมาะกับใคร ใช้เซตอะไร เล่นยังไง…">${entry ? esc(entry.body || "") : ""}</textarea>

                <div class="st-blocks-head">
                    <label class="st-label">ภาพและคำอธิบาย (ใส่ได้หลายภาพ ต่อกันเป็นขั้นตอน)</label>
                    <span class="st-hint" id="st-blockcount"></span>
                </div>
                <div id="st-blocks"></div>
                <button class="st-act st-addblock" id="st-addblock" type="button">+ เพิ่มภาพ / ข้อความ</button>
                <p class="st-hint">แต่ละบล็อกใส่รูป 1 ภาพพร้อมคำอธิบายของภาพนั้น เรียงลำดับได้ด้วยปุ่ม ↑ ↓ —
                   แนะนำสกรีนช็อตจากในเกมจริง ระบบย่อขนาดให้อัตโนมัติ</p>

                <label class="st-label" for="st-f-author">ชื่อผู้แชร์</label>
                <input class="st-input" id="st-f-author" maxlength="${MAX_AUTHOR}" placeholder="ใส่หรือไม่ใส่ก็ได้"
                       value="${entry ? esc(entry.author || "") : esc(lsGet("gk_st_name", ""))}">

                <div class="st-form-msg" id="st-form-msg"></div>

                <div class="st-form-actions">
                    <button class="btn-primary" id="st-save" type="button">${entry ? "บันทึกการแก้ไข" : "เผยแพร่"}</button>
                    <button class="btn-secondary" id="st-cancel" type="button">ยกเลิก</button>
                </div>
                <p class="st-tos">เมื่อกดเผยแพร่ ข้อมูลจะแสดงต่อสาธารณะให้ผู้เล่นคนอื่นเห็น กรุณาแชร์เฉพาะข้อมูลจากในเกมจริง</p>
            </div>`;

        renderBlocks();
        document.getElementById("st-addblock").addEventListener("click", () => {
            syncBlocks();
            if (blocks.length >= MAX_BLOCKS) {
                document.getElementById("st-form-msg").textContent = "ใส่ได้สูงสุด " + MAX_BLOCKS + " ภาพต่อโพสต์";
                return;
            }
            blocks.push({ img: "", text: "" });
            renderBlocks();
            const last = document.querySelector("#st-blocks .st-blockbox:last-child");
            if (last) last.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        document.getElementById("st-cancel").addEventListener("click", closeEditor);
        document.getElementById("st-save").addEventListener("click", () => save(entry));
        box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // อ่านค่าที่ผู้ใช้พิมพ์กลับเข้าโมเดล ก่อนวาดใหม่ทุกครั้ง (กันข้อความหาย)
    function syncBlocks() {
        blocks.forEach((b, i) => {
            const t = document.getElementById("st-b-text-" + i);
            const u = document.getElementById("st-b-url-" + i);
            if (t) b.text = t.value;
            if (u && u.value.trim()) b.img = u.value.trim();
            else if (u && !u.value.trim() && /^https:/i.test(b.img)) b.img = "";
        });
    }

    function renderBlocks() {
        const wrap = document.getElementById("st-blocks");
        if (!wrap) return;

        wrap.innerHTML = blocks.map((b, i) => {
            const src = safeImgSrc(b.img);
            const isData = /^data:/i.test(b.img);
            return `<div class="st-blockbox" data-i="${i}">
                <div class="st-blockbar">
                    <span class="st-blockno">ภาพที่ ${i + 1}</span>
                    <span class="st-blockacts">
                        <button class="st-mini" data-up="${i}" type="button" title="เลื่อนขึ้น" ${i === 0 ? "disabled" : ""}>↑</button>
                        <button class="st-mini" data-down="${i}" type="button" title="เลื่อนลง" ${i === blocks.length - 1 ? "disabled" : ""}>↓</button>
                        <button class="st-mini st-mini-del" data-rm="${i}" type="button" title="ลบบล็อกนี้">✕</button>
                    </span>
                </div>
                <div class="st-imgrow">
                    <input type="file" id="st-b-file-${i}" accept="image/*" class="st-file" data-file="${i}" aria-label="อัปโหลดไฟล์รูปภาพที่ ${i + 1}">
                    <span class="st-or">หรือ</span>
                    <input class="st-input st-url" id="st-b-url-${i}" data-url="${i}" placeholder="วางลิงก์รูป https://…"
                           aria-label="ลิงก์รูปภาพที่ ${i + 1}"
                           value="${/^https:/i.test(b.img) ? esc(b.img) : ""}">
                </div>
                <div class="st-preview" id="st-b-prev-${i}">
                    ${src ? `<img src="${esc(src)}" alt="ตัวอย่างภาพที่ ${i + 1}">${isData ? '<span class="st-hint">รูปที่อัปโหลดแล้ว (ย่อขนาดอัตโนมัติ)</span>' : ""}` : ""}
                </div>
                <textarea class="st-input st-blocktext" id="st-b-text-${i}" rows="3" maxlength="${MAX_BODY}"
                          aria-label="คำอธิบายของภาพที่ ${i + 1}"
                          placeholder="คำอธิบายของภาพนี้ เช่น กดสกิลอะไรต่อจากอะไร จังหวะไหน…">${esc(b.text)}</textarea>
            </div>`;
        }).join("");

        const c = document.getElementById("st-blockcount");
        if (c) c.textContent = blocks.length + " / " + MAX_BLOCKS;

        wrap.querySelectorAll("[data-file]").forEach(el =>
            el.addEventListener("change", ev => onPickFile(ev, +el.dataset.file)));
        wrap.querySelectorAll("[data-url]").forEach(el =>
            el.addEventListener("input", () => {
                const i = +el.dataset.url;
                blocks[i].img = el.value.trim();
                drawPreview(i);
            }));
        wrap.querySelectorAll("[data-rm]").forEach(el =>
            el.addEventListener("click", () => {
                syncBlocks();
                blocks.splice(+el.dataset.rm, 1);
                if (!blocks.length) blocks = [{ img: "", text: "" }];
                renderBlocks();
            }));
        wrap.querySelectorAll("[data-up]").forEach(el =>
            el.addEventListener("click", () => move(+el.dataset.up, -1)));
        wrap.querySelectorAll("[data-down]").forEach(el =>
            el.addEventListener("click", () => move(+el.dataset.down, 1)));
    }

    function move(i, dir) {
        const j = i + dir;
        if (j < 0 || j >= blocks.length) return;
        syncBlocks();
        const tmp = blocks[i]; blocks[i] = blocks[j]; blocks[j] = tmp;
        renderBlocks();
    }

    function closeEditor() {
        const box = document.getElementById("st-editor");
        if (box) { box.hidden = true; box.innerHTML = ""; }
        blocks = [];
    }

    function drawPreview(i) {
        const p = document.getElementById("st-b-prev-" + i);
        if (!p) return;
        const src = safeImgSrc(blocks[i] && blocks[i].img);
        p.innerHTML = src
            ? `<img src="${esc(src)}" alt="ตัวอย่างภาพที่ ${i + 1}" onerror="this.parentNode.innerHTML='<span class=\\'st-hint\\'>โหลดรูปจากลิงก์นี้ไม่ได้</span>'">`
            : "";
    }

    // ย่อ + บีบอัดรูปในเครื่องก่อนอัปโหลด (กันไฟล์ใหญ่เกิน)
    function onPickFile(ev, i) {
        const f = ev.target.files && ev.target.files[0];
        if (!f) return;
        const msg = document.getElementById("st-form-msg");
        if (!/^image\//.test(f.type)) { if (msg) msg.textContent = "ไฟล์ที่เลือกไม่ใช่รูปภาพ"; return; }
        if (msg) msg.textContent = "กำลังย่อรูป…";

        const rd = new FileReader();
        rd.onload = function () {
            const im = new Image();
            im.onload = function () {
                let { width: w, height: h } = im;
                const scale = Math.min(1, MAX_IMG_PX / Math.max(w, h));
                w = Math.round(w * scale); h = Math.round(h * scale);
                const cv = document.createElement("canvas");
                cv.width = w; cv.height = h;
                cv.getContext("2d").drawImage(im, 0, 0, w, h);

                let q = 0.82, out = "";
                for (let k = 0; k < 6; k++) {
                    out = cv.toDataURL("image/webp", q);
                    if (out.length * 0.75 <= MAX_IMG_BYTES) break;
                    q -= 0.12;
                }
                if (out.length * 0.75 > MAX_IMG_BYTES) {
                    if (msg) msg.textContent = "ภาพที่ " + (i + 1) + " ใหญ่เกินไป ลองใช้รูปที่เล็กลงหรือวางลิงก์รูปแทน";
                    return;
                }
                if (!blocks[i]) return;
                blocks[i].img = out;
                const urlBox = document.getElementById("st-b-url-" + i);
                if (urlBox) urlBox.value = "";
                if (msg) msg.textContent = "";
                drawPreview(i);
            };
            im.onerror = function () { if (msg) msg.textContent = "อ่านไฟล์รูปไม่สำเร็จ"; };
            im.src = rd.result;
        };
        rd.onerror = function () { if (msg) msg.textContent = "อ่านไฟล์ไม่สำเร็จ"; };
        rd.readAsDataURL(f);
    }

    /* ---------- Firebase ---------- */
    let db = null, ref = null, ready = false;
    let isOwner = false, authReady = false;

    function setStatus(txt, kind) {
        const s = document.getElementById("st-status");
        if (!s) return;
        s.textContent = txt || "";
        s.className = "st-status" + (kind ? " st-status-" + kind : "");
        s.style.display = txt ? "" : "none";
    }

    function loadScript(src) {
        return new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = src; s.async = true; s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        });
    }

    function connect() {
        return loadScript(SDK + "firebase-app-compat.js")
            .then(() => loadScript(SDK + "firebase-database-compat.js"))
            .then(() => {
                if (typeof firebase === "undefined") throw new Error("no sdk");
                try { firebase.initializeApp(FIREBASE); } catch (e) {}
                db = firebase.database();
                ready = true;
            })
            // auth ใช้เฉพาะให้ผู้ดูแลลบโพสต์ — โหลดไม่สำเร็จก็ยังใช้เว็บได้ตามปกติ
            .then(() => loadScript(SDK + "firebase-auth-compat.js").then(() => {
                if (!firebase.auth) return;
                authReady = true;
                firebase.auth().onAuthStateChanged(user => {
                    isOwner = !!user;
                    renderOwnerBar();
                    render();
                });
            }).catch(() => {}));
    }

    function watch() {
        if (!ready) return;
        if (ref) ref.off();
        entries = [];
        loaded = false;
        render();
        setStatus("กำลังโหลดข้อมูล…");
        ref = db.ref(DB_PATH + "/" + current);
        ref.limitToLast(200).on("value", snap => {
            const out = [];
            snap.forEach(ch => {
                const v = ch.val() || {};
                if (v.title && v.body) out.push({
                    id: ch.key, title: v.title, body: v.body,
                    img: v.img || "", blocks: v.blocks || null,
                    author: v.author || "", ts: v.ts || 0, tok: v.tok || "", edited: !!v.edited
                });
            });
            out.sort((a, b) => (b.ts || 0) - (a.ts || 0));
            entries = out;
            loaded = true;
            setStatus("");
            render();
        }, () => {
            setStatus("เชื่อมต่อฐานข้อมูลไม่ได้ ขณะนี้แสดงผลได้แต่ยังเพิ่มข้อมูลไม่ได้", "err");
        });
    }

    function save(entry) {
        const msg = document.getElementById("st-form-msg");
        const title = document.getElementById("st-f-title").value.trim();
        const body = document.getElementById("st-f-body").value.trim();
        const author = document.getElementById("st-f-author").value.trim().slice(0, MAX_AUTHOR);

        syncBlocks();
        // ตัดบล็อกว่างทิ้ง และกันลิงก์รูปที่ไม่ใช่ https
        let badUrlAt = -1;
        const clean = blocks.map((b, i) => {
            const img = safeImgSrc(b.img);
            if (b.img && !img && badUrlAt < 0) badUrlAt = i;
            return { img: img, text: String(b.text || "").trim().slice(0, MAX_BODY) };
        }).filter(b => b.img || b.text);

        if (title.length < 3) { msg.textContent = "กรุณาใส่หัวข้ออย่างน้อย 3 ตัวอักษร"; return; }
        if (body.length < 10) { msg.textContent = "กรุณาใส่เกริ่นนำอย่างน้อย 10 ตัวอักษร"; return; }
        if (badUrlAt >= 0) { msg.textContent = "ลิงก์รูปของภาพที่ " + (badUrlAt + 1) + " ต้องขึ้นต้นด้วย https:// เท่านั้น"; return; }
        if (clean.length > MAX_BLOCKS) { msg.textContent = "ใส่ได้สูงสุด " + MAX_BLOCKS + " ภาพต่อโพสต์"; return; }

        const bytes = clean.reduce((n, b) => n + b.img.length + b.text.length, 0);
        if (bytes > MAX_TOTAL_BYTES) {
            msg.textContent = "รูปทั้งหมดรวมกันใหญ่เกินไป (" + Math.round(bytes / 1024) +
                "KB) ลองลดจำนวนภาพ หรือใช้ลิงก์รูปแทนการอัปโหลดบางภาพ";
            return;
        }
        if (!ready) { msg.textContent = "ยังเชื่อมต่อฐานข้อมูลไม่ได้ ลองรีเฟรชหน้าอีกครั้ง"; return; }

        lsSet("gk_st_name", author);
        msg.textContent = "กำลังบันทึก…";

        const payload = {
            title: title.slice(0, MAX_TITLE),
            body: body.slice(0, MAX_BODY),
            author: author,
            ts: firebase.database.ServerValue.TIMESTAMP
        };
        if (clean.length) payload.blocks = clean;

        let p, savedId;
        if (entry && ownsEntry(entry.id, entry.tok)) {
            payload.tok = entry.tok;
            payload.edited = true;
            savedId = entry.id;
            p = db.ref(DB_PATH + "/" + current + "/" + entry.id).set(payload);
        } else {
            const tok = newToken();
            payload.tok = tok;
            const node = db.ref(DB_PATH + "/" + current).push();
            // จำ token ก่อนเขียน เพราะ listener อาจ re-render ทันทีที่ข้อมูลเข้า
            // ถ้าจำทีหลังจะยังไม่รู้ว่าเป็นโพสต์ของเรา ปุ่มแก้ไข/ลบจะไม่ขึ้น
            rememberToken(node.key, tok);
            savedId = node.key;
            p = node.set(payload);
        }

        // บันทึกเสร็จแล้วพาไปหน้าอ่านของโพสต์นั้นเลย จะได้เห็นผลลัพธ์เต็ม ๆ
        p.then(() => { closeEditor(); goto(current, savedId); })
         .catch(err => { msg.textContent = writeErrorText(err); });
    }

    // แยกสาเหตุที่บันทึกไม่สำเร็จ ให้ผู้ใช้รู้ว่าเป็นที่ตัวเองหรือที่ระบบ
    function writeErrorText(err) {
        const code = String((err && (err.code || err.message)) || "").toUpperCase();
        if (code.indexOf("PERMISSION_DENIED") > -1)
            return "ยังเปิดสิทธิ์เขียนข้อมูลไม่ครบ — ผู้ดูแลเว็บต้องตั้ง Firebase Rules ของ path นี้ก่อน (ดู docs/FIREBASE_RULES.md) ข้อมูลที่พิมพ์ไว้ยังอยู่ ไม่ต้องพิมพ์ใหม่";
        if (code.indexOf("NETWORK") > -1 || code.indexOf("UNAVAILABLE") > -1 || code.indexOf("DISCONNECT") > -1)
            return "เชื่อมต่อฐานข้อมูลไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วกดเผยแพร่อีกครั้ง";
        if (code.indexOf("TOO_BIG") > -1 || code.indexOf("MAX") > -1)
            return "ข้อมูลใหญ่เกินที่ระบบรับได้ ลองลดขนาดรูปหรือย่อรายละเอียดลง";
        return "บันทึกไม่สำเร็จ ลองกดเผยแพร่อีกครั้ง — ถ้ายังไม่ได้ แจ้งผู้ดูแลเว็บพร้อมข้อความนี้: " + (code || "unknown");
    }

    /* ---------- ผู้ดูแล (ลบได้คนเดียว) ----------
       ลบได้เฉพาะเจ้าของเว็บที่ล็อกอิน Firebase Auth เท่านั้น
       การซ่อนปุ่มเป็นแค่ UI — ตัวบังคับจริงอยู่ที่ Rules ฝั่ง Firebase
       ที่อนุญาต remove เฉพาะ auth.uid ของเจ้าของ (ดู docs/FIREBASE_RULES.md) */
    function removeEntry(id) {
        if (!isOwner) return;
        const e = entries.find(x => x.id === id);
        if (!e) return;
        if (!confirm('ลบ "' + e.title + '" ออกจากเว็บ?')) return;
        db.ref(DB_PATH + "/" + current + "/" + id).remove()
          .then(() => { if (viewId === id) goto(current, null); })  // ลบจากหน้าอ่าน → กลับไปรายการ
          .catch(err => {
            const code = String((err && (err.code || err.message)) || "").toUpperCase();
            setStatus(code.indexOf("PERMISSION_DENIED") > -1
                ? "ลบไม่สำเร็จ — Rules ยังไม่อนุญาตให้ UID นี้ลบ ตรวจสอบว่าใส่ UID ผู้ดูแลใน Rules แล้ว"
                : "ลบไม่สำเร็จ ลองอีกครั้ง", "err");
        });
    }

    function renderOwnerBar() {
        const bar = document.getElementById("st-ownerbar");
        if (!bar || !authReady) return;
        bar.innerHTML = isOwner
            ? `<span class="st-owner-on">โหมดผู้ดูแล — ลบโพสต์ได้ทุกรายการ</span>
               <button class="st-act" id="st-signout" type="button">ออกจากระบบ</button>`
            : `<button class="st-linkbtn" id="st-signin" type="button">เข้าสู่ระบบผู้ดูแล</button>`;

        const inBtn = document.getElementById("st-signin");
        const outBtn = document.getElementById("st-signout");
        if (inBtn) inBtn.addEventListener("click", openLogin);
        if (outBtn) outBtn.addEventListener("click", () => firebase.auth().signOut());
    }

    function openLogin() {
        const bar = document.getElementById("st-ownerbar");
        if (!bar) return;
        bar.innerHTML = `
            <form class="st-login" id="st-loginform">
                <input class="st-input" id="st-email" type="email" placeholder="อีเมลผู้ดูแล" aria-label="อีเมลผู้ดูแล" autocomplete="username" required>
                <input class="st-input" id="st-pass" type="password" placeholder="รหัสผ่าน" aria-label="รหัสผ่าน" autocomplete="current-password" required>
                <button class="st-act" type="submit">เข้าสู่ระบบ</button>
                <button class="st-act" type="button" id="st-logincancel">ยกเลิก</button>
                <span class="st-loginmsg" id="st-loginmsg"></span>
            </form>`;
        document.getElementById("st-logincancel").addEventListener("click", renderOwnerBar);
        document.getElementById("st-loginform").addEventListener("submit", ev => {
            ev.preventDefault();
            const msg = document.getElementById("st-loginmsg");
            msg.textContent = "กำลังตรวจสอบ…";
            firebase.auth()
                .signInWithEmailAndPassword(
                    document.getElementById("st-email").value.trim(),
                    document.getElementById("st-pass").value)
                .catch(() => { msg.textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง"; });
        });
    }

    /* ---------- boot ---------- */
    shell();
    connect()
        .then(() => { watch(); })
        .catch(() => {
            setStatus("โหลดฐานข้อมูลไม่สำเร็จ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้า", "err");
            const add = document.getElementById("st-add");
            if (add) { add.disabled = true; add.title = "ยังเชื่อมต่อฐานข้อมูลไม่ได้"; }
        });

})();
