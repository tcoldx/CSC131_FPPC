import { MongoClient } from "mongodb";

// Connection URL for MongoDB Atlas
const url = "mongodb+srv://lprakash:m6ZwSVJbQn3cVuWM@agendaitems.ipldsqb.mongodb.net/?appName=AgendaItems";
const client = new MongoClient(url);

// Database and collection names
const dbName = "AgendaItems";
const collectionName = "items";

// Function to connect to the database and return the collection
async function getCollection() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
    const db = client.db(dbName);
    return db.collection(collectionName);
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  } 
}