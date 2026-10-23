export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: 'VIP' | 'Standard' | 'New';
  ordersCount: number;
  lifetimeValue: number;
  csatScore?: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderDetails {
  id: string;
  orderDate: string;
  status: 'Processing' | 'Shipped' | 'Delayed' | 'Delivered' | 'Returned' | 'Cancelled';
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  trackingNumber: string;
  carrier: string;
}
