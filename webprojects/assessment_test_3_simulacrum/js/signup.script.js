import {signIn, verifyEmail} from "../utils/sign_up.js";
const form = document.getElementById("signupForm");
const usernameInput = document.getElementById("signupName");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const passwordVerificationInput = document.getElementById("signupConfirmPassword");
const roleInput = document.getElementById("role");
/* Function Login */
const signup = async (name, email,  password, role)=>{
    let emailIsValid = await verifyEmail(email);
    console.log(emailIsValid)
    if(emailIsValid){
        const user = await signIn(name, password, email, role);
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
    if(roleInput.value === "user" || roleInput.value === "admin"){
        const user = await signup(usernameInput.value, emailInput.value, passwordInput.value, roleInput.value);
        if (user !== null){
            sessionStorage.setItem("user", JSON.stringify(user));
            window.location.reload()
        } else{
            console.error("Error, the user is null") // Change for a pop up
            e.preventDefault();
        }
    }
})
document.addEventListener("DOMContentLoaded", ()=>{
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(user!==null){
        if(user.role ==="admin") location = "./admin/"
        else location = "./"
    }
})