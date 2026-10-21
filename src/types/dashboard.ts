import type { Case } from './case';

export interface DashboardStats {
  totalCases: number;
  openCases: number;
  awaitingApproval: number;
  resolvedCases: number;
  followUpsDue: number;
}

export interface SystemHealth {
  status: 'operational' | 'degraded' | 'offline';
  alexaSimulation: 'connected' | 'idle';
  carrierApi: 'connected' | 'simulated';
  emailService: 'connected' | 'simulated';
  storeSync: 'synced' | 'pending';
  lastPing: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentCases: Case[];
  systemHealth: SystemHealth;
}
