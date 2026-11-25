
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkVendorStatus } from "../../middleware/checkVendorStatus.js";
import { checkUserStatus } from "../../middleware/checkUserStatus.js";

import {
  placeOrder,
  getMyOrders,
  getMyVendorOrders,
  getMyOrderById,
  changeOrderStatus,
  cancelMyOrder,
} from "./order.controller.js";

const router = Router();

// CUSTOMER ROUTES
router.post(
  "/",
  authenticate,
  authorize("customer"),
  checkUserStatus,
  placeOrder
);

router.get(
  "/my-orders",
  authenticate,
  authorize("customer"),
  checkUserStatus,
  getMyOrders
);

router.get(
  "/my-orders/:id",
  authenticate,
  authorize("customer"),
  checkUserStatus,
  getMyOrderById
);

router.patch(
  "/my-orders/:id/cancel",
  authenticate,
  authorize("customer"),
  checkUserStatus,
  cancelMyOrder
);

// VENDOR ROUTES
router.get(
  "/vendor-orders",
  authenticate,
  authorize("vendor"),
  checkVendorStatus,
  getMyVendorOrders
);

router.patch(
  "/vendor-orders/:id/status",
  authenticate,
  authorize("vendor"),
  checkVendorStatus,
  changeOrderStatus
);

export default router;
