import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkVendorStatus } from "../../middleware/checkVendorStatus.js";

import { getMySubscription } from "./subscription.controller.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  authorize("vendor"),
  checkVendorStatus,
  getMySubscription
);

export default router;