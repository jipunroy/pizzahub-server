
import { ObjectId } from "mongodb";

import { db } from "../../config/db.js";

import type {
  Order,
  OrderItem,
  OrderStatus,
} from "./order.types.js";

import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "./order.validation.js";

import type { MenuItem } from "../menu/menu.types.js";

// COLLECTIONS
const orderCollection = db.collection<Order>("orders");
const menuCollection = db.collection<MenuItem>("menuItems");
const usersCollection = db.collection("users");

// CREATE ORDER
export async function createOrder(
  customerId: string,
  data: CreateOrderInput
) {
  if (!ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer account");
  }

  const menuItemIds = data.items.map(
    (item) => new ObjectId(item.menuItemId)
  );

  // FETCH APPROVED AND ACTIVE MENU ITEMS
  const menuItems = await menuCollection
    .find({
      _id: { $in: menuItemIds },
      status: "approved",
      isActive: true,
    })
    .toArray();

  // CHECK ALL REQUESTED ITEMS EXIST
  if (menuItems.length !== data.items.length) {
    throw new Error(
      "One or more menu items are unavailable"
    );
  }

  // ALL ITEMS MUST BELONG TO THE SAME VENDOR
  const vendorIds = [
    ...new Set(menuItems.map((item) => item.vendorId)),
  ];

  if (vendorIds.length !== 1) {
    throw new Error(
      "Please order from one vendor at a time"
    );
  }

  // VERIFY VENDOR ACCOUNT STATUS
  const vendorId = vendorIds[0];

  if (!vendorId || !ObjectId.isValid(vendorId)) {
    throw new Error("Vendor account is unavailable");
  }

  const vendor = await usersCollection.findOne({
    _id: new ObjectId(vendorId),
  });

  if (!vendor || vendor.isBlocked === true) {
    throw new Error(
      "Vendor account is blocked or unavailable"
    );
  }

  // BUILD ORDER ITEMS USING DATABASE PRICES
  const orderItems: OrderItem[] = data.items.map(
    (requestedItem) => {
      const menuItem = menuItems.find(
        (item) =>
          item._id?.toString() === requestedItem.menuItemId
      );

      if (!menuItem || !menuItem._id) {
        throw new Error("Menu item not found");
      }

      const subtotal =
        menuItem.price * requestedItem.quantity;

      return {
        menuItemId: menuItem._id.toString(),
        name: menuItem.name,
        imageUrl: menuItem.imageUrl,
        price: menuItem.price,
        quantity: requestedItem.quantity,
        subtotal,
      };
    }
  );

  // CALCULATE TOTAL
  const totalAmount = orderItems.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const now = new Date();

  const order: Order = {
    customerId,
    vendorId,
    items: orderItems,
    totalAmount,
    deliveryAddress: data.deliveryAddress,
    phone: data.phone,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const result = await orderCollection.insertOne(order);

  return {
    ...order,
    _id: result.insertedId,
  };
}

// GET CUSTOMER ORDERS
export async function getCustomerOrders(
  customerId: string
) {
  return orderCollection
    .find({ customerId })
    .sort({ createdAt: -1 })
    .toArray();
}

// GET VENDOR ORDERS
export async function getVendorOrders(
  vendorId: string
) {
  return orderCollection
    .find({ vendorId })
    .sort({ createdAt: -1 })
    .toArray();
}

// GET SINGLE ORDER
export async function getOrderById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return orderCollection.findOne({
    _id: new ObjectId(id),
  });
}

// UPDATE ORDER STATUS
export async function updateOrderStatus(
  id: string,
  vendorId: string,
  data: UpdateOrderStatusInput
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const allowedTransitions: Record<string, OrderStatus[]> = {
    pending: ["confirmed"],
    confirmed: ["preparing"],
    preparing: ["ready"],
    ready: ["delivered"],
  };

  const order = await orderCollection.findOne({
    _id: new ObjectId(id),
    vendorId,
  });

  if (!order) {
    return null;
  }

  if (!allowedTransitions[order.status]?.includes(data.status)) {
    throw new Error("Invalid order status transition");
  }

  return orderCollection.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      vendorId,
      status: order.status,
    },
    {
      $set: {
        status: data.status,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );
}

// CANCEL CUSTOMER ORDER
export async function cancelCustomerOrder(
  id: string,
  customerId: string
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return orderCollection.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      customerId,
      status: "pending",
    },
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );
}
