
import type { RequestHandler } from "express";

export const handleSubscriptionWebhook: RequestHandler = async (
  req,
  res
) => {
  // Raw body is required for signature verification.
  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({
      success: false,
      message: "Raw webhook body is required",
    });
    return;
  }

  // Signature verification will be connected before
  // accepting or processing any subscription event.
  res.status(501).json({
    success: false,
    message: "Webhook verification is not configured yet",
  });
};
