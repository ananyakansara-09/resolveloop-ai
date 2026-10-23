import React, { useState } from 'react';
import type { ProposedAction } from '../../types/case';
import type { AgentRecommendation } from '../../types/agent';
import type { FollowUp } from '../../types/backend';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  CalendarCheck2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ApprovalModal } from '../cases/ApprovalModal';

interface ProposedActionCardProps {
  action: ProposedAction | null;
  recommendation: AgentRecommendation | null;
  caseId: string | null;
  followUp?: FollowUp | null;
  onApprove: (editedDraft?: string) => Promise<boolean>;
  onReject: (reason: string) => Promise<boolean>;
}

export const ProposedActionCard: React.FC<ProposedActionCardProps> = ({
  action,
  recommendation,
  caseId,
  followUp,
  onApprove,
  onReject,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!action && !recommendation) {
    return (
      <div className="card-saas p-4 text-center text-muted">
        <ShieldCheck size={24} className="mb-2 text-secondary opacity-50" />
        <div className="small">Proposed action and customer outreach will be synthesized upon investigation.</div>
      </div>
    );
  }

  const isPending = action?.status === 'pending';
  const isApproved = action?.status === 'approved';
  const isRejected = action?.status === 'rejected';

  return (
    <>
      <div className="card-saas mb-3 border-primary-subtle">
        <div className="card-saas-header py-2 px-3 bg-light d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="fw-semibold small text-dark">Agent Recommendation & Action</span>
          </div>

          {action && (
            <div>
              {isPending && (
                <span className="badge bg-warning text-dark border border-warning-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <Clock size={11} />
                  <span>Awaiting Approval</span>
                </span>
              )}
              {isApproved && (
                <span className="badge bg-success text-white border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <CheckCircle2 size={11} />
                  <span>Approved & Dispatched</span>
                </span>
              )}
              {isRejected && (
                <span className="badge bg-danger text-white border border-danger-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <AlertCircle size={11} />
                  <span>Rejected</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-3">
          {/* Recommendation Summary */}
          {recommendation && (
            <div className="mb-3">
              <div className="small fw-semibold text-dark mb-1">Recommended Strategy:</div>
              <p className="text-secondary small mb-2" style={{ fontSize: '0.82rem' }}>
                {recommendation.summary}
              </p>
            </div>
          )}

          {/* Action Details */}
          {action && (
            <div className="p-3 rounded-2 bg-light border border-light-subtle mb-3">
              <div className="d-flex align-items-start justify-content-between mb-1">
                <span className="fw-bold text-dark small">{action.title}</span>
                {action.cost !== undefined && action.cost > 0 && (
                  <span className="badge bg-light text-primary border" style={{ fontSize: '0.75rem' }}>
                    ${action.cost.toFixed(2)} Credit
                  </span>
                )}
              </div>
              <p className="text-secondary small mb-2" style={{ fontSize: '0.76rem' }}>
                {action.description}
              </p>

              {/* Email draft preview snippet */}
              {action.customerEmailDraft && (
                <div className="mt-2 pt-2 border-top border-light-subtle">
                  <div className="d-flex align-items-center gap-1 text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                    <Mail size={12} className="text-primary" />
                    <span>Prepared Customer Email:</span>
                  </div>
                  <div
                    className="p-2 bg-white rounded border text-muted small font-monospace"
                    style={{
                      fontSize: '0.72rem',
                      maxHeight: '90px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {action.customerEmailDraft}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Note */}
          {followUp && (
            <div className="p-2 rounded-2 bg-primary-subtle text-primary-emphasis d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.75rem' }}>
              <CalendarCheck2 size={15} className="flex-shrink-0 text-primary" />
              <div>
                <strong>Follow-up Scheduled ({followUp.id}): </strong>
                <span>
                  {followUp.description}
                  {followUp.due_at && (
                    <> • Checkpoint: {new Date(followUp.due_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {isPending && (
            <button
              type="button"
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-semibold"
              onClick={() => setModalOpen(true)}
              style={{ fontSize: '0.85rem' }}
            >
              <span>Review & Authorize Action</span>
              <ArrowRight size={15} />
            </button>
          )}

          {isApproved && (
            <div className="p-2 rounded-2 bg-success-subtle text-success border border-success-subtle text-center small fw-medium">
              Action has been approved and executed. Confirmation dispatched.
            </div>
          )}

          {isRejected && (
            <div className="p-2 rounded-2 bg-danger-subtle text-danger border border-danger-subtle text-center small fw-medium">
              Action was rejected: {action?.rejectedReason || 'By store owner.'}
            </div>
          )}
        </div>
      </div>

      <ApprovalModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        action={action}
        caseId={caseId}
        onApprove={onApprove}
        onReject={onReject}
      />
    </>
  );
};
