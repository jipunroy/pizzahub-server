import { ObjectId } from "mongodb";
import { db } from "../../config/db.js";

const usersCollection = db.collection("users");

export async function getVendorSubscription(vendorId: string) {
  if (!ObjectId.isValid(vendorId)) {
    return null;
  }

  const vendor = await usersCollection.findOne(
    {
      _id: new ObjectId(vendorId),
      role: "vendor",
    },
    {
      projection: {
        subscriptionPlan: 1,
        subscriptionExpiresAt: 1,
        isBlocked: 1,
      },
    }
  );

  if (!vendor) {
    return null;
  }

  const isPremiumActive =
    vendor.subscriptionPlan === "premium" &&
    vendor.subscriptionExpiresAt instanceof Date &&
    vendor.subscriptionExpiresAt.getTime() > Date.now();

  return {
    subscriptionPlan: isPremiumActive ? "premium" : "free",
    subscriptionExpiresAt: vendor.subscriptionExpiresAt ?? null,
    isPremiumActive,
  };
}