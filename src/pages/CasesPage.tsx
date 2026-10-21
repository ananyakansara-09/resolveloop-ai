import React, { useEffect, useState, useCallback } from 'react';
import { getCases } from '../api/casesApi';
import type { Case } from '../types/case';
import { CasesTable } from '../components/cases/CasesTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { RefreshCw } from 'lucide-react';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases();
      setCases(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve cases.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="cases-page-container">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Customer Support Cases</h1>
          <p className="text-muted small mb-0">
            Audit ongoing investigations, approval requests, and historical resolutions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 shadow-sm"
          onClick={fetchCases}
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchCases} className="mb-3" />}

      {loading ? (
        <div className="card-saas p-4">
          <SkeletonLoader count={6} height={40} />
        </div>
      ) : (
        <CasesTable cases={cases} />
      )}
    </div>
  );
};
