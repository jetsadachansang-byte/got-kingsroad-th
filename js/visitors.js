/* ============================================================
   visitors.js — ตัวนับผู้เข้าชม

   ทำงานได้ทันทีโดยไม่ต้องตั้งค่าอะไร (zero-setup):
     • ผู้เข้าชมทั้งหมด (Total visitors) — นับไม่ซ้ำต่ออุปกรณ์ สะสม
     • เปิดลิงก์ไม่ซ้ำ (Unique views)   — นับการเปิดหน้า/ลิงก์ที่ไม่ซ้ำกัน
   ใช้บริการตัวนับฟรี Abacus (abacus.jasoncameron.dev) ไม่ต้องมีบัญชี

   ออปชันเสริม (ต้องตั้งค่าเอง):
     • ออนไลน์ตอนนี้ (Online now) — presence เรียลไทม์จริง ต้องใช้ Firebase
       Realtime Database ใส่ค่าใน FIREBASE ด้านล่าง (ดูวิธีในคอมเมนต์)
       ถ้าไม่ตั้งค่า ไทล์ "ออนไลน์ตอนนี้" จะถูกซ่อนไว้

   ทุกอย่าง degrade อย่างนุ่มนวล: ถ้าบริการใดล่ม ไทล์นั้นจะไม่ขึ้น
   โดยไม่ทำให้หน้าเว็บพัง และไม่มีการโชว์ตัวเลขปลอม
============================================================ */

(function () {

    /* ---------- ตัวนับ (ไม่ต้องตั้งค่า) ---------- */
    var ABACUS = "https://abacus.jasoncameron.dev";
    var NS     = "got-kingsroad-th-jc";   // namespace เฉพาะของเว็บนี้

    /* ---------- ออนไลน์ตอนนี้ (ออปชัน — ใส่ Firebase ถ้าต้องการ) ----------
       สร้างโปรเจกต์ฟรีที่ console.firebase.google.com → Realtime Database
       → ตั้ง Rules ให้ presence อ่าน/เขียนได้:
         { "rules": { "presence": { ".read": true, ".write": true } } }
       แล้ววาง apiKey + databaseURL ด้านล่าง                                   */
    var FIREBASE = {
        databaseURL: "https://online-89559-default-rtdb.asia-southeast1.firebasedatabase.app"
    };

    var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
    var STALE_MS = 70000, BEAT_MS = 25000;

    /* ---------- utils ---------- */
    function fmt(n) { try { return Number(n).toLocaleString("th-TH"); } catch (e) { return String(n); } }
    function el(id) { return document.getElementById(id); }
    function setVal(id, v) { var e = el(id); if (e && v != null && !isNaN(v)) { e.textContent = fmt(v); reveal(); } }
    function reveal() { var w = el("gk-stats"); if (w) w.removeAttribute("hidden"); }
    function seen(key) {
        try { if (localStorage.getItem(key)) return true; localStorage.setItem(key, "1"); return false; }
        catch (e) { return false; }
    }

    /* ---------- Abacus: total + unique ---------- */
    function abacus(path) {
        return fetch(ABACUS + path, { method: "GET" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (j) { return j && typeof j.value === "number" ? j.value : null; })
            .catch(function () { return null; });
    }

    function countTotal() {
        var isNew = !seen("gk_counted_visitor");
        abacus((isNew ? "/hit/" : "/get/") + NS + "/visitors").then(function (v) { setVal("gk-total", v); });
    }

    function countUnique() {
        var pageKey = "gk_pv:" + location.pathname;
        var firstOpen = !seen(pageKey);
        abacus((firstOpen ? "/hit/" : "/get/") + NS + "/views").then(function (v) { setVal("gk-unique", v); });
    }

    /* ---------- Firebase presence: online now (optional) ---------- */
    function onlineConfigured() {
        return FIREBASE.databaseURL && !/PASTE/.test(FIREBASE.databaseURL);
    }

    function hideOnlineTile() {
        var t = el("gk-tile-online"); if (t) t.style.display = "none";
    }

    function loadScript(src, cb) {
        var s = document.createElement("script");
        s.src = src; s.async = true; s.onload = cb;
        s.onerror = function () { hideOnlineTile(); };
        document.head.appendChild(s);
    }

    function startPresence() {
        loadScript(SDK + "firebase-app-compat.js", function () {
            loadScript(SDK + "firebase-database-compat.js", function () {
                if (typeof firebase === "undefined") { hideOnlineTile(); return; }
                try { firebase.initializeApp(FIREBASE); } catch (e) {}
                var db = firebase.database();
                var TS = firebase.database.ServerValue.TIMESTAMP;
                var meRef = db.ref("presence").push();
                var beat = function () { meRef.set({ t: TS }); };
                db.ref(".info/connected").on("value", function (s) {
                    if (s.val() === true) { meRef.onDisconnect().remove(); beat(); }
                });
                var timer = setInterval(beat, BEAT_MS);
                window.addEventListener("beforeunload", function () { clearInterval(timer); try { meRef.remove(); } catch (e) {} });
                db.ref("presence").on("value", function (s) {
                    var now = Date.now(), n = 0;
                    s.forEach(function (c) {
                        var v = c.val() || {};
                        if (now - (v.t || 0) < STALE_MS) n++;
                        else { try { c.ref.remove(); } catch (e) {} }
                    });
                    setVal("gk-online", n || 1);
                });
            });
        });
    }

    /* ---------- boot ---------- */
    function boot() {
        countTotal();
        countUnique();
        if (onlineConfigured()) startPresence();
        else hideOnlineTile();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();

})();
