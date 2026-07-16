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