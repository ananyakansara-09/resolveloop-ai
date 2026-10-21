import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { Case, CaseWithHistory } from '../types/case';
import type { CreateFollowUpDto, FollowUpTask } from '../types/followUp';

export async function getCases(): Promise<Case[]> {
  return executeApi(
    () => apiClient.get<Case[]>('/cases'),
    () => mockService.getCases(),
    { endpointName: 'GET /cases' }
  );
}

export async function getCase(id: string): Promise<CaseWithHistory | null> {
  return executeApi(
    () => apiClient.get<CaseWithHistory>(`/cases/${encodeURIComponent(id)}`),
    () => mockService.getCase(id),
    { endpointName: `GET /cases/${id}` }
  );
}

export async function createCase(data: Partial<Case>): Promise<Case> {
  return executeApi(
    () => apiClient.post<Case>('/cases', data),
    async () => {
      // Create stub case in mock service
      const newId = `CASE-2026-${Date.now().toString().slice(-4)}`;
      const newCase: Case = {
        id: newId,
        orderId: data.orderId || 'KL-1042',
        customer: data.customer || {
          id: 'CUST-NEW',
          name: 'Customer',
          email: 'customer@example.com',
          tier: 'Standard',
          ordersCount: 1,
          lifetimeValue: 100,
        },
        issueSummary: data.issueSummary || 'Support request initiated',
        status: data.status || 'open',
        priority: data.priority || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        actionRequired: false,
      };
      return newCase;
    },
    { endpointName: 'POST /cases' }
  );
}

export async function approveCaseAction(
  caseId: string,
  editedDraftEmail?: string
): Promise<{ success: boolean; case: CaseWithHistory; message: string }> {
  return executeApi(
    () => apiClient.post<{ success: boolean; case: CaseWithHistory; message: string }>(
      `/cases/${encodeURIComponent(caseId)}/approve`,
      { customerEmailDraft: editedDraftEmail }
    ),
    () => mockService.approveAction(caseId, editedDraftEmail),
    { endpointName: `POST /cases/${caseId}/approve` }
  );
}

export async function rejectCaseAction(
  caseId: string,
  reason: string
): Promise<{ success: boolean; case: CaseWithHistory; reason: string }> {
  return executeApi(
    () => apiClient.post<{ success: boolean; case: CaseWithHistory; reason: string }>(
      `/cases/${encodeURIComponent(caseId)}/reject`,
      { reason }
    ),
    () => mockService.rejectAction(caseId, reason),
    { endpointName: `POST /cases/${caseId}/reject` }
  );
}

export async function createCaseFollowUp(
  caseId: string,
  dto: Omit<CreateFollowUpDto, 'caseId'>
): Promise<FollowUpTask> {
  return executeApi(
    () => apiClient.post<FollowUpTask>(`/cases/${encodeURIComponent(caseId)}/follow-ups`, dto),
    () => mockService.createFollowUp({ ...dto, caseId }),
    { endpointName: `POST /cases/${caseId}/follow-ups` }
  );
}
