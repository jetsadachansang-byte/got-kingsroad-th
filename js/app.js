document.addEventListener("DOMContentLoaded", () => {

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

if (window.scrollY > 60) {

navbar.style.background = "rgba(5,5,5,.92)";
navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";

} else {

navbar.style.background = "rgba(8,8,8,.72)";
navbar.style.boxShadow = "none";

}

});

const cards = document.querySelectorAll(
".news-card,.quick-card,.community-box"
);

const observer = new IntersectionObserver(

(entries) => {

entries.forEach((entry) => {

if (entry.isIntersecting) {

entry.target.classList.add("show");

}

});

},

{

threshold: .15

}

);

cards.forEach((card) => {

card.classList.add("hidden");

observer.observe(card);

});

const mobileBtn = document.querySelector(".mobile-btn");

const nav = document.querySelector("nav");

if (mobileBtn) {

mobileBtn.addEventListener("click", () => {

nav.classList.toggle("open");

});

}

});