import React from 'react';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  height = '1.25rem',
  width = '100%',
  className = '',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`skeleton-shimmer ${className}`}
          style={{
            height,
            width,
            marginBottom: count > 1 ? '0.5rem' : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="p-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="d-flex gap-3 mb-3 align-items-center">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="flex-grow-1">
              <SkeletonLoader height={24} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
