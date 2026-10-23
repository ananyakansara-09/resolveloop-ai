import type { CasePriority } from './case';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export interface FollowUpTask {
  id: string;
  caseId: string;
  orderId: string;
  customerName?: string;
  description: string;
  dueDate: string;
  status: FollowUpStatus;
  priority: CasePriority;
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
  isOverdue?: boolean;
}

export interface CreateFollowUpDto {
  caseId: string;
  orderId: string;
  description: string;
  dueDate: string;
  priority?: CasePriority;
  assignedTo?: string;
}
