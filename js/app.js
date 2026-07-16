window.addEventListener("load",()=>{

setTimeout(()=>{

const loader=document.getElementById("loading");

if(loader){

loader.style.opacity="0";

setTimeout(()=>{

loader.remove();

},800);

}

},1200);

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