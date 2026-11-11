import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Row, Col } from 'react-bootstrap';
import {
  ShieldCheck,
  FlaskConical,
  Brain,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useWorkspace, WORKSPACES } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { setActiveWorkspace, setIsRunBenchmarkOpen, setIsUploadMeetingOpen } = useWorkspace();

  const [stats, setStats] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, benchRes, mtgRes] = await Promise.all([
        api.getPlatformStats(),
        api.getBenchmarkResults(),
        api.getMeetings()
      ]);

      setStats(statsRes.data);
      setBenchmarks(benchRes.data.slice(0, 5));
      setMeetings(mtgRes.data.slice(0, 4));
    } catch (err) {
      setError(err.message || 'Failed to load platform telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const performanceTrend = [
    { period: 'Run #890', accuracy: 94.2, trust: 95.1, latency: 420 },
    { period: 'Run #893', accuracy: 95.5, trust: 96.4, latency: 390 },
    { period: 'Run #897', accuracy: 96.1, trust: 97.0, latency: 375 },
    { period: 'Run #900', accuracy: 96.8, trust: 97.4, latency: 345 },
    { period: 'Run #902', accuracy: 97.9, trust: 98.2, latency: 330 },
    { period: 'Run #904', accuracy: 98.6, trust: 98.8, latency: 312 }
  ];

  const meetingSentimentData = [
    { department: 'Executive', positive: 84, neutral: 12, negative: 4 },
    { department: 'Engineering', positive: 76, neutral: 20, negative: 4 },
    { department: 'Product', positive: 68, neutral: 24, negative: 8 },
    { department: 'Legal', positive: 62, neutral: 32, negative: 6 }
  ];

  if (loading) {
    return <LoadingState message="Connecting to NexusAI Dual Intelligence Engine..." />;
  }

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <PageHeader
        title="AI Intelligence & Trust Platform — Unified Telemetry"
        subtitle="Cross-platform operational command center monitoring autonomous agent evaluation and executive meeting intelligence."
        badgeText="Dual Engine v2.4"
        badgeVariant="primary"
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-nexus-secondary"
          onClick={() => navigate('/')}
        >
          &larr; Agent Selection Landing
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="btn-nexus-primary"
          onClick={() => setIsRunBenchmarkOpen(true)}
        >
          <Play size={14} />
          Execute Benchmark
        </Button>
      </PageHeader>

      {/* Global Stat Cards Grid */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Model Trust Index"
            value={`${stats?.overallTrustScore}%`}
            delta={stats?.trustScoreDelta}
            deltaType="positive"
            subtitle="Verified threshold"
            icon={ShieldCheck}
            iconColor="text-success"
            iconBg="bg-success bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Agent Evals"
            value={stats?.totalAgentEvaluations}
            delta={stats?.evaluationsDelta}
            deltaType="positive"
            subtitle="Benchmark runs"
            icon={FlaskConical}
            iconColor="text-cyan"
            iconBg="bg-primary bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Hallucination Defense"
            value={`${stats?.hallucinationPreventionRate}%`}
            delta={stats?.hallucinationRateDelta}
            deltaType="positive"
            subtitle="Adversarial bounds"
            icon={Zap}
            iconColor="text-info"
            iconBg="bg-info bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Processed Meetings"
            value={stats?.processedMeetings}
            delta={stats?.meetingsDelta}
            deltaType="positive"
            subtitle="Diarized & briefed"
            icon={Brain}
            iconColor="text-purple"
            iconBg="bg-purple bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Action Items"
            value={stats?.actionItemsIdentified}
            delta={`${stats?.actionItemsCompleted} closed`}
            deltaType="neutral"
            subtitle="Jira synced"
            icon={CheckCircle2}
            iconColor="text-warning"
            iconBg="bg-warning bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4} xl={2}>
          <StatCard
            title="Agent Latency"
            value={`${stats?.avgAgentLatencyMs}ms`}
            delta={stats?.latencyDelta}
            deltaType="positive"
            subtitle="p95 SLA target"
            icon={Clock}
            iconColor="text-secondary"
            iconBg="bg-secondary bg-opacity-15"
          />
        </Col>
      </Row>

      {/* Dual Workspace Quick Cards */}
      <Row className="g-3 mb-4">
        {/* Workspace 1 Card */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100 border-start border-4 border-start-primary">
            <div className="nexus-card-body d-flex flex-column justify-content-between p-4">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-primary bg-opacity-15 text-cyan font-mono small" style={{ color: '#22D3EE' }}>
                    Workspace 1
                  </span>
                  <span className="badge-trust-verified py-0.5 px-2">
                    <ShieldCheck size={12} />
                    Active Guardrails: {stats?.activeGuardrails}
                  </span>
                </div>
                <h4 className="fw-bold text-white mb-1">AgentBench — Agent Evaluation</h4>
                <p className="text-secondary small mb-3">
                  Autonomous agent evaluation, tool invocation testing, multi-hop reasoning verification, and step-by-step trace inspection.
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Tool Calling</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Hallucination Defense</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">SQL Resilience</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">128k Long-Context</span>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-15">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-1.5"
                  onClick={() => setIsRunBenchmarkOpen(true)}
                >
                  <Play size={14} />
                  Run Suite
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none text-cyan small p-0 hover-primary d-flex align-items-center gap-1"
                  style={{ color: '#22D3EE' }}
                  onClick={() => {
                    setActiveWorkspace(WORKSPACES.AGENT_BENCH);
                    navigate('/agent-bench');
                  }}
                >
                  Open Workspace <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </Col>

        {/* Workspace 2 Card */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100 border-start border-4" style={{ borderLeftColor: '#8B5CF6 !important' }}>
            <div className="nexus-card-body d-flex flex-column justify-content-between p-4">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-purple bg-opacity-15 font-mono small" style={{ color: '#A78BFA' }}>
                    Workspace 2
                  </span>
                  <span className="badge-trust-verified py-0.5 px-2">
                    <CheckCircle2 size={12} />
                    Consensus: {stats?.decisionConsensusRate}%
                  </span>
                </div>
                <h4 className="fw-bold text-white mb-1">Meeting Intelligence & Briefings</h4>
                <p className="text-secondary small mb-3">
                  Automated pre-meeting company research, leadership verification, audio diarization, and executive action item tracking.
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Company Research</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Executive Briefing</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Decision Audits</span>
                  <span className="badge bg-secondary bg-opacity-15 text-light border border-secondary border-opacity-25">Jira Sync</span>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-15">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center gap-1.5 btn-nexus-secondary"
                  onClick={() => setIsUploadMeetingOpen(true)}
                >
                  <Brain size={14} />
                  Upload Audio
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none text-purple small p-0 hover-primary d-flex align-items-center gap-1"
                  style={{ color: '#A78BFA' }}
                  onClick={() => {
                    setActiveWorkspace(WORKSPACES.MEETING_INTEL);
                    navigate('/meeting-intelligence');
                  }}
                >
                  Open Workspace <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Analytics Visualizations */}
      <Row className="g-3 mb-4">
        {/* Model Accuracy & Trust Trend Chart */}
        <Col xs={12} lg={7}>
          <div className="nexus-card h-100">
            <div className="nexus-card-header">
              <div>
                <h6 className="fw-bold mb-0 text-white">Agent Trust & Accuracy Trajectory</h6>
                <span className="text-muted small">Consecutive evaluation runs over verified benchmarks</span>
              </div>
              <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                p95: 312ms
              </Badge>
            </div>
            <div className="nexus-card-body">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[90, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151F35', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: '#94A3B8' }} />
                    <Area
                      type="monotone"
                      name="Trust Index (%)"
                      dataKey="trust"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trustGradient)"
                    />
                    <Area
                      type="monotone"
                      name="Factual Accuracy (%)"
                      dataKey="accuracy"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#accGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        {/* Meeting Sentiment & Alignment by Department */}
        <Col xs={12} lg={5}>
          <div className="nexus-card h-100">
            <div className="nexus-card-header">
              <div>
                <h6 className="fw-bold mb-0 text-white">Meeting Alignment by Department</h6>
                <span className="text-muted small">Sentiment tone extracted from executive diarization</span>
              </div>
              <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                124 Sessions
              </Badge>
            </div>
            <div className="nexus-card-body">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meetingSentimentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="department" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151F35', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: '#94A3B8' }} />
                    <Bar name="Positive (%)" dataKey="positive" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar name="Constructive (%)" dataKey="neutral" fill="#64748B" radius={[4, 4, 0, 0]} />
                    <Bar name="Concern (%)" dataKey="negative" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
