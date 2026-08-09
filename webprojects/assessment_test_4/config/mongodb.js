const { MongoClient } = require('mongodb')
require('dotenv').config(); // Load environment variables from .env file
let client;
let db;
async function connectToDatabase() {
  if (db) return db; // If a connection exists alredy, reuse
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.MONGODB_NAME); //This can be set up differently if different db are used, this particular case only needs logs, so one database is enough
  return db;
}
module.exports = connectToDatabase
