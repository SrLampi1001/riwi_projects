import { getTasks, updateTask, deleteTask } from "../../api.js";
export default class Task{
    static _tasks = new Map()
    constructor(id, title, details, expiration_date, state, priority, user_id){
        this.id=id;
        this.title=title;
        this.details = details;
        this.expiration_date = expiration_date;
        this.state = state;
        this.priority = priority;
        this.user_id = user_id
    }
    static createTask({id, title, details, expiration_date, state, priority, user_id}){
        if(!id || !title || !details || !expiration_date || !state || !priority || !user_id){
            console.log({
                id:id,
                title:title,
                details:details,
                expiration_date:expiration_date,
                state:state,
                priority:priority,
                user_id:user_id
            })
            console.error("Not all parameters included")
            return null
        }
        return new Task(id, title, details, expiration_date, state, priority, user_id)
    }
    static async removeTask(id){
        this._tasks.delete(id);
        return deleteTask(id)
    }
    markCompleted(){
        this.state = "Complete"
    }
    markInProgress(){
        this.state = "In-progress"
    }
    async updateTask(data){
        for (const prop in data){
            Object.hasOwn(prop)
            Object.defineProperty(this, prop, {value:data[prop], writable:true})
        }
        if(await updateTask(this.id, data)){ //Calls the task update in the db.json
            console.log("updated succesfully")
        } else{
            console.log("There has been an error and the task could not be updated")
        }
    }
    static async fetchTasks(){
        const task = await getTasks();
        for(const t of task){
            this._tasks.set(t.id, this.createTask(t))
        }
    }
    static get tasks(){
        return this._tasks;
    }
}