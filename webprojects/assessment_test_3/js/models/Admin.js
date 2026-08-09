import User from "./User.js";
import {createTask} from "../../api.js"
import Task from "./Task.js";
export default class Admin extends User {
    role = "admin";
    constructor(id, username, email, password) {
        super(id, username, email, password);
        delete this.cart; //removes the cart property, as admins should not have
    }
    static createAdmin({id, username, email, password } = {}) {
        try {
            if (!id || !username || !email || !password) {
                throw new Error("Missing required user fields");
            }
            return new Admin(id, username, email, password);
        } catch (err) {
            console.error("error", err)
            return null;
        }
    }
    async makeTask({title, details, expiration_date, priority, user_id}){
        if(!title||!details||!expiration_date||!priority||!user_id)return null //a value is missing
        const taskModel = {
            title:title, 
            details:details, 
            expiration_date:expiration_date,
            state:"Pending",
            priority:priority,
            user_id:user_id
        }
        const task = await createTask(taskModel);
        return await Task.createTask(task) //Returns task object
    }
}