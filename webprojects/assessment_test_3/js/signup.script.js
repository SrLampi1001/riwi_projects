import {signIn, verifyEmail} from "./utils/sign_up.js";
const form = document.getElementById("signupForm");
const usernameInput = document.getElementById("signupName");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const passwordVerificationInput = document.getElementById("signupConfirmPassword");
/* Function Login */
const signup = async (name, email,  password)=>{
    let emailIsValid = await verifyEmail(email);
    console.log(emailIsValid)
    if(emailIsValid){
        const user = await signIn(name, password, email);
        return user
    }
    document.querySelector("#signupEmail + .hidden").classList.remove("hidden") //show error 
    return null
}
/* Function PasswordVerification */
const verificatePassword = (password, passwordVerification) =>{
    if (password !== passwordVerification){
        passwordVerificationInput.value = "";
        passwordVerificationInput.nextElementSibling.classList.remove("hidden")
        return false
    }
    return true
}

form.addEventListener("submit", async e=>{
    e.preventDefault()
    if(!verificatePassword(passwordInput.value, passwordVerificationInput.value)){
        return
    }
    const user = await signup(usernameInput.value, emailInput.value, passwordInput.value);
    if (user !== null){
        localStorage.setItem("user", JSON.stringify(user));
        window.location.reload()
    } else{
        console.error("Error, the user is null") // Change for a pop up
        e.preventDefault();
    }
})
document.addEventListener("DOMContentLoaded", ()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    if(user!==null){
        if(user.role ==="admin") location = "./admin/dashboard.html"
        else location = "./"
    }
})