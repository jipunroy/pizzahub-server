
import type { RequestHandler } from "express";

import {
  getPendingMenuItems,
  updateMenuApproval,
  updateVendorBlockStatus,
  updateCustomerBlockStatus,
} from "./admin.service.js";

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

// VALIDATE OBJECT ID
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// GET PENDING MENU ITEMS
export const getPendingMenus: RequestHandler = async (
  _req,
  res
) => {
  try {
    const items = await getPendingMenuItems();

    res.status(200).json({
      success: true,
      results: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get pending menus error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending menu items",
    });
  }
};

// APPROVE MENU ITEM
export const approveMenu: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const item = await updateMenuApproval(id, "approved");

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Pending menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item approved successfully",
      data: item,
    });
  } catch (error) {
    console.error("Approve menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve menu item",
    });
  }
};

// REJECT MENU ITEM
export const rejectMenu: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const item = await updateMenuApproval(id, "rejected");

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Pending menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item rejected successfully",
      data: item,
    });
  } catch (error) {
    console.error("Reject menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject menu item",
    });
  }
};

// BLOCK VENDOR
export const blockVendor: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID",
      });
      return;
    }

    const vendor = await updateVendorBlockStatus(id, true);

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor blocked successfully",
    });
  } catch (error) {
    console.error("Block vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to block vendor",
    });
  }
};

// UNBLOCK VENDOR
export const unblockVendor: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid vendor ID",
      });
      return;
    }

    const vendor = await updateVendorBlockStatus(id, false);

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vendor unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock vendor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unblock vendor",
    });
  }
};

// BLOCK CUSTOMER
export const blockCustomer: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await updateCustomerBlockStatus(id, true);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer blocked successfully",
    });
  } catch (error) {
    console.error("Block customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to block customer",
    });
  }
};

// UNBLOCK CUSTOMER
export const unblockCustomer: RequestHandler = async (
  req,
  res
) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await updateCustomerBlockStatus(id, false);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unblock customer",
    });
  }
};
