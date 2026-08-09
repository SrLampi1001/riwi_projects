import Task from "./../../js/models/Task.js"; 
import User from "./../../js/models/User.js";
const asideEditing = document.getElementById("task-editing");
const tableTasks = document.getElementById("table-tasks");
const completionRate = document.querySelector("[data-completion-rate]");
const pendingTasks = document.querySelector("[data-pending-tasks");
const usersAmount = document.querySelector("[data-users-amount]");
const tasksAmount = document.querySelector("[data-tasks-amount]");

const setTaskToedit = (task)=>{
    //Create Element select for the select status option
    let selectState = document.createElement("select"); 
    selectState.innerHTML = `
        <option value="Pending" data-class="bg-warning-subtle text-warning-emphasis" ${task?.state === "Pending" ? "selected" : ""}>Pending </option>
        <option value="In-progress" data-class="bg-info-subtle text-info-emphasis" ${task?.state === "In-progress" ? "selected" : ""}>In-progress</option>
        <option value="Completed" data-class="bg-success-subtle text-success-emphasis" ${task?.state === "Completed" ? "selected" : ""}>Completed</option>
    `; //Sets the innerHTML
    selectState.setAttribute("class", selectState.querySelector(`[value=${task?.state}]`).getAttribute("data-class")) //Add classes from state
    selectState.classList.add("small", "rounded-pill", "p-2", "position-absolute", "top-0", "end-0", "mt-2"); //add the rest of the classes
    selectState.setAttribute("data-task-state", "");
    //Select for asignee
    let selectAsignee = document.createElement("select");
    selectAsignee.setAttribute("data-task-asignee", "");
        //Set the first option
    selectAsignee.innerHTML = `<option value="${task?.user_id}" selected>${User.users.get(task?.user_id)?.username}</option>`;
    for(const [key, user] of User.users){ //Adds the rest of user options
        if(user?.role === "admin"){
            continue //Skips admins
        }else{
            selectAsignee.innerHTML+=`<option value="${key}">${user?.username}</option>`;
        }
    }
    //Select for priority
    let selectPriority = document.createElement("select");
    selectPriority.innerHTML = `
    <option value="Low" data-class="bg-success-subtle text-success-emphasis" ${task?.priority === "Low" ? "selected" : ""}>Low</option>
    <option value="Medium" data-class="bg-warning-subtle text-warning-emphasis" ${task?.priority === "Medium" ? "selected" : ""}>Medium</option>
    <option value="High" data-class="bg-danger-subtle text-danger-emphasis" ${task?.priority === "High" ? "selected" : ""}>High</option>
    `;
    selectPriority.setAttribute("class", selectPriority.querySelector(`[value=${task?.priority}]`)?.getAttribute("data-class")) //Add classes from priority
    selectPriority.classList.add("w-bold","small","border-0", "bg-white", "m-0", "p-0"); //add the rest of the classes
    selectPriority.setAttribute("data-task-priority", "");
    let template = `
        <div class="card-header position-relative">
            <p class="small text-secondary m-0">Details</p>
            <span class="fw-bold" data-task-id>${task.id}</span>
            ${selectState.outerHTML} <!-- Inserts all the html from selectState object -->
        </div>
        <div class="card-body">
            <div class="row pb-3 border-bottom border-black">
                <div class="d-flex flex-column col-12">
                    ${selectAsignee.outerHTML} <!-- Inserts all the html from selectAsignee object -->
                    <span class="small text-secondary" data-user-email>saraglin@gmail.com</span>
                    <span class="small text-secondary" data-user-number>+1 (555) 123-4567</span>
                    <input type="text" class="fw-bolder fs-4 border-0 form-control" value="${task?.title}"
                        data-task-title>
                    <textarea data-task-details value="${task?.details}" class="border-0 form-control">${task?.details}</textarea>
                    <label for="priority" class="text-secondary small">Task Priority: </label>
                    ${selectPriority.outerHTML}<!-- Inserts all the html from selecPriority object -->
                    <label for="expiration-date" class="text-secondary small">Date: </label>
                    <input name="expiration-date" id="expiration-date" type="date" data-task-due-date class="text-secondary border-0 form-control"
                        value="${task?.expiration_date}">
                </div>
            </div>
        </div>
        <div class="card-footer row m-0 p-2 text-center">
            <button type="button" class="btn btn-danger col-md-4" data-cancel>Cancel</button>
            <button type="button" class="btn btn-success col-md-4" data-update>Update</button>
            <button type="button" class="btn btn-warning col-md-4" data-delete>Delete</button>
        </div>
        `;
        asideEditing.innerHTML = template; //Sets content inside aside
}
//Event listener to start Editing
document.addEventListener("click", e=>{
    //For editing a taks
    if(e.composedPath()[1] && e.composedPath()[1].matches('[data-task]')){
        const tr = e.composedPath()[1]
        e.target.closest(".table-selected")?.classList.toggle("table-selected") //remove selected from other table elements
        tr.classList.add("table-selected") //add selected to table element
        let id = tr.getAttribute("data-task") //Get the attribute data task, retrieves id inside the tr
        setTaskToedit(Task.tasks.get(id))// search for matching task inside tasks
    }
    //editing and updating
    if(e.target && e.target.matches("[data-delete]")){
        console.log("deleting")
        let el = asideEditing.querySelector("[data-task-id]");
        let id = el.textContent
        console.log("removing")
        Task.removeTask(id)
    } else if(e.target && e.target.matches("[data-update]")){
        let state = asideEditing.querySelector("[data-task-state]");
        let asignee = asideEditing.querySelector("[data-task-asignee]")
        let title = asideEditing.querySelector("[data-task-title]")
        let details = asideEditing.querySelector("[data-task-details]")
        let priority = asideEditing.querySelector("[data-task-priority]")
        let date = asideEditing.querySelector("[data-task-due-date]")
        const data = {
            user_id : asignee.value,
            title: title.value,
            state:state.value,
            details:details.value,
            priority:priority.value,
            expiration_date: date.value
        }
        let el = asideEditing.querySelector("[data-task-id]");
        let id = el.textContent;
        console.log("updating")
        Task.tasks.get(id).updateTask(data)//push data to update using task method
    } else if(e.target && e.target.matches("[data-cancel]")){
        asideEditing.innerHTML = "";
        console.log("canceling")
    }
})
const createTableElement = async (task)=>{
    const classes = new Map(); 
    //set a map to create css classes to be added
    classes.set("In-progress", "bg-info-subtle text-info-emphasis"); //For in progress task state
    classes.set("Complete", "bg-success-subtle text-success-emphasis"); //For complete tasks state 
    classes.set("Pending", "bg-warning-subtle text-warning-emphasis"); //For pending task state
    classes.set("Low", "text-success"); //For low priority task
    classes.set("Medium", "text-warning"); //For medium priority task
    classes.set("High", "text-danger") //For high priority task
    const tr = document.createElement("tr");
    let template = `
        <td class="small text-secondary">${task?.id}</td>
        <td>${task?.title}</td>
        <td>${User.users.get(task?.user_id)?.username}</td> <!-- Gets the username from the users in user -->
        <td><span class="small ${classes.get(task?.state)} rounded-pill p-2">${task?.state}</span></td>
        <td class="text-warning">${task?.priority}</td>
        <td class="text-secondary date">${task?.expiration_date}</td>
    `;
    tr.innerHTML = template;
    return tr;
}

const renderTable = async()=>{
    await Task.fetchTasks();
    await User.fetchUsers();
    for(const [key, task] of Task.tasks){
        const tr = await createTableElement(task); //Creates the tr element
        tr.setAttribute("data-task", key) //Sets the task id into an attribute
        tableTasks.querySelector("tbody").appendChild(tr) //render the table element inside the table
    }
    tasksAmount.textContent = Task.tasks.size;
    usersAmount.textContent = User.users.size;
    let pendingAmount = 0;
    let completedTask = 0;
    for(const [key, task] of Task.tasks){
        if(task.state === "Pending"){
            pendingAmount++;
        }
        if(task.state == "Complete"){
            completedTask++;
        }
    }
    pendingTasks.textContent = pendingAmount;
    completionRate.textContent = (completedTask / Task.tasks.size)*100 + "%"
}
renderTable()