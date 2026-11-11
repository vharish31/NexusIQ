import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Sparkles } from 'lucide-react';

const ROUTE_LABELS = {
  '': 'Agents',
  'agent-bench': 'AgentBench',
  'benchmark-results': 'Benchmark Results',
  'agent-trace': 'Agent Trace',
  'meeting-intelligence': 'Meeting Intelligence',
  'briefing-results': 'Briefing Results',
  'dashboard': 'Platform Overview'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0 align-items-center" style={{ fontSize: '0.8rem' }}>
        <li className="breadcrumb-item d-flex align-items-center">
          <Link to="/" className="text-decoration-none text-muted d-flex align-items-center gap-1 hover-primary">
            <Sparkles size={13} className="text-primary" />
            <span>NexusAI</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[value] || value;

          return isLast ? (
            <li key={to} className="breadcrumb-item active text-white fw-semibold d-flex align-items-center gap-1" aria-current="page">
              <ChevronRight size={12} className="text-muted" />
              <span>{label}</span>
            </li>
          ) : (
            <li key={to} className="breadcrumb-item d-flex align-items-center gap-1">
              <ChevronRight size={12} className="text-muted" />
              <Link to={to} className="text-decoration-none text-muted hover-primary">
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
