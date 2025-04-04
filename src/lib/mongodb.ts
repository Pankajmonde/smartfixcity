
import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI
const uri = "mongodb+srv://smartcityapp:SmartCity123@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections
const db = client.db("smart-city-app");
const reportsCollection = db.collection("reports");
const usersCollection = db.collection("users");

// Connect to the database
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
}

// Initialize connection when module is imported
connectToMongoDB();

export { client, db, reportsCollection, usersCollection };
