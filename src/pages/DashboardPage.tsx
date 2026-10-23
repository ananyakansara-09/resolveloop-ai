import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/dashboardApi';
import type { DashboardData } from '../types/dashboard';
import { CasesTable } from '../components/cases/CasesTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { VoiceSimulationModal } from '../components/agent/VoiceSimulationModal';
import { useAgent } from '../context/AgentContext';
import {
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarCheck2,
  Sparkles,
  ArrowRight,
  Search,
  Mic,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickOrderInput, setQuickOrderInput] = useState('KL-1042');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const navigate = useNavigate();
  const { triggerInvestigation } = useAgent();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickInvestigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrderInput.trim()) return;

    navigate('/assistant');
    triggerInvestigation(
      `Investigate order ${quickOrderInput.trim()}, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.`,
      quickOrderInput.trim()
    );
  };

  const handleLaunchHackathonDemo = () => {
    navigate('/assistant');
    triggerInvestigation(
      'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
      'KL-1042',
      true
    );
  };

  const handleVoiceQueryFromModal = (query: string, orderId?: string) => {
    navigate('/assistant');
    triggerInvestigation(query, orderId, true);
  };

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Customer Support Operations Center</h1>
          <p className="text-muted small mb-0">
            Autonomous resolution assistant for ecommerce merchants • Amazon Developer Hackathon 2026 (Alexa+ Track)
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <span>Refresh Metrics</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm fw-semibold"
            onClick={handleLaunchHackathonDemo}
          >
            <Sparkles size={14} />
            <span>Launch Order KL-1042 Demo</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchDashboardData} className="mb-4" />}

      {/* Prominent "Ask ResolveLoop" Entry Banner */}
      <div
        className="card-saas p-4 mb-4 border-0 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 60%, #1d4ed8 100%)',
          borderRadius: '0.85rem',
        }}
      >
        <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="col-lg-7 mb-3 mb-lg-0">
            <div className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-white bg-opacity-10 text-white small mb-2 border border-white border-opacity-15">
              <span className="pulse-indicator" />
              <span className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                Simulated Alexa+ Voice & Reasoning Engine
              </span>
            </div>
            <h2 className="fs-4 fw-bold text-white mb-2">Have an order issue or customer inquiry?</h2>
            <p className="text-light text-opacity-75 small mb-0" style={{ maxWidth: '580px', lineHeight: '1.5' }}>
              Ask ResolveLoop AI to audit carrier route telemetry, verify store refund & exchange policies, draft personalized customer updates, and stage approvals before execution.
            </p>
          </div>

          <div className="col-lg-5">
            <form onSubmit={handleQuickInvestigate} className="bg-white p-2 rounded-3 shadow d-flex gap-2">
              <div className="position-relative flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-sm border-0 ps-4 py-2"
                  placeholder="Enter order ID (e.g. KL-1042)..."
                  value={quickOrderInput}
                  onChange={e => setQuickOrderInput(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <Search
                  size={14}
                  className="position-absolute text-muted"
                  style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                onClick={() => setVoiceModalOpen(true)}
                title="Simulate Alexa+ Voice Interaction"
                style={{ width: '34px', height: '34px', borderRadius: '6px' }}
              >
                <Mic size={15} />
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3 fw-semibold flex-shrink-0"
              >
                <span>Investigate</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="d-flex align-items-center justify-content-between mt-2 px-1 text-light text-opacity-75" style={{ fontSize: '0.72rem' }}>
              <span>Try sample: <strong>KL-1042</strong> (Siskiyou Pass weather delay)</span>
              <button
                type="button"
                className="btn btn-link btn-sm text-info p-0 text-decoration-none small"
                onClick={() => setQuickOrderInput('KL-1042')}
              >
                Insert KL-1042
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Metrics Cards */}
      <div className="row g-3 mb-4">
        {/* Total Support Cases */}
        <div className="col-6 col-md-4 col-xl">
          <div className="card-saas p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fw-semibold small" style={{ fontSize: '0.75rem' }}>
                Total Cases
              </span>
              <div
                className="rounded-2 p-1 bg-light text-secondary d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
              >
                <Layers size={15} />
              </div>
            </div>
            {loading ? (
              <SkeletonLoader height={32} width={60} />
            ) : (
              <div className="fs-4 fw-bold text-dark">{data?.stats.totalCases ?? 0}</div>
            )}
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              Lifetime resolved & active
            </div>
          </div>
        </div>

        {/* Open Cases */}
        <div className="col-6 col-md-4 col-xl">
          <div className="card-saas p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fw-semibold small" style={{ fontSize: '0.75rem' }}>
                Open Cases
              </span>
              <div
                className="rounded-2 p-1 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
              >
                <Clock size={15} />
              </div>
            </div>
            {loading ? (
              <SkeletonLoader height={32} width={60} />
            ) : (
              <div className="fs-4 fw-bold text-primary">{data?.stats.openCases ?? 0}</div>
            )}
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              Active agent investigations
            </div>
          </div>
        </div>

        {/* Cases Awaiting Approval */}
        <div className="col-6 col-md-4 col-xl">
          <div className="card-saas p-3 h-100 border-warning-subtle" style={{ backgroundColor: '#fffdfa' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-warning-emphasis fw-bold small" style={{ fontSize: '0.75rem' }}>
                Awaiting Approval
              </span>
              <div
                className="rounded-2 p-1 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
              >
                <AlertCircle size={15} />
              </div>
            </div>
            {loading ? (
              <SkeletonLoader height={32} width={60} />
            ) : (
              <div className="fs-4 fw-bold text-warning-emphasis">{data?.stats.awaitingApproval ?? 0}</div>
            )}
            <div className="text-warning-emphasis fw-medium" style={{ fontSize: '0.7rem' }}>
              Requires merchant sign-off
            </div>
          </div>
        </div>

        {/* Resolved Cases */}
        <div className="col-6 col-md-4 col-xl">
          <div className="card-saas p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fw-semibold small" style={{ fontSize: '0.75rem' }}>
                Resolved Cases
              </span>
              <div
                className="rounded-2 p-1 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
              >
                <CheckCircle2 size={15} />
              </div>
            </div>
            {loading ? (
              <SkeletonLoader height={32} width={60} />
            ) : (
              <div className="fs-4 fw-bold text-success">{data?.stats.resolvedCases ?? 0}</div>
            )}
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              Completed successfully
            </div>
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="col-6 col-md-4 col-xl">
          <div className="card-saas p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fw-semibold small" style={{ fontSize: '0.75rem' }}>
                Follow-ups Due
              </span>
              <div
                className="rounded-2 p-1 bg-info-subtle text-info-emphasis d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
              >
                <CalendarCheck2 size={15} />
              </div>
            </div>
            {loading ? (
              <SkeletonLoader height={32} width={60} />
            ) : (
              <div className="fs-4 fw-bold text-dark">{data?.stats.followUpsDue ?? 0}</div>
            )}
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              Scheduled carrier checkpoints
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="mb-4">
        {loading ? (
          <div className="card-saas p-4">
            <SkeletonLoader count={6} height={36} />
          </div>
        ) : (
          <CasesTable cases={data?.recentCases ?? []} />
        )}
      </div>

      {/* Voice Simulation Modal */}
      <VoiceSimulationModal
        show={voiceModalOpen}
        onHide={() => setVoiceModalOpen(false)}
        onSendVoiceQuery={handleVoiceQueryFromModal}
        initialQuery={quickOrderInput ? `Investigate order ${quickOrderInput}, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.` : ''}
      />
    </div>
  );
};
