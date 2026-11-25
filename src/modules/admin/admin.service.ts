
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";
import type { MenuItem, MenuStatus } from "../menu/menu.types.js";

// COLLECTIONS
const menuCollection = db.collection<MenuItem>("menuItems");
const usersCollection = db.collection("users");

// GET ALL PENDING MENU ITEMS
export async function getPendingMenuItems() {
  return menuCollection
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .toArray();
}

// APPROVE OR REJECT MENU ITEM
export async function updateMenuApproval(
  id: string,
  status: Extract<MenuStatus, "approved" | "rejected">
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return menuCollection.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      status: "pending",
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );
}

// BLOCK OR UNBLOCK USER BY ROLE
export async function updateUserBlockStatus(
  userId: string,
  role: "vendor" | "customer",
  isBlocked: boolean
) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return usersCollection.findOneAndUpdate(
    {
      _id: new ObjectId(userId),
      role,
    },
    {
      $set: {
        isBlocked,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );
}

// BLOCK OR UNBLOCK VENDOR
export async function updateVendorBlockStatus(
  vendorId: string,
  isBlocked: boolean
) {
  return updateUserBlockStatus(
    vendorId,
    "vendor",
    isBlocked
  );
}

// BLOCK OR UNBLOCK CUSTOMER
export async function updateCustomerBlockStatus(
  customerId: string,
  isBlocked: boolean
) {
  return updateUserBlockStatus(
    customerId,
    "customer",
    isBlocked
  );
}
