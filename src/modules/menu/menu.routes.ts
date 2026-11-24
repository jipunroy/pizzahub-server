
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  createMenu,
  deleteMenu,
  getMyMenu,
  updateMenu,
} from "./menu.controller.js";

const router = Router();

// All menu management routes require authentication
router.use(authenticate);

// Vendor: Create menu item
router.post(
  "/",
  authorize("vendor"),
  createMenu
);

// Vendor: Get own menu items
router.get(
  "/my-menu",
  authorize("vendor"),
  getMyMenu
);

// Vendor: Update own menu item
router.patch(
  "/:id",
  authorize("vendor"),
  updateMenu
);

// Vendor: Delete own menu item
router.delete(
  "/:id",
  authorize("vendor"),
  deleteMenu
);

export default router;
