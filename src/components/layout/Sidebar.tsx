import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Layers,
  CalendarCheck2,
  Settings,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { triggerInvestigation } = useAgent();

  const handleQuickDemo = () => {
    navigate('/assistant');
    triggerInvestigation(
      'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
      'KL-1042',
      true
    );
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'show' : ''}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div className="fw-bold fs-6 text-white lh-1">ResolveLoop AI</div>
            <span
              className="text-secondary small fw-medium text-uppercase"
              style={{ fontSize: '0.65rem', letterSpacing: '0.05em', color: '#94a3b8' }}
            >
              Alexa+ Support Agent
            </span>
          </div>
        </div>
        <button
          className="btn btn-sm btn-link text-white d-lg-none p-1"
          onClick={onClose}
          aria-label="Close Navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Simulated Alexa+ Track Badge */}
      <div className="px-3 pt-3">
        <div
          className="p-2 rounded-2 d-flex align-items-center gap-2"
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}
        >
          <span className="pulse-indicator" />
          <div className="lh-sm">
            <div className="text-white fw-semibold" style={{ fontSize: '0.75rem' }}>
              Alexa+ Voice & Resolution
            </div>
            <div className="text-info-emphasis" style={{ fontSize: '0.675rem', color: '#93c5fd' }}>
              Simulated Experience (Demo)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-grow-1 overflow-y-auto">
        <div
          className="text-uppercase fw-semibold mb-2 px-2"
          style={{ fontSize: '0.68rem', letterSpacing: '0.06em', color: '#64748b' }}
        >
          Operations
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 992 && onClose()}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/assistant"
          className={({ isActive }) => `nav-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 992 && onClose()}
        >
          <Bot size={18} />
          <div className="d-flex align-items-center justify-content-between flex-grow-1">
            <span>AI Workspace</span>
            <span
              className="badge rounded-pill"
              style={{ backgroundColor: '#2563eb', fontSize: '0.65rem', padding: '0.2rem 0.45rem' }}
            >
              Alexa+
            </span>
          </div>
        </NavLink>

        <NavLink
          to="/cases"
          className={({ isActive }) => `nav-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 992 && onClose()}
        >
          <Layers size={18} />
          <span>Support Cases</span>
        </NavLink>

        <NavLink
          to="/follow-ups"
          className={({ isActive }) => `nav-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 992 && onClose()}
        >
          <CalendarCheck2 size={18} />
          <div className="d-flex align-items-center justify-content-between flex-grow-1">
            <span>Follow-up Tasks</span>
          </div>
        </NavLink>

        <div
          className="text-uppercase fw-semibold mt-4 mb-2 px-2"
          style={{ fontSize: '0.68rem', letterSpacing: '0.06em', color: '#64748b' }}
        >
          Configuration
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 992 && onClose()}
        >
          <Settings size={18} />
          <span>Settings & Integrations</span>
        </NavLink>
      </div>

      {/* Quick Demo Scenario Callout */}
      <div className="p-3 border-top border-secondary border-opacity-25" style={{ backgroundColor: '#090e20' }}>
        <div className="small fw-semibold text-light mb-1 d-flex align-items-center gap-1">
          <Zap size={14} className="text-warning" />
          <span>Hackathon Demo Scenario</span>
        </div>
        <p className="small mb-2" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Test the delayed winter parka case with carrier weather exception & late SLA credit.
        </p>
        <button
          type="button"
          className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-1 shadow-sm fw-medium"
          onClick={handleQuickDemo}
          style={{ fontSize: '0.8rem' }}
        >
          <Sparkles size={14} />
          <span>Investigate Order KL-1042</span>
        </button>
      </div>
    </aside>
  );
};
