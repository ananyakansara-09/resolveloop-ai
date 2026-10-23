import React from 'react';
import type { CaseStatus } from '../../types/case';
import { Clock, Search, AlertCircle, CheckCircle, XCircle, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let label = status;
  let bg = '#f1f5f9';
  let color = '#334155';
  let icon = <Clock size={size === 'sm' ? 12 : 14} />;

  switch (normalized) {
    case 'open':
      label = 'Open';
      bg = 'var(--status-open-bg)';
      color = 'var(--status-open-text)';
      icon = <Clock size={size === 'sm' ? 12 : 14} />;
      break;
    case 'investigating':
      label = 'Investigating';
      bg = 'var(--status-investigating-bg)';
      color = 'var(--status-investigating-text)';
      icon = <Search size={size === 'sm' ? 12 : 14} />;
      break;
    case 'awaiting_approval':
      label = 'Awaiting Approval';
      bg = 'var(--status-approval-bg)';
      color = 'var(--status-approval-text)';
      icon = <AlertCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'approved':
      label = 'Approved';
      bg = 'var(--status-approved-bg)';
      color = 'var(--status-approved-text)';
      icon = <Check size={size === 'sm' ? 12 : 14} />;
      break;
    case 'rejected':
      label = 'Rejected';
      bg = 'var(--status-delayed-bg)';
      color = 'var(--status-delayed-text)';
      icon = <XCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'resolved':
      label = 'Resolved';
      bg = 'var(--status-resolved-bg)';
      color = 'var(--status-resolved-text)';
      icon = <CheckCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'delayed':
      label = 'Delayed';
      bg = 'var(--status-delayed-bg)';
      color = 'var(--status-delayed-text)';
      icon = <AlertCircle size={size === 'sm' ? 12 : 14} />;
      break;
    default:
      label = status;
  }

  const fontSize = size === 'sm' ? '0.725rem' : '0.8rem';
  const padding = size === 'sm' ? '0.2rem 0.5rem' : '0.3rem 0.65rem';

  return (
    <span
      className="d-inline-flex align-items-center gap-1 fw-semibold text-nowrap"
      style={{
        backgroundColor: bg,
        color: color,
        borderRadius: '9999px',
        fontSize,
        padding,
        border: `1px solid ${color}20`,
      }}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
