document.addEventListener("DOMContentLoaded", ()=>{
    if(!localStorage.getItem("user")){
        location.href = "./sign.html"
    }
})