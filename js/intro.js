/* ============================================================
   intro.js — ฉากเปิดเว็บ 3D (cinematic intro) เฉพาะหน้าแรก
   - แสดงครั้งเดียวต่อ session · ข้ามได้ (ปุ่ม/ESC/เลื่อน/คลิก) · auto-dismiss
   - เคารพ prefers-reduced-motion · ถ้าไม่แสดง เว็บทำงานปกติ (progressive enhancement)
============================================================ */
(function () {
    const intro = document.getElementById("intro3d");
    if (!intro) return;

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem("gk-intro") === "1"; } catch (e) {}
    if (reduce || seen) return; // ไม่แสดงฉากเปิด — เข้าเว็บตรง ๆ

    document.body.classList.add("intro-lock");
    intro.classList.add("is-active");

    /* ---------- กันโฟกัส/สกรีนรีดเดอร์หลุดไปหลังฉาก ----------
       layout.js แทนที่ #site-header/#site-footer ด้วย <header>/<footer> จริง
       ก่อน intro.js ทำงาน (สคริปต์ถูกโหลดตามลำดับ) จึงต้องหาแบบ selector */
    const hidden = [];
    ["header", "#main-content", "footer"].forEach(function (sel) {
        const el = document.querySelector(sel);
        if (el && !el.hasAttribute("aria-hidden")) {
            el.setAttribute("aria-hidden", "true");
            hidden.push(el);
        }
    });
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) { skipLink.setAttribute("tabindex", "-1"); }

    const enterBtn = document.getElementById("introEnter");
    const skipBtn = document.getElementById("introSkip");
    (enterBtn || intro).focus();

    function trapTab(e) {
        if (e.key !== "Tab" || !enterBtn || !skipBtn) return;
        if (e.shiftKey && document.activeElement === enterBtn) {
            e.preventDefault(); skipBtn.focus();
        } else if (!e.shiftKey && document.activeElement === skipBtn) {
            e.preventDefault(); enterBtn.focus();
        }
    }
    intro.addEventListener("keydown", trapTab);

    /* ---------- หิมะตก (สร้างด้วย JS แบบเบา) ---------- */
    const snow = intro.querySelector(".intro-snow");
    if (snow) {
        let html = "";
        for (let i = 0; i < 46; i++) {
            const left = (Math.random() * 100).toFixed(2);
            const size = (2 + Math.random() * 5).toFixed(1);
            const dur = (5 + Math.random() * 7).toFixed(2);
            const delay = (-Math.random() * 12).toFixed(2);
            const op = (0.25 + Math.random() * 0.6).toFixed(2);
            const drift = (Math.random() * 60 - 30).toFixed(0);
            html += '<span style="left:' + left + '%;width:' + size + 'px;height:' + size +
                'px;opacity:' + op + ';animation-duration:' + dur + 's;animation-delay:' + delay +
                's;--drift:' + drift + 'px"></span>';
        }
        snow.innerHTML = html;
    }

    /* ---------- parallax ตามเมาส์ (tilt เวที 3D) ---------- */
    const stage = intro.querySelector(".intro-stage");
    let raf = 0, tx = 0, ty = 0;
    function onMove(e) {
        tx = (e.clientX / window.innerWidth - 0.5);
        ty = (e.clientY / window.innerHeight - 0.5);
        if (raf) return;
        raf = requestAnimationFrame(function () {
            raf = 0;
            if (!stage) return;
            stage.style.setProperty("--rx", (-ty * 6).toFixed(2) + "deg");
            stage.style.setProperty("--ry", (tx * 9).toFixed(2) + "deg");
        });
    }
    window.addEventListener("mousemove", onMove);

    /* ---------- ปิดฉาก ---------- */
    let done = false, timer = 0;
    function dismiss() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { sessionStorage.setItem("gk-intro", "1"); } catch (e) {}
        window.removeEventListener("mousemove", onMove);
        intro.removeEventListener("keydown", trapTab);
        hidden.forEach(function (el) { el.removeAttribute("aria-hidden"); });
        if (skipLink) { skipLink.removeAttribute("tabindex"); }
        intro.classList.add("is-hiding");
        setTimeout(function () {
            intro.classList.remove("is-active", "is-hiding");
            intro.style.display = "none";
            document.body.classList.remove("intro-lock");
        }, 850);
    }

    if (enterBtn) enterBtn.addEventListener("click", dismiss);
    if (skipBtn) skipBtn.addEventListener("click", dismiss);
    intro.addEventListener("wheel", dismiss, { passive: true });
    intro.addEventListener("touchmove", dismiss, { passive: true });
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    });
    timer = setTimeout(dismiss, 7000);
})();
