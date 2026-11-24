
import "dotenv/config";

import {
  connectDB,
  db,
  mongoClient,
} from "../config/db.js";

async function promoteAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is missing from .env");
  }

  try {
    await connectDB();

    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { email: adminEmail },
      {
        $set: {
          role: "admin",
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Admin user not found");
    }

    console.log("Admin role assigned successfully!");
    console.log(`Admin email: ${adminEmail}`);
  } catch (error) {
    console.error("Admin promotion failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoClient.close();
  }
}

promoteAdmin();
