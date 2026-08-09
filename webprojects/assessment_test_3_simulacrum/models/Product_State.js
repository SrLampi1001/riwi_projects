export default class Product_State{
    static db = "http://localhost:3000";
    static _states = new Map();
    constructor(id, state){
        this.id=id;
        this.state=state;
    }
    static get states(){
        return this._states;
    }
    static createState({id, state}){
        try{
            if(!id||!state){
                throw new Error(`ERORR! not all values provided`)
            }
            return new Product_State(id, state)
        } catch(er){
            console.error("error", er)
            return null
        }
    }
    static async fetchStates(){ //Method to get Categories
        try{
            const response = await fetch(this.db+"/product_state/", {
                method:"GET", 
                headers:{"Content-Type":"application/json"}
            })
            if(!response.ok){
                throw new Error(`HTTP ERROR! ${response.status}`)
            }
            const data = await response.json();
            for (const state of data){
                this._states.set(state?.id, this.createState(state))
            }
            return true
        } catch(er){
            console.error("error", er)
            return false
        }
    }
    static async createNewState({id, state}){
        if(!id || !state){
            console.error("No id or state provided");
            return false
        }
        const st = {
            id:id,
            state:state
        }
        try{
            if(!(await this.verifyId(id))){
                throw new Error(`HTTP ERROR!, unavailable id`);
            }   
            const response = await fetch(this.db+"/product_state/", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(st)
            })
            if(!response.ok){
                throw new Error(`HTTP ERROR! ${response.status}`)
            }
            const data = await response.json();
            this.states.set(data.id, this.createState(data));
            if(!this.states.has(id)){
                throw new Error(`HTTP ERROR!, unexpected id`)
            }
            return true;
        } catch(er){
            console.error("error", er)
            return false
        }
    }
    static async verifyId(id){
        if(this.states.size === 0){
            if(!await this.fetchStates()){
                return
            }
        }
        return !this.states.has(id);
    }
}