import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Brain,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Database,
  LayoutDashboard,
  Globe,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace, WORKSPACES } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspace();

  const [telemetry, setTelemetry] = useState({
    apiOnline: false,
    firestoreConnected: false,
    projectId: 'nexusiq-2fe97',
    trustScore: null,
    totalEvals: 0,
    totalDossiers: 0
  });

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.getHealth(),
      api.getFirebaseHealth(),
      api.getPlatformStats()
    ]).then(([healthRes, fbRes, statsRes]) => {
      if (!mounted) return;
      const apiOk = healthRes.status === 'fulfilled' && healthRes.value?.status === 'healthy';
      const fbConnected = fbRes.status === 'fulfilled' && Boolean(fbRes.value?.connected);
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value?.data : null;

      setTelemetry({
        apiOnline: apiOk,
        firestoreConnected: fbConnected,
        projectId: fbRes.status === 'fulfilled' ? (fbRes.value?.project_id || 'nexusiq-2fe97') : 'nexusiq-2fe97',
        trustScore: statsData?.overallTrustScore ?? null,
        totalEvals: statsData?.totalAgentEvaluations ?? 0,
        totalDossiers: statsData?.processedMeetings ?? 0
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectAgentBench = () => {
    setActiveWorkspace(WORKSPACES.AGENT_BENCH);
    navigate('/agent-bench');
  };

  const handleSelectMeetingIntelligence = () => {
    setActiveWorkspace(WORKSPACES.MEETING_INTEL);
    navigate('/meeting-intelligence');
  };

  const handleOpenDashboard = () => {
    setActiveWorkspace(WORKSPACES.ALL);
    navigate('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="landing-container">
      <div className="ambient-glow-mesh">
        <div className="ambient-orb ambient-orb-blue" />
        <div className="ambient-orb ambient-orb-purple" />
      </div>

      {/* Top Brand Bar */}
      <header className="landing-header">
        <div className="d-flex align-items-center gap-3">
          <img
            src="/icon-192.png"
            alt="NexusIQ Logo"
            className="rounded-3 shadow-sm flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              objectFit: 'cover',
              border: '1px solid rgba(56, 189, 248, 0.35)'
            }}
          />
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 text-white tracking-tight">NEXUSIQ</span>
              <span className={telemetry.apiOnline ? 'pulse-green' : 'pulse-blue'} title={telemetry.apiOnline ? 'Backend API Connected' : 'Connecting'}></span>
            </div>
            <div className="text-secondary small text-uppercase tracking-wider" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
              AI Benchmarking & Pre-Meeting Intelligence
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2.5 flex-wrap">
          <div className="d-none d-md-flex badge-trust-verified py-1.5 px-3">
            <ShieldCheck size={14} />
            <span>
              {telemetry.trustScore !== null && telemetry.trustScore > 0
                ? `Verified Trust Avg: ${telemetry.trustScore}%`
                : 'Trust Verification Engine Active'}
            </span>
          </div>
          <button
            type="button"
            className="btn-nexus-secondary py-1.5 px-3"
            onClick={handleOpenDashboard}
          >
            <LayoutDashboard size={15} />
            <span>Overview Dashboard</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="d-flex flex-column align-items-center"
        >
          <motion.div variants={itemVariants} className="hero-tag">
            <Sparkles size={14} className="text-cyan" style={{ color: '#22D3EE' }} />
            <span>Unified Evaluation & Intelligence Platform</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="hero-headline">
            Benchmark Agents. <span className="hero-headline-gradient">Master Every Meeting.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-subtitle mb-4">
            Empirical FEVER & FEVEROUS agent evaluation paired with live Tavily-grounded pre-meeting intelligence and Firebase Firestore observability.
          </motion.p>

          {/* Live Platform Telemetry Strip */}
          <motion.div variants={itemVariants} className="telemetry-strip">
            <span className="telemetry-pill">
              <Database size={14} className={telemetry.firestoreConnected ? 'text-success' : 'text-info'} />
              <span>
                Firestore:{' '}
                <strong className="text-white">
                  {telemetry.firestoreConnected ? `${telemetry.projectId} Connected` : 'Checking...'}
                </strong>
              </span>
            </span>

            <span className="telemetry-pill">
              <Cpu size={14} style={{ color: '#22D3EE' }} />
              <span>
                Datasets: <strong className="text-white font-mono">216,740</strong> Vectors
              </span>
            </span>

            <span className="telemetry-pill">
              <Globe size={14} style={{ color: '#A78BFA' }} />
              <span>
                Bifrost Gateway + <strong className="text-white">Tavily Search</strong>
              </span>
            </span>
          </motion.div>

          {/* Two Interactive Workspace Cards */}
          <motion.div variants={itemVariants} className="w-100">
            <div className="agent-cards-grid">
              {/* CARD 1: AGENTBENCH */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="agent-card agent-card-agentbench"
                onClick={handleSelectAgentBench}
              >
                <div>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="agent-card-icon-wrap">
                      <FlaskConical size={30} />
                    </div>
                    <span className="badge bg-primary bg-opacity-15 text-cyan border border-primary border-opacity-30 font-mono small px-2.5 py-1 rounded-pill" style={{ color: '#22D3EE' }}>
                      Workspace 1
                    </span>
                  </div>

                  <h2 className="agent-card-title">AgentBench</h2>
                  <div className="agent-card-subtitle">AI Agent Evaluation Engine</div>

                  <p className="agent-card-description mb-3">
                    Benchmark models via Bifrost AI Gateway against stratified FEVER & FEVEROUS datasets, track accuracy vs. latency, and inspect step-by-step execution traces.
                  </p>

                  <div className="metric-callout-grid">
                    <div className="metric-callout">
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>FEVER + FEVEROUS</div>
                      <div className="fw-bold text-white font-mono">216,740 Claims</div>
                    </div>
                    <div className="metric-callout">
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Logged Evaluations</div>
                      <div className="fw-bold text-white font-mono">{telemetry.totalEvals} Runs</div>
                    </div>
                  </div>

                  <div className="agent-card-features mb-4">
                    <span className="feature-pill">FEVER & FEVEROUS</span>
                    <span className="feature-pill">Bifrost Gateway</span>
                    <span className="feature-pill">Leaderboard & Radar</span>
                    <span className="feature-pill">Execution Traces</span>
                  </div>
                </div>

                <button type="button" className="agent-card-cta" onClick={handleSelectAgentBench}>
                  <span>Launch AgentBench</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>

              {/* CARD 2: MEETING INTELLIGENCE */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="agent-card agent-card-meeting"
                onClick={handleSelectMeetingIntelligence}
              >
                <div>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="agent-card-icon-wrap">
                      <Brain size={30} />
                    </div>
                    <span className="badge bg-purple bg-opacity-15 border border-purple border-opacity-30 font-mono small px-2.5 py-1 rounded-pill" style={{ color: '#A78BFA' }}>
                      Workspace 2
                    </span>
                  </div>

                  <h2 className="agent-card-title">Meeting Intelligence</h2>
                  <div className="agent-card-subtitle">Pre-Meeting Research & Briefing Agent</div>

                  <p className="agent-card-description mb-3">
                    Research target companies and executives using live Tavily web intelligence, validate every assertion with the Trust Engine, and persist verified dossiers to Firestore.
                  </p>

                  <div className="metric-callout-grid">
                    <div className="metric-callout">
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Verification Method</div>
                      <div className="fw-bold text-white d-flex align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
                        <CheckCircle2 size={14} className="text-success" /> Source Grounded
                      </div>
                    </div>
                    <div className="metric-callout">
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Saved Briefings</div>
                      <div className="fw-bold text-white font-mono">{telemetry.totalDossiers} Dossiers</div>
                    </div>
                  </div>

                  <div className="agent-card-features mb-4">
                    <span className="feature-pill">Tavily Web Intel</span>
                    <span className="feature-pill">Trust Score Audit</span>
                    <span className="feature-pill">Citation Links</span>
                    <span className="feature-pill">Action Tracking</span>
                  </div>
                </div>

                <button type="button" className="agent-card-cta" onClick={handleSelectMeetingIntelligence}>
                  <span>Open Meeting Intelligence</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-top border-secondary border-opacity-10 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
        <div>
          <span className="text-secondary fw-semibold">NexusIQ Platform</span> — FastAPI + Firebase Firestore + Bifrost + Tavily
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="d-flex align-items-center gap-1.5 text-secondary">
            <span className={telemetry.apiOnline ? 'pulse-green' : 'pulse-blue'}></span>
            {telemetry.apiOnline ? 'Backend API Online' : 'Start backend on :8000'}
          </span>
          <span className="text-muted font-mono">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
