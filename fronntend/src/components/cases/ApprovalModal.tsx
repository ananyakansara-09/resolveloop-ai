import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { ProposedAction } from '../../types/case';
import { CheckCircle2, XCircle, Mail, ShieldAlert, Edit3, Loader2 } from 'lucide-react';

interface ApprovalModalProps {
  show: boolean;
  onHide: () => void;
  action: ProposedAction | null;
  caseId: string | null;
  onApprove: (editedDraft?: string) => Promise<boolean>;
  onReject: (reason: string) => Promise<boolean>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  show,
  onHide,
  action,
  caseId,
  onApprove,
  onReject,
}) => {
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (action) {
      setDraftContent(action.customerEmailDraft || '');
      setConfirmCheckbox(false);
      setIsEditingDraft(false);
      setRejectMode(false);
      setRejectReason('');
      setErrorMsg(null);
    }
  }, [action, show]);

  if (!action) return null;

  const handleApprove = async () => {
    if (!confirmCheckbox) {
      setErrorMsg('Please confirm and check the authorization box before approving.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onApprove(draftContent);
      if (ok) {
        onHide();
      } else {
        setErrorMsg('Approval could not be completed by the server.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify a reason for rejecting the proposed action.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onReject(rejectReason);
      if (ok) {
        onHide();
      } else {
        setErrorMsg('Rejection failed on server.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={!isSubmitting}>
      <Modal.Header closeButton={!isSubmitting} className="border-bottom bg-light">
        <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
          <ShieldAlert size={18} className="text-warning" />
          <span>Authorize Proposed Resolution Action</span>
          {caseId && <span className="text-muted fw-normal">({caseId})</span>}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {errorMsg && (
          <Alert variant="danger" className="py-2 px-3 small mb-3">
            {errorMsg}
          </Alert>
        )}

        {/* Action Summary Banner */}
        <div className="p-3 mb-3 rounded-2 bg-light border border-light-subtle">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <div className="fw-semibold text-dark fs-6">{action.title}</div>
              <p className="text-secondary small mb-1">{action.description}</p>
            </div>
            {action.cost !== undefined && action.cost > 0 && (
              <div className="text-end">
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fs-6">
                  ${action.cost.toFixed(2)} Credit
                </span>
                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                  Financial impact
                </div>
              </div>
            )}
          </div>

          {/* Evidence List */}
          {action.evidence && action.evidence.length > 0 && (
            <div className="mt-2 pt-2 border-top border-light-subtle">
              <div className="text-muted fw-semibold small mb-1" style={{ fontSize: '0.72rem' }}>
                Supporting Evidence:
              </div>
              <ul className="mb-0 ps-3 small text-secondary" style={{ fontSize: '0.76rem' }}>
                {action.evidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rejection Mode View */}
        {rejectMode ? (
          <div className="p-3 border rounded-2 bg-light mb-3">
            <h6 className="fw-semibold text-danger mb-2">Provide Rejection Reason</h6>
            <Form.Group>
              <Form.Label className="small text-secondary">
                Explain why this proposed action is rejected or what alternative approach is required:
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g. Carrier weather cleared; hold off on account credit until delivery scan tomorrow morning..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                disabled={isSubmitting}
              />
            </Form.Group>
          </div>
        ) : (
          /* Normal Approval & Email Review View */
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span className="fw-semibold small text-dark">Proposed Customer Email</span>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none small d-inline-flex align-items-center gap-1"
                onClick={() => setIsEditingDraft(!isEditingDraft)}
                disabled={isSubmitting}
              >
                <Edit3 size={13} />
                <span>{isEditingDraft ? 'View Preview' : 'Edit Email Draft'}</span>
              </Button>
            </div>

            {isEditingDraft ? (
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={8}
                  className="font-monospace small bg-white border"
                  value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                  disabled={isSubmitting}
                  style={{ fontSize: '0.82rem' }}
                />
                <Form.Text className="text-muted small">
                  You can personalize the text before confirming dispatch.
                </Form.Text>
              </Form.Group>
            ) : (
              <div
                className="p-3 bg-light rounded-2 border text-dark font-monospace small mb-3 overflow-y-auto"
                style={{ maxHeight: '200px', whiteSpace: 'pre-wrap', fontSize: '0.8rem', lineHeight: '1.45' }}
              >
                {draftContent}
              </div>
            )}

            {/* Explicit Confirmation Checkbox */}
            <div className="p-3 rounded-2 bg-primary-subtle border border-primary-subtle mb-3">
              <Form.Check
                type="checkbox"
                id="explicit-action-confirmation"
                label={
                  <span className="small fw-semibold text-primary-emphasis">
                    I explicitly authorize this action, account adjustment, and the dispatch of this customer message.
                  </span>
                }
                checked={confirmCheckbox}
                onChange={e => setConfirmCheckbox(e.target.checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top bg-light d-flex justify-content-between">
        <div>
          {rejectMode ? (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setRejectMode(false)}
              disabled={isSubmitting}
            >
              Cancel Rejection
            </Button>
          ) : (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setRejectMode(true)}
              disabled={isSubmitting}
              className="d-inline-flex align-items-center gap-1"
            >
              <XCircle size={14} />
              <span>Reject Action</span>
            </Button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            Close
          </Button>

          {rejectMode ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
              className="d-inline-flex align-items-center gap-1"
            >
              {isSubmitting && <Loader2 size={14} className="spin" />}
              <span>Confirm Rejection</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={isSubmitting || !confirmCheckbox}
              className="d-inline-flex align-items-center gap-1 px-3 shadow-sm fw-semibold"
            >
              {isSubmitting ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
              <span>Authorize & Dispatch</span>
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};
