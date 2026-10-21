import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { DashboardData, SystemHealth } from '../types/dashboard';

export async function getHealth(): Promise<{ status: string; timestamp: string; mode: string; health: SystemHealth }> {
  return executeApi(
    async () => {
      // First try root health check, if fails try api health
      try {
        const rootRes = await apiClient.get('/health');
        return rootRes;
      } catch {
        return await apiClient.get('/health');
      }
    },
    () => mockService.getHealth(),
    { endpointName: 'GET /health' }
  );
}

export async function getDashboard(): Promise<DashboardData> {
  return executeApi(
    () => apiClient.get<DashboardData>('/dashboard'),
    () => mockService.getDashboard(),
    { endpointName: 'GET /dashboard' }
  );
}
