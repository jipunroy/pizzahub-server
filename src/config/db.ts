
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME || "pizzahub";

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

export const mongoClient = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});

export const db = mongoClient.db(databaseName);

export async function connectDB() {
  try {
    await mongoClient.connect();
    await db.command({ ping: 1 });

    console.log("MongoDB Connected Successfully!");
    console.log(`Database: ${databaseName}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    throw error;
  }
}
