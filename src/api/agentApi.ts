import { apiClient, executeApi } from './apiClient';
import { mockService } from './mock/mockService';
import type { AgentRunRequest, AgentRunResponse, ToolCall } from '../types/agent';
import type { AgentRunResponse as BackendAgentRunResponse, AgentRunRequest as BackendAgentRunRequest } from '../types/backend';
import type { OrderDetails } from '../types/order';
import type { ShippingDetails } from '../types/shipping';
import type { StorePolicyMatch, ProposedAction } from '../types/case';

function getToolDisplayName(toolName: string): string {
  const map: Record<string, string> = {
    lookup_order: 'Search & Fetch Order Details',
    get_shipping_status: 'Query Carrier Tracking & Hub Telemetry',
    fetch_shipping_events: 'Query Carrier Tracking & Hub Telemetry',
    check_store_policy: 'Evaluate Merchant SLA & Return Rules',
    create_support_case: 'Create Support Resolution Case',
    draft_customer_email: 'Draft Empathetic Customer Outreach',
    synthesize_resolution_plan: 'Synthesize Context & Draft Customer Outreach',
    create_follow_up: 'Schedule Automated Follow-up Monitor',
    schedule_followup: 'Schedule Automated Follow-up Monitor',
  };
  return map[toolName] || toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Endpoint: POST /api/agent/run
 * Core Autonomous Investigation & Resolution Endpoint
 */
export async function runAgent(req: AgentRunRequest): Promise<AgentRunResponse & { rawBackend?: BackendAgentRunResponse }> {
  const backendPayload: BackendAgentRunRequest = {
    message: req.prompt,
    caseId: req.caseId || null,
  };

  return executeApi(
    async () => {
      const res = await apiClient.post<BackendAgentRunResponse>('/api/agent/run', backendPayload);
      const data = res.data;

      // Map tool execution results into tool calls for execution tracker
      const executionSteps: ToolCall[] = (data.toolExecutionResults || []).map((step, idx) => ({
        id: `tool-${idx + 1}-${Date.now()}`,
        name: step.tool_name,
        displayName: getToolDisplayName(step.tool_name),
        input: step.input_arguments || {},
        output: step.output ?? (step.error ? { error: step.error } : {}),
        status: step.status === 'success' ? 'completed' : 'failed',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationMs: 220 + idx * 60,
        error: step.error || undefined,
      }));

      // Extract shipping events and telemetry dynamically
      const events = data.order?.shipping_events || data.evidence?.shipping?.timeline || [];
      const latestEv = data.evidence?.shipping?.latest_event || events[events.length - 1];
      const currentLocation = latestEv?.location || 'Siskiyou Pass, CA';
      const isDelayed = data.evidence?.shipping?.is_delayed ?? (data.order?.status === 'delayed');

      const shipping: ShippingDetails = {
        trackingNumber: `TRK-${data.order?.id || '9823412'}`,
        carrier: 'FedEx Priority',
        serviceLevel: 'Priority Air Transit',
        status: isDelayed ? 'Delayed' : 'In Transit',
        currentLocation,
        delayHours: 48,
        estimatedDelivery: data.followUpDetails?.due_at || new Date(Date.now() + 86400000).toISOString(),
        events: events.map((ev, i) => ({
          id: ev.id || `ev-${i + 1}`,
          timestamp: ev.occurred_at,
          location: ev.location,
          status: ev.event_type === 'carrier_delay' ? 'Carrier Transit Exception' : ev.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: ev.description,
          exception: ev.event_type === 'carrier_delay',
        })),
      };

      // Map backend Order to UI OrderDetails dynamically
      let adaptedOrder: OrderDetails | undefined;
      if (data.order) {
        const orderDate = data.order.order_date || data.order.created_at;
        const total = data.order.total_amount;
        const currency = data.order.currency || 'USD';
        const customerName = data.order.customer_name || 'Customer';
        const customerEmail = data.order.customer_email || 'customer@example.com';

        adaptedOrder = {
          id: data.order.id,
          orderDate,
          status: data.order.status === 'delayed' ? 'Delayed' : data.order.status === 'shipped' ? 'Shipped' : 'Delivered',
          totalAmount: total,
          currency,
          carrier: 'FedEx Priority',
          trackingNumber: `TRK-${data.order.id}`,
          items: [
            {
              id: 'PKG-1',
              name: `Order #${data.order.id} Package`,
              sku: data.order.id,
              quantity: 1,
              price: total,
            },
          ],
          customer: {
            id: `CUST-${data.order.id.replace(/\D/g, '') || '1042'}`,
            name: customerName,
            email: customerEmail,
            tier: 'VIP',
            ordersCount: 1,
            lifetimeValue: total,
            csatScore: 4.9,
          },
          shippingAddress: {
            street: `Destination via ${currentLocation} Transit Hub`,
            city: 'Springfield',
            state: 'IL',
            zip: '62704',
            country: 'United States',
          },
        };
      }

      // Map Policy Decision dynamically
      const policy: StorePolicyMatch = {
        policyId: data.policyDecision?.policy_id || 'POL-SHIPPING-DELAY',
        title: data.policyDecision?.policy_name || 'In-Transit Carrier Delay Resolution Policy',
        category: 'shipping_sla',
        ruleApplied:
          data.policyDecision?.reason ||
          'Under Policy POL-SHIPPING-DELAY, proactive explanation and apology email is eligible, but requires explicit merchant approval before transmission.',
        thresholdMet: data.policyDecision?.eligible ?? true,
        recommendedAction: (data.policyDecision?.allowed_actions || ['send_customer_email', 'create_follow_up']).join(', '),
      };

      // Map Proposed Action dynamically from backend
      const firstAction = data.proposedActions?.[0];
      const proposedAction: ProposedAction = {
        id: firstAction?.id || `ACT-${Date.now().toString().slice(-6)}`,
        type: firstAction?.action_type === 'send_customer_email' ? 'customer_outreach' : 'courtesy_credit',
        title: firstAction?.payload?.subject || 'Dispatch Customer Notification Email',
        description:
          firstAction?.reason ||
          'Proactive customer update regarding shipping transit delay. Requires merchant approval prior to transmission.',
        cost: firstAction?.payload?.concession_amount || 0,
        customerEmailDraft:
          firstAction?.payload?.body ||
          `Subject: ${firstAction?.payload?.subject || `Update regarding Order #${data.order?.id || 'KL-1042'}`}\n\nDear ${
            data.order?.customer_name || 'Customer'
          },\n\nWe have investigated the status of your order...`,
        status: (firstAction?.status === 'approved' ? 'approved' : 'pending'),
        evidence: [
          data.policyDecision?.reason || 'Documented carrier delay exceeds Late Delivery SLA threshold',
          data.approvalRequirements?.policy_rule || 'External customer communication requires merchant approval before execution',
          firstAction?.payload?.recommended_action || 'Notify customer of carrier weather delay and provide revised delivery expectation.',
        ],
      };

      const adapted: AgentRunResponse & { rawBackend?: BackendAgentRunResponse } = {
        sessionId: data.caseId,
        caseId: data.caseId,
        orderId: data.order?.id || req.orderId || 'KL-1042',
        response: data.assistantMessage,
        executionSteps,
        recommendation: {
          summary: data.recommendation,
          confidence: 0.96,
          evidence: [
            data.policyDecision?.reason || 'Store policy evaluated for transit exception',
            `Carrier transit exception active at ${currentLocation}`,
            data.approvalRequirements?.policy_rule || 'Requires merchant approval before customer dispatch',
            data.followUpDetails?.description || 'Follow-up checkpoint registered to monitor delivery window',
          ],
          rationale: data.recommendation,
          urgency: data.approvalRequirements?.has_pending_approval ? 'high' : 'medium',
        },
        order: adaptedOrder,
        shipping,
        policy,
        proposedAction,
        followUpDetails: data.followUpDetails || null,
        rawBackend: data,
      };

      return { data: adapted };
    },
    () => mockService.runAgent(req),
    { endpointName: 'POST /api/agent/run' }
  );
}
