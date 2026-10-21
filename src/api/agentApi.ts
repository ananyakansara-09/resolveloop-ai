import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { AgentRunRequest, AgentRunResponse } from '../types/agent';

export async function runAgent(req: AgentRunRequest): Promise<AgentRunResponse> {
  return executeApi(
    () => apiClient.post<AgentRunResponse>('/agent/run', req),
    () => mockService.runAgent(req),
    { endpointName: 'POST /agent/run' }
  );
}
