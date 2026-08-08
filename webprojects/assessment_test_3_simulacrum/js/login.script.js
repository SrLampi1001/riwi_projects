import logIn from "./../utils/log_in.js";
const PasswordInput = document.getElementById("loginPassword");
const EmailInput = document.getElementById("loginEmail");

document.getElementById("loginForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const user = await logIn(EmailInput.value, PasswordInput.value);
    if(user !== null){
        sessionStorage.setItem("user", JSON.stringify(user))
        location.reload()
    }
    const hidden = document.querySelector(".hidden");
    hidden.classList.remove("hidden");

})
document.addEventListener("DOMContentLoaded", ()=>{
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(user!==null){
        if(user.role === "admin") {
            window.location = "./admin/"
        } else{
            location = "./"
        }
    }
})