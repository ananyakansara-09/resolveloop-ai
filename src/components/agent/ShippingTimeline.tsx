import React from 'react';
import type { ShippingDetails } from '../../types/shipping';
import { Truck, AlertTriangle, ExternalLink, Calendar, MapPin, Check } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface ShippingTimelineProps {
  shipping: ShippingDetails | null;
}

export const ShippingTimeline: React.FC<ShippingTimelineProps> = ({ shipping }) => {
  if (!shipping) {
    return (
      <div className="card-saas p-4 text-center text-muted">
        <Truck size={24} className="mb-2 text-secondary opacity-50" />
        <div className="small">Carrier telemetry will display once an order investigation runs.</div>
      </div>
    );
  }

  const hasException = shipping.events.some(e => e.exception);

  return (
    <div className="card-saas mb-3">
      <div className="card-saas-header py-2 px-3 bg-light d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Truck size={16} className="text-primary" />
          <span className="fw-semibold small text-dark">Carrier Telemetry & Tracking</span>
        </div>
        <StatusBadge status={shipping.status} size="sm" />
      </div>

      <div className="p-3">
        {/* Carrier Header Info */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 mb-3 bg-light rounded-2 border border-light-subtle small">
          <div>
            <div className="fw-semibold text-dark">{shipping.carrier}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              Service: {shipping.serviceLevel}
            </div>
          </div>

          <div className="text-end">
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>Tracking:</span>
              <a
                href={`https://track.fedex.com/${shipping.trackingNumber}`}
                target="_blank"
                rel="noreferrer"
                className="fw-semibold text-primary d-inline-flex align-items-center gap-1 text-decoration-none"
                style={{ fontSize: '0.78rem' }}
              >
                <span>{shipping.trackingNumber}</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              Current Hub: <span className="text-dark fw-medium">{shipping.currentLocation}</span>
            </div>
          </div>
        </div>

        {/* ETA Alert Banner */}
        <div
          className={`p-2 rounded-2 mb-3 d-flex align-items-center gap-2 ${
            hasException ? 'bg-danger-subtle border border-danger-subtle text-danger-emphasis' : 'bg-light text-secondary'
          }`}
          style={{ fontSize: '0.8rem' }}
        >
          {hasException ? (
            <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          ) : (
            <Calendar size={16} className="text-primary flex-shrink-0" />
          )}
          <div>
            <div>
              <strong>Est. Delivery: </strong>
              <span>
                {new Date(shipping.estimatedDelivery).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {shipping.delayHours && (
                <span className="badge bg-danger text-white ms-2" style={{ fontSize: '0.68rem' }}>
                  Delayed ~{shipping.delayHours}h
                </span>
              )}
            </div>
            {shipping.originalEstimatedDelivery && (
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                Original SLA delivery date was:{' '}
                {new Date(shipping.originalEstimatedDelivery).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stepper Events */}
        <div className="mt-3">
          <div className="text-uppercase fw-semibold text-muted mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Tracking Events Trail
          </div>

          <div className="ps-1">
            {shipping.events.map((evt) => (
              <div key={evt.id} className="shipping-step">
                <div
                  className={`shipping-step-node ${
                    evt.exception ? 'exception' : evt.status === 'Delivered' ? 'completed' : ''
                  }`}
                >
                  {evt.exception ? (
                    <AlertTriangle size={10} />
                  ) : evt.status === 'Delivered' ? (
                    <Check size={10} />
                  ) : (
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-accent)',
                      }}
                    />
                  )}
                </div>

                <div className="d-flex flex-column" style={{ fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className={`fw-semibold ${evt.exception ? 'text-danger' : 'text-dark'}`}>
                      {evt.status}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {new Date(evt.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-secondary small mt-0.5">{evt.description}</div>

                  <div className="text-muted d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
                    <MapPin size={11} />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
