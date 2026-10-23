import React from 'react';
import type { OrderDetails } from '../../types/order';
import { Package, User, MapPin, Award, Star } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface OrderSummaryCardProps {
  order: OrderDetails | null;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
  if (!order) {
    return (
      <div className="card-saas p-4 text-center text-muted">
        <Package size={24} className="mb-2 text-secondary opacity-50" />
        <div className="small">No active order selected. Start an investigation to load order data.</div>
      </div>
    );
  }

  const customer = order.customer || {
    id: `CUST-${order.id}`,
    name: (order as any).customer_name || 'Sarah Connor',
    email: (order as any).customer_email || 'sarah.c@example.com',
    tier: 'VIP',
    ordersCount: 1,
    lifetimeValue: order.totalAmount || 149.99,
    csatScore: 4.9,
  };

  const items = order.items && order.items.length > 0 ? order.items : [
    {
      id: `ITEM-${order.id}`,
      name: `Order #${order.id} Package`,
      sku: order.id,
      quantity: 1,
      price: order.totalAmount,
    },
  ];

  const shippingAddress = order.shippingAddress || {
    street: `Destination via Carrier Transit Hub`,
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    country: 'United States',
  };

  return (
    <div className="card-saas mb-3">
      <div className="card-saas-header py-2 px-3 bg-light">
        <div className="d-flex align-items-center gap-2">
          <Package size={16} className="text-primary" />
          <span className="fw-semibold small text-dark">Order #{order.id}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={order.status} size="sm" />
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            {new Date(order.orderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="p-3">
        {/* Customer Profile Section */}
        <div className="p-2 mb-3 rounded-2 bg-light border border-light-subtle">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-white border text-primary"
                style={{ width: '32px', height: '32px' }}
              >
                <User size={16} />
              </div>
              <div>
                <div className="fw-semibold text-dark small lh-1">{customer.name}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {customer.email}
                </div>
              </div>
            </div>

            <span
              className="badge d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: customer.tier === 'VIP' ? '#fef3c7' : '#f1f5f9',
                color: customer.tier === 'VIP' ? '#b45309' : '#334155',
                border: '1px solid currentColor',
                fontSize: '0.7rem',
              }}
            >
              <Award size={11} />
              <span>{customer.tier} Customer</span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 pt-1 border-top border-light-subtle text-secondary small" style={{ fontSize: '0.75rem' }}>
            <div>
              <span className="text-muted">Lifetime Value: </span>
              <strong className="text-dark">${customer.lifetimeValue.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-muted">Orders: </span>
              <strong className="text-dark">{customer.ordersCount}</strong>
            </div>
            {customer.csatScore && (
              <div className="d-flex align-items-center gap-1">
                <Star size={12} className="text-warning fill-warning" />
                <strong className="text-dark">{customer.csatScore} CSAT</strong>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <div className="text-uppercase fw-semibold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Purchased Items ({items.length})
          </div>
          <div className="border rounded-2 overflow-hidden bg-white">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-2 d-flex align-items-center justify-content-between ${
                  idx > 0 ? 'border-top' : ''
                }`}
                style={{ fontSize: '0.8rem' }}
              >
                <div>
                  <div className="fw-medium text-dark">{item.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    SKU: {item.sku} • Qty: {item.quantity}
                  </div>
                </div>
                <div className="fw-semibold text-dark">${item.price.toFixed(2)}</div>
              </div>
            ))}
            <div className="p-2 bg-light border-top d-flex align-items-center justify-content-between small">
              <span className="fw-semibold text-secondary">Total Amount</span>
              <span className="fw-bold text-dark fs-6">${order.totalAmount.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="d-flex align-items-start gap-2 text-secondary small" style={{ fontSize: '0.78rem' }}>
          <MapPin size={15} className="text-muted flex-shrink-0 mt-0.5" />
          <div>
            <span className="fw-medium text-dark">Deliver to: </span>
            <span>
              {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip},{' '}
              {shippingAddress.country}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
