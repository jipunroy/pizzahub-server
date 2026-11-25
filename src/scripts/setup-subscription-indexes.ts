
import "dotenv/config";

import { db, mongoClient } from "../config/db.js";

async function setupSubscriptionIndexes() {
  try {
    const eventsCollection = db.collection("subscriptionEvents");

    await eventsCollection.createIndex(
      { eventId: 1 },
      { unique: true, name: "unique_subscription_event" }
    );

    console.log("Subscription event index created successfully!");
  } catch (error) {
    console.error("Index setup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoClient.close();
  }
}

setupSubscriptionIndexes();
