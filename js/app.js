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
        
        // Search box: filter visible content on the page
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function performLocalSearch() {
  const query = searchInput.value.trim().toLowerCase();

  // ถ้าอยากให้ปุ่มค้นหาแค่กระโดดไปส่วนข่าว ก็เปลี่ยน logic ตรงนี้ได้ภายหลัง
  if (!query) {
    alert("พิมพ์คำที่ต้องการค้นหาก่อน");
    return;
  }

  const searchableItems = document.querySelectorAll(
    ".news-card, .quick-card, .featured-content, .section-title, .community-box"
  );

  let firstMatch = null;

  searchableItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(query);

    item.style.display = match ? "" : "none";

    if (match && !firstMatch) {
      firstMatch = item;
    }
  });

  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert("ไม่พบข้อมูลที่ค้นหา");
  }
}

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", performLocalSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performLocalSearch();
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