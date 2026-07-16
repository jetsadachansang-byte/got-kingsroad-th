window.addEventListener("DOMContentLoaded",()=>{

const loader=document.getElementById("loading");

if(loader){

setTimeout(()=>{

loader.style.opacity="0";

loader.style.visibility="hidden";

setTimeout(()=>{

loader.remove();

},600);

},1200);

}

});

document.addEventListener("DOMContentLoaded",()=>{

const navbar=document.querySelector(".navbar");

const mobileBtn=document.querySelector(".mobile-btn");

const nav=document.querySelector("nav");

window.addEventListener("scroll",()=>{

navbar.classList.toggle("scrolled",window.scrollY>50);

});

if(mobileBtn){

mobileBtn.onclick=()=>{

nav.classList.toggle("open");

};

}

const cards=document.querySelectorAll(".news-card,.quick-card,.community-box");

const observer=new IntersectionObserver((entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{threshold:.15});

cards.forEach((card)=>{

card.classList.add("hidden");

observer.observe(card);

});

});
const hero=document.getElementById("hero");

window.addEventListener("scroll",()=>{

if(hero){

hero.style.backgroundPositionY=window.scrollY*.35+"px";

}

});
const slides=document.querySelectorAll(".featured-slide");

let current=0;

setInterval(()=>{

slides[current].classList.remove("active");

current++;

if(current>=slides.length){

current=0;

}

slides[current].classList.add("active");

},5000);
const glow=document.createElement("div");

glow.id="cursorGlow";

document.body.appendChild(glow);

document.addEventListener("mousemove",(e)=>{

requestAnimationFrame(()=>{

glow.style.left=e.clientX+"px";

glow.style.top=e.clientY+"px";

});

});(e)=>{

glow.style.left=e.clientX+"px";

glow.style.top=e.clientY+"px";

});
window.addEventListener("scroll",()=>{

document.querySelectorAll(".quick-card,.news-card").forEach(card=>{

const rect=card.getBoundingClientRect();

if(rect.top<window.innerHeight-80){

card.classList.add("show");

}

});

});
const searchBtn=document.getElementById("searchBtn");

const searchInput=document.getElementById("searchInput");

if(searchBtn){

searchBtn.onclick=()=>{

const value=searchInput.value.toLowerCase();

if(value.includes("ข่าว")){

location.href="news.html";

}

else if(value.includes("road")){

location.href="roadmap.html";

}

else if(value.includes("คู่มือ")){

location.href="guide.html";

}

else if(value.includes("ฐาน")){

location.href="database.html";

}

else if(value.includes("บอส")){

location.href="database.html";

}

else if(value.includes("ไอเทม")){

location.href="database.html";

}

else if(value.includes("ทอง")){

location.href="calculator.html";

}

else{

alert("ยังไม่พบข้อมูล");

}

};

}
const hero=document.querySelector(".hero");

const heroImages=[

"images/hero/hero1.jpg",

"images/hero/hero2.jpg",

"images/hero/hero3.jpg",

"images/hero/hero4.jpg"

];

let heroIndex=0;

setInterval(()=>{

heroIndex++;

if(heroIndex>=heroImages.length){

heroIndex=0;

}

hero.style.backgroundImage=

`linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.88)),url(${heroImages[heroIndex]})`;

},6000);