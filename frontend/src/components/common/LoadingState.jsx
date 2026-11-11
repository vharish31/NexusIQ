import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Cpu } from 'lucide-react';

export const LoadingState = ({ message = 'Loading intelligence telemetry...', height = '260px' }) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center p-5 rounded-4 nexus-card"
      style={{ minHeight: height }}
    >
      <div className="position-relative mb-3">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
        <div className="position-absolute top-50 start-50 translate-middle">
          <Cpu size={16} className="text-cyan" style={{ color: '#22D3EE' }} />
        </div>
      </div>
      <h6 className="fw-semibold text-white mb-1">{message}</h6>
      <p className="text-muted small mb-0">Verifying neural evaluation nodes and streaming latest state...</p>
    </div>
  );
};

export default LoadingState;
