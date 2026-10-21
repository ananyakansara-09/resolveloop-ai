import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCase, approveCaseAction, rejectCaseAction } from '../api/casesApi';
import type { CaseWithHistory, CaseMessage } from '../types/case';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CaseAuditTrail } from '../components/cases/CaseAuditTrail';
import { ApprovalModal } from '../components/cases/ApprovalModal';
import { ShippingTimeline } from '../components/agent/ShippingTimeline';
import { PolicyEvidenceCard } from '../components/agent/PolicyEvidenceCard';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import {
  ChevronLeft,
  Bot,
  CalendarCheck2,
  Mail,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const navigate = useNavigate();
  const { loadCaseIntoWorkspace } = useAgent();
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchCaseDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCase(id);
      if (data) {
        setCaseData(data);
      } else {
        setError(`Case ${id} not found.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve case details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCaseDetails();
  }, [fetchCaseDetails]);

  const handleOpenInWorkspace = async () => {
    if (!id) return;
    await loadCaseIntoWorkspace(id);
    navigate('/assistant');
  };

  const handleApprove = async (editedDraft?: string): Promise<boolean> => {
    if (!id) return false;
    try {
      const result = await approveCaseAction(id, editedDraft);
      if (result.success) {
        setCaseData(result.case);
        toastSuccess('Action Approved', result.message);
        return true;
      }
      return false;
    } catch (err: unknown) {
      toastError('Approval Failed', err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const handleReject = async (reason: string): Promise<boolean> => {
    if (!id) return false;
    try {
      const result = await rejectCaseAction(id, reason);
      if (result.success) {
        setCaseData(result.case);
        toastSuccess('Action Rejected', `Action marked rejected. Reason: ${reason}`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      toastError('Rejection Failed', err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <SkeletonLoader height={40} className="mb-3" />
        <SkeletonLoader count={4} height={100} className="mb-3" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-3">
        <Link to="/cases" className="btn btn-sm btn-outline-secondary mb-3 d-inline-flex align-items-center gap-1">
          <ChevronLeft size={14} />
          <span>Back to Cases</span>
        </Link>
        <ErrorAlert message={error || 'Case not found.'} onRetry={fetchCaseDetails} />
      </div>
    );
  }

  const isAwaitingApproval = caseData.status === 'awaiting_approval';

  return (
    <div className="case-details-container">
      {/* Breadcrumb Navigation */}
      <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
        <Link to="/" className="text-secondary text-decoration-none">Dashboard</Link>
        <span>/</span>
        <Link to="/cases" className="text-secondary text-decoration-none">Support Cases</Link>
        <span>/</span>
        <span className="text-dark fw-semibold">{caseData.id}</span>
      </div>

      {/* Case Header Banner */}
      <div className="card-saas p-3 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h1 className="fs-4 fw-bold text-dark mb-0">{caseData.id}</h1>
              <StatusBadge status={caseData.status} />
              <PriorityBadge priority={caseData.priority} />
            </div>

            <div className="text-muted small">
              Associated Order: <strong className="text-dark">{caseData.orderId}</strong> • Created{' '}
              {new Date(caseData.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={handleOpenInWorkspace}
            >
              <Bot size={14} />
              <span>Open in AI Workspace</span>
            </button>

            {isAwaitingApproval && (
              <button
                type="button"
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm fw-semibold"
                onClick={() => setApprovalModalOpen(true)}
              >
                <ShieldAlert size={14} />
                <span>Review & Approve Action</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="row g-3">
        {/* Left Column: Customer, Issue, Proposed Action & Timeline */}
        <div className="col-12 col-lg-7">
          {/* Issue Summary & Customer Card */}
          <div className="card-saas p-3 mb-3">
            <h6 className="fw-bold text-dark mb-2">Issue Overview</h6>
            <p className="text-secondary small mb-3">{caseData.issueSummary}</p>

            <div className="row g-2 pt-2 border-top border-light-subtle small">
              <div className="col-sm-6">
                <span className="text-muted">Customer: </span>
                <strong className="text-dark">{caseData.customer.name}</strong>
              </div>
              <div className="col-sm-6">
                <span className="text-muted">Email: </span>
                <span className="text-dark">{caseData.customer.email}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted">Tier: </span>
                <span className="badge bg-light text-secondary border">{caseData.customer.tier} Customer</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted">Lifetime Value: </span>
                <strong className="text-dark">${caseData.customer.lifetimeValue.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Proposed Action Card if exists */}
          {caseData.proposedAction && (
            <div className="card-saas p-3 mb-3 border-primary-subtle">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <ShieldAlert size={16} className="text-primary" />
                  <span className="fw-bold text-dark small">Resolution Action</span>
                </div>
                {caseData.proposedAction.status === 'approved' ? (
                  <span className="badge bg-success text-white d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle2 size={11} />
                    <span>Approved & Dispatched</span>
                  </span>
                ) : caseData.proposedAction.status === 'rejected' ? (
                  <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                    <AlertCircle size={11} />
                    <span>Rejected</span>
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark border border-warning-subtle" style={{ fontSize: '0.72rem' }}>
                    Pending Merchant Sign-off
                  </span>
                )}
              </div>

              <div className="p-2 rounded bg-light border border-light-subtle mb-3">
                <div className="fw-semibold text-dark small">{caseData.proposedAction.title}</div>
                <p className="text-secondary small mb-1">{caseData.proposedAction.description}</p>
                {caseData.proposedAction.cost !== undefined && caseData.proposedAction.cost > 0 && (
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Authorized Credit: <strong className="text-primary">${caseData.proposedAction.cost.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* Prepared Email Preview */}
              {caseData.proposedAction.customerEmailDraft && (
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-1 text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                    <Mail size={12} className="text-primary" />
                    <span>Customer Communication Draft:</span>
                  </div>
                  <div
                    className="p-3 bg-light rounded-2 border text-dark font-monospace small"
                    style={{ whiteSpace: 'pre-line', maxHeight: '160px', overflowY: 'auto', fontSize: '0.78rem' }}
                  >
                    {caseData.proposedAction.customerEmailDraft}
                  </div>
                </div>
              )}

              {isAwaitingApproval && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                  onClick={() => setApprovalModalOpen(true)}
                >
                  <CheckCircle2 size={13} />
                  <span>Review & Authorize Action</span>
                </button>
              )}
            </div>
          )}

          {/* Previous Conversation Messages */}
          {caseData.messages && caseData.messages.length > 0 && (
            <div className="card-saas mb-3">
              <div className="card-saas-header py-2 px-3 bg-light">
                <span className="fw-semibold small text-dark">Agent Interaction Thread</span>
              </div>
              <div className="p-3">
                {caseData.messages.map((m: CaseMessage) => (
                  <div key={m.id} className="mb-2 p-2 rounded bg-light border border-light-subtle small">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <strong className={m.sender === 'user' ? 'text-primary' : 'text-dark'}>
                        {m.sender === 'user' ? 'Store Owner' : 'ResolveLoop Agent'}
                      </strong>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {m.timestamp}
                      </span>
                    </div>
                    <div className="text-secondary small" style={{ whiteSpace: 'pre-line' }}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail & History */}
          <CaseAuditTrail events={caseData.auditTrail || []} />
        </div>

        {/* Right Column: Carrier Telemetry, Policy Evidence & Follow-up */}
        <div className="col-12 col-lg-5">
          {/* Follow-up Task Preview */}
          {caseData.followUpId && (
            <div className="card-saas p-3 mb-3 border-info-subtle bg-info-subtle bg-opacity-25">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <CalendarCheck2 size={16} className="text-primary" />
                  <span className="fw-semibold small text-dark">Scheduled Follow-up Task</span>
                </div>
                <Link to="/follow-ups" className="small text-primary text-decoration-none">
                  View Tasks
                </Link>
              </div>
              <div className="small text-secondary mb-2">
                Task <strong>{caseData.followUpId}</strong> is registered to monitor package departure and verify carrier resolution.
              </div>
            </div>
          )}

          {/* Shipping Telemetry */}
          {caseData.shipping && <ShippingTimeline shipping={caseData.shipping} />}

          {/* Policy Evidence */}
          {caseData.policy && (
            <PolicyEvidenceCard
              policy={caseData.policy}
              recommendation={
                caseData.proposedAction
                  ? {
                      summary: caseData.proposedAction.title,
                      confidence: 0.96,
                      evidence: caseData.proposedAction.evidence || [],
                      rationale: caseData.proposedAction.description,
                      urgency: caseData.priority,
                    }
                  : null
              }
            />
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        show={approvalModalOpen}
        onHide={() => setApprovalModalOpen(false)}
        action={caseData.proposedAction || null}
        caseId={caseData.id}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
