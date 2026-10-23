import {
  INITIAL_ORDERS,
  INITIAL_SHIPPING,
  INITIAL_POLICIES,
  INITIAL_CASES,
  INITIAL_FOLLOW_UPS,
  INITIAL_DASHBOARD,
} from './mockData';
import type { OrderDetails } from '../../types/order';
import type { ShippingDetails } from '../../types/shipping';
import type { Case, CaseWithHistory } from '../../types/case';
import type { FollowUpTask, CreateFollowUpDto } from '../../types/followUp';
import type { DashboardData, SystemHealth } from '../../types/dashboard';
import type { AgentRunRequest, AgentRunResponse, ToolCall } from '../../types/agent';

// Storage keys
const STORAGE_PREFIX = 'resolveloop_ai_state_v1_';
const CASES_KEY = STORAGE_PREFIX + 'cases';
const FOLLOWUPS_KEY = STORAGE_PREFIX + 'followups';

class MockService {
  private cases: Record<string, CaseWithHistory>;
  private followUps: FollowUpTask[];
  private orders: Record<string, OrderDetails>;
  private shipping: Record<string, ShippingDetails>;

  constructor() {
    this.orders = { ...INITIAL_ORDERS };
    this.shipping = { ...INITIAL_SHIPPING };
    this.cases = this.loadFromStorage(CASES_KEY, INITIAL_CASES);
    this.followUps = this.loadFromStorage(FOLLOWUPS_KEY, INITIAL_FOLLOW_UPS);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
    } catch {
      // localStorage disabled or failed
    }
    return fallback;
  }

  private saveToStorage(key: string, data: unknown): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // Storage quota or error
    }
  }

  public resetToDefault(): void {
    this.cases = { ...INITIAL_CASES };
    this.followUps = [...INITIAL_FOLLOW_UPS];
    this.saveToStorage(CASES_KEY, this.cases);
    this.saveToStorage(FOLLOWUPS_KEY, this.followUps);
  }

  // Health check
  public async getHealth(): Promise<{ status: string; timestamp: string; mode: string; health: SystemHealth }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: 'simulated_alexa_plus',
      health: {
        status: 'operational',
        alexaSimulation: 'connected',
        carrierApi: 'simulated',
        emailService: 'simulated',
        storeSync: 'synced',
        lastPing: new Date().toISOString(),
      },
    };
  }

  // Dashboard
  public async getDashboard(): Promise<DashboardData> {
    const caseList = Object.values(this.cases);
    const openCases = caseList.filter(c => c.status === 'open' || c.status === 'investigating').length;
    const awaitingApproval = caseList.filter(c => c.status === 'awaiting_approval').length;
    const resolvedCases = caseList.filter(c => c.status === 'resolved' || c.status === 'approved').length;
    const followUpsDue = this.followUps.filter(t => t.status === 'pending').length;

    const recentCases: Case[] = caseList
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(c => ({
        id: c.id,
        orderId: c.orderId,
        customer: c.customer,
        issueSummary: c.issueSummary,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        actionRequired: c.actionRequired,
      }));

    return {
      stats: {
        totalCases: caseList.length,
        openCases,
        awaitingApproval,
        resolvedCases,
        followUpsDue,
      },
      recentCases,
      systemHealth: INITIAL_DASHBOARD.systemHealth,
    };
  }

  // Orders
  public async getOrder(id: string): Promise<OrderDetails | null> {
    const normalized = id.trim().toUpperCase();
    return this.orders[normalized] || null;
  }

  public async getOrderShipping(id: string): Promise<ShippingDetails | null> {
    const normalized = id.trim().toUpperCase();
    return this.shipping[normalized] || null;
  }

  // Cases
  public async getCases(): Promise<Case[]> {
    return Object.values(this.cases).map(c => ({
      id: c.id,
      orderId: c.orderId,
      customer: c.customer,
      issueSummary: c.issueSummary,
      status: c.status,
      priority: c.priority,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      actionRequired: c.actionRequired,
    }));
  }

  public async getCase(id: string): Promise<CaseWithHistory | null> {
    const found = this.cases[id];
    return found || null;
  }

  public async approveAction(caseId: string, editedDraftEmail?: string): Promise<{ success: boolean; case: CaseWithHistory; message: string }> {
    const currentCase = this.cases[caseId];
    if (!currentCase) {
      throw new Error(`Case ${caseId} not found.`);
    }

    if (!currentCase.proposedAction) {
      throw new Error(`Case ${caseId} does not have a pending action.`);
    }

    const now = new Date().toISOString();
    const updatedDraft = editedDraftEmail ?? currentCase.proposedAction.customerEmailDraft;

    const updatedCase: CaseWithHistory = {
      ...currentCase,
      status: 'approved',
      actionRequired: false,
      updatedAt: now,
      proposedAction: {
        ...currentCase.proposedAction,
        status: 'approved',
        approvedAt: now,
        customerEmailDraft: updatedDraft,
      },
      auditTrail: [
        {
          id: `AUD-${Date.now()}-APP`,
          timestamp: now,
          actor: 'user',
          action: 'Action Approved',
          details: `Store owner approved action "${currentCase.proposedAction.title}". Customer update dispatched & account adjustments posted.`,
        },
        ...currentCase.auditTrail,
      ],
      messages: [
        ...currentCase.messages,
        {
          id: `MSG-${Date.now()}-SYS`,
          sender: 'system',
          timestamp: now,
          content: `Action "${currentCase.proposedAction.title}" was approved by store owner. Confirmation email sent to ${currentCase.customer.email}.`,
        },
      ],
    };

    this.cases[caseId] = updatedCase;
    this.saveToStorage(CASES_KEY, this.cases);

    return {
      success: true,
      case: updatedCase,
      message: `Action approved! Customer notification sent to ${currentCase.customer.email}.`,
    };
  }

  public async rejectAction(caseId: string, reason: string): Promise<{ success: boolean; case: CaseWithHistory; reason: string }> {
    const currentCase = this.cases[caseId];
    if (!currentCase) {
      throw new Error(`Case ${caseId} not found.`);
    }

    const now = new Date().toISOString();
    const updatedCase: CaseWithHistory = {
      ...currentCase,
      status: 'rejected',
      actionRequired: false,
      updatedAt: now,
      proposedAction: currentCase.proposedAction
        ? {
            ...currentCase.proposedAction,
            status: 'rejected',
            rejectedReason: reason,
          }
        : undefined,
      auditTrail: [
        {
          id: `AUD-${Date.now()}-REJ`,
          timestamp: now,
          actor: 'user',
          action: 'Action Rejected',
          details: `Store owner rejected action. Reason: "${reason}"`,
        },
        ...currentCase.auditTrail,
      ],
      messages: [
        ...currentCase.messages,
        {
          id: `MSG-${Date.now()}-SYS`,
          sender: 'system',
          timestamp: now,
          content: `Proposed action was rejected by store owner. Reason: ${reason}`,
        },
      ],
    };

    this.cases[caseId] = updatedCase;
    this.saveToStorage(CASES_KEY, this.cases);

    return {
      success: true,
      case: updatedCase,
      reason,
    };
  }

  // Follow-ups
  public async getFollowUps(): Promise<FollowUpTask[]> {
    const now = new Date().getTime();
    return this.followUps.map(task => {
      const isPast = new Date(task.dueDate).getTime() < now;
      return {
        ...task,
        isOverdue: task.status === 'pending' && isPast,
      };
    });
  }

  public async createFollowUp(dto: CreateFollowUpDto): Promise<FollowUpTask> {
    const task: FollowUpTask = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      caseId: dto.caseId,
      orderId: dto.orderId,
      description: dto.description,
      dueDate: dto.dueDate,
      priority: dto.priority || 'medium',
      assignedTo: dto.assignedTo || 'ResolveLoop AI Agent',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isOverdue: false,
    };

    this.followUps.unshift(task);
    this.saveToStorage(FOLLOWUPS_KEY, this.followUps);

    // If case exists, link it
    if (this.cases[dto.caseId]) {
      this.cases[dto.caseId] = {
        ...this.cases[dto.caseId],
        followUpId: task.id,
      };
      this.saveToStorage(CASES_KEY, this.cases);
    }

    return task;
  }

  public async updateFollowUp(id: string, updates: Partial<FollowUpTask>): Promise<FollowUpTask> {
    const idx = this.followUps.findIndex(f => f.id === id);
    if (idx === -1) {
      throw new Error(`Follow-up task ${id} not found.`);
    }

    const updated: FollowUpTask = {
      ...this.followUps[idx],
      ...updates,
      completedAt: updates.status === 'completed' ? new Date().toISOString() : this.followUps[idx].completedAt,
    };

    this.followUps[idx] = updated;
    this.saveToStorage(FOLLOWUPS_KEY, this.followUps);
    return updated;
  }

  // Run Agent
  public async runAgent(req: AgentRunRequest): Promise<AgentRunResponse> {
    // Determine target order
    let orderId = req.orderId?.toUpperCase();
    if (!orderId) {
      const match = req.prompt.match(/KL-\d{4}/i);
      if (match) {
        orderId = match[0].toUpperCase();
      } else {
        orderId = 'KL-1042'; // Default primary scenario
      }
    }

    const order = this.orders[orderId] || INITIAL_ORDERS['KL-1042'];
    const shipping = this.shipping[orderId] || INITIAL_SHIPPING['KL-1042'];
    const policy = INITIAL_POLICIES[orderId] || INITIAL_POLICIES['KL-1042'];

    const timestamp = new Date().toISOString();
    const caseId = req.caseId || `CASE-2026-${orderId.replace('KL-', '')}`;

    // Realistic tool execution pipeline
    const executionSteps: ToolCall[] = [
      {
        id: `tool-1-${Date.now()}`,
        name: 'lookup_order',
        displayName: 'Search & Fetch Order Details',
        input: { order_id: orderId },
        output: {
          id: order.id,
          customer: order.customer.name,
          email: order.customer.email,
          tier: order.customer.tier,
          total: `$${order.totalAmount.toFixed(2)}`,
          status: order.status,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
        },
        status: 'completed',
        startTime: timestamp,
        endTime: timestamp,
        durationMs: 310,
      },
      {
        id: `tool-2-${Date.now()}`,
        name: 'fetch_shipping_events',
        displayName: 'Query Carrier Tracking & Hub Telemetry',
        input: { tracking_number: order.trackingNumber, carrier: order.carrier },
        output: {
          current_status: shipping.status,
          current_location: shipping.currentLocation,
          delay_hours: shipping.delayHours || 48,
          active_exception: 'Blizzard storm hold at Chicago regional air transfer ramp',
          latest_event: shipping.events[0]?.description,
        },
        status: 'completed',
        startTime: timestamp,
        endTime: timestamp,
        durationMs: 440,
      },
      {
        id: `tool-3-${Date.now()}`,
        name: 'check_store_policy',
        displayName: 'Evaluate Merchant SLA & Return Rules',
        input: {
          policy_category: 'shipping_sla',
          carrier_delay_hours: shipping.delayHours || 48,
          customer_tier: order.customer.tier,
        },
        output: {
          policy_matched: policy.title,
          policy_id: policy.policyId,
          rule: policy.ruleApplied,
          action_recommended: policy.recommendedAction,
          credit_authorized: '$15.00',
        },
        status: 'completed',
        startTime: timestamp,
        endTime: timestamp,
        durationMs: 280,
      },
      {
        id: `tool-4-${Date.now()}`,
        name: 'synthesize_resolution_plan',
        displayName: 'Synthesize Context & Draft Customer Outreach',
        input: {
          order_id: orderId,
          customer: order.customer.name,
          explanation: 'Chicago blizzard weather exception',
        },
        output: {
          action_type: 'courtesy_credit_and_proactive_email',
          draft_prepared: true,
          human_in_the_loop_required: true,
        },
        status: 'completed',
        startTime: timestamp,
        endTime: timestamp,
        durationMs: 510,
      },
      {
        id: `tool-5-${Date.now()}`,
        name: 'schedule_followup',
        displayName: 'Register 24-Hour Automated Hub Monitor',
        input: {
          case_id: caseId,
          order_id: orderId,
          interval: '24h',
          checkpoint: 'Chicago Hub clearance scan',
        },
        output: {
          task_id: `TASK-${orderId.replace('KL-', '')}`,
          scheduled_for: 'Tomorrow 09:00 AM',
          status: 'pending',
        },
        status: 'completed',
        startTime: timestamp,
        endTime: timestamp,
        durationMs: 190,
      },
    ];

    const recommendation = {
      summary: `Authorize $15 Late Delivery Courtesy Credit for ${order.customer.name} and send proactive Chicago blizzard reassurance update.`,
      confidence: 0.96,
      evidence: [
        `Carrier FedEx tracking confirms 48h weather hold at Chicago Hub (SLA exceeded)`,
        `Customer ${order.customer.name} has Tier ${order.customer.tier} loyalty status with ${order.customer.ordersCount} lifetime purchases`,
        `Store Policy ${policy.policyId} directly prescribes courtesy credit & proactive outreach for delays > 48h`,
        `Automated 24h follow-up prevents customer escalation before next scheduled delivery window`,
      ],
      rationale: `Sarah Jenkins is a VIP customer whose high-value winter parka is stalled in Chicago due to severe weather. Proactively acknowledging the delay and issuing the policy-compliant $15 credit transforms a potential customer complaint into a high-satisfaction loyalty moment.`,
      urgency: 'high' as const,
    };

    const proposedAction = {
      id: `ACT-${orderId.replace('KL-', '')}`,
      type: 'courtesy_credit' as const,
      title: 'Issue $15 Courtesy Credit & Send Proactive Delay Update',
      description: `Apply $15 account credit under Store Policy ${policy.policyId} and dispatch the drafted customer notification.`,
      cost: 15.0,
      status: 'pending' as const,
      evidence: recommendation.evidence,
      customerEmailDraft: `Subject: Update regarding your ResolveLoop order #${order.id}

Dear ${order.customer.name},

We are actively keeping an eye on your recent order #${order.id} containing the ${order.items.map(i => i.name).join(' & ')}.

We noticed that ${order.carrier} is experiencing an unexpected severe weather delay at their ${shipping.currentLocation}. Because delivering an exceptional experience is our highest standard, we have applied a $15 courtesy credit directly to your account.

Your package is safely in carrier custody and we anticipate movement resumes within the next 24 hours. You can review the real-time tracking scan here:
https://track.fedex.com/${order.trackingNumber}

Our team has also set an automated check for tomorrow morning at 9:00 AM to verify your parcel is back on track. We will notify you immediately of any updates.

Warm regards,
UrbanAura Customer Care Team`,
    };

    // Ensure follow-up task exists in storage
    const followUpId = `TASK-${orderId.replace('KL-', '')}`;
    const existingTask = this.followUps.find(t => t.id === followUpId);
    if (!existingTask) {
      this.followUps.unshift({
        id: followUpId,
        caseId,
        orderId: order.id,
        customerName: order.customer.name,
        description: `Check FedEx tracking for weather clearance and package departure from Chicago Hub; notify customer if delayed past Oct 23.`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high',
        assignedTo: 'ResolveLoop AI Agent',
        createdAt: timestamp,
        isOverdue: false,
      });
      this.saveToStorage(FOLLOWUPS_KEY, this.followUps);
    }

    const agentResponseText = `I have completed the full investigation for **Order ${order.id}** (${order.customer.name}):

- **Carrier Telemetry:** Shipment **${order.trackingNumber}** is delayed at the **${shipping.currentLocation}** due to winter storm conditions (~48 hours stalled).
- **Policy Compliance:** Under **${policy.title}**, this delay entitles the customer to a **$15 courtesy account credit** and proactive communication.
- **Action Prepared:** I have drafted a personalized reassurance email and queued the credit for your review.
- **Follow-up:** Checkpoint **${followUpId}** is scheduled for tomorrow at 09:00 AM to monitor carrier transit resumption.

Review the findings, evidence, and drafted email in the right panel and approve when ready.`;

    // Update or create case
    const existingCase = this.cases[caseId];
    const newCaseWithHistory: CaseWithHistory = {
      id: caseId,
      orderId: order.id,
      customer: order.customer,
      issueSummary: `Order stalled in Chicago weather hub for 48h; customer awaiting delivery.`,
      status: 'awaiting_approval',
      priority: 'high',
      createdAt: existingCase ? existingCase.createdAt : timestamp,
      updatedAt: timestamp,
      actionRequired: true,
      followUpId,
      shipping,
      policy,
      proposedAction,
      messages: existingCase
        ? [
            ...existingCase.messages,
            {
              id: `MSG-${Date.now()}-U`,
              sender: 'user',
              timestamp,
              content: req.prompt,
              isVoiceInput: req.isVoiceInput,
            },
            {
              id: `MSG-${Date.now()}-A`,
              sender: 'agent',
              timestamp,
              content: agentResponseText,
            },
          ]
        : [
            {
              id: `MSG-${Date.now()}-U`,
              sender: 'user',
              timestamp,
              content: req.prompt,
              isVoiceInput: req.isVoiceInput,
            },
            {
              id: `MSG-${Date.now()}-A`,
              sender: 'agent',
              timestamp,
              content: agentResponseText,
            },
          ],
      auditTrail: [
        {
          id: `AUD-${Date.now()}-INV`,
          timestamp,
          actor: 'agent',
          action: 'Agent Investigation Completed',
          details: `Processed request for order ${order.id}. Queried carrier tracking, evaluated store policy ${policy.policyId}, queued action ${proposedAction.id}.`,
        },
        ...(existingCase?.auditTrail || []),
      ],
    };

    this.cases[caseId] = newCaseWithHistory;
    this.saveToStorage(CASES_KEY, this.cases);

    return {
      sessionId: `sess-${Date.now()}`,
      caseId,
      orderId: order.id,
      response: agentResponseText,
      executionSteps,
      recommendation,
      order,
      shipping,
      policy,
      proposedAction,
    };
  }
}

export const mockService = new MockService();
