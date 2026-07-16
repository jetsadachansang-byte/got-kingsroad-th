window.addEventListener("load",()=>{

setTimeout(()=>{

const loader=document.getElementById("loading");

loader.style.opacity="0";

setTimeout(()=>{

loader.remove();

},800);

},1200);

});

document.addEventListener("DOMContentLoaded",()=>{

const navbar=document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

navbar.classList.toggle("scrolled",window.scrollY>50);

});

});