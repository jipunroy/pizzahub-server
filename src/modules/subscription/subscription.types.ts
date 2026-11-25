
export type SubscriptionPlan = "free" | "premium";

export type SubscriptionBillingPeriod = "monthly" | "yearly";

export interface VendorSubscription {
  vendorId: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt: Date | null;
  billingPeriod?: SubscriptionBillingPeriod;
}

export type SubscriptionEventStatus =
  | "processing"
  | "processed"
  | "failed";

export interface SubscriptionEvent {
  eventId: string;
  eventType: string;
  vendorId: string;
  status: SubscriptionEventStatus;
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  retryCount?: number;
}
