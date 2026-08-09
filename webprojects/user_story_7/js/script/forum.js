import User from "../models/User.js"
import Post from "../models/Post.js"
const user = await User.constructUser(JSON.parse(localStorage.getItem("user")))

const createPost = async ()=>{
    const title = document.getElementById('postTitle').value.trim();
    const contents = document.getElementById('postContent').value.trim();
    if (!title || !contents) return; // basic validation
    const post = await Post.createPost({title, contents,userName:user.name})
    const newPost = postHTML(post)
    user.post(post.id)
    return newPost;
}
const postHTML = ({userName, title, contents})=>{
    const newPost = document.createElement('div');
    newPost.className = 'post';
    newPost.innerHTML = `
    <div class="d-flex justify-content-between">
        <strong>${userName}</strong>
        <span class="badge badge-${title.replace(' ','').toLowerCase()}">${title}</span>
        <!-- <button class="btn p-0 dropdown-toggle dropdown-toggle-split" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <span class="visually-hidden">More actions</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" style="max-width:150px;right:0;">
            <li><a class="dropdown-item" href="#">Ocultar</a></li>
            <li><a class="dropdown-item" href="#">Bloquear</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#">Eliminar</a></li>
        </ul>
        Content for next update-> deleting buttons-->
    </div>
    <p class="mt-2 mb-1">${contents}</p>
    `;
    return newPost;
}
document.querySelector("form").addEventListener("submit",async e=>{
    e.preventDefault();
    const post = await createPost();
    const main = document.querySelector("main");
    console.log(post)
    main.insertBefore(post, main.children[3]) //Inserts the post first
})
const chargePosts = async ()=>{
    const posts = await Post.getAllPosts()
    if(posts.lenght < 1)return
    for(const post of posts){
        document.querySelector("main").appendChild(postHTML(post))
    }
}
chargePosts();