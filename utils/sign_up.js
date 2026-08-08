import User from "../models/User.js";
import Admin from "../models/Admin.js"
export const signIn= async (name, password, email, role)=>{
    try{
        const user = {
            name: name,
            email:email,
            password:password,
            role:role
        }
        const response = await fetch(User.db+"/users", {
            method:"POST",
            headers:{"Content-Type":"applicaton/json"},
            body:JSON.stringify(user)
        })
        if(!response.ok){
            throw new Error(`HTTP ERROR!, ${response.status}`)
        }
        const data = await response.json();
        if(user.role === "admin") return Admin.createAdmin(data)
        return  User.createUser(data)
    }catch(er){
        console.error("Error", er)
    }
}
export const verifyEmail = async (email)=>{
    try{
        const response = await User.verifyEmail(email)
        if(response){
            return true
        }
        return false;
    } catch(er){
        console.error("Error", er)
    }
}
export default signIn