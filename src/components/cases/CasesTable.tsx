import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Case } from '../../types/case';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Bot, ChevronRight, Search } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

interface CasesTableProps {
  cases: Case[];
}

export const CasesTable: React.FC<CasesTableProps> = ({ cases }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();
  const { loadCaseIntoWorkspace } = useAgent();

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'awaiting_approval' && c.status === 'awaiting_approval') ||
        (filterStatus === 'open' && (c.status === 'open' || c.status === 'investigating')) ||
        (filterStatus === 'resolved' && (c.status === 'resolved' || c.status === 'approved'));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.issueSummary.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [cases, filterStatus, searchQuery]);

  const handleOpenInAssistant = async (c: Case) => {
    await loadCaseIntoWorkspace(c.id);
    navigate('/assistant');
  };

  return (
    <div className="card-saas">
      {/* Header with Search and Filter */}
      <div className="card-saas-header flex-wrap gap-2 py-3 px-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-dark fs-6">Support Resolution Cases</span>
          <span className="badge bg-light text-secondary border">
            {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="position-relative" style={{ minWidth: '220px' }}>
            <input
              type="text"
              className="form-control form-control-sm ps-4 pe-2 py-1 bg-light border"
              placeholder="Filter by ID, order, customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
            <Search
              size={13}
              className="position-absolute text-muted"
              style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('all')}
              style={{ fontSize: '0.75rem' }}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                filterStatus === 'awaiting_approval' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setFilterStatus('awaiting_approval')}
              style={{ fontSize: '0.75rem' }}
            >
              Needs Approval
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'open' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('open')}
              style={{ fontSize: '0.75rem' }}
            >
              Open
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterStatus === 'resolved' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('resolved')}
              style={{ fontSize: '0.75rem' }}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
          <thead className="table-light text-secondary">
            <tr>
              <th scope="col" className="ps-3 py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Case & Order</th>
              <th scope="col" className="py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Customer</th>
              <th scope="col" className="py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Issue Summary</th>
              <th scope="col" className="py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Status</th>
              <th scope="col" className="py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Priority</th>
              <th scope="col" className="py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Last Updated</th>
              <th scope="col" className="text-end pe-3 py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted small">
                  No cases match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredCases.map(item => (
                <tr key={item.id}>
                  {/* Case & Order */}
                  <td className="ps-3">
                    <Link
                      to={`/cases/${item.id}`}
                      className="fw-bold text-dark text-decoration-none d-block lh-sm"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {item.id}
                    </Link>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Order: <strong className="text-secondary">{item.orderId}</strong>
                    </span>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="fw-semibold text-dark lh-sm">{item.customer.name}</div>
                    <div className="d-flex align-items-center gap-1">
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {item.customer.email}
                      </span>
                      {item.customer.tier === 'VIP' && (
                        <span className="badge bg-warning-subtle text-warning-emphasis border" style={{ fontSize: '0.62rem' }}>
                          VIP
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Issue Summary */}
                  <td style={{ maxWidth: '320px' }}>
                    <div className="text-dark text-truncate" title={item.issueSummary}>
                      {item.issueSummary}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Priority */}
                  <td>
                    <PriorityBadge priority={item.priority} />
                  </td>

                  {/* Last Updated */}
                  <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(item.updatedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="text-end pe-3 text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-2 me-1"
                      onClick={() => handleOpenInAssistant(item)}
                      title="Open in AI Workspace"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Bot size={13} className="me-1" />
                      <span>Workspace</span>
                    </button>

                    <Link
                      to={`/cases/${item.id}`}
                      className="btn btn-sm btn-light border py-1 px-2 text-dark"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span>Details</span>
                      <ChevronRight size={12} className="ms-0.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
