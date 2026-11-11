import React from 'react';
import { Button } from 'react-bootstrap';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active records matching your criteria in this workspace.',
  actionLabel,
  onAction,
  height = '320px'
}) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center p-5 rounded-4 nexus-card"
      style={{ minHeight: height }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded-circle mb-3 p-3 bg-secondary bg-opacity-15 border border-secondary border-opacity-25 text-secondary"
        style={{ width: '64px', height: '64px' }}
      >
        <Icon size={30} />
      </div>
      <h5 className="fw-bold text-white mb-1">{title}</h5>
      <p className="text-muted small mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && (
        <Button variant="primary" className="btn-nexus-primary" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
