import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  Zap,
  TrendingUp,
  Download,
  Filter,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  Award,
  CheckCircle2,
  Clock,
  FlaskConical
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid
} from 'recharts';

import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import ErrorBanner from '../../components/common/ErrorBanner';
import api from '../../services/api';

export const BenchmarkResultsPage = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [models, setModels] = useState([]);
  const [suites, setSuites] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedSuite, setSelectedSuite] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Drilldown modal
  const [activeDrilldown, setActiveDrilldown] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, modelRes, suiteRes] = await Promise.all([
        api.getBenchmarkResults({
          modelId: selectedModel,
          suiteId: selectedSuite,
          status: selectedStatus
        }),
        api.getModels(),
        api.getBenchmarkSuites()
      ]);
      setResults(res.data || []);
      setRadarData(res.radarData || []);
      setScatterData(res.scatterData || []);
      setModels(modelRes.data || []);
      setSuites(suiteRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load benchmark results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedModel, selectedSuite, selectedStatus]);

  const topTrustRun = results.length
    ? [...results].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))[0]
    : null;
  const topAccuracyRun = results.length
    ? [...results].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]
    : null;
  const fastestRun = results.length
    ? [...results].sort((a, b) => (a.latencyP95 || 0) - (b.latencyP95 || 0))[0]
    : null;

  // Table columns definition
  const columns = [
    {
      key: 'id',
      label: 'Run ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono fw-bold text-white">{val}</span>
          <div className="text-muted small" style={{ fontSize: '0.70rem' }}>
            {row.runTimestamp}
          </div>
        </div>
      )
    },
    {
      key: 'modelName',
      label: 'Model Evaluated',
      sortable: true,
      render: (val) => (
        <span className="fw-semibold text-white">{val}</span>
      )
    },
    {
      key: 'suiteName',
      label: 'Suite Tested',
      sortable: true,
      render: (val) => (
        <span className="text-secondary small">{val}</span>
      )
    },
    {
      key: 'trustScore',
      label: 'Trust Score',
      sortable: true,
      render: (val) => (
        <span className="badge-trust-verified py-0.5 px-2 font-mono">
          <ShieldCheck size={12} /> {val}%
        </span>
      )
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-white fw-bold">{val}%</span>
      )
    },
    {
      key: 'latencyP95',
      label: 'p95 Latency',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-secondary small">{val}ms</span>
      )
    },
    {
      key: 'costPer1k',
      label: 'Cost / 1k',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-muted small">${val.toFixed(4)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="sm" />
    },
    {
      key: 'actions',
      label: 'Details',
      render: (_, row) => (
        <Button
          variant="outline-secondary"
          size="sm"
          className="p-1 px-2.5 small text-cyan fw-medium border-secondary border-opacity-25"
          style={{ color: '#22D3EE' }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveDrilldown(row);
          }}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="workspace-agentbench">
      {error && <ErrorBanner message={error} onRetry={fetchResults} />}

      <PageHeader
        title="Model Performance Leaderboard & Empirical Analytics"
        subtitle="Independent comparative benchmarks evaluating frontier and sovereign models under adversarial constraints."
        badgeText="Workspace 1"
        badgeVariant="primary"
      >
        <Button
          variant="primary"
          size="sm"
          className="btn-nexus-primary"
          onClick={() => navigate('/agent-bench')}
        >
          <FlaskConical size={14} />
          Execute Benchmark
        </Button>
      </PageHeader>

      {/* Leaderboard Highlight Pods */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <div className="nexus-card h-100 border-start border-4 border-start-primary">
            <div className="nexus-card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small text-muted fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Top Trust Index
                </span>
                <Award size={18} className="text-cyan" style={{ color: '#22D3EE' }} />
              </div>
              <h5 className="fw-bold mb-1 text-white">{topTrustRun ? topTrustRun.modelName : 'No Runs Yet'}</h5>
              <div className="d-flex align-items-center gap-2 small">
                <span className="badge-trust-verified py-0.5 px-2">{topTrustRun ? `${topTrustRun.trustScore}% Trust` : '—'}</span>
                <span className="text-muted">{topTrustRun ? topTrustRun.suiteName : 'Run a benchmark to populate'}</span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="nexus-card h-100 border-start border-4 border-start-warning">
            <div className="nexus-card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small text-muted fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Top Dataset Accuracy
                </span>
                <Award size={18} className="text-warning" />
              </div>
              <h5 className="fw-bold mb-1 text-white">{topAccuracyRun ? topAccuracyRun.modelName : 'No Runs Yet'}</h5>
              <div className="d-flex align-items-center gap-2 small">
                <span className="badge-trust-verified py-0.5 px-2">{topAccuracyRun ? `${topAccuracyRun.accuracy}% Accuracy` : '—'}</span>
                <span className="text-muted">{topAccuracyRun ? `${topAccuracyRun.sampleSize} vectors tested` : 'FEVER & FEVEROUS ready'}</span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="nexus-card h-100 border-start border-4 border-start-success">
            <div className="nexus-card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small text-muted fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Fastest Execution
                </span>
                <Award size={18} className="text-success" />
              </div>
              <h5 className="fw-bold mb-1 text-white">{fastestRun ? fastestRun.modelName : 'No Runs Yet'}</h5>
              <div className="d-flex align-items-center gap-2 small">
                <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                  {fastestRun ? `${fastestRun.latencyP95}ms p95` : '—'}
                </span>
                <span className="text-muted">{fastestRun ? `$${Number(fastestRun.costPer1k || 0).toFixed(4)} / 1k` : 'Awaiting evaluation'}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Comparative Charts: Radar & Accuracy vs Latency */}
      <Row className="g-3 mb-4">
        {/* Radar: Multi-dimensional model comparison */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100">
            <div className="nexus-card-header">
              <div>
                <h6 className="fw-bold mb-0 text-white">Multi-Dimensional Capability Radar</h6>
                <span className="text-muted small">Normalized across 6 critical enterprise evaluation dimensions</span>
              </div>
              <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                Index (0-100)
              </Badge>
            </div>
            <div className="nexus-card-body d-flex align-items-center justify-content-center">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[80, 100]} stroke="rgba(255, 255, 255, 0.15)" fontSize={10} />
                    <Radar name="Nexus-Agent v2.1" dataKey="NexusAgent" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.35} />
                    <Radar name="Claude 3.5 Sonnet" dataKey="Claude35" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
                    <Radar name="GPT-4o" dataKey="GPT4o" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151F35', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        {/* Scatter: Accuracy vs Latency */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100">
            <div className="nexus-card-header">
              <div>
                <h6 className="fw-bold mb-0 text-white">Accuracy vs. Latency Trade-off</h6>
                <span className="text-muted small">Higher accuracy (Y) and lower latency (X) indicates optimal performance</span>
              </div>
              <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                p95 ms
              </Badge>
            </div>
            <div className="nexus-card-body">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                    <XAxis
                      type="number"
                      dataKey="latency"
                      name="p95 Latency"
                      unit="ms"
                      domain={[150, 700]}
                      stroke="#64748B"
                      fontSize={11}
                    />
                    <YAxis
                      type="number"
                      dataKey="accuracy"
                      name="Factual Accuracy"
                      unit="%"
                      domain={[90, 100]}
                      stroke="#64748B"
                      fontSize={11}
                    />
                    <ZAxis type="number" dataKey="cost" range={[60, 300]} name="Cost / 1k" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 rounded-3 border shadow-sm small" style={{ backgroundColor: '#151F35', borderColor: 'rgba(255,255,255,0.1)' }}>
                              <div className="fw-bold text-white mb-1">{data.model}</div>
                              <div className="text-muted">Accuracy: <strong className="text-white">{data.accuracy}%</strong></div>
                              <div className="text-muted">Latency (p95): <strong className="text-white">{data.latency}ms</strong></div>
                              <div className="text-muted">Trust Index: <strong className="text-success">{data.trust}%</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Models" data={scatterData} fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <div className="nexus-card mb-3 p-3">
        <Row className="g-3 align-items-center">
          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Filter by Model
              </Form.Label>
              <Form.Select
                size="sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="all">All Evaluated Models</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Filter by Suite
              </Form.Label>
              <Form.Select
                size="sm"
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value)}
              >
                <option value="all">All Benchmark Suites</option>
                {suites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Verification Status
              </Form.Label>
              <Form.Select
                size="sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="warning">With Warnings</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Benchmark Results Table */}
      <DataTable
        columns={columns}
        data={results}
        isLoading={loading}
        searchPlaceholder="Search model, suite or run ID..."
        searchKeys={['id', 'modelName', 'suiteName', 'summary']}
        defaultSortKey="trustScore"
        defaultSortDirection="desc"
        itemsPerPage={10}
        onRowClick={(row) => setActiveDrilldown(row)}
      />

      {/* Drilldown Modal for Detailed Result Inspection */}
      {activeDrilldown && (
        <Modal show={true} onHide={() => setActiveDrilldown(null)} size="lg" centered>
          <Modal.Header closeButton className="border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle p-2 bg-primary bg-opacity-20 text-cyan" style={{ color: '#22D3EE' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <Modal.Title className="h5 mb-0 fw-bold text-white">
                  Run #{activeDrilldown.id} — Detailed Verification Audit
                </Modal.Title>
                <div className="text-muted small">
                  {activeDrilldown.modelName} on {activeDrilldown.suiteName}
                </div>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="py-3">
            {/* KPI Summary Grid */}
            <Row className="g-2 p-3 bg-secondary bg-opacity-10 rounded-3 mb-3 border border-secondary border-opacity-15">
              <Col xs={3}>
                <div className="text-muted small">Trust Score</div>
                <div className="fs-5 fw-bold text-success font-mono">{activeDrilldown.trustScore}%</div>
              </Col>
              <Col xs={3}>
                <div className="text-muted small">Accuracy</div>
                <div className="fs-5 fw-bold text-white font-mono">{activeDrilldown.accuracy}%</div>
              </Col>
              <Col xs={3}>
                <div className="text-muted small">p95 Latency</div>
                <div className="fs-5 fw-bold text-white font-mono">{activeDrilldown.latencyP95}ms</div>
              </Col>
              <Col xs={3}>
                <div className="text-muted small">Sample Size</div>
                <div className="fs-5 fw-bold text-white font-mono">{activeDrilldown.sampleSize} tests</div>
              </Col>
            </Row>

            {/* Qualitative Synthesis */}
            <div className="mb-3">
              <h6 className="fw-bold text-white small text-uppercase tracking-wider">Evaluation Verdict & Summary</h6>
              <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-20 rounded-3 text-secondary small">
                {activeDrilldown.summary}
              </div>
            </div>

            {/* Execution Metadata */}
            <div className="mb-3">
              <h6 className="fw-bold text-white small text-uppercase tracking-wider">Audit Trail Metadata</h6>
              <div className="row g-2 text-muted small">
                <div className="col-sm-6">
                  <div className="p-2 border border-secondary border-opacity-15 rounded-2 bg-secondary bg-opacity-10">
                    <strong className="text-white">Conducted by:</strong> {activeDrilldown.testedBy}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-2 border border-secondary border-opacity-15 rounded-2 bg-secondary bg-opacity-10">
                    <strong className="text-white">Timestamp:</strong> {activeDrilldown.runTimestamp}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-2 border border-secondary border-opacity-15 rounded-2 bg-secondary bg-opacity-10">
                    <strong className="text-white">Safety Pass Rate:</strong> {activeDrilldown.safetyPassRate}%
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-2 border border-secondary border-opacity-15 rounded-2 bg-secondary bg-opacity-10">
                    <strong className="text-white">Cost Estimate:</strong> ${activeDrilldown.costPer1k}/1k tokens
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-secondary border-opacity-25">
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1.5"
              onClick={() => {
                setActiveDrilldown(null);
                navigate('/agent-trace');
              }}
            >
              <Activity size={14} />
              Open In Agent Trace Debugger
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveDrilldown(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default BenchmarkResultsPage;
