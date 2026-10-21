import React, { type ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-5 px-4 rounded-3 border border-dashed bg-white ${className}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--primary-subtle)',
          color: 'var(--primary-accent)',
        }}
      >
        {icon || <Inbox size={28} />}
      </div>
      <h5 className="fw-semibold text-dark mb-1">{title}</h5>
      <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="px-3 fw-medium">
          {actionText}
        </Button>
      )}
    </div>
  );
};
