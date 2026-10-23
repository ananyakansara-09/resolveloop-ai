import type { OrderDetails } from './order';
import type { ShippingDetails } from './shipping';
import type { StorePolicyMatch, ProposedAction } from './case';
import type { FollowUp } from './backend';

export type ToolExecutionStatus = 'running' | 'completed' | 'failed';

export interface ToolCall {
  id: string;
  name: string;
  displayName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  status: ToolExecutionStatus;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  error?: string;
}

export interface AgentRecommendation {
  summary: string;
  confidence: number;
  evidence: string[];
  rationale: string;
  urgency: 'urgent' | 'high' | 'medium' | 'low';
}

export interface AgentRunRequest {
  prompt: string;
  orderId?: string;
  caseId?: string;
  isVoiceInput?: boolean;
}

export interface AgentRunResponse {
  sessionId: string;
  caseId: string;
  orderId: string;
  response: string;
  executionSteps: ToolCall[];
  recommendation: AgentRecommendation;
  order?: OrderDetails;
  shipping?: ShippingDetails;
  policy?: StorePolicyMatch;
  proposedAction?: ProposedAction;
  followUpDetails?: FollowUp | null;
}
