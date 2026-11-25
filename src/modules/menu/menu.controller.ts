import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";

import {
  createMenuItem,
  deleteMenuItem,
  getVendorMenu,
  updateMenuItem,
  getPublicMenu,
  getVendorMenuItemById,
  countActiveVendorMenuItems,
} from "./menu.service.js";

import {
  createMenuSchema,
  updateMenuSchema,
  publicMenuQuerySchema,
} from "./menu.validation.js";

// BETTER AUTH USERS COLLECTION
interface VendorDocument {
  _id: ObjectId;
  isBlocked?: boolean;
  subscriptionPlan?: string;
}

const usersCollection = db.collection<VendorDocument>("users");

function getParamId(
  value: string | string[] | undefined
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

// CREATE MENU ITEM
export const createMenu: RequestHandler = async (req, res) => {
  try {
    const vendorId = req.authUser!.id;

    const validation = createMenuSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid menu data",
        errors: validation.error.flatten(),
      });
      return;
    }

    if (!ObjectId.isValid(vendorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID",
      });
      return;
    }

    const vendor = await usersCollection.findOne({
      _id: new ObjectId(vendorId),
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor account not found",
      });
      return;
    }

    if (vendor.isBlocked === true) {
      res.status(403).json({
        success: false,
        message: "Blocked vendors cannot manage menu items",
      });
      return;
    }

    const isPremium = vendor.subscriptionPlan === "premium";

    if (!isPremium) {
      const activeCount =
        await countActiveVendorMenuItems(vendorId);

      if (activeCount >= 3) {
        res.status(403).json({
          success: false,
          message:
            "Free vendors can have only 3 active menu items. Upgrade to Premium.",
        });
        return;
      }
    }

    const menuItem = await createMenuItem(
      vendorId,
      validation.data
    );

    res.status(201).json({
      success: true,
      message: "Menu item created and submitted for approval",
      data: menuItem,
    });
  } catch (error) {
    console.error("Create menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
};

// GET VENDOR MENU
export const getMyMenu: RequestHandler = async (req, res) => {
  try {
    const vendorId = req.authUser!.id;

    const items = await getVendorMenu(vendorId);

    res.status(200).json({
      success: true,
      results: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get vendor menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
};

// UPDATE MENU ITEM
export const updateMenu: RequestHandler = async (req, res) => {
  try {
    const vendorId = req.authUser!.id;
    const id = getParamId(req.params.id);

    if (!id || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const validation = updateMenuSchema.safeParse(req.body);

    if (
      !validation.success ||
      Object.keys(req.body).length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid or empty update data",
        errors: validation.success
          ? undefined
          : validation.error.flatten(),
      });
      return;
    }

    // FIND MENU ITEM OWNED BY THIS VENDOR
    const existingItem = await getVendorMenuItemById(
      id,
      vendorId
    );

    if (!existingItem) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    // CHECK VENDOR SUBSCRIPTION
    const vendor = await usersCollection.findOne({
      _id: new ObjectId(vendorId),
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor account not found",
      });
      return;
    }

    if (vendor.isBlocked === true) {
      res.status(403).json({
        success: false,
        message: "Blocked vendors cannot manage menu items",
      });
      return;
    }

    const isPremium = vendor.subscriptionPlan === "premium";

    // FREE VENDOR ACTIVE ITEM LIMIT
    if (
      !isPremium &&
      validation.data.isActive === true &&
      existingItem.isActive === false
    ) {
      const activeCount =
        await countActiveVendorMenuItems(vendorId, id);

      if (activeCount >= 3) {
        res.status(403).json({
          success: false,
          message:
            "Free vendors can have only 3 active menu items. Upgrade to Premium.",
        });
        return;
      }
    }

    // UPDATE MENU ITEM
    const result = await updateMenuItem(
      id,
      vendorId,
      validation.data
    );

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated and sent for re-approval",
      data: result,
    });
  } catch (error) {
    console.error("Update menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
    });
  }
};

// DELETE MENU ITEM
export const deleteMenu: RequestHandler = async (req, res) => {
  try {
    const vendorId = req.authUser!.id;
    const id = getParamId(req.params.id);

    if (!id || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const deleted = await deleteMenuItem(id, vendorId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Menu item not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
};

// GET PUBLIC MENU
export const getPublicMenus: RequestHandler = async (
  req,
  res
) => {
  try {
    const validation = publicMenuQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
      return;
    }

    const result = await getPublicMenu(validation.data);

    res.status(200).json({
      success: true,
      results: result.items.length,
      pagination: result.pagination,
      data: result.items,
    });
  } catch (error) {
    console.error("Get public menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch public menu",
    });
  }
};