
import type { ObjectId } from "mongodb";

// ORDER STATUS
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

// ORDER ITEM
export interface OrderItem {
  menuItemId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// MAIN ORDER
export interface Order {
  _id?: ObjectId;

  customerId: string;
  vendorId: string;

  items: OrderItem[];

  totalAmount: number;

  deliveryAddress: string;
  phone: string;

  status: OrderStatus;

  createdAt: Date;
  updatedAt: Date;
}
