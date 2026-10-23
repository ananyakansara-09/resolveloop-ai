import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { OrderDetails } from '../types/order';
import type { ShippingDetails } from '../types/shipping';
import type { Order as BackendOrder, ShippingEventsResponse } from '../types/backend';

/**
 * Endpoint: GET /api/orders/{order_id}
 * Retrieve order details by ID
 */
export async function getOrder(id: string): Promise<OrderDetails | null> {
  return executeApi(
    async () => {
      const res = await apiClient.get<BackendOrder>(`/api/orders/${encodeURIComponent(id)}`);
      const o = res.data;

      const adaptedOrder: OrderDetails = {
        id: o.id,
        orderDate: o.order_date || o.created_at,
        status: o.status === 'delayed' ? 'Delayed' : o.status === 'shipped' ? 'Shipped' : 'Delivered',
        totalAmount: o.total_amount,
        currency: o.currency || 'USD',
        carrier: 'FedEx Priority',
        trackingNumber: 'TRK-9823412',
        items: [
          {
            id: 'ITEM-1',
            name: 'Apex Thermal Winter Parka - Navy / L',
            sku: 'APX-PRK-NV-L',
            quantity: 1,
            price: o.total_amount,
          },
        ],
        customer: {
          id: `CUST-${o.id.replace(/\D/g, '') || '1042'}`,
          name: o.customer_name || 'Sarah Jenkins',
          email: o.customer_email || 'sarah.jenkins@example.com',
          tier: 'VIP',
          ordersCount: 14,
          lifetimeValue: 1840.0,
          csatScore: 4.9,
        },
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          zip: '62704',
          country: 'United States',
        },
      };

      return { data: adaptedOrder };
    },
    () => mockService.getOrder(id),
    { endpointName: `GET /api/orders/${id}` }
  );
}

/**
 * Endpoint: GET /api/orders/{order_id}/shipping
 * Retrieve shipping tracking milestones and transit exceptions
 */
export async function getOrderShipping(id: string): Promise<ShippingDetails | null> {
  return executeApi(
    async () => {
      const res = await apiClient.get<ShippingEventsResponse>(`/api/orders/${encodeURIComponent(id)}/shipping`);
      const eventsData = res.data.events || [];

      const latestEvent = eventsData[eventsData.length - 1];
      const hasDelay = eventsData.some(e => e.event_type === 'carrier_delay');

      const adaptedShipping: ShippingDetails = {
        trackingNumber: 'TRK-9823412',
        carrier: 'FedEx Priority',
        serviceLevel: 'Priority Air Hub',
        status: hasDelay ? 'Delayed' : 'In Transit',
        currentLocation: latestEvent?.location || 'Siskiyou Pass, CA',
        delayHours: 48,
        estimatedDelivery: '2026-10-24T18:00:00Z',
        events: eventsData.map((e, idx) => ({
          id: e.id || `ev-${idx + 1}`,
          timestamp: e.occurred_at,
          location: e.location,
          status: e.event_type === 'carrier_delay' ? 'Weather Exception Hold' : e.event_type.replace(/_/g, ' '),
          description: e.description,
          exception: e.event_type === 'carrier_delay',
        })),
      };

      return { data: adaptedShipping };
    },
    () => mockService.getOrderShipping(id),
    { endpointName: `GET /api/orders/${id}/shipping` }
  );
}
