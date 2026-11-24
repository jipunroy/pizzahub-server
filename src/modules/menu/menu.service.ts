
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";
import type { MenuItem, MenuStatus } from "./menu.types.js";

import type {
  CreateMenuInput,
  UpdateMenuInput,
  PublicMenuQuery,
} from "./menu.validation.js";

const menuCollection = db.collection<MenuItem>("menuItems");

// CREATE MENU ITEM
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

// GET VENDOR MENU
export async function getVendorMenu(vendorId: string) {
  return menuCollection
    .find({ vendorId })
    .sort({ createdAt: -1 })
    .toArray();
}

// GET SINGLE MENU ITEM
export async function getMenuItemById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return menuCollection.findOne({
    _id: new ObjectId(id),
  });
}

// UPDATE MENU ITEM
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

// DELETE MENU ITEM
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

// GET PUBLIC MENU
export async function getPublicMenu(query: PublicMenuQuery) {
  const { search, category, page, limit } = query;

  const filter: Record<string, unknown> = {
    status: "approved",
    isActive: true,
  };

  if (search) {
    const safeSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.name = {
      $regex: safeSearch,
      $options: "i",
    };
  }

  if (category) {
    const safeCategory = category.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.category = {
      $regex: `^${safeCategory}$`,
      $options: "i",
    };
  }

  const [items, total] = await Promise.all([
    menuCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),

    menuCollection.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
