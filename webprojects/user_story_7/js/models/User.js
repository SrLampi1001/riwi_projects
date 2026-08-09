import fetchAPI from "../utils/fetch.js";
import POST from "./Post.js"
export default class User {
    constructor(name, email, password, posts, id = null){
        this.name = name;
        this.email = email;
        this.password = password;
        this.posts = posts;
        this.id = id;
    }
    static async constructUser({name, email, password, posts, id}){
        try{
            if(!name || !email || !password || !id ) throw new Error("Error, not al params given")
            return new User(name, email, password, posts||[], id)
        } catch(error){
            console.error(error)
            return error
        }
    }
    logOut(){
        localStorage.removeItem("user")
    }
    logIn(){
        localStorage.setItem("user", JSON.stringify(this))
    }
    async removeAccout(){
        try{
            const response = await fetchAPI(`/users/${this.id}`,{method:"DELETE"})
            return response;
        } catch(error){
            console.error(error)
            return error;
        }
    }
    async post(post_id){
        this.posts.push(post_id)
        try{
            const response = await fetchAPI(`/users/${this.id}`,{
                method:"PATCH",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    posts: this.posts
                })
            })
            return response
        } catch(error){
            console.error(error)
            return error
        }
    }
}