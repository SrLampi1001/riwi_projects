import Product from "./Product.js";
export default class User{
    static db = "http://localhost:3000";
    static isListening = false;
    static _users = new Map();

    role = "user";
    constructor(id, name, email, password, cart = new Map()){
        this.id=id;
        this.name=name;
        this.email=email;
        this.password = password;
        this.cart = cart; //Expected to include in constructor
    }
    static createUser({id, name, email, password, cart}){
        if (!id || !name || !email || !password) {
            console.error("Missing required user fields");
            return null
        }
        return new User(id, name, email, password, cart || []);
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
    //Add methods for buying and updating user information
    async buyProduct(productId, amount){
        const product = await Product.getProductById(productId);
        if(product===null) return;
        //product.sell(amount)    //Expected method to reduce the product amount database 
    }
    
    async addProductToCart(productId, amount=1){
        amountInCart = this.cart.get(productId)
        if(amountInCart!==null){
            this.cart.set(productId, amountInCart+amount);
        }
        this.cart.set(productId, amount)
    }
    static async fetchUsers(){
        try{
            const response = await fetch(this.db+"/users", {
                method:"GET", 
                headers:{"Content-Type":"application/json"}
            })
            if(!response.ok){
                throw new Error(`HTTP ERROR! ${response.status}`)
            }
            const data = await response.json();
            for(const user of data){
                User._users.set(user?.id, this.createUser(user))
            }
            return true
        } catch(er){
            console.error("error", er)
            return false;
        }
    }
    static get users(){
        return this._users;
    }
}