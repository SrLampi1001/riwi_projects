import fetchAPI from "./fetch.js";

async function log_auth(email, password){
    let securePassword = encodeURIComponent(String(password));
    let secureEmail = encodeURIComponent(email.trim().toLowerCase());
    try{
        const response = await fetchAPI(`/users?email=${secureEmail}&password=${securePassword}`);
        if(response instanceof Error) throw response;
        if(response.length > 0){
            return response
        } else {
            alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            return null
        }
    } catch(error){
        console.error(error);
    }
}
function logout(){
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
async function sign_auth(name, email, password){
    let securePassword = password;
    let secureEmail = email.trim().toLowerCase()
    let secureName = name
    try{
        const response = await fetchAPI(`/users`, {headers:{"Content-Type":"application/json"}, method:"POST", body: JSON.stringify({
            "name":secureName,
            "email":secureEmail,
            "password":securePassword
        })})
        if (response instanceof Error) throw response;
        console.log("user created!")
        return response;
    } catch(error){
        console.error("The user could not be created: ", error)
        return null;
    }
}
export {log_auth, sign_auth, logout}