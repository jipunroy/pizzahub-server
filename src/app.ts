
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import { authenticate } from "./middleware/authenticate.js";
import { authorize } from "./middleware/authorize.js";

import menuRoutes from "./modules/menu/menu.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Better Auth handler must come before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON middleware for normal Express APIs
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PizzaHub API is running!",
  });
});

// Protected API test
app.get(
  "/api/test/protected",
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      message: "Protected API access successful",
      user: req.authUser,
    });
  }
);

// Vendor API test
app.get(
  "/api/test/vendor",
  authenticate,
  authorize("vendor"),
  (_req, res) => {
    res.json({
      success: true,
      message: "Vendor access successful",
    });
  }
);

// Menu management routes
app.use("/api/menu", menuRoutes);

// Admin management routes
app.use("/api/admin", adminRoutes);

export default app;
