export type SubscriptionPlan = "free" | "premium";

export type SubscriptionBillingPeriod = "monthly" | "yearly";

export interface VendorSubscription {
  vendorId: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt: Date | null;
  billingPeriod?: SubscriptionBillingPeriod;
}