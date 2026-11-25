
import { z } from "zod";

// CREATE ORDER VALIDATION
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid menu item ID"),

        quantity: z
          .number()
          .int()
          .min(1, "Quantity must be at least 1")
          .max(20, "Maximum quantity is 20"),
      })
    )
    .min(1, "At least one item is required")
    .max(20, "Maximum 20 different items allowed"),

  deliveryAddress: z
    .string()
    .trim()
    .min(10, "Delivery address must be at least 10 characters")
    .max(300, "Delivery address is too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
});

// UPDATE ORDER STATUS VALIDATION
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "confirmed",
    "preparing",
    "ready",
    "delivered",
  ]),
});

// TYPE EXPORTS
export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;
