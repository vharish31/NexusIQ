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

  const performanceTrend = stats?.performanceTrend || [];

  const meetingSentimentData = meetings.length
    ? meetings.map((m) => ({
        department: m.department || 'General',
        positive: m.sentimentScore || 0,
        neutral: Math.max(0, 100 - (m.sentimentScore || 0)),
        negative: 0
      }))
    : [];

  if (loading) {
    return <LoadingState message="Connecting to NexusAI Dual Intelligence Engine..." />;
  }

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <PageHeader
        title="NexusIQ Platform — Unified Telemetry"
        subtitle="Cross-platform operational command center monitoring autonomous agent evaluation and executive meeting intelligence."
        badgeText="Live Engine"
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
        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Model Trust Index"
            value={`${stats?.overallTrustScore || 0}%`}
            delta={stats?.trustScoreDelta}
            deltaType="positive"
            subtitle="Verified threshold"
            icon={ShieldCheck}
            iconColor="text-success"
            iconBg="bg-success bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Agent Evals"
            value={stats?.totalAgentEvaluations || 0}
            delta={stats?.evaluationsDelta}
            deltaType="positive"
            subtitle="Benchmark runs"
            icon={FlaskConical}
            iconColor="text-cyan"
            iconBg="bg-primary bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Hallucination Defense"
            value={`${stats?.hallucinationPreventionRate || 0}%`}
            delta={stats?.hallucinationRateDelta}
            deltaType="positive"
            subtitle="Groundedness avg"
            icon={Zap}
            iconColor="text-info"
            iconBg="bg-info bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Meetings & Briefings"
            value={stats?.processedMeetings || 0}
            delta={stats?.meetingsDelta}
            deltaType="positive"
            subtitle="Firestore persisted"
            icon={Brain}
            iconColor="text-purple"
            iconBg="bg-purple bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Action Items"
            value={stats?.actionItemsIdentified || 0}
            delta={`${stats?.actionItemsCompleted || 0} closed`}
            deltaType="neutral"
            subtitle="Tracked tasks"
            icon={CheckCircle2}
            iconColor="text-warning"
            iconBg="bg-warning bg-opacity-15"
          />
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <StatCard
            title="Agent Latency"
            value={`${stats?.avgAgentLatencyMs || 0}ms`}
            delta={stats?.latencyDelta}
            deltaType="positive"
            subtitle="Observed p95"
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
                    Saved Briefings: {stats?.processedMeetings || 0}
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
                p95: {stats?.avgAgentLatencyMs || 0}ms
              </Badge>
            </div>
            <div className="nexus-card-body">
              <div style={{ width: '100%', height: 260 }}>
                {performanceTrend.length > 0 ? (
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
                      <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
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
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                    Run a benchmark in AgentBench to plot live trust and accuracy trajectories.
                  </div>
                )}
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
                {stats?.processedMeetings || 0} Sessions
              </Badge>
            </div>
            <div className="nexus-card-body">
              <div style={{ width: '100%', height: 260 }}>
                {meetingSentimentData.length > 0 ? (
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
                ) : (
                  <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                    Ingest a meeting record to analyze department alignment metrics.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
