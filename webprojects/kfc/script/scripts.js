const theme = document.getElementById("select_theme");
if(localStorage.getItem("Theme") == "dark"){
    document.querySelector("body").classList.add("theme-dark")
    document.querySelector("body").classList.remove("rainbow-background")
} else if(localStorage.getItem("Theme") == "rainbow") {
    document.querySelector("body").classList.add("rainbow-background");
    document.querySelector("body").classList.remove("theme-dark")
}else{
    document.querySelector("body").classList.remove("theme-dark")
    document.querySelector("body").classList.remove("rainbow-background")
}
theme.addEventListener("change", (e)=>{
    localStorage.setItem("Theme", theme.value);
    if(localStorage.getItem("Theme") == "dark"){
    document.querySelector("body").classList.add("theme-dark")
    document.querySelector("body").classList.remove("rainbow-background")
    } else if(localStorage.getItem("Theme") == "rainbow") {
    document.querySelector("body").classList.add("rainbow-background");
    document.querySelector("body").classList.remove("theme-dark")
    }else{
    document.querySelector("body").classList.remove("theme-dark")
    document.querySelector("body").classList.remove("rainbow-background")
    }
})
