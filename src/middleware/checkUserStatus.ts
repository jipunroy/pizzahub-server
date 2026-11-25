
import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";

import { db } from "../config/db.js";

interface UserDocument {
  _id: ObjectId;
  isBlocked?: boolean;
}

const usersCollection = db.collection<UserDocument>("users");

export const checkUserStatus: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.authUser?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid user authentication",
      });
      return;
    }

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      res.status(403).json({
        success: false,
        message: "User account not found or access denied",
      });
      return;
    }

    if (user.isBlocked === true) {
      res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("User status check error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify user account",
    });
  }
};
