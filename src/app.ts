
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import { authenticate } from "./middleware/authenticate.js";
import { authorize } from "./middleware/authorize.js";

import menuRoutes from "./modules/menu/menu.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import subscriptionRoutes from "./modules/subscription/subscription.routes.js";
import { handleSubscriptionWebhook } from "./modules/subscription/subscription.webhook.controller.js";

const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());

// CORS CONFIGURATION
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Stripe-Signature",
    ],
  })
);

// BETTER AUTH HANDLER
app.all("/api/auth/*splat", toNodeHandler(auth));

// STRIPE WEBHOOK ROUTE
// IMPORTANT: Must be before express.json()
app.post(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  handleSubscriptionWebhook
);

// JSON MIDDLEWARE
app.use(express.json());

// HEALTH CHECK
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PizzaHub API is running!",
  });
});

// PROTECTED API TEST
app.get("/api/test/protected", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Protected API access successful",
    user: req.authUser,
  });
});

// VENDOR API TEST
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

// MENU MANAGEMENT ROUTES
app.use("/api/menu", menuRoutes);

// ADMIN MANAGEMENT ROUTES
app.use("/api/admin", adminRoutes);

// ORDER MANAGEMENT ROUTES
app.use("/api/orders", orderRoutes);

// SUBSCRIPTION ROUTES
app.use("/api/subscriptions", subscriptionRoutes);

export default app;
