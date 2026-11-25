import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";

import { db } from "../config/db.js";

interface VendorDocument {
  _id: ObjectId;
  isBlocked?: boolean;
}

const usersCollection = db.collection<VendorDocument>("users");

export const checkVendorStatus: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const vendorId = req.authUser?.id;

    if (!vendorId || !ObjectId.isValid(vendorId)) {
      res.status(401).json({
        success: false,
        message: "Invalid vendor authentication",
      });
      return;
    }

    const vendor = await usersCollection.findOne({
      _id: new ObjectId(vendorId),
    });

    if (!vendor) {
      res.status(403).json({
        success: false,
        message: "Vendor account not found or access denied",
      });
      return;
    }

    if (vendor.isBlocked === true) {
      res.status(403).json({
        success: false,
        message: "Your vendor account is blocked",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Vendor status check error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify vendor account",
    });
  }
};