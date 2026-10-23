import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { DashboardData, SystemHealth } from '../types/dashboard';
import type { BackendHealthResponse, DashboardStatsResponse } from '../types/backend';
import type { Case, CasePriority, CaseStatus } from '../types/case';

export interface HealthCheckResult {
  status: string;
  timestamp: string;
  mode: string;
  service?: string;
  version?: string;
  environment?: string;
  aiProvider?: string;
  health: SystemHealth;
}

/**
 * Endpoint: GET /health
 * Backend Health Check
 */
export async function getHealth(): Promise<HealthCheckResult> {
  return executeApi(
    async () => {
      const res = await apiClient.get<BackendHealthResponse>('/health');
      const data = res.data;
      const isHealthy = data.status === 'healthy' || data.status === 'ok';

      const adapted: HealthCheckResult = {
        status: data.status,
        timestamp: new Date().toISOString(),
        mode: data.ai_provider || 'connected',
        service: data.service,
        version: data.version,
        environment: data.environment,
        aiProvider: data.ai_provider,
        health: {
          status: isHealthy ? 'operational' : 'degraded',
          alexaSimulation: 'connected',
          carrierApi: 'connected',
          emailService: 'connected',
          storeSync: 'synced',
          lastPing: new Date().toISOString(),
        },
      };
      return { data: adapted };
    },
    async () => {
      const mockHealth = await mockService.getHealth();
      return {
        ...mockHealth,
        service: 'ResolveLoop AI Backend (Simulated)',
        version: '1.0.0',
        environment: 'development',
        aiProvider: 'simulated_alexa_plus',
      };
    },
    { endpointName: 'GET /health' }
  );
}

/**
 * Endpoint: GET /api/dashboard
 * Dashboard Metrics & Recent Cases
 */
export async function getDashboard(): Promise<DashboardData> {
  return executeApi(
    async () => {
      const res = await apiClient.get<DashboardStatsResponse>('/api/dashboard');
      const data = res.data;

      // Map backend recent_cases to frontend Case type
      const recentCases: Case[] = (data.recent_cases || []).map(c => ({
        id: c.id,
        orderId: c.order_id || 'KL-1042',
        issueSummary: c.summary || 'Customer inquiry under investigation',
        status: (c.status || 'open') as CaseStatus,
        priority: (c.priority || 'medium') as CasePriority,
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.created_at || new Date().toISOString(),
        actionRequired: c.status === 'awaiting_approval',
        customer: {
          id: `CUST-${c.order_id ? c.order_id.replace(/\D/g, '') || '1042' : '1042'}`,
          name: c.order_id === 'KL-1042' ? 'Sarah Connor' : 'Valued Customer',
          email: c.order_id === 'KL-1042' ? 'sarah.c@example.com' : 'customer@example.com',
          tier: 'VIP',
          ordersCount: 1,
          lifetimeValue: 149.99,
        },
      }));

      const adaptedDashboard: DashboardData = {
        stats: {
          totalCases: data.total_cases ?? 0,
          openCases: Math.max(0, (data.total_cases ?? 0) - (data.resolved_cases ?? 0)),
          awaitingApproval: data.cases_awaiting_approval ?? 0,
          resolvedCases: data.resolved_cases ?? 0,
          followUpsDue: data.follow_ups_due ?? 0,
        },
        recentCases,
        systemHealth: {
          status: 'operational',
          alexaSimulation: 'connected',
          carrierApi: 'connected',
          emailService: 'connected',
          storeSync: 'synced',
          lastPing: new Date().toISOString(),
        },
      };

      return { data: adaptedDashboard };
    },
    () => mockService.getDashboard(),
    { endpointName: 'GET /api/dashboard' }
  );
}
