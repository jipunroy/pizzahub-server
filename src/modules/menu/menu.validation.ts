
import { z } from "zod";

export const createMenuSchema = z.object({
  name: z.string().trim().min(2).max(100),

  description: z.string().trim().min(10).max(1000),

  price: z.number().positive(),

  category: z.string().trim().min(2).max(50),

  imageUrl: z.string().url(),

  location: z.string().trim().min(2).max(150),
});

export const updateMenuSchema = createMenuSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
