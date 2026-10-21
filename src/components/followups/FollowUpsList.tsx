import React from 'react';
import { Link } from 'react-router-dom';
import type { FollowUpTask } from '../../types/followUp';
import {
  CalendarCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Bot,
  User,
  RotateCcw,
} from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';

interface FollowUpsListProps {
  tasks: FollowUpTask[];
  onToggleStatus: (task: FollowUpTask) => void;
}

export const FollowUpsList: React.FC<FollowUpsListProps> = ({ tasks, onToggleStatus }) => {
  if (tasks.length === 0) {
    return (
      <div className="card-saas p-5 text-center text-muted">
        <CalendarCheck2 size={32} className="mb-2 text-secondary opacity-50" />
        <h6 className="fw-semibold text-dark">No follow-up tasks scheduled</h6>
        <p className="small mb-0">Follow-up tasks will appear here when the AI agent schedules checkpoints.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {tasks.map(task => {
        const isCompleted = task.status === 'completed';
        const isOverdue = task.isOverdue && !isCompleted;

        return (
          <div
            key={task.id}
            className={`card-saas p-3 ${
              isOverdue
                ? 'border-danger'
                : isCompleted
                ? 'bg-light border-light-subtle'
                : 'border-subtle'
            }`}
            style={{
              borderLeft: isOverdue ? '4px solid #ef4444' : isCompleted ? '4px solid #10b981' : '4px solid #2563eb',
            }}
          >
            <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3">
              {/* Task Details */}
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span className="fw-bold text-dark fs-6">{task.id}</span>

                  <PriorityBadge priority={task.priority} />

                  {/* Overdue Alert - Non-color reliant text & icon */}
                  {isOverdue && (
                    <span
                      className="badge bg-danger text-white d-inline-flex align-items-center gap-1 fw-bold text-uppercase"
                      style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
                      role="alert"
                      aria-label="Task is overdue"
                    >
                      <AlertTriangle size={12} />
                      <span>[OVERDUE] Action Required</span>
                    </span>
                  )}

                  {isCompleted && (
                    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Completed</span>
                    </span>
                  )}

                  {!isCompleted && !isOverdue && (
                    <span className="badge bg-light text-secondary border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <Clock size={12} />
                      <span>Scheduled Checkpoint</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <p
                  className={`mb-2 small ${
                    isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark fw-medium'
                  }`}
                  style={{ fontSize: '0.88rem' }}
                >
                  {task.description}
                </p>

                {/* Metadata Row */}
                <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small" style={{ fontSize: '0.75rem' }}>
                  {/* Related Case Link */}
                  <div>
                    <span className="text-muted">Case: </span>
                    <Link
                      to={`/cases/${task.caseId}`}
                      className="text-primary fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
                    >
                      <span>{task.caseId}</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>

                  <div>
                    <span className="text-muted">Order: </span>
                    <strong className="text-dark">{task.orderId}</strong>
                  </div>

                  {task.customerName && (
                    <div>
                      <span className="text-muted">Customer: </span>
                      <strong className="text-dark">{task.customerName}</strong>
                    </div>
                  )}

                  {/* Assigned to */}
                  <div className="d-flex align-items-center gap-1">
                    {task.assignedTo.includes('AI') ? (
                      <Bot size={13} className="text-primary" />
                    ) : (
                      <User size={13} className="text-secondary" />
                    )}
                    <span className="text-muted">Assigned: </span>
                    <span className="fw-medium text-dark">{task.assignedTo}</span>
                  </div>

                  {/* Due Date */}
                  <div className={`d-flex align-items-center gap-1 ${isOverdue ? 'text-danger fw-bold' : ''}`}>
                    <Clock size={13} />
                    <span>Due: {new Date(task.dueDate).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0 align-self-md-center">
                <Link
                  to={`/cases/${task.caseId}`}
                  className="btn btn-sm btn-outline-secondary py-1 px-2 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>Open Case</span>
                  <ExternalLink size={12} />
                </Link>

                <button
                  type="button"
                  className={`btn btn-sm d-inline-flex align-items-center gap-1 py-1 px-3 fw-medium ${
                    isCompleted
                      ? 'btn-outline-secondary'
                      : 'btn-success text-white shadow-sm'
                  }`}
                  onClick={() => onToggleStatus(task)}
                  style={{ fontSize: '0.78rem' }}
                >
                  {isCompleted ? (
                    <>
                      <RotateCcw size={13} />
                      <span>Reopen Task</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
