
import { db } from "../../config/db.js";
import type { SubscriptionEvent } from "./subscription.types.js";

const eventsCollection =
  db.collection<SubscriptionEvent>("subscriptionEvents");

export async function hasSubscriptionEvent(
  eventId: string
): Promise<boolean> {
  const existingEvent = await eventsCollection.findOne(
    { eventId },
    { projection: { _id: 1 } }
  );

  return existingEvent !== null;
}

export async function recordSubscriptionEvent(
  event: SubscriptionEvent
): Promise<boolean> {
  try {
    await eventsCollection.insertOne(event);
    return true;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return false;
    }

    throw error;
  }
}

export async function markSubscriptionEventProcessed(
  eventId: string
): Promise<void> {
  await eventsCollection.updateOne(
    { eventId },
    {
      $set: {
        status: "processed",
        processedAt: new Date(),
      },
    }
  );
}

export async function markSubscriptionEventFailed(
  eventId: string
): Promise<void> {
  await eventsCollection.updateOne(
    { eventId },
    {
      $set: {
        status: "failed",
      },
    }
  );
}
