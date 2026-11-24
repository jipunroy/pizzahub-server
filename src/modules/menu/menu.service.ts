
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";
import type { MenuItem, MenuStatus } from "./menu.types.js";
import type {
  CreateMenuInput,
  UpdateMenuInput,
} from "./menu.validation.js";

const menuCollection = db.collection<MenuItem>("menuItems");

export async function createMenuItem(
  vendorId: string,
  data: CreateMenuInput
) {
  const now = new Date();

  const menuItem: MenuItem = {
    ...data,
    vendorId,
    status: "pending",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await menuCollection.insertOne(menuItem);

  return {
    ...menuItem,
    _id: result.insertedId,
  };
}

export async function getVendorMenu(vendorId: string) {
  return menuCollection
    .find({ vendorId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getMenuItemById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return menuCollection.findOne({
    _id: new ObjectId(id),
  });
}

export async function updateMenuItem(
  id: string,
  vendorId: string,
  data: UpdateMenuInput
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await menuCollection.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      vendorId,
    },
    {
      $set: {
        ...data,
        status: "pending" as MenuStatus,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  return result;
}

export async function deleteMenuItem(
  id: string,
  vendorId: string
) {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await menuCollection.deleteOne({
    _id: new ObjectId(id),
    vendorId,
  });

  return result.deletedCount > 0;
}
