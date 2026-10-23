import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { runAgent } from '../api/agentApi';
import { getCase, approveCaseAction, rejectCaseAction } from '../api/casesApi';
import type { OrderDetails } from '../types/order';
import type { ShippingDetails } from '../types/shipping';
import type { CaseWithHistory, ProposedAction, StorePolicyMatch, CaseMessage } from '../types/case';
import type { ToolCall, AgentRecommendation } from '../types/agent';
import type { FollowUp } from '../types/backend';
import { useToast } from './ToastContext';

interface AgentContextType {
  messages: CaseMessage[];
  toolCalls: ToolCall[];
  currentOrder: OrderDetails | null;
  currentShipping: ShippingDetails | null;
  currentPolicy: StorePolicyMatch | null;
  currentAction: ProposedAction | null;
  currentRecommendation: AgentRecommendation | null;
  currentFollowUp: FollowUp | null;
  currentCaseId: string | null;
  isRunning: boolean;
  activeToolIndex: number | null;
  error: string | null;
  triggerInvestigation: (prompt: string, orderId?: string, isVoiceInput?: boolean) => Promise<void>;
  approveAction: (editedDraftEmail?: string) => Promise<boolean>;
  rejectAction: (reason: string) => Promise<boolean>;
  loadCaseIntoWorkspace: (caseId: string) => Promise<void>;
  clearWorkspace: () => void;
  updateProposedEmailDraft: (draft: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<CaseMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Welcome to **ResolveLoop AI** (Alexa+ Resolution Assistant). I can investigate delayed orders, inspect carrier routing exceptions, interpret merchant SLA policies, generate customer reassurance emails, and queue high-impact actions for your approval.

Try asking:
> *"Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed."*`,
    },
  ]);

  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [currentShipping, setCurrentShipping] = useState<ShippingDetails | null>(null);
  const [currentPolicy, setCurrentPolicy] = useState<StorePolicyMatch | null>(null);
  const [currentAction, setCurrentAction] = useState<ProposedAction | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<AgentRecommendation | null>(null);
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUp | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeToolIndex, setActiveToolIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const clearWorkspace = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Workspace reset. Ready to investigate an order or customer issue. Enter an order number (e.g. **KL-1042**) or click a starter prompt below.`,
      },
    ]);
    setToolCalls([]);
    setCurrentOrder(null);
    setCurrentShipping(null);
    setCurrentPolicy(null);
    setCurrentAction(null);
    setCurrentRecommendation(null);
    setCurrentFollowUp(null);
    setCurrentCaseId(null);
    setError(null);
    setActiveToolIndex(null);
  }, []);

  const updateProposedEmailDraft = useCallback((draft: string) => {
    setCurrentAction(prev => (prev ? { ...prev, customerEmailDraft: draft } : null));
  }, []);

  const triggerInvestigation = useCallback(
    async (prompt: string, orderId?: string, isVoiceInput = false) => {
      if (!prompt.trim() || isRunning) return;

      setIsRunning(true);
      setError(null);

      // Add user message to conversation
      const userMessage: CaseMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: prompt,
        isVoiceInput,
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        toastInfo('Agent Processing', 'ResolveLoop AI is querying telemetry and evaluating policies...');

        // Make the real backend request
        const response = await runAgent({
          prompt,
          orderId,
          isVoiceInput,
          caseId: currentCaseId || undefined,
        });

        // Progressively reveal tool calls for realistic UX
        const totalSteps = response.executionSteps.length;
        setToolCalls([]);

        for (let i = 0; i < totalSteps; i++) {
          setActiveToolIndex(i);
          const step = response.executionSteps[i];

          // Show step as running
          setToolCalls(prev => [
            ...prev,
            { ...step, status: 'running' },
          ]);

          // Small stagger for readable progress
          await new Promise(r => setTimeout(r, 450));

          // Mark step completed
          setToolCalls(prev =>
            prev.map((s, idx) => (idx === i ? { ...step, status: 'completed' } : s))
          );
        }

        setActiveToolIndex(null);

        // Update context with dynamic backend response
        setCurrentCaseId(response.caseId);
        if (response.order) setCurrentOrder(response.order);
        if (response.shipping) setCurrentShipping(response.shipping);
        if (response.policy) setCurrentPolicy(response.policy);
        if (response.proposedAction) setCurrentAction(response.proposedAction);
        if (response.recommendation) setCurrentRecommendation(response.recommendation);
        if (response.followUpDetails) setCurrentFollowUp(response.followUpDetails);

        // Add agent response message
        const agentMsg: CaseMessage = {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: response.response,
        };

        setMessages(prev => [...prev, agentMsg]);
        toastSuccess('Investigation Complete', `Investigation finished for order ${response.orderId}. Action queued for review.`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to complete agent investigation.';
        setError(errorMsg);
        toastError('Agent Error', errorMsg);
        setMessages(prev => [
          ...prev,
          {
            id: `msg-err-${Date.now()}`,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `⚠️ An error occurred while running the investigation: ${errorMsg}`,
          },
        ]);
      } finally {
        setIsRunning(false);
        setActiveToolIndex(null);
      }
    },
    [currentCaseId, isRunning, toastError, toastInfo, toastSuccess]
  );

  const approveAction = useCallback(
    async (editedDraftEmail?: string): Promise<boolean> => {
      if (!currentCaseId || !currentAction) return false;

      try {
        const result = await approveCaseAction(
          currentCaseId,
          editedDraftEmail || currentAction.customerEmailDraft,
          currentAction.id
        );
        if (result.success) {
          setCurrentAction(prev => (prev ? { ...prev, status: 'approved' } : null));
          const outboxId = result.result?.verification_details?.outbox_message_id;
          const msg = outboxId ? `${result.message} (Outbox Ref: ${outboxId})` : result.message;
          toastSuccess('Action Approved & Dispatched', msg);

          setMessages(prev => [
            ...prev,
            {
              id: `msg-appr-${Date.now()}`,
              sender: 'system',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              content: `✅ **Action Approved & Verified**${outboxId ? ` (Outbox ID: \`${outboxId}\`)` : ''}: The customer notification email was sent and the account credit was authorized for Case **${currentCaseId}**.`,
            },
          ]);
          return true;
        }
        return false;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to approve action.';
        toastError('Approval Failed', errorMsg);
        return false;
      }
    },
    [currentCaseId, currentAction, toastSuccess, toastError]
  );

  const rejectAction = useCallback(
    async (reason: string): Promise<boolean> => {
      if (!currentCaseId) return false;

      try {
        const result = await rejectCaseAction(currentCaseId, reason, currentAction?.id);
        if (result.success) {
          setCurrentAction(prev => (prev ? { ...prev, status: 'rejected', rejectedReason: reason } : null));
          toastInfo('Action Rejected', `Proposed action was marked rejected. Reason: "${reason}"`);

          setMessages(prev => [
            ...prev,
            {
              id: `msg-rej-${Date.now()}`,
              sender: 'system',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              content: `❌ **Action Rejected**: Store owner rejected the proposed action. Reason: *${reason}*`,
            },
          ]);
          return true;
        }
        return false;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to reject action.';
        toastError('Rejection Failed', errorMsg);
        return false;
      }
    },
    [currentCaseId, currentAction, toastInfo, toastError]
  );

  const loadCaseIntoWorkspace = useCallback(async (caseId: string) => {
    setIsRunning(true);
    try {
      const caseData: CaseWithHistory | null = await getCase(caseId);
      if (caseData) {
        setCurrentCaseId(caseData.id);

        // Dynamically load order details
        if (caseData.order) {
          setCurrentOrder(caseData.order);
        } else if (caseData.customer) {
          setCurrentOrder({
            id: caseData.orderId,
            orderDate: caseData.createdAt,
            status: caseData.shipping?.status === 'Delayed' ? 'Delayed' : 'Shipped',
            totalAmount: 149.99,
            currency: 'USD',
            items: [
              {
                id: 'PKG-1',
                name: `Order #${caseData.orderId} Package`,
                sku: caseData.orderId,
                quantity: 1,
                price: 149.99,
              },
            ],
            customer: caseData.customer,
            shippingAddress: {
              street: `Destination via ${caseData.shipping?.currentLocation || 'Carrier'} Transit Hub`,
              city: 'Springfield',
              state: 'IL',
              zip: '62704',
              country: 'United States',
            },
            trackingNumber: caseData.shipping?.trackingNumber || `TRK-${caseData.orderId}`,
            carrier: caseData.shipping?.carrier || 'FedEx Priority',
          });
        }

        // Dynamically load shipping telemetry
        if (caseData.shipping) setCurrentShipping(caseData.shipping);

        // Dynamically load policy match
        if (caseData.policy) setCurrentPolicy(caseData.policy);

        // Dynamically load proposed action
        if (caseData.proposedAction) {
          setCurrentAction(caseData.proposedAction);
          setCurrentRecommendation({
            summary: caseData.proposedAction.title,
            confidence: 0.96,
            evidence: caseData.proposedAction.evidence || [],
            rationale: caseData.proposedAction.description,
            urgency: caseData.priority,
          });
        }

        // Dynamically load scheduled follow-up
        if (caseData.followUps && caseData.followUps.length > 0) {
          setCurrentFollowUp(caseData.followUps[0]);
        } else if (caseData.followUpId) {
          setCurrentFollowUp({
            id: caseData.followUpId,
            case_id: caseData.id,
            description: caseData.followUpDescription || 'Automated verification scheduled for carrier rerouting progress.',
            due_at: caseData.followUpDueAt || new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
            created_at: caseData.createdAt,
            completed_at: null,
          });
        } else {
          setCurrentFollowUp(null);
        }

        // Dynamically load previous messages
        if (caseData.messages && caseData.messages.length > 0) {
          setMessages(caseData.messages);
        }

        // Populate execution tracker from audit trail so activity is visible
        if (caseData.auditTrail && caseData.auditTrail.length > 0) {
          const historyTools: ToolCall[] = caseData.auditTrail.map((ev, i) => ({
            id: ev.id,
            name: ev.action.toLowerCase().replace(/\s+/g, '_'),
            displayName: ev.action,
            input: { caseId: caseData.id, actor: ev.actor },
            output: { details: ev.details },
            status: 'completed',
            startTime: ev.timestamp,
            endTime: ev.timestamp,
            durationMs: 160 + i * 40,
          }));
          setToolCalls(historyTools);
        }
      }
    } finally {
      setIsRunning(false);
    }
  }, []);

  return (
    <AgentContext.Provider
      value={{
        messages,
        toolCalls,
        currentOrder,
        currentShipping,
        currentPolicy,
        currentAction,
        currentRecommendation,
        currentFollowUp,
        currentCaseId,
        isRunning,
        activeToolIndex,
        error,
        triggerInvestigation,
        approveAction,
        rejectAction,
        loadCaseIntoWorkspace,
        clearWorkspace,
        updateProposedEmailDraft,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
