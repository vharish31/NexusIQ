import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  BarChart3,
  Activity,
  Brain,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useWorkspace, WORKSPACES } from '../../context/WorkspaceContext';

export const Sidebar = () => {
  const {
    activeWorkspace,
    setActiveWorkspace,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setIsRegisterAgentOpen
  } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect active workspace based on current pathname
  const isAgentBench = location.pathname.startsWith('/agent-bench') ||
                       location.pathname.startsWith('/benchmark-results') ||
                       location.pathname.startsWith('/agent-trace');

  const isMeeting = location.pathname.startsWith('/meeting-intelligence') ||
                    location.pathname.startsWith('/briefing-results');

  const closeMobile = () => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const handleBackToAgents = () => {
    closeMobile();
    navigate('/');
  };

  const handleSwitchWorkspace = (targetWorkspace) => {
    setActiveWorkspace(targetWorkspace);
    closeMobile();
    if (targetWorkspace === WORKSPACES.AGENT_BENCH) {
      navigate('/agent-bench');
    } else {
      navigate('/meeting-intelligence');
    }
  };

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
        mobileSidebarOpen ? 'mobile-open' : ''
      } ${isAgentBench ? 'workspace-agentbench' : 'workspace-meeting'}`}
    >
      {/* Brand & Back to Agents Button */}
      <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex flex-column gap-2" style={{ minHeight: '80px' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: isAgentBench
                  ? 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
              }}
            >
              {isAgentBench ? <FlaskConical size={18} /> : <Brain size={18} />}
            </div>
            {!sidebarCollapsed && (
              <div className="text-truncate">
                <div className="fw-bold text-white fs-6 d-flex align-items-center gap-1.5">
                  <span>{isAgentBench ? 'AgentBench' : 'Meeting Intel'}</span>
                  <span className="pulse-green"></span>
                </div>
                <div className="text-muted small text-truncate" style={{ fontSize: '0.68rem' }}>
                  {isAgentBench ? 'AI Agent Evaluation' : 'Research & Briefings'}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-sm btn-link text-muted p-1 d-none d-md-flex align-items-center justify-content-center"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ width: '28px', height: '28px' }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Visible Back to Agents button */}
        {!sidebarCollapsed ? (
          <button
            className="btn-back-to-agents w-100 justify-content-between mt-1"
            onClick={handleBackToAgents}
            title="Return to Landing Page & Agent Selection"
          >
            <span className="d-flex align-items-center gap-1.5">
              <ArrowLeft size={14} />
              <span>Back to Agents</span>
            </span>
            <span className="badge bg-secondary bg-opacity-25 text-light font-mono" style={{ fontSize: '0.65rem' }}>
              Home
            </span>
          </button>
        ) : (
          <button
            className="btn btn-sm btn-dark border border-secondary border-opacity-25 p-1 text-muted d-flex align-items-center justify-content-center mx-auto"
            onClick={handleBackToAgents}
            title="Back to Agents"
            style={{ width: '32px', height: '32px' }}
          >
            <ArrowLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-grow-1 overflow-y-auto">
        {/* AgentBench Dedicated Navigation */}
        {isAgentBench && (
          <div>
            {!sidebarCollapsed && (
              <div className="d-flex align-items-center justify-content-between px-2 mb-2">
                <span className="text-uppercase small fw-bold text-muted tracking-wider" style={{ fontSize: '0.68rem', color: '#22D3EE !important' }}>
                  AgentBench Engine
                </span>
                <span className="badge bg-primary bg-opacity-15 text-cyan font-mono" style={{ fontSize: '0.62rem', color: '#22D3EE' }}>
                  W1
                </span>
              </div>
            )}

            <NavLink
              to="/agent-bench"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
              title="AgentBench Suite Runner"
            >
              <FlaskConical size={18} />
              {!sidebarCollapsed && <span>Suite Runner</span>}
            </NavLink>

            <NavLink
              to="/benchmark-results"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
              title="Model Performance Leaderboard & Radar"
            >
              <BarChart3 size={18} />
              {!sidebarCollapsed && <span>Benchmark Results</span>}
            </NavLink>

            <NavLink
              to="/agent-trace"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
              title="Step-by-Step Execution Traces"
            >
              <Activity size={18} />
              {!sidebarCollapsed && <span>Agent Trace</span>}
            </NavLink>

            {/* Quick Switcher to Meeting Intelligence */}
            {!sidebarCollapsed && (
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                <div className="text-uppercase small fw-bold text-muted px-2 mb-2" style={{ fontSize: '0.65rem' }}>
                  Switch Workspace
                </div>
                <button
                  className="sidebar-link w-100 text-start border-0 bg-transparent text-secondary hover-lift"
                  onClick={() => handleSwitchWorkspace(WORKSPACES.MEETING_INTEL)}
                >
                  <Brain size={18} className="text-purple" style={{ color: '#A78BFA' }} />
                  <div className="text-truncate">
                    <div className="text-white small fw-semibold">Meeting Intelligence</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Pre-meeting research agent</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Meeting Intelligence Dedicated Navigation */}
        {isMeeting && (
          <div>
            {!sidebarCollapsed && (
              <div className="d-flex align-items-center justify-content-between px-2 mb-2">
                <span className="text-uppercase small fw-bold tracking-wider" style={{ fontSize: '0.68rem', color: '#A78BFA' }}>
                  Meeting Intelligence
                </span>
                <span className="badge bg-purple bg-opacity-15 font-mono" style={{ fontSize: '0.62rem', color: '#A78BFA' }}>
                  W2
                </span>
              </div>
            )}

            <NavLink
              to="/meeting-intelligence"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
              title="Pre-Meeting Research & Dossiers"
            >
              <Search size={18} />
              {!sidebarCollapsed && <span>Pre-Meeting Research</span>}
            </NavLink>

            <NavLink
              to="/briefing-results"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
              title="Executive Briefings & Action Center"
            >
              <FileText size={18} />
              {!sidebarCollapsed && <span>Briefing & Actions</span>}
            </NavLink>

            {/* Quick Switcher to AgentBench */}
            {!sidebarCollapsed && (
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                <div className="text-uppercase small fw-bold text-muted px-2 mb-2" style={{ fontSize: '0.65rem' }}>
                  Switch Workspace
                </div>
                <button
                  className="sidebar-link w-100 text-start border-0 bg-transparent text-secondary hover-lift"
                  onClick={() => handleSwitchWorkspace(WORKSPACES.AGENT_BENCH)}
                >
                  <FlaskConical size={18} className="text-cyan" style={{ color: '#22D3EE' }} />
                  <div className="text-truncate">
                    <div className="text-white small fw-semibold">AgentBench</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>AI Agent evaluation engine</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Verification Status */}
      <div className="p-3 border-top border-secondary border-opacity-10 bg-dark bg-opacity-40">
        {!sidebarCollapsed ? (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-1.5">
              <span className="badge-trust-verified py-0.5 px-2" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} />
                Trust Verified
              </span>
              <span className="text-white font-mono small fw-bold">
                98.4%
              </span>
            </div>
            <div className="text-muted small d-flex align-items-center justify-content-between" style={{ fontSize: '0.74rem' }}>
              <span>Verification Node</span>
              <span className="text-success fw-medium">Operational</span>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-center">
            <ShieldCheck size={18} className="text-success" title="Trust Verified 98.4%" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
