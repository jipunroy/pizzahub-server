
import type { RequestHandler } from "express";
import type { UserRole } from "./authenticate.js";

export const authorize = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, res, next) => {
    if (!req.authUser) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to access this resource",
      });
      return;
    }

    next();
  };
};
