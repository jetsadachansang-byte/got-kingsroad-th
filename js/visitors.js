/* ============================================================
   visitors.js — ตัวนับผู้เข้าชมแบบเรียลไทม์ (Firebase Realtime Database)

   แสดง 3 ค่า:
     • ออนไลน์ตอนนี้ (Online now)     — presence แบบเรียลไทม์
     • ผู้เข้าชมทั้งหมด (Total visitors) — นับผู้เข้าชมไม่ซ้ำ (ต่ออุปกรณ์) สะสม
     • เปิดลิงก์ไม่ซ้ำ (Unique views)  — จำนวนการเปิดหน้า/ลิงก์ที่ไม่ซ้ำกัน

   ────────────────────────────────────────────────────────────
   ✏️ วิธีตั้งค่า (ทำครั้งเดียว):
   1) ไปที่ https://console.firebase.google.com → สร้างโปรเจกต์ (ฟรี)
   2) เมนู Build → Realtime Database → Create Database (เลือก region + Start in test mode
      หรือใช้กฎด้านล่าง)
   3) ตั้งกฎ (Rules) ให้ตัวนับอ่าน/เขียนได้ (เว็บ community ทั่วไปใช้ได้):
        {
          "rules": {
            "presence": { ".read": true, ".write": true },
            "stats":    { ".read": true, ".write": true }
          }
        }
   4) Project Settings → General → Your apps → Web app (</>) → คัดลอกค่า firebaseConfig
      มาวางแทนค่าใน CONFIG ด้านล่าง (โดยเฉพาะ apiKey และ databaseURL)
   5) เพิ่มโดเมนเว็บ (…​.workers.dev) ใน Authentication → Settings → Authorized domains
      (ถ้าใช้ presence ผ่าน anonymous ไม่จำเป็น แต่ใส่ไว้ก็ดี)

   หมายเหตุ: apiKey ของ Firebase เป็นค่า public ใส่ในโค้ดฝั่งหน้าเว็บได้ตามปกติ
   ตราบใดที่ตั้ง Rules ให้เหมาะสม (ด้านบนจำกัดเขียนได้เฉพาะ presence/stats)

   วิดเจ็ตจะซ่อนอัตโนมัติจนกว่าจะกรอก CONFIG จริง
============================================================ */

(function () {

    /* ---------- ⬇️ วางค่า firebaseConfig ของคุณตรงนี้ ⬇️ ---------- */
    var CONFIG = {
        apiKey:       "PASTE_FIREBASE_API_KEY",
        authDomain:   "PASTE_PROJECT.firebaseapp.com",
        databaseURL:  "https://PASTE_PROJECT-default-rtdb.firebaseio.com",
        projectId:    "PASTE_PROJECT"
    };
    /* ---------- ⬆️ วางค่า firebaseConfig ของคุณตรงนี้ ⬆️ ---------- */

    var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
    var STALE_MS = 70000;   // ถือว่าออฟไลน์ถ้าไม่มี heartbeat เกิน 70 วินาที
    var BEAT_MS  = 25000;   // ส่ง heartbeat ทุก 25 วินาที

    /* ถ้ายังไม่ตั้งค่า → ไม่ทำอะไร (ซ่อนวิดเจ็ต) */
    if (!CONFIG.apiKey || /PASTE/.test(CONFIG.apiKey) ||
        !CONFIG.databaseURL || /PASTE/.test(CONFIG.databaseURL)) {
        if (window.console) console.info("[visitors] ยังไม่ได้ตั้งค่า Firebase — ตัวนับถูกซ่อนไว้ (ดูวิธีตั้งค่าใน js/visitors.js)");
        return;
    }

    function loadScript(src, cb) {
        var s = document.createElement("script");
        s.src = src; s.async = true;
        s.onload = cb;
        s.onerror = function () { if (window.console) console.warn("[visitors] โหลด Firebase SDK ไม่สำเร็จ:", src); };
        document.head.appendChild(s);
    }

    function fmt(n) { try { return Number(n || 0).toLocaleString("th-TH"); } catch (e) { return String(n || 0); } }
    function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = fmt(v); }

    /* client id ถาวรต่ออุปกรณ์ (สำหรับนับผู้เข้าชมไม่ซ้ำ) */
    function clientId() {
        var k = "gk_cid", v;
        try {
            v = localStorage.getItem(k);
            if (!v) { v = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem(k, v); }
        } catch (e) { v = "anon"; }
        return v;
    }
    function seen(key) {
        try { if (localStorage.getItem(key)) return true; localStorage.setItem(key, "1"); return false; }
        catch (e) { return false; }
    }

    function boot() {
        loadScript(SDK + "firebase-app-compat.js", function () {
            loadScript(SDK + "firebase-database-compat.js", init);
        });
    }

    function init() {
        if (typeof firebase === "undefined") return;
        try { firebase.initializeApp(CONFIG); } catch (e) { /* already inited */ }
        var db = firebase.database();
        var TS = firebase.database.ServerValue.TIMESTAMP;
        var cid = clientId();

        /* ---- ผู้เข้าชมทั้งหมด: +1 ครั้งเดียวต่ออุปกรณ์ (ครั้งแรกที่เข้า) ---- */
        if (!seen("gk_counted_visitor")) {
            db.ref("stats/totalVisitors").transaction(function (v) { return (v || 0) + 1; });
        }

        /* ---- เปิดลิงก์ไม่ซ้ำ: +1 ครั้งเดียวต่อ (อุปกรณ์ + หน้า) ---- */
        var pageKey = "gk_pv:" + location.pathname;
        if (!seen(pageKey)) {
            db.ref("stats/uniqueViews").transaction(function (v) { return (v || 0) + 1; });
        }

        /* ---- ออนไลน์ตอนนี้ (presence) ---- */
        var meRef = db.ref("presence").push();
        var beat = function () { meRef.set({ t: TS, c: cid }); };
        db.ref(".info/connected").on("value", function (snap) {
            if (snap.val() === true) { meRef.onDisconnect().remove(); beat(); }
        });
        var beatTimer = setInterval(beat, BEAT_MS);
        window.addEventListener("beforeunload", function () {
            clearInterval(beatTimer);
            try { meRef.remove(); } catch (e) {}
        });

        /* ---- อ่านค่ามาแสดง (เรียลไทม์) ---- */
        db.ref("presence").on("value", function (snap) {
            var now = Date.now(), online = 0;
            snap.forEach(function (child) {
                var val = child.val() || {};
                if (now - (val.t || 0) < STALE_MS) {
                    online++;
                } else {
                    // เก็บกวาด node ที่ตายค้าง (best-effort)
                    try { child.ref.remove(); } catch (e) {}
                }
            });
            setText("gk-online", online || 1);
        });
        db.ref("stats/totalVisitors").on("value", function (s) { setText("gk-total", s.val()); });
        db.ref("stats/uniqueViews").on("value", function (s) { setText("gk-unique", s.val()); });

        showWidget();
    }

    function showWidget() {
        var w = document.getElementById("gk-stats");
        if (w) w.removeAttribute("hidden");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

})();
