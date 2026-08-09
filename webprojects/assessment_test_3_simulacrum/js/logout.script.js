document.getElementById("logout").addEventListener("click", e=>{
    const confirmation =  confirm("do you really want to log out?")
    sessionStorage.removeItem("user")
    location.reload();
})