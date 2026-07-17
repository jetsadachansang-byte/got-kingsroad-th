document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       LOADING
    ========================== */

    const loader = document.getElementById("loading");

    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            setTimeout(() => loader.remove(), 600);
        }, 1200);
    }

    /* ==========================
       SEARCH → ROUTE
    ========================== */

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    function goToSearchResult() {
        if (!searchInput) return;

        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            alert("พิมพ์คำค้นหาก่อน");
            return;
        }

        const routes = {
            "ข่าว": "news.html",
            "ข่าวสาร": "news.html",
            "developer": "news.html",
            "patch": "news.html",
            "แพตช์": "news.html",
            "roadmap": "roadmap.html",
            "แผน": "roadmap.html",
            "ฐานข้อมูล": "database.html",
            "database": "database.html",
            "บอส": "database.html",
            "ไอเทม": "database.html",
            "อาชีพ": "database.html",
            "แผนที่": "database.html",
            "คู่มือ": "guide.html",
            "guide": "guide.html",
            "ฟาร์ม": "guide.html",
            "build": "guide.html",
            "คำนวณ": "calculator.html",
            "calculator": "calculator.html"
        };

        for (const key in routes) {
            if (query.includes(key)) {
                window.location.href = routes[key];
                return;
            }
        }

        alert("ไม่พบหน้าที่ตรงกับคำค้น");
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", goToSearchResult);

        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                goToSearchResult();
            }
        });
    }

    /* ==========================
       NAVBAR SCROLL
    ========================== */

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
    });

    /* ==========================
       MOBILE MENU
    ========================== */

    const mobileBtn = document.querySelector(".mobile-btn");
    const nav = document.querySelector("nav");

    if (mobileBtn && nav) {
        mobileBtn.addEventListener("click", () => {
            nav.classList.toggle("open");
        });

        // ปิดเมนูเมื่อกดลิงก์
        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => nav.classList.remove("open"));
        });
    }

    /* ==========================
       FEATURED SLIDER
    ========================== */

    const slider = document.querySelector(".featured-slider");
    const slides = document.querySelectorAll(".featured-slide");

    if (slider && slides.length > 1) {

        let current = 0;
        let timer = null;
        const DELAY = 5000; // สลับทุก 5 วินาที

        // สร้างจุด indicator
        const dotsWrap = document.createElement("div");
        dotsWrap.className = "slider-dots";

        slides.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.className = "dot" + (i === 0 ? " active" : "");
            dot.setAttribute("aria-label", "สไลด์ที่ " + (i + 1));
            dot.addEventListener("click", () => {
                goTo(i);
                restart();
            });
            dotsWrap.appendChild(dot);
        });

        slider.appendChild(dotsWrap);

        // สร้างปุ่มลูกศร (ไอคอน SVG)
        const CHEVRON_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
        const CHEVRON_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

        const prevBtn = document.createElement("button");
        prevBtn.className = "slider-arrow prev";
        prevBtn.innerHTML = CHEVRON_L;
        prevBtn.setAttribute("aria-label", "สไลด์ก่อนหน้า");

        const nextBtn = document.createElement("button");
        nextBtn.className = "slider-arrow next";
        nextBtn.innerHTML = CHEVRON_R;
        nextBtn.setAttribute("aria-label", "สไลด์ถัดไป");

        slider.appendChild(prevBtn);
        slider.appendChild(nextBtn);

        prevBtn.addEventListener("click", () => {
            goTo((current - 1 + slides.length) % slides.length);
            restart();
        });

        nextBtn.addEventListener("click", () => {
            goTo((current + 1) % slides.length);
            restart();
        });

        function goTo(index) {
            slides[current].classList.remove("active");
            dotsWrap.children[current].classList.remove("active");

            current = index;

            slides[current].classList.add("active");
            dotsWrap.children[current].classList.add("active");
        }

        function start() {
            timer = setInterval(() => {
                goTo((current + 1) % slides.length);
            }, DELAY);
        }

        function restart() {
            clearInterval(timer);
            start();
        }

        // หยุดเลื่อนเมื่อเอาเมาส์ชี้
        slider.addEventListener("mouseenter", () => clearInterval(timer));
        slider.addEventListener("mouseleave", start);

        start();
    }

    /* ==========================
       BACK TO TOP
    ========================== */

    const backTop = document.createElement("button");
    backTop.className = "back-top";
    backTop.setAttribute("aria-label", "กลับขึ้นด้านบน");
    backTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(backTop);

    window.addEventListener("scroll", () => {
        backTop.classList.toggle("visible", window.scrollY > 600);
    });

    backTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ==========================
       SCROLL REVEAL
    ========================== */

    const cards = document.querySelectorAll(".news-card,.quick-card,.community-box,.class-card,.tl-item,.stat");

    if (cards.length > 0) {

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        cards.forEach(card => {
            card.classList.add("hidden");
            observer.observe(card);
        });
    }

});
