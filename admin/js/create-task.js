import User from "../../js/models/User.js";
import Task from "../../js/models/Task.js";
import Admin from "../../js/models/Admin.js";
const admin = Admin.createAdmin(JSON.parse(localStorage.getItem("user"))) //Get admin object
const form = document.querySelector("form");
await User.fetchUsers(); //Await fot users
await Task.fetchTasks(); //await for tasks
const title = document.querySelector("[data-task-title]")
const details = document.querySelector("[data-task-details]")
const priority = document.querySelector("[data-task-priority]")
const date = document.querySelector("[data-task-date]")
const user = document.querySelector("[data-task-user]")
for (const [key, username] of User.users){ //Chargue all users for addition
    user.innerHTML+=`
    <option value="${key}">${username.username}</option>
    `
}
form.addEventListener("submit",async  e=>{
    e.preventDefault()
    const taskmodel = {
        user_id : user.value,
        title: title.value,
        details:details.value,
        priority:priority.value,
        expiration_date: date.value
    }
    console.log(taskmodel)
    const Task = await admin.makeTask(taskmodel)
    console.log(Task)
}
)
document.querySelector("[type=button]").addEventListener("click", ()=>{
    title.value = "";
    details.value = "";
    priority.value = "";
    date.value = "";
    user.value = "";
})