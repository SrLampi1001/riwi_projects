const connectMongo = require("../config/mongodb"); //Creates mongoDB DB
require('dotenv').config()
const createLog = async (action)=>{
    const db = await connectMongo();
    const logsCollection = db.collection(process.env.MONGODB_LOG_COLLECTION) //Collection for logs (there could be more collections)
    try{
        await logsCollection.insertOne({
            action,
            created_at: new Date()
        })
        console.log(`log ${action} added`)
    } catch(er){
        console.error(`Error while saving log \n ${er}`)
    }
}
const showLogs = async ()=>{    //Show logs
    const logs = await logsCollection.find({}).toArray();
    return logs;
}
module.exports = {createLog, showLogs}