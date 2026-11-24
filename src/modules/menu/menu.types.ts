
import type { ObjectId } from "mongodb";

export type MenuStatus = "pending" | "approved" | "rejected";

export interface MenuItem {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  location: string;
  vendorId: string;
  status: MenuStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
