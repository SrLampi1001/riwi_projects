const password_input = document.getElementById("password");
const email_input = document.getElementById("email");
let correct_password = "PASWORDSSSSS";
let correct_email = "Email@gmail.com";

document.getElementById("btn-submit").addEventListener("click", (e)=>{
    if (password_input.value == correct_password && correct_email == email_input.value){
        // Functionality
        sessionStorage.setItem("email", email_input);
        window.location = "./index.html";
    } else{
        password_input.value = "";
        message = document.createElement("span"); message.textContent = "La contraseña o correo incorrecto";
        message.setAttribute("style", "position: absolute; left:50%; transform:translate(-50%, 50%); display:inline-block; width:max-content; color:red");
        document.querySelector("body").append(message)
        setTimeout(() => {
            message.remove()
        }, 2000);

    }
})
