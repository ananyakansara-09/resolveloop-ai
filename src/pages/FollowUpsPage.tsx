import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getFollowUps, updateFollowUp, createFollowUp } from '../api/followUpsApi';
import type { FollowUpTask, CreateFollowUpDto } from '../types/followUp';
import { FollowUpsList } from '../components/followups/FollowUpsList';
import { NewFollowUpModal } from '../components/followups/NewFollowUpModal';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { useToast } from '../context/ToastContext';
import {
  CalendarCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { success, error: toastError } = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFollowUps();
      setTasks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve follow-up tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleStatus = async (task: FollowUpTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await updateFollowUp(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
      success(
        newStatus === 'completed' ? 'Task Completed' : 'Task Reopened',
        `Follow-up ${task.id} has been marked as ${newStatus}.`
      );
    } catch (err: unknown) {
      toastError('Update Failed', err instanceof Error ? err.message : 'Failed to update task.');
    }
  };

  const handleCreateTask = async (dto: CreateFollowUpDto) => {
    try {
      const created = await createFollowUp(dto);
      setTasks(prev => [created, ...prev]);
      success('Follow-up Scheduled', `Task ${created.id} scheduled for ${new Date(created.dueDate).toLocaleDateString()}.`);
    } catch (err: unknown) {
      toastError('Creation Failed', err instanceof Error ? err.message : 'Failed to create task.');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterTab === 'pending' && t.status !== 'pending') return false;
      if (filterTab === 'completed' && t.status !== 'completed') return false;
      if (filterTab === 'overdue' && (!t.isOverdue || t.status === 'completed')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCase = t.caseId.toLowerCase().includes(q);
        const matchesOrder = t.orderId.toLowerCase().includes(q);
        const matchesAssignee = t.assignedTo.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCase && !matchesOrder && !matchesAssignee) return false;
      }

      return true;
    });
  }, [tasks, filterTab, searchQuery]);

  const overdueCount = tasks.filter(t => t.isOverdue && t.status === 'pending').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="follow-ups-container">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Follow-up Management</h1>
          <p className="text-muted small mb-0">
            Track automated carrier checkpoints, customer re-contacts, and team resolution tasks.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 shadow-sm"
            onClick={fetchTasks}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm fw-semibold"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={14} />
            <span>Schedule New Task</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchTasks} className="mb-3" />}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-saas p-3">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small text-muted fw-semibold">All Tasks</span>
              <CalendarCheck2 size={16} className="text-primary" />
            </div>
            <div className="fs-4 fw-bold text-dark">{tasks.length}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card-saas p-3">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small text-muted fw-semibold">Pending Checkpoints</span>
              <Clock size={16} className="text-info" />
            </div>
            <div className="fs-4 fw-bold text-primary">{pendingCount}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className={`card-saas p-3 ${overdueCount > 0 ? 'border-danger' : ''}`}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className={`small fw-bold ${overdueCount > 0 ? 'text-danger' : 'text-muted'}`}>
                Overdue Tasks
              </span>
              <AlertTriangle size={16} className={overdueCount > 0 ? 'text-danger' : 'text-muted'} />
            </div>
            <div className={`fs-4 fw-bold ${overdueCount > 0 ? 'text-danger' : 'text-dark'}`}>
              {overdueCount}
            </div>
            {overdueCount > 0 && (
              <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.68rem' }}>
                Action Required
              </span>
            )}
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card-saas p-3">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small text-muted fw-semibold">Completed</span>
              <CheckCircle2 size={16} className="text-success" />
            </div>
            <div className="fs-4 fw-bold text-success">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Tabs Filter Bar */}
      <div className="card-saas p-3 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          {/* Tabs */}
          <div className="btn-group btn-group-sm w-100 w-md-auto" role="group">
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterTab('all')}
              style={{ fontSize: '0.78rem' }}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterTab('pending')}
              style={{ fontSize: '0.78rem' }}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                filterTab === 'overdue' ? 'btn-danger' : overdueCount > 0 ? 'btn-outline-danger' : 'btn-outline-secondary'
              }`}
              onClick={() => setFilterTab('overdue')}
              style={{ fontSize: '0.78rem' }}
            >
              Overdue ({overdueCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterTab('completed')}
              style={{ fontSize: '0.78rem' }}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search */}
          <div className="position-relative w-100 w-md-auto" style={{ minWidth: '260px' }}>
            <input
              type="text"
              className="form-control form-control-sm ps-4 pe-2 py-1 bg-light border"
              placeholder="Filter tasks by case, order, description..."
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
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          <SkeletonLoader count={3} height={120} />
        </div>
      ) : (
        <FollowUpsList tasks={filteredTasks} onToggleStatus={handleToggleStatus} />
      )}

      {/* New Follow-up Modal */}
      <NewFollowUpModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        onSubmitTask={handleCreateTask}
      />
    </div>
  );
};
