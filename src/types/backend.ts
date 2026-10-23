// ==========================================
// ResolveLoop AI - Backend API TypeScript Interfaces
// Exact types from the Backend Integration Guide
// ==========================================

// ==========================================
// 1. ORDER & SHIPPING
// ==========================================
export interface ShippingEvent {
  id: string;
  order_id: string;
  event_type: string; // "picked_up" | "in_transit" | "carrier_delay" | "delivered"
  description: string;
  location: string;
  occurred_at: string; // ISO 8601
}

export interface Order {
  id: string; // e.g., "KL-1042"
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: "processing" | "shipped" | "delayed" | "delivered";
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  shipping_events: ShippingEvent[];
}

export interface ShippingEventsResponse {
  order_id: string;
  events: ShippingEvent[];
}

// ==========================================
// 2. SUPPORT CASE & ACTIONS
// ==========================================
export interface ProposedAction {
  id: string; // e.g., "ACT-..."
  case_id: string;
  action_type: "send_customer_email" | "offer_concession" | "issue_refund";
  payload: {
    recipient?: string;
    subject?: string;
    body?: string;
    recommended_action?: string;
    [key: string]: any;
  };
  reason: string;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  idempotency_key: string;
  created_at: string;
  executed_at: string | null;
}

export interface FollowUp {
  id: string; // e.g., "FOL-..."
  case_id: string;
  description: string;
  due_at: string; // ISO 8601
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  completed_at: string | null;
}

export interface AuditEvent {
  id: string; // e.g., "AUD-..."
  case_id: string;
  event_type: string;
  actor: "agent" | "merchant" | "merchant_admin" | "system";
  details: Record<string, any>;
  created_at: string;
}

export interface Message {
  id: string;
  case_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface SupportCase {
  id: string; // e.g., "CASE-..."
  order_id: string | null;
  customer_issue: string;
  summary: string;
  status: "open" | "investigating" | "awaiting_approval" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportCaseDetail extends SupportCase {
  order?: Order | null;
  messages: Message[];
  proposed_actions: ProposedAction[];
  follow_ups: FollowUp[];
  audit_events: AuditEvent[];
}

export interface PaginatedCasesResponse {
  items: SupportCase[];
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// 3. AGENT RUN ENDPOINT
// ==========================================
export interface AgentRunRequest {
  message: string;
  caseId?: string | null;
}

export interface ToolExecutionResult {
  tool_name: string;
  input_arguments: Record<string, any>;
  status: "success" | "error";
  output: any;
  error?: string | null;
}

export interface AgentRunResponse {
  caseId: string;
  assistantMessage: string;
  order: Order | null;
  toolExecutionResults: ToolExecutionResult[];
  evidence: {
    order?: Record<string, any>;
    shipping?: {
      order_id: string;
      has_events: boolean;
      events_count: number;
      is_delayed: boolean;
      latest_event?: ShippingEvent;
      timeline?: ShippingEvent[];
    };
    policy_check?: Record<string, any>;
    [key: string]: any;
  };
  policyDecision: {
    eligible: boolean;
    status: "eligible" | "ineligible" | "needs_review" | "requires_approval";
    requires_approval: boolean;
    policy_name: string;
    policy_id: string;
    allowed_actions: string[];
    reason: string;
    conditions_met?: Record<string, any>;
  };
  recommendation: string;
  proposedActions: ProposedAction[];
  approvalRequirements: {
    has_pending_approval: boolean;
    pending_action_count: number;
    policy_rule: string;
  };
  followUpDetails: FollowUp | null;
  currentCaseStatus: string;
  auditEvents: AuditEvent[];
}

// ==========================================
// 4. APPROVAL & ACTIONS
// ==========================================
export interface ActionApprovalRequest {
  action_id?: string;
  actor?: string; // default "merchant"
  notes?: string;
}

export interface ActionRejectionRequest {
  action_id?: string;
  actor?: string; // default "merchant"
  reason?: string;
}

export interface ActionExecutionResult {
  action_id: string;
  case_id: string;
  status: "executed" | "rejected" | "failed";
  executed: boolean;
  verified: boolean;
  verification_details: {
    verified: boolean;
    outbox_message_id?: string;
    recipient?: string;
    subject?: string;
    status?: string;
    dispatched_at?: string;
    [key: string]: any;
  };
  message: string;
}

// ==========================================
// 5. DASHBOARD & HEALTH
// ==========================================
export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  ai_provider: string;
}

export interface DashboardRecentCase {
  id: string;
  order_id: string | null;
  summary: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface DashboardStatsResponse {
  total_cases: number;
  cases_awaiting_approval: number;
  resolved_cases: number;
  follow_ups_due: number;
  recent_cases: DashboardRecentCase[];
}
