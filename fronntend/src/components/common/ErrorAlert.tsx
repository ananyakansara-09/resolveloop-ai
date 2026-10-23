import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <Alert variant="danger" className={`d-flex align-items-start gap-3 border-danger-subtle ${className}`}>
      <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-1" />
      <div className="flex-grow-1">
        <Alert.Heading as="h6" className="fw-semibold mb-1 text-danger">
          {title}
        </Alert.Heading>
        <p className="mb-0 small text-danger-emphasis">{message}</p>
        {onRetry && (
          <Button
            variant="outline-danger"
            size="sm"
            className="mt-2 d-inline-flex align-items-center gap-1"
            onClick={onRetry}
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </Alert>
  );
};
