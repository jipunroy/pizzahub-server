
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";
import type { MenuItem, MenuStatus } from "../menu/menu.types.js";

const menuCollection = db.collection<MenuItem>("menuItems");

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

  const result = await menuCollection.findOneAndUpdate(
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

  return result;
}
