import React, { useState } from 'react';
import { useAgent } from '../context/AgentContext';
import { ChatMessageList } from '../components/agent/ChatMessageList';
import { ChatInput } from '../components/agent/ChatInput';
import { ToolExecutionTracker } from '../components/agent/ToolExecutionTracker';
import { OrderSummaryCard } from '../components/agent/OrderSummaryCard';
import { ShippingTimeline } from '../components/agent/ShippingTimeline';
import { PolicyEvidenceCard } from '../components/agent/PolicyEvidenceCard';
import { ProposedActionCard } from '../components/agent/ProposedActionCard';
import { Bot, Sparkles } from 'lucide-react';

export const AgentWorkspacePage: React.FC = () => {
  const {
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
    triggerInvestigation,
    approveAction,
    rejectAction,
    clearWorkspace,
  } = useAgent();

  const [activeRightTab, setActiveRightTab] = useState<'all' | 'order' | 'shipping' | 'policy' | 'action'>('all');

  return (
    <div className="agent-workspace-container">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h1 className="fs-5 fw-bold text-dark mb-0">Alexa+ Resolution Workspace</h1>
            <span
              className="badge d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                fontSize: '0.72rem',
              }}
            >
              <Sparkles size={11} />
              <span>Simulated Voice & Reasoning Engine</span>
            </span>
          </div>
          <p className="text-muted small mb-0">
            Conversational agent investigating orders, carrier exceptions, merchant SLA, and staging approval workflows.
          </p>
        </div>

        {currentCaseId && (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-secondary border px-2 py-1">
              Active Case: <strong className="text-dark">{currentCaseId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Two-Panel Layout */}
      <div className="row g-3">
        {/* LEFT PANEL: Conversational Interface & Tool Tracker */}
        <div className="col-12 col-xl-6">
          <div className="card-saas h-100 d-flex flex-column" style={{ minHeight: '680px' }}>
            {/* Left Panel Header */}
            <div className="card-saas-header py-2 px-3 bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Bot size={17} className="text-primary" />
                <span className="fw-semibold small text-dark">Simulated Alexa+ Dialog</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="pulse-indicator" style={{ width: '7px', height: '7px' }} />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {isRunning ? 'Processing request...' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Left Panel Scrollable Body */}
            <div className="p-3 flex-grow-1 overflow-y-auto d-flex flex-column justify-content-between">
              <div>
                {/* Tool Activity Tracker (shown when tools exist or are executing) */}
                <ToolExecutionTracker tools={toolCalls} isRunning={isRunning} />

                {/* Message Stream */}
                <ChatMessageList messages={messages} isRunning={isRunning} />
              </div>

              {/* Input Form & Starter Prompts */}
              <ChatInput
                onSendMessage={triggerInvestigation}
                onClear={clearWorkspace}
                isRunning={isRunning}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Context, Evidence & Action Workbench */}
        <div className="col-12 col-xl-6">
          <div className="d-flex flex-column gap-3">
            {/* View filter tabs for Right Panel on tablet/desktop */}
            <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border shadow-sm">
              <span className="small fw-semibold text-secondary px-2">Investigation Telemetry:</span>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${activeRightTab === 'all' ? 'btn-primary' : 'btn-light border'}`}
                  onClick={() => setActiveRightTab('all')}
                  style={{ fontSize: '0.72rem' }}
                >
                  All Context
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeRightTab === 'order' ? 'btn-primary' : 'btn-light border'}`}
                  onClick={() => setActiveRightTab('order')}
                  style={{ fontSize: '0.72rem' }}
                >
                  Order
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeRightTab === 'shipping' ? 'btn-primary' : 'btn-light border'}`}
                  onClick={() => setActiveRightTab('shipping')}
                  style={{ fontSize: '0.72rem' }}
                >
                  Shipping
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeRightTab === 'policy' ? 'btn-primary' : 'btn-light border'}`}
                  onClick={() => setActiveRightTab('policy')}
                  style={{ fontSize: '0.72rem' }}
                >
                  Policy
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeRightTab === 'action' ? 'btn-primary' : 'btn-light border'}`}
                  onClick={() => setActiveRightTab('action')}
                  style={{ fontSize: '0.72rem' }}
                >
                  Action & Email
                </button>
              </div>
            </div>

            {/* Action & Email Card (Primary Focus) */}
            {(activeRightTab === 'all' || activeRightTab === 'action') && (
              <ProposedActionCard
                action={currentAction}
                recommendation={currentRecommendation}
                caseId={currentCaseId}
                followUp={currentFollowUp}
                onApprove={approveAction}
                onReject={rejectAction}
              />
            )}

            {/* Order & Customer Summary Card */}
            {(activeRightTab === 'all' || activeRightTab === 'order') && (
              <OrderSummaryCard order={currentOrder} />
            )}

            {/* Shipping Timeline & Carrier Exceptions */}
            {(activeRightTab === 'all' || activeRightTab === 'shipping') && (
              <ShippingTimeline shipping={currentShipping} />
            )}

            {/* Store Policy & Evidence Citations */}
            {(activeRightTab === 'all' || activeRightTab === 'policy') && (
              <PolicyEvidenceCard
                policy={currentPolicy}
                recommendation={currentRecommendation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
