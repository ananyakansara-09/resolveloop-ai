import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { FollowUpTask, CreateFollowUpDto, FollowUpStatus } from '../types/followUp';
import type { FollowUp as BackendFollowUp } from '../types/backend';

export interface GetFollowUpsParams {
  status?: string;
  case_id?: string;
}

/**
 * Endpoint: GET /api/follow-ups
 * List follow-up tasks with optional status and case filters
 */
export async function getFollowUps(params?: GetFollowUpsParams): Promise<FollowUpTask[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.case_id) queryParams.append('case_id', params.case_id);

  const url = `/api/follow-ups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return executeApi(
    async () => {
      const res = await apiClient.get<BackendFollowUp[]>(url);
      const now = Date.now();

      const adaptedTasks: FollowUpTask[] = (res.data || []).map(f => {
        const isPast = new Date(f.due_at).getTime() < now;
        return {
          id: f.id,
          caseId: f.case_id,
          orderId: f.case_id.replace('CASE-2026-', 'KL-').replace('CASE-', 'KL-'),
          description: f.description,
          dueDate: f.due_at,
          status: (f.status === 'completed' ? 'completed' : f.status === 'cancelled' ? 'cancelled' : 'pending') as FollowUpStatus,
          priority: 'high',
          assignedTo: 'ResolveLoop AI Agent',
          createdAt: f.created_at,
          completedAt: f.completed_at || undefined,
          isOverdue: f.status === 'pending' && isPast,
        };
      });

      return { data: adaptedTasks };
    },
    () => mockService.getFollowUps(),
    { endpointName: `GET ${url}` }
  );
}

/**
 * Endpoint: POST /api/cases/{case_id}/follow-ups
 * Register an automated follow-up checkpoint
 */
export async function createFollowUp(dto: CreateFollowUpDto): Promise<FollowUpTask> {
  const targetCaseId = dto.caseId || 'CASE-2026-1042';
  const payload = {
    description: dto.description,
    due_at: dto.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<BackendFollowUp>(
        `/api/cases/${encodeURIComponent(targetCaseId)}/follow-ups`,
        payload
      );
      const f = res.data;
      const adapted: FollowUpTask = {
        id: f.id,
        caseId: f.case_id,
        orderId: dto.orderId || 'KL-1042',
        customerName: 'Sarah Jenkins',
        description: f.description,
        dueDate: f.due_at,
        status: (f.status === 'completed' ? 'completed' : 'pending') as FollowUpStatus,
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo || 'ResolveLoop AI Agent',
        createdAt: f.created_at,
        completedAt: f.completed_at || undefined,
        isOverdue: false,
      };
      return { data: adapted };
    },
    () => mockService.createFollowUp(dto),
    { endpointName: `POST /api/cases/${targetCaseId}/follow-ups` }
  );
}

/**
 * Endpoint: PATCH /api/follow-ups/{follow_up_id}
 * Update follow-up status (e.g. mark completed) or description
 */
export async function updateFollowUp(
  id: string,
  updates: Partial<FollowUpTask> & { status?: string; description?: string }
): Promise<FollowUpTask> {
  const payload: { status?: string; description?: string } = {};
  if (updates.status) payload.status = updates.status;
  if (updates.description) payload.description = updates.description;

  return executeApi(
    async () => {
      const res = await apiClient.patch<BackendFollowUp>(
        `/api/follow-ups/${encodeURIComponent(id)}`,
        payload
      );
      const f = res.data;
      const adapted: FollowUpTask = {
        id: f.id,
        caseId: f.case_id,
        orderId: f.case_id.replace('CASE-2026-', 'KL-').replace('CASE-', 'KL-'),
        description: f.description,
        dueDate: f.due_at,
        status: (f.status === 'completed' ? 'completed' : f.status === 'cancelled' ? 'cancelled' : 'pending') as FollowUpStatus,
        priority: updates.priority || 'high',
        assignedTo: updates.assignedTo || 'ResolveLoop AI Agent',
        createdAt: f.created_at,
        completedAt: f.completed_at || undefined,
        isOverdue: false,
      };
      return { data: adapted };
    },
    () => mockService.updateFollowUp(id, updates),
    { endpointName: `PATCH /api/follow-ups/${id}` }
  );
}
