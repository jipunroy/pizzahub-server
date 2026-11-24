
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  approveMenu,
  getPendingMenus,
  rejectMenu,
} from "./admin.controller.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize("admin"));

router.get("/pending-menus", getPendingMenus);
router.patch("/menus/:id/approve", approveMenu);
router.patch("/menus/:id/reject", rejectMenu);

export default router;
