import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bot,
  RotateCcw,
  Store,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useToast } from '../../context/ToastContext';
import { mockService } from '../../api/mock/mockService';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { triggerInvestigation } = useAgent();
  const { info, success } = useToast();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate('/assistant');
    triggerInvestigation(
      `Investigate order ${query}, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.`,
      query
    );
    setSearchQuery('');
  };

  const handleResetData = () => {
    mockService.resetToDefault();
    success('Demo Data Reset', 'Synthetic demo orders, cases, and follow-ups have been reset.');
    window.location.reload();
  };

  return (
    <header className="bg-white border-bottom py-2 px-3 px-md-4 d-flex align-items-center justify-content-between sticky-top" style={{ borderColor: 'var(--border-subtle)', zIndex: 1020 }}>
      {/* Left section: Hamburger & Store Selector */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-secondary btn-sm d-lg-none p-1 border-0"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="d-none d-sm-flex align-items-center gap-2 text-secondary small">
          <Store size={16} className="text-primary" />
          <span className="fw-semibold text-dark">UrbanAura Goods</span>
        </div>
      </div>

      {/* Middle section: Quick Search */}
      <div className="mx-2 flex-grow-1" style={{ maxWidth: '440px' }}>
        <form onSubmit={handleSearchSubmit} className="position-relative">
          <input
            type="search"
            className="form-control form-control-sm ps-4 pe-3 py-1 rounded-pill bg-light border"
            placeholder="Search order (e.g. KL-1042) or customer issue..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.85rem' }}
            aria-label="Quick order investigation search"
          />
          <Search
            size={14}
            className="position-absolute text-muted"
            style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </form>
      </div>

      {/* Right section: System Status, Reset & Ask Action */}
      <div className="d-flex align-items-center gap-2">
        {/* Reset Demo Data Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-none d-md-inline-flex align-items-center gap-1 py-1 px-2"
          onClick={handleResetData}
          title="Reset sample orders and cases"
          style={{ fontSize: '0.75rem' }}
        >
          <RotateCcw size={12} />
          <span>Reset Demo</span>
        </button>

        {/* Alexa+ Status Pill */}
        <div
          className="d-none d-lg-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill small border"
          style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', fontSize: '0.75rem' }}
        >
          <span className="pulse-indicator" style={{ width: '6px', height: '6px' }} />
          <span className="fw-medium">Simulated Alexa+ Ready</span>
        </div>

        {/* Ask ResolveLoop Primary Action */}
        <button
          type="button"
          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3 fw-medium"
          onClick={() => {
            navigate('/assistant');
            info('Ask ResolveLoop', 'Enter your inquiry or choose a starter prompt below.');
          }}
          style={{ borderRadius: '9999px', fontSize: '0.825rem' }}
        >
          <Bot size={15} />
          <span>Ask ResolveLoop</span>
        </button>
      </div>
    </header>
  );
};
