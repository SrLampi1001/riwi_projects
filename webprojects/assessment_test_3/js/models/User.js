import {getUsers} from "../../api.js"
export default class User{
    static db = "http://localhost:3000";
    static isListening = false;
    static _users = new Map();
    constructor(id, username, email, password, role = "user"){
        this.id=id;
        this.username=username;
        this.email=email;
        this.password = password;
        this.role = role;
    }
    static createUser({id, username, email, password, role}){
        if (!id || !username || !email || !password) {
            console.error("Missing required user fields");
            return null
        }
        return new User(id, username, email, password, role);
    }
    static async verifyEmail(email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; //Regex to validate email
        if(!emailRegex.test(email)){
            return false
        }
        try{
            const response = await fetch(User.db+"/users/?email="+email, {
                method:"GET",
                headers:{"Content-Type":"application/json"}
            })
            if(!response.ok){
                throw new Error(`HTTP ERROR! ${response.status}`)
            }
            const data = await response.json();
            if(data.length===0){
                return true
            }
            return false
        } catch (err){
            console.error("error", err)
            return er;
        }
    }
    static async fetchUsers(){
        const data = await getUsers();
        for(const user of data){
            User._users.set(user?.id, this.createUser(user))
        }
    }
    static get users(){
        return this._users;
    }
    //Add methods for creating and updating user information
    async createTask({title, details, expiration_date, priority}){

    }

}