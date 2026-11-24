
import type { RequestHandler } from "express";

import {
  getPendingMenuItems,
  updateMenuApproval,
} from "./admin.service.js";

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
