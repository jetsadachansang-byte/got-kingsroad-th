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

    const CLASSES = [
        { id: "knight",    name: "Knight",    nameTh: "อัศวิน",       role: "Frontline · แทงก์",        img: "images/classes/knight.webp" },
        { id: "assassin",  name: "Assassin",  nameTh: "นักลอบสังหาร", role: "Burst Damage · ความเร็ว",  img: "images/classes/assassin.webp" },
        { id: "sellsword", name: "Sellsword", nameTh: "ทหารรับจ้าง",  role: "Heavy Hitter · คอมโบหนัก", img: "images/classes/sellsword.webp" }
    ];

    /* ---------- utils ---------- */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

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

    /* ---------- โครงหน้า ---------- */
    let current = (location.hash || "").replace("#", "");
    if (!CLASSES.some(c => c.id === current)) current = "knight";

    function shell() {
        const tabs = CLASSES.map(c =>
            `<button class="st-tab${c.id === current ? " is-on" : ""}" data-cls="${c.id}" type="button">
                <span class="st-tab-name">${esc(c.name)}</span>
                <span class="st-tab-sub">${esc(c.nameTh)}</span>
            </button>`).join("");

        root.innerHTML = `
            <div class="st-tabs" role="tablist">${tabs}</div>
            <div class="st-classhead" id="st-classhead"></div>
            <div class="st-toolbar">
                <button class="btn-primary st-add" id="st-add" type="button">+ แชร์คอมโบ / บิลด์</button>
                <span class="st-count" id="st-count"></span>
            </div>
            <div class="st-status" id="st-status">กำลังโหลดข้อมูล…</div>
            <div class="st-list" id="st-list"></div>
            <div class="st-editor" id="st-editor" hidden></div>`;

        root.querySelectorAll(".st-tab").forEach(b =>
            b.addEventListener("click", () => switchTo(b.dataset.cls)));

        document.getElementById("st-add").addEventListener("click", () => openEditor(null));
        renderHead();
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
        if (!CLASSES.some(c => c.id === id) || id === current) return;
        current = id;
        history.replaceState(null, "", "#" + id);
        root.querySelectorAll(".st-tab").forEach(b =>
            b.classList.toggle("is-on", b.dataset.cls === id));
        renderHead();
        closeEditor();
        watch();
    }

    /* ---------- แสดงรายการ ---------- */
    let entries = [];

    function render() {
        const list = document.getElementById("st-list");
        const count = document.getElementById("st-count");
        if (!list) return;

        if (count) count.textContent = entries.length ? entries.length + " รายการ" : "";

        if (!entries.length) {
            list.innerHTML = `<div class="st-empty">
                <h3>ยังไม่มีข้อมูลของอาชีพนี้</h3>
                <p>เป็นคนแรกที่แชร์แนวทางลงสกิล ตำแหน่งจุด หรือภาพแผงสกิลของ ${esc(CLASSES.find(c => c.id === current).name)}
                   กด “เพิ่มข้อมูลสกิล” ด้านบนได้เลย</p>
            </div>`;
            return;
        }

        list.innerHTML = entries.map(e => {
            const img = safeImgSrc(e.img);
            const mine = ownsEntry(e.id, e.tok);
            return `<article class="st-entry" id="e-${esc(e.id)}">
                <header class="st-entry-head">
                    <h3>${esc(e.title)}</h3>
                    <div class="st-meta">
                        <span class="st-author">${esc(e.author || "ผู้เล่นนิรนาม")}</span>
                        <span class="st-dot">·</span>
                        <span>${esc(timeAgo(e.ts))}</span>
                        ${e.edited ? '<span class="st-dot">·</span><span class="st-edited">แก้ไขแล้ว</span>' : ""}
                    </div>
                </header>
                ${img ? `<div class="st-entry-img"><img src="${esc(img)}" alt="${esc(e.title)}" loading="lazy"
                          onerror="this.closest('.st-entry-img').style.display='none'"></div>` : ""}
                <div class="st-entry-body">${nl2br(e.body)}</div>
                <footer class="st-entry-foot">
                    ${mine ? `<button class="st-act" data-edit="${esc(e.id)}" type="button">แก้ไข</button>
                              <button class="st-act st-act-del" data-del="${esc(e.id)}" type="button">ลบ</button>`
                           : `<span class="st-byline">แชร์โดยผู้เล่นในชุมชน</span>`}
                </footer>
            </article>`;
        }).join("");

        list.querySelectorAll("[data-edit]").forEach(b =>
            b.addEventListener("click", () => openEditor(entries.find(x => x.id === b.dataset.edit))));
        list.querySelectorAll("[data-del]").forEach(b =>
            b.addEventListener("click", () => removeEntry(b.dataset.del)));
    }

    /* ---------- ฟอร์มเพิ่ม/แก้ไข ---------- */
    let pendingImg = "";

    function openEditor(entry) {
        const box = document.getElementById("st-editor");
        if (!box) return;
        pendingImg = entry ? (entry.img || "") : "";

        box.hidden = false;
        box.innerHTML = `
            <div class="st-editor-inner">
                <h3>${entry ? "แก้ไขข้อมูล" : "แชร์คอมโบ / บิลด์"} — ${esc(CLASSES.find(c => c.id === current).name)}</h3>

                <label class="st-label" for="st-f-title">หัวข้อ <span class="st-req">*</span></label>
                <input class="st-input" id="st-f-title" maxlength="${MAX_TITLE}" placeholder="เช่น คอมโบดาบใหญ่สายเลือดเดือด / เซตบิลด์ตีบอสสายคริ"
                       value="${entry ? esc(entry.title) : ""}">

                <label class="st-label" for="st-f-body">รายละเอียด <span class="st-req">*</span></label>
                <textarea class="st-input st-textarea" id="st-f-body" rows="8" maxlength="${MAX_BODY}"
                          placeholder="อธิบายลำดับคอมโบ เซตอุปกรณ์ที่ใส่ วัตถุโบราณ จำนวนจุดสกิล และเหตุผลที่เลือกแนวนี้…">${entry ? esc(entry.body) : ""}</textarea>

                <label class="st-label">รูปภาพ (ถ้ามี)</label>
                <div class="st-imgrow">
                    <input type="file" id="st-f-file" accept="image/*" class="st-file">
                    <span class="st-or">หรือ</span>
                    <input class="st-input st-url" id="st-f-url" placeholder="วางลิงก์รูป https://…"
                           value="${entry && /^https:/i.test(entry.img || "") ? esc(entry.img) : ""}">
                </div>
                <p class="st-hint">แนะนำภาพแผงสกิล เซตอุปกรณ์ หรือคอมโบจากในเกมจริง (สกรีนช็อต) — ระบบจะย่อขนาดให้อัตโนมัติ ห้ามใช้ภาพที่ไม่เกี่ยวข้อง</p>
                <div class="st-preview" id="st-preview"></div>

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

        drawPreview();
        document.getElementById("st-f-file").addEventListener("change", onPickFile);
        document.getElementById("st-f-url").addEventListener("input", function () {
            pendingImg = this.value.trim(); drawPreview();
        });
        document.getElementById("st-cancel").addEventListener("click", closeEditor);
        document.getElementById("st-save").addEventListener("click", () => save(entry));
        box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closeEditor() {
        const box = document.getElementById("st-editor");
        if (box) { box.hidden = true; box.innerHTML = ""; }
        pendingImg = "";
    }

    function drawPreview() {
        const p = document.getElementById("st-preview");
        if (!p) return;
        const src = safeImgSrc(pendingImg);
        p.innerHTML = src
            ? `<img src="${esc(src)}" alt="ตัวอย่างรูป" onerror="this.parentNode.innerHTML='<span class=\\'st-hint\\'>โหลดรูปจากลิงก์นี้ไม่ได้</span>'">`
            : "";
    }

    // ย่อ + บีบอัดรูปในเครื่องก่อนอัปโหลด (กันไฟล์ใหญ่เกิน)
    function onPickFile(ev) {
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
                for (let i = 0; i < 6; i++) {
                    out = cv.toDataURL("image/webp", q);
                    if (out.length * 0.75 <= MAX_IMG_BYTES) break;
                    q -= 0.12;
                }
                if (out.length * 0.75 > MAX_IMG_BYTES) {
                    if (msg) msg.textContent = "รูปใหญ่เกินไป ลองใช้รูปที่เล็กลงหรือวางลิงก์รูปแทน";
                    return;
                }
                pendingImg = out;
                const urlBox = document.getElementById("st-f-url");
                if (urlBox) urlBox.value = "";
                if (msg) msg.textContent = "";
                drawPreview();
            };
            im.onerror = function () { if (msg) msg.textContent = "อ่านไฟล์รูปไม่สำเร็จ"; };
            im.src = rd.result;
        };
        rd.onerror = function () { if (msg) msg.textContent = "อ่านไฟล์ไม่สำเร็จ"; };
        rd.readAsDataURL(f);
    }

    /* ---------- Firebase ---------- */
    let db = null, ref = null, ready = false;

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
            });
    }

    function watch() {
        if (!ready) return;
        if (ref) ref.off();
        entries = [];
        render();
        setStatus("กำลังโหลดข้อมูล…");
        ref = db.ref(DB_PATH + "/" + current);
        ref.limitToLast(200).on("value", snap => {
            const out = [];
            snap.forEach(ch => {
                const v = ch.val() || {};
                if (v.title && v.body) out.push({ id: ch.key, title: v.title, body: v.body, img: v.img || "", author: v.author || "", ts: v.ts || 0, tok: v.tok || "", edited: !!v.edited });
            });
            out.sort((a, b) => (b.ts || 0) - (a.ts || 0));
            entries = out;
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
        const img = safeImgSrc(pendingImg);

        if (title.length < 3) { msg.textContent = "กรุณาใส่หัวข้ออย่างน้อย 3 ตัวอักษร"; return; }
        if (body.length < 10) { msg.textContent = "กรุณาใส่รายละเอียดอย่างน้อย 10 ตัวอักษร"; return; }
        if (pendingImg && !img) { msg.textContent = "ลิงก์รูปต้องขึ้นต้นด้วย https:// เท่านั้น"; return; }
        if (!ready) { msg.textContent = "ยังเชื่อมต่อฐานข้อมูลไม่ได้ ลองรีเฟรชหน้าอีกครั้ง"; return; }

        lsSet("gk_st_name", author);
        msg.textContent = "กำลังบันทึก…";

        const payload = {
            title: title.slice(0, MAX_TITLE),
            body: body.slice(0, MAX_BODY),
            img: img,
            author: author,
            ts: firebase.database.ServerValue.TIMESTAMP
        };

        let p;
        if (entry && ownsEntry(entry.id, entry.tok)) {
            payload.tok = entry.tok;
            payload.edited = true;
            p = db.ref(DB_PATH + "/" + current + "/" + entry.id).set(payload);
        } else {
            const tok = newToken();
            payload.tok = tok;
            const node = db.ref(DB_PATH + "/" + current).push();
            // จำ token ก่อนเขียน เพราะ listener อาจ re-render ทันทีที่ข้อมูลเข้า
            // ถ้าจำทีหลังจะยังไม่รู้ว่าเป็นโพสต์ของเรา ปุ่มแก้ไข/ลบจะไม่ขึ้น
            rememberToken(node.key, tok);
            p = node.set(payload);
        }

        p.then(() => { closeEditor(); })
         .catch(() => { msg.textContent = "บันทึกไม่สำเร็จ อาจถูกจำกัดสิทธิ์การเขียน ลองใหม่อีกครั้ง"; });
    }

    function removeEntry(id) {
        const e = entries.find(x => x.id === id);
        if (!e || !ownsEntry(id, e.tok)) return;
        if (!confirm("ลบข้อมูลนี้ออกจากเว็บ?")) return;
        db.ref(DB_PATH + "/" + current + "/" + id).remove().catch(() => {
            setStatus("ลบไม่สำเร็จ ลองอีกครั้ง", "err");
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
