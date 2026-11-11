import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Brain,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Cpu,
  Zap
} from 'lucide-react';
import { useWorkspace, WORKSPACES } from '../../context/WorkspaceContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspace();

  const handleSelectAgentBench = () => {
    setActiveWorkspace(WORKSPACES.AGENT_BENCH);
    navigate('/agent-bench');
  };

  const handleSelectMeetingIntelligence = () => {
    setActiveWorkspace(WORKSPACES.MEETING_INTEL);
    navigate('/meeting-intelligence');
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="landing-container">
      {/* Background Ambient Orbs */}
      <div className="ambient-glow-mesh">
        <div className="ambient-orb ambient-orb-blue" />
        <div className="ambient-orb ambient-orb-purple" />
      </div>

      {/* Top Brand Bar */}
      <header className="landing-header">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 text-white tracking-tight">NEXUSAI</span>
              <span className="pulse-green" title="Operational"></span>
            </div>
            <div className="text-secondary small text-uppercase tracking-wider" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
              AI Intelligence & Trust Platform
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-sm-flex badge-trust-verified py-1 px-3">
            <ShieldCheck size={14} />
            <span>Dual Trust Nodes Active</span>
          </div>
          <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono small">
            v2.4 Enterprise
          </span>
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
          {/* Badge Tag */}
          <motion.div variants={itemVariants} className="hero-tag">
            <Sparkles size={14} className="text-cyan" style={{ color: '#22D3EE' }} />
            <span>Next-Generation Enterprise AI Architecture</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} className="hero-headline">
            One Platform. <span className="hero-headline-gradient">Two Intelligent Agents.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="hero-subtitle">
            Evaluate AI performance. Discover business intelligence. Make smarter decisions.
          </motion.p>

          {/* ONLY TWO Prominent Interactive Agent Cards */}
          <motion.div variants={itemVariants} className="w-100">
            <div className="agent-cards-grid">
              {/* CARD 1: AGENTBENCH */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="agent-card agent-card-agentbench"
                onClick={handleSelectAgentBench}
              >
                <div>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="agent-card-icon-wrap">
                      <FlaskConical size={32} />
                    </div>
                    <span className="badge bg-primary bg-opacity-15 text-cyan border border-primary border-opacity-30 font-mono small px-2.5 py-1 rounded-pill" style={{ color: '#22D3EE' }}>
                      Workspace 1
                    </span>
                  </div>

                  <h2 className="agent-card-title">AgentBench</h2>
                  <div className="agent-card-subtitle">AI Agent Evaluation Engine</div>
                  
                  <p className="agent-card-description">
                    Benchmark, compare and discover the best-performing AI agents across rigorous tool-use, multi-hop reasoning, and safety guardrails.
                  </p>

                  <div className="agent-card-features">
                    <span className="feature-pill">Model Leaderboard</span>
                    <span className="feature-pill">Radar Capabilities</span>
                    <span className="feature-pill">Accuracy vs Latency</span>
                    <span className="feature-pill">Waterfall Traces</span>
                  </div>
                </div>

                <button className="agent-card-cta" onClick={handleSelectAgentBench}>
                  <span>Explore AgentBench</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>

              {/* CARD 2: MEETING INTELLIGENCE */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="agent-card agent-card-meeting"
                onClick={handleSelectMeetingIntelligence}
              >
                <div>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="agent-card-icon-wrap">
                      <Brain size={32} />
                    </div>
                    <span className="badge bg-purple bg-opacity-15 border border-purple border-opacity-30 font-mono small px-2.5 py-1 rounded-pill" style={{ color: '#A78BFA' }}>
                      Workspace 2
                    </span>
                  </div>

                  <h2 className="agent-card-title">Meeting Intelligence</h2>
                  <div className="agent-card-subtitle">AI Research & Briefing Agent</div>
                  
                  <p className="agent-card-description">
                    Research companies and people, discover recent developments, verify leadership changes, and generate intelligent pre-meeting briefs.
                  </p>

                  <div className="agent-card-features">
                    <span className="feature-pill">Company Research</span>
                    <span className="feature-pill">Executive Dossiers</span>
                    <span className="feature-pill">Verified Claims</span>
                    <span className="feature-pill">Audio Diarization</span>
                  </div>
                </div>

                <button className="agent-card-cta" onClick={handleSelectMeetingIntelligence}>
                  <span>Explore Meeting Intelligence</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-3 px-4 border-top border-secondary border-opacity-10 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
        <div>
          <span className="text-secondary fw-semibold">NexusAI Enterprise Platform</span> — SOC2 Type II & EU AI Act Guardrails
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="d-flex align-items-center gap-1.5 text-secondary">
            <span className="pulse-blue"></span> 98.4% Average Trust Score
          </span>
          <span className="text-muted font-mono">v2.4.0</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
