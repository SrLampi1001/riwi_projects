import User from "./User.js";
export default class Admin extends User {
    role = "admin";
    constructor(id, name, email, password) {
        super(id, name, email, password);
        delete this.cart; //removes the cart property, as admins should not have
    }
    static createAdmin({ id, name, email, password } = {}) {
        try {
            if (!id || !name || !email || !password) {
                throw new Error("Missing required user fields");
            }
            return new Admin(id, name, email, password);
        } catch (err) {
            console.error("error", err)
            return null;
        }
    }
    async createUser({ name, email, password }) {
        if (!name || !email || !password) {
            console.error("Missing required user fields");
            return null
        } else {
            let verify = await User.verifyEmail(email)
            if (!verify && (typeof (verify) !== "object")) {
                console.error("The email is unavaiable")
                return null
            } else if (typeof (verify) === "object") {
                return verify
            }
        }
        try {
            const user = {
                name: name,
                email: email,
                password: password,
                role: "user"
            }
            const response = await fetch(User.db + "/users", {
                method: "POST",
                headers: { "Content-Type": "applicaton/json" },
                body: JSON.stringify(user)
            })
            if (!response.ok) {
                return new Error(`HTTP ERROR!, ${response.status}`)
            }
            const data = await response.json();
            const newUser = User.createUser(data)
            User.users.set(newUser.id, newUser)
            this.updateDashboardStats({ "total_users": User.users.size });
            return newUser
        } catch (er) {
            console.error("Error", er)
            return er
        }
    }
    async createAdmin({ name, email, password } = {}) {
        if (!name || !email || !password) {
            console.error("Missing required user fields");
            return null
        } else {
            let verify = await User.verifyEmail(email)
            if (!verify && (typeof (verify) !== "object")) {
                console.error("El correo ya esta registrado")
                return null
            } else if (typeof (verify) === "object") {
                return verify
            }
        }
        try {
            const user = {
                name: name,
                email: email,
                password: password,
                role: "admin"
            }
            const response = await fetch(User.db + "/users", {
                method: "POST",
                headers: { "Content-Type": "applicaton/json" },
                body: JSON.stringify(user)
            })
            if (!response.ok) {
                return new Error(`HTTP ERROR!, ${response.status}`)
            }
            const data = await response.json();
            const newUser = Admin.createAdmin(data)
            User.users.set(newUser.id, newUser)
            this.updateDashboardStats({ "total_users": User.users.size });
            return newUser
        } catch (er) {
            console.error("Error", er)
            return er
        }
    }
    async grantAdminPermisions(user) {
        if (user instanceof User) {
            console.warn("NOT A USER OBJECT")
            return null
        }
        const newAdmin = new Admin(user.id, user.name, user.email, user.password);
        try {
            const response = await fetch(User.db + "/users/" + user.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAdmin)
            });
            if (!response.ok) {
                throw new Error(`HTTP Error! ${response.status}`)
            }
            return await response.ok;
        } catch (err) {
            console.error("error", err);
            return null;
        }
    }
    updateProduct(productId, { name, category_id, price, stock, description, images, product_state }) {
        //update product

    }
    async deleteUser(id) {
        try {
            const response = await fetch(`${User.db}/users/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP ERROR!! ${response.status}`)
            }
            const data = await response.json()
        } catch (er) {
            console.error("error", er)
            return er;
        } finally {
            User.users.delete(id);
            let total_users = User.users.size
            return this.updateDashboardStats({ "total_users": total_users });
        }
    }
    async getDashboardStats(sta) {
        let data;
        try {
            const response = await fetch(User.db + "/dashboard/", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            if (!response.ok) {
                throw new Error(`HTTP ERROR! ${response.status}`)
            }
            data = await response.json();
            return data.stats;
        } catch (er) {
            console.error("error", er)
            return er
        }
    }
    async updateDashboardStats(statsUpdate) {
        try {
            const stats = await this.getDashboardStats();
            const updatedStats = { ...stats, ...statsUpdate }
            const response = await fetch(User.db + "/dashboard", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stats: updatedStats })
            })
            return await response.json();
        } catch (er) {
            console.error("error", er)
            return er
        }
    }
}