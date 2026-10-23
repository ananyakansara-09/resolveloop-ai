import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  timestamp: string;
}

interface ToastContextType {
  showToast: (title: string, message: string, variant?: ToastVariant) => void;
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = {
      id,
      title,
      message,
      variant,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const success = useCallback((title: string, message: string) => showToast(title, message, 'success'), [showToast]);
  const error = useCallback((title: string, message: string) => showToast(title, message, 'danger'), [showToast]);
  const info = useCallback((title: string, message: string) => showToast(title, message, 'info'), [showToast]);
  const warning = useCallback((title: string, message: string) => showToast(title, message, 'warning'), [showToast]);

  const getIcon = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={18} className="text-success me-2" />;
      case 'danger':
        return <AlertCircle size={18} className="text-danger me-2" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-warning me-2" />;
      default:
        return <Info size={18} className="text-primary me-2" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 9999 }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            delay={5000}
            autohide
            className="shadow-sm border-0 mb-2 bg-white"
            style={{ minWidth: '320px', borderRadius: '0.625rem' }}
          >
            <Toast.Header closeButton>
              {getIcon(toast.variant)}
              <strong className="me-auto text-dark">{toast.title}</strong>
              <small className="text-muted">{toast.timestamp}</small>
            </Toast.Header>
            <Toast.Body className="text-secondary small">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
