
// This is a browser-compatible mock of MongoDB functionality
// Real MongoDB connections should be done server-side

import { Report } from '../types';

// Mock collections using localStorage
class Collection {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }

  // Initialize storage if needed
  private initStorage(): void {
    if (!localStorage.getItem(this.name)) {
      localStorage.setItem(this.name, JSON.stringify([]));
    }
  }

  // Get all documents from collection
  async find(query = {}): Promise<any[]> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    
    // Simple filtering based on query object
    if (Object.keys(query).length === 0) {
      return data;
    }
    
    return data.filter((item: any) => {
      for (const [key, value] of Object.entries(query)) {
        // Handle $ne operator
        if (typeof value === 'object' && value !== null && '$ne' in value) {
          if (item[key] === value.$ne) return false;
        } 
        // Regular equality check
        else if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  // Find one document
  async findOne(query: any): Promise<any> {
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  // Insert one document
  async insertOne(doc: any): Promise<{ insertedId: string }> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    
    // Generate ID if not provided
    const id = Math.random().toString(36).substring(2, 15);
    const newDoc = { ...doc, _id: id };
    
    data.push(newDoc);
    localStorage.setItem(this.name, JSON.stringify(data));
    
    return { insertedId: id };
  }

  // Insert many documents
  async insertMany(docs: any[]): Promise<{ insertedIds: string[] }> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    const insertedIds: string[] = [];
    
    for (const doc of docs) {
      const id = Math.random().toString(36).substring(2, 15);
      const newDoc = { ...doc, _id: id };
      data.push(newDoc);
      insertedIds.push(id);
    }
    
    localStorage.setItem(this.name, JSON.stringify(data));
    
    return { insertedIds };
  }

  // Find and update document
  async findOneAndUpdate(
    filter: any,
    update: any,
    options: any = {}
  ): Promise<any> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    
    // Find matching document
    const index = data.findIndex((item: any) => {
      for (const [key, value] of Object.entries(filter)) {
        if (key === '_id') {
          if (item._id !== value) return false;
        } else if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
    
    if (index === -1) return null;
    
    // Update document
    if (update.$set) {
      data[index] = { ...data[index], ...update.$set };
    }
    
    localStorage.setItem(this.name, JSON.stringify(data));
    
    return options.returnDocument === 'after' ? data[index] : null;
  }

  // Delete one document
  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    
    const originalLength = data.length;
    
    // Filter out the document to delete
    const newData = data.filter((item: any) => {
      for (const [key, value] of Object.entries(filter)) {
        if (key === '_id') {
          if (item._id === value) return false;
        } else if (item[key] === value) {
          return false;
        }
      }
      return true;
    });
    
    localStorage.setItem(this.name, JSON.stringify(newData));
    
    return { deletedCount: originalLength - newData.length };
  }

  // Count documents
  async countDocuments(): Promise<number> {
    this.initStorage();
    const data = JSON.parse(localStorage.getItem(this.name) || '[]');
    return data.length;
  }
}

// Mock Database
class Database {
  collection(name: string) {
    return new Collection(name);
  }
}

// Mock MongoDB Client
class MongoClient {
  private connected: boolean = false;
  private database: Database;
  
  constructor() {
    this.database = new Database();
  }
  
  async connect() {
    this.connected = true;
    console.log("Connected to mock MongoDB");
    return this;
  }
  
  db(name: string) {
    return this.database;
  }
}

// Create a mock client instance
const client = new MongoClient();

// Connect to the mock database
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to mock MongoDB in browser");
    return true;
  } catch (error) {
    console.error("Error connecting to mock MongoDB:", error);
    return false;
  }
}

// Initialize collections
const database = client.db("smart-city-app");
const reportsCollection = database.collection("reports");
const usersCollection = database.collection("users");

// Initialize connection when module is imported
connectToMongoDB();

export { client, reportsCollection, usersCollection };
