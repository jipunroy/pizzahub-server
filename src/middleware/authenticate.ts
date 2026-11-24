
import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const serverUrl = process.env.SERVER_URL;

if (!serverUrl) {
  throw new Error("SERVER_URL is missing");
}

const JWKS = createRemoteJWKSet(
  new URL("/api/auth/jwks", serverUrl)
);

export type UserRole = "admin" | "vendor" | "customer";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: serverUrl,
      audience: serverUrl,
    });

    const validRoles: UserRole[] = [
      "admin",
      "vendor",
      "customer",
    ];

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !validRoles.includes(payload.role as UserRole)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
