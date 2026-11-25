
import type { RequestHandler } from "express";

import {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelCustomerOrder,
} from "./order.service.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "./order.validation.js";

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

// CREATE ORDER
export const placeOrder: RequestHandler = async (
  req,
  res
) => {
  try {
    const customerId = req.authUser?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = createOrderSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order data",
        errors: validation.error.flatten(),
      });
      return;
    }

    const order = await createOrder(
      customerId,
      validation.data
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Place order error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to place order";

    // BLOCKED OR UNAVAILABLE VENDOR
    if (
      message === "Vendor account is blocked or unavailable"
    ) {
      res.status(403).json({
        success: false,
        message,
      });
      return;
    }

    // CLIENT ERRORS
    const isClientError = [
      "Invalid customer account",
      "One or more menu items are unavailable",
      "Please order from one vendor at a time",
      "Menu item not found",
    ].includes(message);

    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError
        ? message
        : "Failed to place order",
    });
  }
};

// GET CUSTOMER ORDERS
export const getMyOrders: RequestHandler = async (
  req,
  res
) => {
  try {
    const customerId = req.authUser?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orders = await getCustomerOrders(customerId);

    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

// GET VENDOR ORDERS
export const getMyVendorOrders: RequestHandler = async (
  req,
  res
) => {
  try {
    const vendorId = req.authUser?.id;

    if (!vendorId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orders = await getVendorOrders(vendorId);

    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get vendor orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor orders",
    });
  }
};

// GET SINGLE CUSTOMER ORDER
export const getMyOrderById: RequestHandler = async (
  req,
  res
) => {
  try {
    const customerId = req.authUser?.id;
    const id = getParamId(req.params.id);

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await getOrderById(id);

    if (!order || order.customerId !== customerId) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// UPDATE ORDER STATUS
export const changeOrderStatus: RequestHandler = async (
  req,
  res
) => {
  try {
    const vendorId = req.authUser?.id;
    const id = getParamId(req.params.id);

    if (!vendorId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const validation = updateOrderStatusSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order status",
        errors: validation.error.flatten(),
      });
      return;
    }

    const order = await updateOrderStatus(
      id,
      vendorId,
      validation.data
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update order status";

    res.status(
      message === "Invalid order status transition"
        ? 400
        : 500
    ).json({
      success: false,
      message:
        message === "Invalid order status transition"
          ? message
          : "Failed to update order status",
    });
  }
};

// CANCEL CUSTOMER ORDER
export const cancelMyOrder: RequestHandler = async (
  req,
  res
) => {
  try {
    const customerId = req.authUser?.id;
    const id = getParamId(req.params.id);

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await cancelCustomerOrder(
      id,
      customerId
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Pending order not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};
