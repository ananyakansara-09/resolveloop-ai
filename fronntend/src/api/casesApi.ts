import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { Case, CaseWithHistory, CasePriority, CaseStatus } from '../types/case';
import type { OrderDetails } from '../types/order';
import type { CreateFollowUpDto, FollowUpTask } from '../types/followUp';
import type {
  SupportCase,
  SupportCaseDetail,
  PaginatedCasesResponse,
  ActionApprovalRequest,
  ActionRejectionRequest,
  ActionExecutionResult,
  FollowUp as BackendFollowUp,
} from '../types/backend';

export interface GetCasesParams {
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Endpoint: GET /api/cases
 * List cases with optional status filter and pagination
 */
export async function getCases(params?: GetCasesParams): Promise<Case[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `/api/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return executeApi(
    async () => {
      const res = await apiClient.get<PaginatedCasesResponse | SupportCase[]>(url);
      const items: SupportCase[] = Array.isArray(res.data) ? res.data : (res.data.items || []);

      const adaptedCases: Case[] = items.map(c => ({
        id: c.id,
        orderId: c.order_id || 'KL-1042',
        issueSummary: c.customer_issue || c.summary || 'Shipping transit investigation',
        status: (c.status || 'open') as CaseStatus,
        priority: (c.priority || 'medium') as CasePriority,
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.updated_at || new Date().toISOString(),
        actionRequired: c.status === 'awaiting_approval',
        customer: {
          id: `CUST-${(c.order_id || '1042').replace(/\D/g, '') || '1042'}`,
          name: (c as any).order?.customer_name || (c.order_id === 'KL-1042' ? 'Sarah Connor' : 'Customer'),
          email: (c as any).order?.customer_email || (c.order_id === 'KL-1042' ? 'sarah.c@example.com' : 'customer@example.com'),
          tier: 'VIP',
          ordersCount: 1,
          lifetimeValue: (c as any).order?.total_amount || 149.99,
        },
      }));

      return { data: adaptedCases };
    },
    () => mockService.getCases(),
    { endpointName: `GET ${url}` }
  );
}

/**
 * Endpoint: GET /api/cases/{case_id}
 * Retrieve complete case detail including audit events, messages, actions, and follow-ups
 */
export async function getCase(id: string): Promise<CaseWithHistory | null> {
  return executeApi(
    async () => {
      const res = await apiClient.get<SupportCaseDetail>(`/api/cases/${encodeURIComponent(id)}`);
      const detail = res.data;

      // Extract customer details if order attached
      const customerName = detail.order?.customer_name || 'Sarah Connor';
      const customerEmail = detail.order?.customer_email || 'sarah.c@example.com';
      const totalAmount = detail.order?.total_amount || 149.99;
      const events = detail.order?.shipping_events || [];
      const latestEv = events[events.length - 1];
      const currentLocation = latestEv?.location || 'Siskiyou Pass, CA';
      const isDelayed = detail.order?.status === 'delayed';

      // Map proposed actions
      const firstAction = detail.proposed_actions?.[0];

      // Map audit events with clean, human-readable details
      const auditTrail = (detail.audit_events || []).map(a => {
        let detailsText = '';
        if (typeof a.details === 'string') {
          detailsText = a.details;
        } else if (a.details) {
          if (a.details.summary) {
            detailsText = a.details.summary;
          } else if (a.details.description) {
            detailsText = a.details.description;
          } else if (a.details.subject) {
            detailsText = `Subject: ${a.details.subject} (Recipient: ${a.details.recipient || customerEmail})`;
          } else {
            detailsText = Object.entries(a.details)
              .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
              .join(' • ');
          }
        }

        return {
          id: a.id,
          timestamp: a.created_at,
          actor: (a.actor === 'merchant' || a.actor === 'merchant_admin' ? 'user' : a.actor) as 'agent' | 'user' | 'system',
          action: a.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          details: detailsText || 'Action event recorded.',
        };
      });

      // Map conversation messages
      const messages = (detail.messages || []).map(m => ({
        id: m.id,
        sender: (m.role === 'assistant' ? 'agent' : m.role === 'user' ? 'user' : 'system') as 'agent' | 'user' | 'system',
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: m.content,
      }));

      const firstFollowUp = detail.follow_ups?.[0];

      const adaptedOrder: OrderDetails | undefined = detail.order
        ? {
            id: detail.order.id,
            orderDate: detail.order.order_date || detail.order.created_at,
            status: detail.order.status === 'delayed' ? 'Delayed' : detail.order.status === 'shipped' ? 'Shipped' : 'Delivered',
            totalAmount,
            currency: detail.order.currency || 'USD',
            carrier: 'FedEx Priority',
            trackingNumber: `TRK-${detail.order.id}`,
            items: [
              {
                id: 'PKG-1',
                name: `Order #${detail.order.id} Package`,
                sku: detail.order.id,
                quantity: 1,
                price: totalAmount,
              },
            ],
            customer: {
              id: `CUST-${(detail.order.id || '1042').replace(/\D/g, '') || '1042'}`,
              name: customerName,
              email: customerEmail,
              tier: 'VIP',
              ordersCount: 1,
              lifetimeValue: totalAmount,
              csatScore: 4.9,
            },
            shippingAddress: {
              street: `Destination via ${currentLocation} Transit Hub`,
              city: 'Springfield',
              state: 'IL',
              zip: '62704',
              country: 'United States',
            },
          }
        : undefined;

      const adaptedCase: CaseWithHistory = {
        id: detail.id,
        orderId: detail.order_id || 'KL-1042',
        customer: {
          id: `CUST-${(detail.order_id || '1042').replace(/\D/g, '') || '1042'}`,
          name: customerName,
          email: customerEmail,
          tier: 'VIP',
          ordersCount: 1,
          lifetimeValue: totalAmount,
          csatScore: 4.9,
        },
        order: adaptedOrder,
        issueSummary: detail.customer_issue || detail.summary || 'Shipping transit investigation',
        status: (detail.status || 'open') as CaseStatus,
        priority: (detail.priority || 'medium') as CasePriority,
        createdAt: detail.created_at,
        updatedAt: detail.updated_at,
        actionRequired: detail.status === 'awaiting_approval',
        messages,
        auditTrail,
        followUpId: firstFollowUp?.id,
        followUpDescription: firstFollowUp?.description,
        followUpDueAt: firstFollowUp?.due_at,
        followUps: detail.follow_ups || [],
        proposedAction: firstAction
          ? {
              id: firstAction.id,
              type: firstAction.action_type === 'send_customer_email' ? 'customer_outreach' : 'courtesy_credit',
              title: firstAction.payload?.subject || 'Dispatch Customer Notification Email',
              description: firstAction.reason,
              cost: firstAction.payload?.concession_amount || 0,
              customerEmailDraft:
                firstAction.payload?.body ||
                `Subject: ${firstAction.payload?.subject || 'Update regarding order'}\n\nDear Customer...`,
              status: firstAction.status === 'executed' || firstAction.status === 'approved' ? 'approved' : firstAction.status === 'rejected' ? 'rejected' : 'pending',
              evidence: [
                firstAction.reason,
                firstAction.payload?.recommended_action || 'Notify customer of carrier weather delay and provide revised delivery expectation.',
              ],
              approvedAt: firstAction.executed_at || undefined,
            }
          : undefined,
        shipping: events.length
          ? {
              trackingNumber: `TRK-${detail.order?.id || detail.order_id || '1042'}`,
              carrier: 'FedEx Priority',
              serviceLevel: 'Priority Air Transit',
              status: isDelayed ? 'Delayed' : 'In Transit',
              currentLocation,
              delayHours: 48,
              estimatedDelivery: firstFollowUp?.due_at || new Date(Date.now() + 86400000).toISOString(),
              events: events.map((e, idx) => ({
                id: e.id || `ev-${idx + 1}`,
                timestamp: e.occurred_at,
                location: e.location,
                status: e.event_type === 'carrier_delay' ? 'Carrier Transit Exception' : e.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: e.description,
                exception: e.event_type === 'carrier_delay',
              })),
            }
          : undefined,
        policy: {
          policyId: 'POL-SHIPPING-DELAY',
          title: 'In-Transit Carrier Delay Resolution Policy',
          category: 'shipping_sla',
          ruleApplied: 'Under Policy POL-SHIPPING-DELAY (In-Transit Carrier Delay Resolution Policy), proactive explanation and apology email is eligible, but requires explicit merchant approval before transmission.',
          thresholdMet: true,
          recommendedAction: 'send_customer_email, create_follow_up, offer_concession',
        },
      };

      return { data: adaptedCase };
    },
    () => mockService.getCase(id),
    { endpointName: `GET /api/cases/${id}` }
  );
}

/**
 * Endpoint: POST /api/cases
 * Create manual case
 */
export async function createCase(data: Partial<Case> & { customer_issue?: string }): Promise<Case> {
  const payload = {
    order_id: data.orderId || 'KL-1042',
    customer_issue: data.customer_issue || data.issueSummary || 'Customer support inquiry',
    summary: data.issueSummary || 'Customer support inquiry',
    priority: data.priority || 'medium',
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<SupportCase>('/api/cases', payload);
      const c = res.data;
      const adapted: Case = {
        id: c.id,
        orderId: c.order_id || 'KL-1042',
        customer: {
          id: 'CUST-NEW',
          name: 'Customer',
          email: 'customer@example.com',
          tier: 'Standard',
          ordersCount: 1,
          lifetimeValue: 100,
        },
        issueSummary: c.customer_issue || c.summary,
        status: (c.status || 'open') as CaseStatus,
        priority: (c.priority || 'medium') as CasePriority,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        actionRequired: c.status === 'awaiting_approval',
      };
      return { data: adapted };
    },
    async () => {
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
    { endpointName: 'POST /api/cases' }
  );
}

/**
 * Endpoint: POST /api/cases/{case_id}/approve
 * Authorize and dispatch proposed action (email & courtesy credit)
 */
export async function approveCaseAction(
  caseId: string,
  editedDraftEmail?: string,
  actionId?: string
): Promise<{ success: boolean; case: CaseWithHistory; message: string; result?: ActionExecutionResult }> {
  const payload: ActionApprovalRequest = {
    action_id: actionId,
    actor: 'merchant',
    notes: editedDraftEmail
      ? `Approved with customized draft email: ${editedDraftEmail.slice(0, 80)}...`
      : 'Approved by store owner via merchant portal.',
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<ActionExecutionResult>(
        `/api/cases/${encodeURIComponent(caseId)}/approve`,
        payload
      );
      const executionResult = res.data;

      // Re-fetch updated case
      const updatedCase = await getCase(caseId);
      const fallbackCase: CaseWithHistory = updatedCase || (await mockService.getCase(caseId))!;

      const approvedCase: CaseWithHistory = {
        ...fallbackCase,
        status: 'approved' as CaseStatus,
        proposedAction: fallbackCase.proposedAction
          ? { ...fallbackCase.proposedAction, status: 'approved' }
          : undefined,
      };

      return {
        data: {
          success: executionResult.executed || executionResult.status === 'executed',
          case: approvedCase,
          message: executionResult.message || 'Action authorized and dispatched successfully.',
          result: executionResult,
        },
      };
    },
    async () => {
      const mockResult = await mockService.approveAction(caseId, editedDraftEmail);
      return {
        ...mockResult,
        result: {
          action_id: `ACT-${caseId}`,
          case_id: caseId,
          status: 'executed',
          executed: true,
          verified: true,
          verification_details: {
            verified: true,
            outbox_message_id: `MSG-${Date.now().toString(16).toUpperCase()}`,
            status: 'sent',
            dispatched_at: new Date().toISOString(),
          },
          message: mockResult.message,
        },
      };
    },
    { endpointName: `POST /api/cases/${caseId}/approve` }
  );
}

/**
 * Endpoint: POST /api/cases/{case_id}/reject
 * Reject proposed action with mandatory reason
 */
export async function rejectCaseAction(
  caseId: string,
  reason: string,
  actionId?: string
): Promise<{ success: boolean; case: CaseWithHistory; reason: string; result?: ActionExecutionResult }> {
  const payload: ActionRejectionRequest = {
    action_id: actionId,
    actor: 'merchant',
    reason,
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<ActionExecutionResult>(
        `/api/cases/${encodeURIComponent(caseId)}/reject`,
        payload
      );
      const executionResult = res.data;

      // Re-fetch updated case
      const updatedCase = await getCase(caseId);
      const fallbackCase: CaseWithHistory = updatedCase || (await mockService.getCase(caseId))!;

      const rejectedCase: CaseWithHistory = {
        ...fallbackCase,
        status: 'rejected' as CaseStatus,
        proposedAction: fallbackCase.proposedAction
          ? { ...fallbackCase.proposedAction, status: 'rejected', rejectedReason: reason }
          : undefined,
      };

      return {
        data: {
          success: true,
          case: rejectedCase,
          reason,
          result: executionResult,
        },
      };
    },
    () => mockService.rejectAction(caseId, reason),
    { endpointName: `POST /api/cases/${caseId}/reject` }
  );
}

/**
 * Endpoint: POST /api/cases/{case_id}/follow-ups
 * Create follow-up task attached to a case
 */
export async function createCaseFollowUp(
  caseId: string,
  dto: Omit<CreateFollowUpDto, 'caseId'>
): Promise<FollowUpTask> {
  const payload = {
    description: dto.description,
    due_at: dto.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<BackendFollowUp>(
        `/api/cases/${encodeURIComponent(caseId)}/follow-ups`,
        payload
      );
      const f = res.data;
      const adaptedTask: FollowUpTask = {
        id: f.id,
        caseId: f.case_id,
        orderId: dto.orderId || 'KL-1042',
        description: f.description,
        dueDate: f.due_at,
        status: (f.status === 'completed' ? 'completed' : 'pending'),
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo || 'ResolveLoop AI Agent',
        createdAt: f.created_at,
        completedAt: f.completed_at || undefined,
        isOverdue: false,
      };
      return { data: adaptedTask };
    },
    () => mockService.createFollowUp({ ...dto, caseId }),
    { endpointName: `POST /api/cases/${caseId}/follow-ups` }
  );
}
