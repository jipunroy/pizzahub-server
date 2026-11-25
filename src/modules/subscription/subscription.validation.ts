import { z } from "zod";

export const subscriptionPlanSchema = z.object({
  billingPeriod: z.enum(["monthly", "yearly"]),
});

export type SubscriptionPlanInput = z.infer<
  typeof subscriptionPlanSchema
>;