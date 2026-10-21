import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { FollowUpTask, CreateFollowUpDto } from '../types/followUp';

export async function getFollowUps(): Promise<FollowUpTask[]> {
  return executeApi(
    () => apiClient.get<FollowUpTask[]>('/follow-ups'),
    () => mockService.getFollowUps(),
    { endpointName: 'GET /follow-ups' }
  );
}

export async function createFollowUp(dto: CreateFollowUpDto): Promise<FollowUpTask> {
  return executeApi(
    () => apiClient.post<FollowUpTask>('/follow-ups', dto),
    () => mockService.createFollowUp(dto),
    { endpointName: 'POST /follow-ups' }
  );
}

export async function updateFollowUp(id: string, updates: Partial<FollowUpTask>): Promise<FollowUpTask> {
  return executeApi(
    () => apiClient.patch<FollowUpTask>(`/follow-ups/${encodeURIComponent(id)}`, updates),
    () => mockService.updateFollowUp(id, updates),
    { endpointName: `PATCH /follow-ups/${id}` }
  );
}
