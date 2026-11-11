import React from 'react';

export const StatCard = ({
  title,
  value,
  delta,
  deltaType = 'positive', // 'positive' | 'negative' | 'neutral'
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary bg-opacity-15',
  badgeText
}) => {
  const getDeltaBadgeClass = () => {
    if (deltaType === 'positive') return 'badge-trust-verified';
    if (deltaType === 'negative') return 'badge-trust-danger';
    return 'badge-trust-neutral';
  };

  return (
    <div className="nexus-card hover-lift h-100">
      <div className="nexus-card-body d-flex flex-column justify-content-between p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-secondary small fw-semibold text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
            {title}
          </span>
          {Icon && (
            <div
              className={`d-flex align-items-center justify-content-center rounded-3 p-2 border border-secondary border-opacity-25 ${iconBg}`}
              style={{ width: '38px', height: '38px' }}
            >
              <Icon size={19} className={iconColor} />
            </div>
          )}
        </div>

        <div>
          <div className="d-flex align-items-baseline gap-2 mb-1">
            <h2 className="display-6 fw-bold mb-0 text-white tracking-tight">{value}</h2>
            {badgeText && (
              <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono small">
                {badgeText}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            {delta && (
              <span className={`${getDeltaBadgeClass()} py-1 px-2 font-mono`}>
                {deltaType === 'positive' && <i className="bi bi-arrow-up-short"></i>}
                {deltaType === 'negative' && <i className="bi bi-arrow-down-short"></i>}
                {delta}
              </span>
            )}
            {subtitle && (
              <span className="text-muted small">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
