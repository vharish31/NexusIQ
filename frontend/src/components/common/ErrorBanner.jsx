import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { AlertOctagon, RotateCw } from 'lucide-react';

export const ErrorBanner = ({
  message = 'Failed to synchronize with Nexus verification nodes.',
  details,
  onRetry
}) => {
  return (
    <Alert variant="danger" className="border-danger-subtle bg-danger-subtle text-danger-emphasis d-flex align-items-center justify-content-between p-3 rounded-3 mb-4">
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-circle p-2 bg-white text-danger shadow-sm">
          <AlertOctagon size={20} />
        </div>
        <div>
          <div className="fw-bold">{message}</div>
          {details && <div className="small text-danger opacity-75">{details}</div>}
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline-danger"
          size="sm"
          className="d-flex align-items-center gap-1.5 fw-semibold px-3"
          onClick={onRetry}
        >
          <RotateCw size={14} />
          Retry Connection
        </Button>
      )}
    </Alert>
  );
};

export default ErrorBanner;
