document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       LOADING
    ========================== */

    const loader = document.getElementById("loading");

    if (loader) {
    setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        setTimeout(() => {
            loader.remove();
        }, 600);

    }, 1200);
}
      
        
        // Search box: route to matching pages
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function goToSearchResult() {
    if (!searchInput || !searchBtn) return;

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
        "roadmap": "roadmap.html",
        "ฐานข้อมูล": "database.html",
        "database": "database.html",
        "คู่มือ": "guide.html",
        "guide": "guide.html",
        "คำนวณ": "calculator.html",
        "calculator": "calculator.html",
        "บริการ": "services.html",
        "service": "services.html"
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
       NAVBAR
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

    }

    /* ==========================
       SCROLL REVEAL
    ========================== */

    const cards = document.querySelectorAll(
        ".news-card,.quick-card,.community-box"
    );

    if (cards.length > 0) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

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