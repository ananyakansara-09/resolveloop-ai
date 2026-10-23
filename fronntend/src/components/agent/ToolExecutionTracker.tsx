import React, { useState } from 'react';
import type { ToolCall } from '../../types/agent';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal,
} from 'lucide-react';

interface ToolExecutionTrackerProps {
  tools: ToolCall[];
  isRunning: boolean;
}

export const ToolExecutionTracker: React.FC<ToolExecutionTrackerProps> = ({ tools, isRunning }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (tools.length === 0 && !isRunning) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="card-saas mb-3 border-primary-subtle">
      <div className="card-saas-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Cpu size={16} className="text-primary" />
          <span className="fw-semibold small text-dark">Agent Tool-Call Activity</span>
          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
            {tools.filter(t => t.status === 'completed').length}/{tools.length} Completed
          </span>
        </div>
        {isRunning && (
          <div className="d-flex align-items-center gap-1 text-primary small">
            <Loader2 size={13} className="spin" />
            <span style={{ fontSize: '0.75rem' }}>Executing step...</span>
          </div>
        )}
      </div>

      <div className="p-2">
        {tools.map(tool => {
          const isExpanded = expandedId === tool.id;

          let statusBadge = (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1">
              <Loader2 size={11} className="spin" />
              <span>Running</span>
            </span>
          );

          if (tool.status === 'completed') {
            statusBadge = (
              <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Completed</span>
              </span>
            );
          } else if (tool.status === 'failed') {
            statusBadge = (
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                <AlertCircle size={11} />
                <span>Failed</span>
              </span>
            );
          }

          return (
            <div
              key={tool.id}
              className={`tool-step-item mb-1 ${tool.status}`}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
            >
              <div
                className="d-flex align-items-center justify-content-between cursor-pointer"
                onClick={() => toggleExpand(tool.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleExpand(tool.id);
                  }
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <Terminal size={14} className="text-secondary" />
                  <span className="fw-medium text-dark">{tool.displayName || tool.name}</span>
                  <code className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {tool.name}()
                  </code>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {statusBadge}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-top border-light-subtle">
                  <div className="mb-1 text-muted" style={{ fontSize: '0.7rem' }}>
                    <strong>Input parameters:</strong>
                  </div>
                  <pre
                    className="p-2 bg-light rounded text-dark mb-2"
                    style={{ fontSize: '0.7rem', maxHeight: '100px', overflowY: 'auto' }}
                  >
                    {JSON.stringify(tool.input, null, 2)}
                  </pre>
                  {tool.output && (
                    <>
                      <div className="mb-1 text-muted" style={{ fontSize: '0.7rem' }}>
                        <strong>Output telemetry:</strong>
                      </div>
                      <pre
                        className="p-2 bg-light rounded text-dark mb-0"
                        style={{ fontSize: '0.7rem', maxHeight: '120px', overflowY: 'auto' }}
                      >
                        {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
