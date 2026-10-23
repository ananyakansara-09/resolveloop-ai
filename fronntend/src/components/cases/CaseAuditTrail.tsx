import React from 'react';
import type { CaseAuditEvent } from '../../types/case';
import { History, Bot, User, Cpu, ShieldCheck } from 'lucide-react';

interface CaseAuditTrailProps {
  events: CaseAuditEvent[];
}

export const CaseAuditTrail: React.FC<CaseAuditTrailProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-3 text-center text-muted small bg-light rounded-2 border">
        No audit events recorded yet for this case.
      </div>
    );
  }

  const getActorBadge = (actor: 'agent' | 'user' | 'system') => {
    switch (actor) {
      case 'agent':
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
            <Bot size={11} />
            <span>ResolveLoop Agent</span>
          </span>
        );
      case 'user':
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
            <User size={11} />
            <span>Store Owner</span>
          </span>
        );
      case 'system':
      default:
        return (
          <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
            <Cpu size={11} />
            <span>System</span>
          </span>
        );
    }
  };

  return (
    <div className="card-saas">
      <div className="card-saas-header py-2 px-3 bg-light d-flex align-items-center gap-2">
        <History size={16} className="text-primary" />
        <span className="fw-semibold small text-dark">Audit Trail & Action History</span>
      </div>

      <div className="p-3">
        <div className="ps-1">
          {events.map((evt) => (
            <div key={evt.id} className="shipping-step">
              <div className="shipping-step-node completed">
                <ShieldCheck size={10} />
              </div>

              <div className="d-flex flex-column" style={{ fontSize: '0.8rem' }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-dark">{evt.action}</span>
                    {getActorBadge(evt.actor)}
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {new Date(evt.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-secondary small mt-1">{evt.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
