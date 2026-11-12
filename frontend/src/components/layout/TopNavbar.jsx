import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import {
  Menu,
  Search,
  FlaskConical,
  Brain,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Play
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setIsSearchOpen,
    setIsRunBenchmarkOpen,
    setIsPreMeetingResearchOpen,
    setMobileSidebarOpen
  } = useWorkspace();

  const [liveTrustScore, setLiveTrustScore] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getPlatformStats()
      .then((res) => {
        if (mounted && res?.data) {
          setLiveTrustScore(res.data.overallTrustScore);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const isAgentBench = location.pathname.startsWith('/agent-bench') ||
                       location.pathname.startsWith('/benchmark-results') ||
                       location.pathname.startsWith('/agent-trace');

  const isMeeting = location.pathname.startsWith('/meeting-intelligence') ||
                    location.pathname.startsWith('/briefing-results');

  const handleBackToAgents = () => {
    navigate('/');
  };

  return (
    <header className="top-navbar justify-content-between">
      {/* Left side: Mobile Toggle & Back to Agents & Workspace Tag */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-dark border border-secondary border-opacity-25 d-md-none text-light p-1.5"
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          aria-label="Toggle Mobile Menu"
        >
          <Menu size={18} />
        </button>

        {/* Back to Agents button */}
        <button
          className="btn-back-to-agents"
          onClick={handleBackToAgents}
          title="Return to Landing Page & Agent Selection"
        >
          <ArrowLeft size={15} />
          <span className="d-none d-sm-inline">Back to Agents</span>
        </button>

        {/* Active Agent Badge */}
        <div className="d-flex align-items-center gap-2">
          {isAgentBench ? (
            <div className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-primary bg-opacity-15 border border-primary border-opacity-30">
              <FlaskConical size={14} className="text-cyan" style={{ color: '#22D3EE' }} />
              <span className="fw-bold small text-white">AgentBench</span>
              <span className="text-muted small d-none d-lg-inline">— AI Agent Evaluation</span>
            </div>
          ) : isMeeting ? (
            <div className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-purple bg-opacity-15 border border-purple border-opacity-30" style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
              <Brain size={14} className="text-purple" style={{ color: '#A78BFA' }} />
              <span className="fw-bold small text-white">Meeting Intelligence</span>
              <span className="text-muted small d-none d-lg-inline">— Pre-Meeting Research</span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-secondary bg-opacity-15 border border-secondary border-opacity-30">
              <LayoutDashboard size={14} className="text-info" />
              <span className="fw-bold small text-white">NexusIQ Overview</span>
              <span className="text-muted small d-none d-lg-inline">— Unified Telemetry</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Quick Search Trigger */}
      <div className="d-none d-xl-flex align-items-center flex-grow-1 mx-4" style={{ maxWidth: '380px' }}>
        <button
          className="btn btn-dark border border-secondary border-opacity-25 w-100 text-start text-muted d-flex align-items-center justify-content-between px-3 py-1.5 rounded-3 bg-secondary bg-opacity-10"
          onClick={() => setIsSearchOpen(true)}
          style={{ fontSize: '0.85rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <Search size={15} />
            <span>Search models, dossiers, traces...</span>
          </div>
          <kbd className="bg-dark border border-secondary border-opacity-25 text-light px-1.5 py-0.5 rounded font-mono" style={{ fontSize: '0.7rem' }}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Trust Pill, Actions, Notifications, Profile */}
      <div className="d-flex align-items-center gap-2.5">
        {/* Mobile Search Button */}
        <button
          className="btn btn-sm btn-dark border border-secondary border-opacity-25 d-xl-none p-1.5 rounded-3 text-muted"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={16} />
        </button>

        {/* Global Trust Score Pill */}
        <div className="d-none d-sm-flex badge-trust-verified py-1 px-2.5">
          <ShieldCheck size={14} />
          <span>
            {liveTrustScore !== null && liveTrustScore > 0
              ? `Trust Score: ${liveTrustScore}%`
              : 'Trust Engine Live'}
          </span>
        </div>

        {/* Workspace-Specific Primary Action */}
        {isAgentBench ? (
          <Button
            variant="primary"
            className="btn-nexus-primary py-1.5 px-3 rounded-3"
            onClick={() => setIsRunBenchmarkOpen(true)}
          >
            <Play size={15} />
            <span className="d-none d-md-inline">Run Benchmark</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            className="btn-nexus-purple py-1.5 px-3 rounded-3"
            onClick={() => {
              if (location.pathname !== '/meeting-intelligence') {
                navigate('/meeting-intelligence');
              }
              setIsPreMeetingResearchOpen(true);
            }}
          >
            <Search size={15} />
            <span className="d-none d-md-inline">Research Company</span>
          </Button>
        )}

        {/* User Profile */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="dark"
            className="d-flex align-items-center gap-2 p-1 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50"
            id="user-profile-dropdown"
          >
            <div
              className="rounded-2 fw-bold d-flex align-items-center justify-content-center text-white"
              style={{
                width: '30px',
                height: '30px',
                fontSize: '0.72rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
              }}
            >
              NQ
            </div>
            <ChevronDown size={13} className="text-muted d-none d-sm-inline" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg border p-1" style={{ minWidth: '220px' }}>
            <div className="px-3 py-2 border-bottom border-secondary border-opacity-25">
              <div className="fw-bold text-white small">NexusIQ Workspace</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>AI Benchmarking & Intelligence</div>
            </div>
            <Dropdown.Item onClick={() => navigate('/')} className="small py-2 px-3 d-flex align-items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span>Landing Page & Agents</span>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/dashboard')} className="small py-2 px-3 d-flex align-items-center gap-2">
              <LayoutDashboard size={14} className="text-info" />
              <span>Overview Dashboard</span>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/agent-bench')} className="small py-2 px-3 d-flex align-items-center gap-2">
              <FlaskConical size={14} className="text-cyan" />
              <span>AgentBench Workspace</span>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/meeting-intelligence')} className="small py-2 px-3 d-flex align-items-center gap-2">
              <Brain size={14} className="text-purple" />
              <span>Meeting Intelligence</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleBackToAgents} className="small py-2 px-3 d-flex align-items-center gap-2 text-danger">
              <LogOut size={14} />
              <span>Switch / Exit Workspace</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopNavbar;
