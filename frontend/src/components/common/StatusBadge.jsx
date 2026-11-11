import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  if (normalized.includes('verified') || normalized.includes('completed') || normalized.includes('ratified') || normalized.includes('ready')) {
    return (
      <span className="badge-trust-verified">
        <ShieldCheck size={13} />
        {status}
      </span>
    );
  }

  if (normalized.includes('warning') || normalized.includes('caution') || normalized.includes('vigilant')) {
    return (
      <span className="badge-trust-warning">
        <AlertTriangle size={13} />
        {status}
      </span>
    );
  }

  if (normalized.includes('fail') || normalized.includes('error') || normalized.includes('critical')) {
    return (
      <span className="badge-trust-danger">
        <AlertCircle size={13} />
        {status}
      </span>
    );
  }

  if (normalized.includes('running') || normalized.includes('progress') || normalized.includes('processing')) {
    return (
      <span className="badge-trust-info">
        <RefreshCw size={13} className="spinner-border spinner-border-sm border-0" style={{ animation: 'spin 2s linear infinite' }} />
        {status}
      </span>
    );
  }

  return (
    <span className="badge-trust-neutral">
      <Clock size={13} />
      {status}
    </span>
  );
};

export default StatusBadge;
