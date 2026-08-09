const API_URL = "http://localhost:3000/";
export default API_URL;
/* API TASK METHODS */
export const getTasks = async ()=>{
    try{
        const response = await fetch(API_URL+"tasks/")
        if(!response.ok)throw new Error("Http error: ", response.status)
        const data = await response.json();
        return data
    } catch (er){
        console.error("Error: ", er)
        return er;
    }
}
export const getTasksById = async (...ids)=>{
    let consult = ids.join(","); //Joins all ids by comma for consult
    try{
        const response = await fetch(API_URL+"tasks?_id="+consult)
        if(!response.ok) throw new Error("HTTP error: ", response.status)
        const data = await response.json();
        return data;
    } catch(er){
        console.error("Error: ", er)
        return er;
    }
}
export const updateTask = async (id, data)=>{
    try{
        const response = await fetch(API_URL+"tasks/"+id, {
            method:"PATCH",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(data)
        });
        if(!response.ok) throw new Error("HTTP error: ", response.status)
        const result = await response.ok;
        return result;
    } catch(er){
        console.error("Error: ", er)
        return er;
    }
}
export const createTask = async ({title, details, expiration_date, state, priority, user_id}) => {
    try {
        const task = {
            title:title,
            details:details,
            expiration_date, expiration_date,
            state:state,
            priority:priority,
            user_id:user_id
        }
        const response = await fetch(API_URL+"tasks/", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(task)
        })
        if(!response.ok) throw new Error("HTTP error: ", response.status)
        const data = await response.json();
        return data;
    } catch (er) {
        console.error("Error: ", er)
        return er;
    }
}
export const deleteTask = async (id) => {
    try{
        const response = await fetch(API_URL+"tasks/"+id, {method:"DELETE"});
        if(!response.ok) throw new Error("HTTP error: ", response.status)
        const result = await response.json();
        return result;
    } catch(er){
        console.error("Error: ", er)
        return er;
    }
}
/* API USER METHODS */
export const getUsers = async () =>{
    try{
        const response = await fetch(API_URL+"users/", {
            method:"GET", 
            headers:{"Content-Type":"application/json"}
        })
        if(!response.ok){
            throw new Error(`HTTP ERROR! ${response.status}`)
        }
        const data = await response.json();
        return data
    } catch(er){
        console.error("Error", er)
        return false;
    }
}
export const getUser = async (id) => {
    try{
        const response = await fetch(API_URL+"users/"+id)
        if(!response.ok)throw new Error("Http error: ", response.status)
        const data = await response.json();
        return data
    }catch(er){
        console.error("Error: ", er)
        return er;
    }
}
export const updateUser = async (id, dat)=>{
    try{
        const response = await fetch(API_URL+"users/"+id, {
            method:"PATCH",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(dat)
        })
        if(!response.ok)throw new Error("Http error: ", response.status)
        const data = await response.json();
        return data
    }catch(er){
        console.error("Error: ", er)
        return er;
    }
}
export const deleteUser = async (id) => {
    try{
        const response = await fetch(API_URL+"users/"+id, {method:"DELETE"});
        if(!response.ok) throw new Error("HTTP error: ", response.status)
        const result = await response.json();
        return result;
    } catch(er){
        console.error("Error: ", er)
        return er;
    }
}