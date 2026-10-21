import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import type { CreateFollowUpDto } from '../../types/followUp';
import { CalendarCheck2, Plus } from 'lucide-react';

interface NewFollowUpModalProps {
  show: boolean;
  onHide: () => void;
  onSubmitTask: (data: CreateFollowUpDto) => Promise<void>;
  defaultCaseId?: string;
  defaultOrderId?: string;
}

interface FormInputs {
  caseId: string;
  orderId: string;
  description: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo: string;
}

export const NewFollowUpModal: React.FC<NewFollowUpModalProps> = ({
  show,
  onHide,
  onSubmitTask,
  defaultCaseId = 'CASE-2026-1042',
  defaultOrderId = 'KL-1042',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      caseId: defaultCaseId,
      orderId: defaultOrderId,
      description: '',
      dueDate: '',
      priority: 'high',
      assignedTo: 'ResolveLoop AI Agent',
    },
  });

  const onFormSubmit = async (data: FormInputs) => {
    await onSubmitTask({
      caseId: data.caseId,
      orderId: data.orderId,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
      assignedTo: data.assignedTo,
    });
    reset();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-bottom bg-light">
        <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
          <CalendarCheck2 size={18} className="text-primary" />
          <span>Schedule Follow-up Task</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body className="p-3">
          <div className="row g-2 mb-2">
            <div className="col-6">
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">Case ID</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  {...register('caseId', { required: 'Case ID is required' })}
                  isInvalid={!!errors.caseId}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.caseId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-6">
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">Order ID</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  {...register('orderId', { required: 'Order ID is required' })}
                  isInvalid={!!errors.orderId}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.orderId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold text-secondary mb-1">
              Task Description & Action Goal
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g. Check tracking for Chicago ramp clearance and notify customer if delay exceeds 72h..."
              size="sm"
              {...register('description', { required: 'Description is required' })}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-2 mb-2">
            <div className="col-6">
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">Due Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  size="sm"
                  {...register('dueDate', { required: 'Due date is required' })}
                  isInvalid={!!errors.dueDate}
                />
              </Form.Group>
            </div>

            <div className="col-6">
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">Priority</Form.Label>
                <Form.Select size="sm" {...register('priority')}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-1">
            <Form.Label className="small fw-semibold text-secondary mb-1">Assigned Responder</Form.Label>
            <Form.Select size="sm" {...register('assignedTo')}>
              <option value="ResolveLoop AI Agent">ResolveLoop AI Agent (Automated Check)</option>
              <option value="Store Operations">Store Operations</option>
              <option value="Warehouse Dispatch">Warehouse Dispatch</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-top bg-light">
          <Button variant="secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting}
            className="d-inline-flex align-items-center gap-1 shadow-sm fw-medium"
          >
            <Plus size={14} />
            <span>Schedule Task</span>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
