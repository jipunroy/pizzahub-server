
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";
import type { MenuItem, MenuStatus } from "./menu.types.js";

import type {
  CreateMenuInput,
  UpdateMenuInput,
  PublicMenuQuery,
} from "./menu.validation.js";

const menuCollection = db.collection<MenuItem>("menuItems");
const usersCollection = db.collection("users");

// CHECK VENDOR AND SUBSCRIPTION
async function getVendorPlan(vendorId: string) {
  if (!ObjectId.isValid(vendorId)) {
    throw new Error("Invalid vendor ID");
  }

  const vendor = await usersCollection.findOne({
    _id: new ObjectId(vendorId),
    role: "vendor",
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  if (vendor.isBlocked === true) {
    throw new Error("Your vendor account is blocked");
  }

  const now = new Date();

  const isPremiumActive =
    vendor.subscriptionPlan === "premium" &&
    vendor.subscriptionExpiresAt instanceof Date &&
    vendor.subscriptionExpiresAt.getTime() > now.getTime();

  return {
    isPremiumActive,
  };
}

// CHECK FREE PLAN ACTIVE ITEM LIMIT
async function checkFreePlanLimit(
  vendorId: string,
  excludeId?: string
) {
  const activeCount = await countActiveVendorMenuItems(
    vendorId,
    excludeId
  );

  if (activeCount >= 3) {
    throw new Error(
      "Free plan allows maximum 3 active menu items. Upgrade to Premium for unlimited items."
    );
  }
}

// CREATE MENU ITEM
export async function createMenuItem(
  vendorId: string,
  data: CreateMenuInput
) {
  const { isPremiumActive } = await getVendorPlan(vendorId);

  if (!isPremiumActive) {
    await checkFreePlanLimit(vendorId);
  }

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

// GET SINGLE VENDOR MENU ITEM
export async function getVendorMenuItemById(
  id: string,
  vendorId: string
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return menuCollection.findOne({
    _id: new ObjectId(id),
    vendorId,
  });
}

// COUNT ACTIVE MENU ITEMS FOR VENDOR
export async function countActiveVendorMenuItems(
  vendorId: string,
  excludeId?: string
) {
  const filter: Record<string, unknown> = {
    vendorId,
    isActive: true,
  };

  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = {
      $ne: new ObjectId(excludeId),
    };
  }

  return menuCollection.countDocuments(filter);
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

  // CHECK VENDOR AND SUBSCRIPTION
  const { isPremiumActive } = await getVendorPlan(vendorId);

  // CHECK ITEM OWNERSHIP
  const existingItem = await getVendorMenuItemById(
    id,
    vendorId
  );

  if (!existingItem) {
    return null;
  }

  // CHECK ITEM ACTIVATION
  const isActivatingItem =
    data.isActive === true &&
    existingItem.isActive === false;

  // CHECK FREE PLAN LIMIT WHEN ACTIVATING AN ITEM
  if (isActivatingItem && !isPremiumActive) {
    await checkFreePlanLimit(vendorId, id);
  }

  // UPDATE MENU ITEM
  return menuCollection.findOneAndUpdate(
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
export async function getPublicMenu(
  query: PublicMenuQuery
) {
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
