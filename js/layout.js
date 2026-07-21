/* ============================================================
   layout.js — ส่วนกลางของเว็บ (แก้ที่นี่ที่เดียว เปลี่ยนทุกหน้า)

   ✏️ วิธีแก้เมนู: แก้ในตัวแปร MENU ด้านล่าง
   ✏️ วิธีแก้ footer: แก้ในตัวแปร FOOTER_HTML
   หน้า HTML แต่ละหน้าแค่มี:
     <body data-page="ชื่อหน้า" data-topbar="ข้อความบนสุด">
     <div id="site-header"></div>  และ  <div id="site-footer"></div>
============================================================ */

(function () {

    /* ---------- เมนูหลัก (แก้ตรงนี้ที่เดียว) ---------- */

    const MENU = [
        { id: "home",       href: "index.html",      label: "หน้าหลัก" },
        { id: "news",       href: "news.html",       label: "ข่าวสาร" },
        { id: "roadmap",    href: "roadmap.html",    label: "Roadmap" },
        {
            id: "database", href: "database.html",   label: "ฐานข้อมูล",
            dropdown: [
                { href: "database.html#cat-class", label: "อาชีพ" },
                { href: "database.html#cat-boss",  label: "บอส" },
                { href: "database.html#cat-dungeon", label: "ดันเจียน" },
                { href: "database.html#cat-map",   label: "แผนที่" },
                { href: "database.html#cat-eq-system", label: "อุปกรณ์" },
                { href: "database.html#cat-eq-amulet", label: "Amulet" },
                { href: "database.html#cat-monster", label: "มอนสเตอร์" },
            ],
        },
        { id: "guide",      href: "guide.html",      label: "คู่มือ" },
        { id: "calculator", href: "calculator.html", label: "คำนวณ" },
    ];

    // หน้าไหนให้เมนูไหนขึ้น active (หน้า classes ให้เมนูฐานข้อมูล active)
    const ACTIVE_ALIAS = { classes: "database" };

    /* ---------- Footer (แก้ตรงนี้ที่เดียว) ---------- */

    const FOOTER_HTML = `
<footer>
    <div class="container footer-grid">

        <div>
            <h3>Game of Thrones: Kingsroad TH</h3>
            <p>เว็บไซต์แฟนคอมมูนิตี้ภาษาไทย</p>
        </div>

        <div>
            <h4>เมนู</h4>
            <ul>
                <li><a href="news.html">ข่าวสาร</a></li>
                <li><a href="roadmap.html">Roadmap</a></li>
                <li><a href="database.html">ฐานข้อมูล</a></li>
            </ul>
        </div>

        <div>
            <h4>JC Gameservice</h4>
            <ul>
                <li><a href="classes.html">อาชีพ</a></li>
                <li><a href="guide.html">คู่มือ</a></li>
                <li><a href="calculator.html">เครื่องคำนวณ</a></li>
            </ul>
        </div>

    </div>

    <div class="gk-stats" id="gk-stats" hidden>
        <div class="gk-stat gk-stat-live" id="gk-tile-online">
            <span class="gk-dot" aria-hidden="true"></span>
            <span class="gk-num" id="gk-online">–</span>
            <span class="gk-label">ออนไลน์ตอนนี้</span>
        </div>
        <div class="gk-stat">
            <span class="gk-num" id="gk-total">–</span>
            <span class="gk-label">ผู้เข้าชมทั้งหมด</span>
        </div>
        <div class="gk-stat">
            <span class="gk-num" id="gk-unique">–</span>
            <span class="gk-label">เปิดลิงก์ไม่ซ้ำ</span>
        </div>
    </div>

    <p class="footer-disclaimer">เว็บไซต์นี้เป็นแฟนคอมมูนิตี้/ฐานข้อมูลที่จัดทำโดยแฟนเกม ไม่ได้เป็นเว็บไซต์อย่างเป็นทางการ และไม่มีส่วนเกี่ยวข้องกับ Netmarble หรือ HBO — เครื่องหมายการค้าและทรัพย์สินทางปัญญาทั้งหมดเป็นของเจ้าของลิขสิทธิ์</p>

    <div class="copyright">© 2026 Game of Thrones: Kingsroad TH • JC Gameservice</div>
</footer>`;

    /* ============================================================
       ด้านล่างนี้ไม่ต้องแก้ (ระบบประกอบหน้า)
    ============================================================ */

    const page = document.body.dataset.page || "";
    const activeId = ACTIVE_ALIAS[page] || page;
    const topbarText = document.body.dataset.topbar ||
        "ประเทศไทยแฟนคอมมูนิตี้ Game of Thrones: Kingsroad";

    const topbarLink = page === "home"
        ? '<a href="news.html">ข่าวล่าสุด</a>'
        : '<a href="index.html">กลับหน้าหลัก</a>';

    const menuHtml = MENU.map(function (m) {
        const active = m.id === activeId ? ' class="active"' : "";
        if (m.dropdown) {
            const sub = m.dropdown
                .map(d => `<a href="${d.href}">${d.label}</a>`)
                .join("\n                        ");
            return `<li class="dropdown">
                    <a${active} href="${m.href}">${m.label}</a>
                    <div class="dropdown-menu">
                        ${sub}
                    </div>
                </li>`;
        }
        return `<li><a${active} href="${m.href}">${m.label}</a></li>`;
    }).join("\n                ");

    const HEADER_HTML = `
<div class="topbar">
    <div class="container">
        <span>${topbarText}</span>
        ${topbarLink}
    </div>
</div>

<header class="navbar">
    <div class="container nav-wrapper">

        <a href="index.html" class="logo">
            <img src="images/logo/got-header.webp"
                 class="logo-image"
                 alt="Game of Thrones Kingsroad Thailand">
        </a>

        <nav>
            <ul>
                ${menuHtml}
            </ul>
        </nav>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="ค้นหาข่าว คู่มือ บอส ไอเทม...">
            <button id="searchBtn" aria-label="ค้นหา"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></button>
        </div>

        <div class="mobile-btn" role="button" aria-label="เมนู"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></div>

    </div>
</header>`;

    const headerSlot = document.getElementById("site-header");
    const footerSlot = document.getElementById("site-footer");

    if (headerSlot) headerSlot.outerHTML = HEADER_HTML;
    if (footerSlot) footerSlot.outerHTML = FOOTER_HTML;

    /* โหลดตัวนับผู้เข้าชม (ทำงานเมื่อกรอก Firebase config แล้วเท่านั้น) */
    if (!document.getElementById("gk-visitors-js")) {
        const vs = document.createElement("script");
        vs.id = "gk-visitors-js";
        vs.src = "js/visitors.js";
        vs.async = true;
        document.body.appendChild(vs);
    }

})();
