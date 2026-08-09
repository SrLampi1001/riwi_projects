import { sanytizeString } from "../utils/funcs.js";
import fetchAPI from "../utils/fetch.js";
export default class Post{
    constructor(title, contents, id = null){
        this.title = title;
        this.contents = contents;
        this.id = id;
    }
    static async constructPost({title, contents, userName, id}){
        try{
            if(!title||!contents||!userName||!id)throw new Error("Error, not all params given")
            return new Post(title, contents, userName, id)
        } catch(error){
            console.error(error);
            return error
        }
    }
    static editPost({title, contents}){
        if(title){
            title = sanytizeString(title)
            this.title = title;
        }
        if(contents){
            contents = sanytizeString(contents)
            this.contents = contents;
        }
    }
    static async createPost({title, contents, userName}){
        try{
            const response = await fetchAPI("/posts/", {
                headers:{"Content-Type":"application/json"},
                method:"POST",
                body: JSON.stringify({title, contents, userName})
            })
            return Post.constructPost(response)
        } catch(error){
            console.error(error)
        }
    }
    static async getAllPosts(){
        try{
            const response = await fetchAPI("/posts/");
            return response;
        } catch(error){
            console.error(error)
            return error
        }
    }
}