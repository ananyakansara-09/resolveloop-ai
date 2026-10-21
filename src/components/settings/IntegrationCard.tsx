import React, { type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'simulated' | 'offline';
  icon: ReactNode;
  version?: string;
  documentationUrl?: string;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  category,
  description,
  status,
  icon,
  version,
  documentationUrl,
}) => {
  let badge = (
    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
      <CheckCircle2 size={11} />
      <span>Live Connected</span>
    </span>
  );

  if (status === 'simulated') {
    badge = (
      <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
        <Info size={11} />
        <span>Simulated / Demo Mode</span>
      </span>
    );
  } else if (status === 'offline') {
    badge = (
      <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
        <AlertCircle size={11} />
        <span>Disconnected</span>
      </span>
    );
  }

  return (
    <div className="card-saas p-3 h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center bg-light border text-primary"
              style={{ width: '38px', height: '38px' }}
            >
              {icon}
            </div>
            <div>
              <div className="fw-bold text-dark small">{name}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                {category} {version && `• v${version}`}
              </div>
            </div>
          </div>
          {badge}
        </div>

        <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
          {description}
        </p>
      </div>

      <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.72rem' }}>
        <span>Security: No secrets exposed in browser</span>
        {documentationUrl && (
          <a
            href={documentationUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
          >
            <span>Docs</span>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
};
