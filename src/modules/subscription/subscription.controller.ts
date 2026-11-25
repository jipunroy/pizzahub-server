import type { RequestHandler } from "express";
import { getVendorSubscription } from "./subscription.service.js";

export const getMySubscription: RequestHandler = async (
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

    const subscription = await getVendorSubscription(vendorId);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: "Vendor subscription not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Subscription status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription",
    });
  }
};