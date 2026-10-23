import type { CustomerInfo, OrderDetails } from './order';
import type { ShippingDetails } from './shipping';
import type { FollowUp } from './backend';

export type CaseStatus = 'open' | 'investigating' | 'awaiting_approval' | 'approved' | 'rejected' | 'resolved';

export type CasePriority = 'urgent' | 'high' | 'medium' | 'low';

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export interface ProposedAction {
  id: string;
  type: 'refund' | 'reship' | 'courtesy_credit' | 'carrier_investigation' | 'customer_outreach' | 'custom';
  title: string;
  description: string;
  cost?: number;
  customerEmailDraft: string;
  status: ActionStatus;
  approvedAt?: string;
  rejectedReason?: string;
  evidence: string[];
}

export interface StorePolicyMatch {
  policyId: string;
  title: string;
  category: string;
  ruleApplied: string;
  thresholdMet: boolean;
  recommendedAction: string;
  policyUrl?: string;
}

export interface CaseAuditEvent {
  id: string;
  timestamp: string;
  actor: 'agent' | 'user' | 'system';
  action: string;
  details: string;
}

export interface CaseMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  content: string;
  isVoiceInput?: boolean;
}

export interface Case {
  id: string;
  orderId: string;
  customer: CustomerInfo;
  issueSummary: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  actionRequired: boolean;
}

export interface CaseWithHistory extends Case {
  order?: OrderDetails;
  messages: CaseMessage[];
  shipping?: ShippingDetails;
  policy?: StorePolicyMatch;
  proposedAction?: ProposedAction;
  auditTrail: CaseAuditEvent[];
  followUpId?: string;
  followUpDescription?: string;
  followUpDueAt?: string;
  followUps?: FollowUp[];
}
