import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkVendorStatus } from "../../middleware/checkVendorStatus.js";

import {
  createMenu,
  deleteMenu,
  getMyMenu,
  updateMenu,
  getPublicMenus,
} from "./menu.controller.js";

const router = Router();

// PUBLIC MENU ROUTE
router.get("/", getPublicMenus);

// ALL VENDOR ROUTES REQUIRE AUTHENTICATION,
// VENDOR ROLE AND ACTIVE ACCOUNT STATUS
router.use(
  authenticate,
  authorize("vendor"),
  checkVendorStatus
);

router.post("/", createMenu);
router.get("/my-menu", getMyMenu);
router.patch("/:id", updateMenu);
router.delete("/:id", deleteMenu);

export default router;