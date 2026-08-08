import Admin from "../models/Admin.js";
import User from "../models/User.js"
const logIn = async (email, password)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; //Regex to verify if it's username or email
    if(!emailRegex.test(email)){
        return new Error("Email invalid")
    }
    try{
        //If product Model created, instead of fecth, call Product.getStock() -> product.sell();
        const response = await fetch(User.db+"/users?email="+email, {
                method: "GET",
                headers: {"Content-Type":"application/json"}
            });
            if(!response.ok){
                throw new Error(`HTTP Error! status ${response.status}`);
            }
            const data = await response.json();
            if (data.length === 0){
                return null
            } else if (data[0]?.password === password){
                if(data[0].role === "admin"){
                    return new Admin(data[0]?.id, data[0]?.name, data[0].email, data[0]?.password)
                }
                return new User(data[0]?.id, data[0]?.name, data[0]?.email, data[0]?.password);
            } else{
                return null
            }
    } catch(error){
        console.error(error)
    }
}
export default logIn