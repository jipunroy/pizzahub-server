
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  approveMenu,
  blockVendor,
  getPendingMenus,
  rejectMenu,
  unblockVendor,
  blockCustomer,
  unblockCustomer,
} from "./admin.controller.js";

const router = Router();

// ALL ADMIN ROUTES REQUIRE AUTHENTICATION AND ADMIN ROLE
router.use(authenticate, authorize("admin"));

// MENU APPROVAL ROUTES
router.get("/pending-menus", getPendingMenus);
router.patch("/menus/:id/approve", approveMenu);
router.patch("/menus/:id/reject", rejectMenu);

// VENDOR BLOCK / UNBLOCK
router.patch("/vendors/:id/block", blockVendor);
router.patch("/vendors/:id/unblock", unblockVendor);

// CUSTOMER BLOCK / UNBLOCK
router.patch("/customers/:id/block", blockCustomer);
router.patch("/customers/:id/unblock", unblockCustomer);

export default router;
