
import { z } from "zod";

// CREATE MENU VALIDATION
export const createMenuSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1000),
  price: z.number().positive(),
  category: z.string().trim().min(2).max(50),
  imageUrl: z.string().url(),
  location: z.string().trim().min(2).max(150),
});

// UPDATE MENU VALIDATION
export const updateMenuSchema = createMenuSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// PUBLIC MENU QUERY VALIDATION
export const publicMenuQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type PublicMenuQuery = z.infer<typeof publicMenuQuerySchema>;
