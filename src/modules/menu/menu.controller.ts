
import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";

import {
  createMenuItem,
  deleteMenuItem,
  getVendorMenu,
  updateMenuItem,
  getPublicMenu,
} from "./menu.service.js";

import {
  createMenuSchema,
  updateMenuSchema,
  publicMenuQuerySchema,
} from "./menu.validation.js";

// GET PARAMETER ID
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

// HANDLE MENU SERVICE ERRORS
function handleMenuError(
  error: unknown,
  res: Parameters<RequestHandler>[1],
  action: string
) {
  console.error(`${action} error:`, error);

  if (error instanceof Error) {
    if (
      error.message.startsWith(
        "Free plan allows maximum 3"
      ) ||
      error.message === "Your vendor account is blocked"
    ) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "Vendor not found") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "Invalid vendor ID") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message: `Failed to ${action.toLowerCase()}`,
  });
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
    handleMenuError(error, res, "Create menu item");
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
    handleMenuError(error, res, "Update menu item");
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
    const validation = publicMenuQuerySchema.safeParse(
      req.query
    );

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
