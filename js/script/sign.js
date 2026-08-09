import {log_auth, sign_auth} from "../utils/log_auth.js"
import {sanytizeString} from "../utils/funcs.js"
import User from "../models/User.js"
let sesion = "#login";
const opt = async ()=>{
    const state = document.querySelector('.active')
    sesion = state.dataset.bsTarget;
}
const select = document.querySelector('ul.nav-pills')
select.addEventListener('click', opt)
const log_in = async ()=>{
    const email = document.querySelector("input[type=email]")
    const password = document.querySelector("input[type=password")
    let passwordValue = sanytizeString(password.value)
    let emailValue =  sanytizeString(email.value)
    const user = await log_auth(emailValue, passwordValue)
    return user[0];
}
const sign_in = async ()=>{
    const username = document.querySelector("[data-signup-username]");
    const email = document.querySelector("[data-signup-email]");
    const password = document.querySelector("[data-signup-password]");
    const confirmPassword = document.querySelector('[data-signup-confirm-password]');
    if((password.value !== confirmPassword.value)){
        alert("Passwords aren't the same")
        throw new Error("passwords don't match")
    } else if (password.value === '' || email.value=== ''){
        throw new Error("Password or email empty")
    }
    let passwordValue = sanytizeString(password.value);
    let usernameValue = username.value !== '' ? sanytizeString(username.value) : "annonymus";
    let emailValue = sanytizeString(email.value)
    const user = await sign_auth(usernameValue, emailValue, passwordValue)
    return user;
}
document.addEventListener('submit', async (e)=>{
    e.preventDefault()
    try{
        if(sesion === "#login"){
            const user = await User.constructUser(await log_in());
            user.logIn()

        } else{
            const user = await User.constructUser(await sign_in());
            user.logIn()
        }
    } catch (error){
        console.error(error)
        return null;
    }
    location.href = "index.html"
})
