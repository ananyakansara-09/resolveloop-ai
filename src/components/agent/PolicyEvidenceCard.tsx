import React from 'react';
import type { StorePolicyMatch } from '../../types/case';
import type { AgentRecommendation } from '../../types/agent';
import { ShieldCheck, BookOpen, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';

interface PolicyEvidenceCardProps {
  policy: StorePolicyMatch | null;
  recommendation: AgentRecommendation | null;
}

export const PolicyEvidenceCard: React.FC<PolicyEvidenceCardProps> = ({ policy, recommendation }) => {
  if (!policy && !recommendation) {
    return (
      <div className="card-saas p-4 text-center text-muted">
        <ShieldCheck size={24} className="mb-2 text-secondary opacity-50" />
        <div className="small">Store policy rules and agent reasoning will appear after an order is evaluated.</div>
      </div>
    );
  }

  return (
    <div className="card-saas mb-3">
      <div className="card-saas-header py-2 px-3 bg-light d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <span className="fw-semibold small text-dark">Store Policy & AI Reasoning</span>
        </div>
        {recommendation && (
          <span
            className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.7rem' }}
          >
            <Sparkles size={11} />
            <span>{(recommendation.confidence * 100).toFixed(0)}% AI Confidence</span>
          </span>
        )}
      </div>

      <div className="p-3">
        {/* Policy Rule Matched */}
        {policy && (
          <div className="p-2 mb-3 rounded-2 bg-light border border-light-subtle">
            <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
              <div>
                <span className="badge bg-secondary-subtle text-secondary me-2" style={{ fontSize: '0.68rem' }}>
                  {policy.policyId}
                </span>
                <span className="fw-semibold text-dark small">{policy.title}</span>
              </div>
              <span className="badge bg-success text-white d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <CheckCircle size={10} />
                <span>Threshold Met</span>
              </span>
            </div>

            <p className="text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
              {policy.ruleApplied}
            </p>

            <div className="d-flex align-items-center justify-content-between pt-1 border-top border-light-subtle" style={{ fontSize: '0.72rem' }}>
              <span className="text-muted">Category: {policy.category}</span>
              {policy.policyUrl && (
                <a
                  href={policy.policyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                >
                  <span>View Policy Doc</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Evidence Citations */}
        {recommendation && (
          <div>
            <div className="text-uppercase fw-semibold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Key Evidence Citations
            </div>
            <ul className="list-unstyled mb-3 ps-0">
              {recommendation.evidence.map((item, idx) => (
                <li
                  key={idx}
                  className="d-flex align-items-start gap-2 mb-1 text-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  <span className="text-success mt-0.5">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-2 rounded-2 bg-info-subtle border border-info-subtle text-dark" style={{ fontSize: '0.78rem' }}>
              <div className="fw-semibold text-primary-emphasis mb-0.5 d-flex align-items-center gap-1">
                <BookOpen size={13} />
                <span>Agent Rationale</span>
              </div>
              <div className="text-secondary small">{recommendation.rationale}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
