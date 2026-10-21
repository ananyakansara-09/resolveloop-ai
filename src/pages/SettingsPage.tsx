import React, { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../api/dashboardApi';
import { API_BASE_URL, USE_MOCK_API } from '../api/apiClient';
import { IntegrationCard } from '../components/settings/IntegrationCard';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { useToast } from '../context/ToastContext';
import {
  Bot,
  Store,
  Truck,
  Mail,
  ShieldCheck,
  Server,
  RefreshCw,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('checking...');
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const res = await getHealth();
      setHealthStatus(res.status === 'ok' ? 'Operational' : 'Degraded');
      setLastCheckTime(new Date().toLocaleTimeString());
      success('Health Check Passed', `API responded with status: ${res.status}. Mode: ${res.mode}`);
    } catch (err: unknown) {
      setHealthStatus('Offline / Unreachable');
      setError(err instanceof Error ? err.message : 'Health check failed');
      toastError('Health Check Failed', 'Could not reach backend health endpoint.');
    } finally {
      setIsChecking(false);
    }
  }, [success, toastError]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Settings & Integration Status</h1>
          <p className="text-muted small mb-0">
            System architecture, active connectors, and simulated API service telemetry.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
          onClick={checkHealth}
          disabled={isChecking}
        >
          <RefreshCw size={13} className={isChecking ? 'spin' : ''} />
          <span>Ping /health Endpoint</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={checkHealth} className="mb-3" />}

      {/* Security & Disclaimer Notice */}
      <div className="p-3 mb-4 rounded-3 bg-light border border-secondary-subtle d-flex align-items-start gap-3">
        <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="small text-secondary">
          <strong className="text-dark d-block mb-0.5">
            Hackathon Notice: Simulated Alexa+ Environment
          </strong>
          ResolveLoop AI demonstrates an Alexa+-style simulated conversational experience designed for the Amazon Developer Hackathon 2026 Alexa+ track. All carrier events, email dispatchers, and store webhooks run on isolated synthetic demo services without exposing private keys or live carrier accounts.
        </div>
      </div>

      {/* Backend API Configuration Status */}
      <div className="card-saas p-4 mb-4">
        <h5 className="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Server size={18} className="text-primary" />
          <span>Backend API Contract & Connectivity</span>
        </h5>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 rounded-2 bg-light border border-light-subtle small">
              <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                Configured API Base URL:
              </div>
              <code className="text-primary fw-semibold d-block text-break" style={{ fontSize: '0.82rem' }}>
                {API_BASE_URL}
              </code>
              <div className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                Defined in client environment via <code>VITE_API_BASE_URL</code>.
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-2 bg-light border border-light-subtle small">
              <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                Health Check Service Status:
              </div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="pulse-indicator" />
                <strong className="text-dark fs-6">{healthStatus}</strong>
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Last ping: {lastCheckTime || 'Just now'} • Active client mode:{' '}
                <strong className="text-dark">{USE_MOCK_API ? 'Resilient Demo / Mock Fallback' : 'Strict Real Backend'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configured Integrations Grid */}
      <h5 className="fs-6 fw-bold text-dark mb-3">Configured Services & Simulators</h5>
      <div className="row g-3 mb-4">
        {/* Alexa+ Engine */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="Alexa+ Voice & Resolution Assistant"
            category="Conversational AI Engine"
            version="2026.1"
            description="Simulated Alexa+ multi-turn conversational agent with proactive tool calling and step-by-step resolution reasoning."
            status="simulated"
            icon={<Bot size={20} />}
          />
        </div>

        {/* Shopify Connector */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="Shopify Store Sync"
            category="Ecommerce Platform"
            version="2026.04"
            description="Connected to demo store 'UrbanAura Goods'. Syncs customer lifetime value, order statuses, and SKU catalogs."
            status="simulated"
            icon={<Store size={20} />}
          />
        </div>

        {/* FedEx & Carrier Tracking */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="ShipStation & FedEx Telemetry"
            category="Carrier Tracking API"
            version="3.2"
            description="Carrier webhook simulator delivering real-time transit telemetry, weather exceptions, and delayed SLA events."
            status="simulated"
            icon={<Truck size={20} />}
          />
        </div>

        {/* Customer Email Dispatcher */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="Zendesk & Customer Email Dispatch"
            category="Communication Gateway"
            version="1.8"
            description="Sandbox email dispatcher that simulates delivering personalized reassurance letters and courtesy credits."
            status="simulated"
            icon={<Mail size={20} />}
          />
        </div>

        {/* Store Policy Engine */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="Merchant Policy Rule Engine"
            category="SLA & Compliance"
            version="2.4"
            description="Evaluates merchant return windows, shipping SLA guarantees, and courtesy compensation thresholds."
            status="simulated"
            icon={<ShieldCheck size={20} />}
          />
        </div>

        {/* Security & Session Storage */}
        <div className="col-md-6 col-lg-4">
          <IntegrationCard
            name="Human-in-the-Loop Gateway"
            category="Security & Governance"
            version="1.0"
            description="Enforces explicit merchant verification before financial courtesy credits or customer emails are dispatched."
            status="simulated"
            icon={<CheckCircle2 size={20} />}
          />
        </div>
      </div>
    </div>
  );
};
