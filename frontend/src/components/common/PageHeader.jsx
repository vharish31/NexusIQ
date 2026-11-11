import React from 'react';
import { Badge } from 'react-bootstrap';
import { useWorkspace } from '../../context/WorkspaceContext';

export const PageHeader = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'primary',
  children
}) => {
  const { workspaceMeta } = useWorkspace();

  return (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-15">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <h1 className="h3 mb-0 font-heading fw-bold text-white">{title}</h1>
          {badgeText ? (
            <Badge bg={badgeVariant} className="px-2 py-1 font-mono small">
              {badgeText}
            </Badge>
          ) : (
            <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono small">
              {workspaceMeta.badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-secondary small mb-0">
            {subtitle}
          </p>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
