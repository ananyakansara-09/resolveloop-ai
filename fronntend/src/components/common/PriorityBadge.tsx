import React from 'react';
import type { CasePriority } from '../../types/case';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: CasePriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let label = 'Low';
  let bg = '#f1f5f9';
  let color = '#475569';
  let icon = <ArrowDown size={13} />;

  switch (priority) {
    case 'urgent':
      label = 'Urgent';
      bg = '#ffe4e6';
      color = '#be123c';
      icon = <AlertTriangle size={13} />;
      break;
    case 'high':
      label = 'High';
      bg = '#fef3c7';
      color = '#b45309';
      icon = <AlertCircle size={13} />;
      break;
    case 'medium':
      label = 'Medium';
      bg = '#eff6ff';
      color = '#1d4ed8';
      icon = <ArrowUp size={13} />;
      break;
    case 'low':
      label = 'Low';
      bg = '#f8fafc';
      color = '#64748b';
      icon = <ArrowDown size={13} />;
      break;
  }

  return (
    <span
      className="d-inline-flex align-items-center gap-1 fw-semibold text-nowrap"
      style={{
        backgroundColor: bg,
        color: color,
        borderRadius: '6px',
        fontSize: '0.725rem',
        padding: '0.2rem 0.5rem',
        border: `1px solid ${color}30`,
      }}
      aria-label={`Priority: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
