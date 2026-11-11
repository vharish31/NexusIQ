import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const TrustScorePill = ({ score = 98.4, showLabel = true, size = 'md' }) => {
  const isHigh = score >= 97.0;
  const isMedium = score >= 92.0 && score < 97.0;

  let bgClass = 'bg-success-subtle text-success border-success-subtle';
  let icon = <ShieldCheck size={14} className="text-success" />;

  if (isMedium) {
    bgClass = 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
    icon = <ShieldAlert size={14} className="text-warning" />;
  } else if (!isHigh) {
    bgClass = 'bg-danger-subtle text-danger border-danger-subtle';
    icon = <ShieldAlert size={14} className="text-danger" />;
  }

  return (
    <div
      className={`d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill border fw-semibold font-mono ${bgClass}`}
      style={{ fontSize: size === 'sm' ? '0.72rem' : '0.82rem' }}
    >
      {icon}
      <span>{showLabel ? 'Trust Index: ' : ''}{score}%</span>
    </div>
  );
};

export default TrustScorePill;
