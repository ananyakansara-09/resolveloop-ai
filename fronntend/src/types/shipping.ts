export interface ShippingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  exception: boolean;
}

export interface ShippingDetails {
  trackingNumber: string;
  carrier: string;
  serviceLevel: string;
  status: 'In Transit' | 'Delayed' | 'Out for Delivery' | 'Delivered' | 'Returned';
  estimatedDelivery: string;
  originalEstimatedDelivery?: string;
  currentLocation: string;
  delayHours?: number;
  events: ShippingEvent[];
}
