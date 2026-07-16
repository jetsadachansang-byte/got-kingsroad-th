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