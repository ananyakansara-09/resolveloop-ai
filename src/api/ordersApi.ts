import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { OrderDetails } from '../types/order';
import type { ShippingDetails } from '../types/shipping';

export async function getOrder(id: string): Promise<OrderDetails | null> {
  return executeApi(
    () => apiClient.get<OrderDetails>(`/orders/${encodeURIComponent(id)}`),
    () => mockService.getOrder(id),
    { endpointName: `GET /orders/${id}` }
  );
}

export async function getOrderShipping(id: string): Promise<ShippingDetails | null> {
  return executeApi(
    () => apiClient.get<ShippingDetails>(`/orders/${encodeURIComponent(id)}/shipping`),
    () => mockService.getOrderShipping(id),
    { endpointName: `GET /orders/${id}/shipping` }
  );
}
