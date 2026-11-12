import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Play,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Info
} from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const AgentBenchPage = () => {
  const navigate = useNavigate();
  const { setIsRegisterAgentOpen } = useWorkspace();

  const [suites, setSuites] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration state
  const [selectedModel, setSelectedModel] = useState('gemini/gemini-1.5-flash');
  const [selectedSuite, setSelectedSuite] = useState('fever-validation');
  const [sampleSize, setSampleSize] = useState(50);
  const [concurrency, setConcurrency] = useState(16);
  const [temperature, setTemperature] = useState(0.2);

  // Live Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [suiteRes, modelRes] = await Promise.all([
        api.getBenchmarkSuites(),
        api.getModels()
      ]);
      const loadedSuites = suiteRes.data || [];
      const loadedModels = modelRes.data || [];
      setSuites(loadedSuites);
      setModels(loadedModels);
      if (loadedModels.length > 0 && !loadedModels.some(m => m.id === selectedModel)) {
        setSelectedModel(loadedModels[0].id);
      }
      if (loadedSuites.length > 0 && !loadedSuites.some(s => s.id === selectedSuite)) {
        setSelectedSuite(loadedSuites[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load benchmark suites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteBenchmark = async () => {
    setIsRunning(true);
    setProgress(25);
    setLastResult(null);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [Harness] Dispatching live evaluation to NexusIQ backend...`,
      `[${new Date().toLocaleTimeString()}] [Model] Target model: "${selectedModel}" (Temp: ${temperature})`,
      `[${new Date().toLocaleTimeString()}] [Suite] Sampling ${sampleSize} real vectors from "${selectedSuite}"...`
    ]);

    try {
      const response = await api.runBenchmark({
        modelId: selectedModel,
        suiteId: selectedSuite,
        sampleSize: Number(sampleSize),
        temperature: Number(temperature)
      });
      setProgress(100);
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [Verify] Mode: ${response.data.evaluationMode}. Accuracy: ${response.data.accuracy}% | Trust: ${response.data.trustScore}% | P95: ${response.data.latencyP95}ms`,
        `[${new Date().toLocaleTimeString()}] [Trace] Recorded execution trace ${response.data.traceId || 'N/A'}`,
        `[${new Date().toLocaleTimeString()}] [SUCCESS] Result ${response.data.id} saved (${response.persisted_to_firestore ? 'Firestore' : 'Session'}).`
      ]);
      setLastResult(response.data);
      loadData();
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] Execution halted: ${err.message}`]);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickSuiteLaunch = (suiteId) => {
    setSelectedSuite(suiteId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingState message="Configuring AgentBench evaluation harness..." />;
  }

  return (
    <div className="workspace-agentbench">
      {error && <ErrorBanner message={error} />}

      <PageHeader
        title="AgentBench — AI Agent Evaluation Engine"
        subtitle="Standardized enterprise evaluation harness testing autonomous tool orchestration, multi-hop reasoning, and adversarial trust bounds."
        badgeText="Workspace 1"
        badgeVariant="primary"
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-nexus-secondary"
          onClick={() => setIsRegisterAgentOpen(true)}
        >
          <Plus size={15} />
          Register Custom Agent
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="btn-nexus-primary"
          onClick={() => navigate('/benchmark-results')}
        >
          <BarChart3 size={15} />
          View Leaderboard
        </Button>
      </PageHeader>

      {/* Main Execution Arena */}
      <Row className="g-4 mb-4">
        {/* Left: Configuration Panel */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100">
            <div className="nexus-card-header">
              <div className="d-flex align-items-center gap-2">
                <Sliders size={17} className="text-cyan" style={{ color: '#22D3EE' }} />
                <h6 className="fw-bold mb-0 text-white">Evaluation Parameters</h6>
              </div>
              <Badge bg="primary" className="bg-opacity-20 text-cyan border border-primary border-opacity-30 font-mono" style={{ color: '#22D3EE' }}>
                Harness Config
              </Badge>
            </div>

            <div className="nexus-card-body">
              {/* Model Selector with Register Option */}
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label className="small fw-semibold text-secondary mb-0">
                    Target AI Agent Model
                  </Form.Label>
                  <button
                    className="btn btn-sm btn-link p-0 text-cyan text-decoration-none small"
                    onClick={() => setIsRegisterAgentOpen(true)}
                    style={{ fontSize: '0.75rem', color: '#22D3EE' }}
                  >
                    + Register Model
                  </button>
                </div>
                <Form.Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isRunning}
                  className="fw-medium"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.provider} ({m.type})
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Suite Selector */}
              <div className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">
                  Benchmark Suite Matrix
                </Form.Label>
                <Form.Select
                  value={selectedSuite}
                  onChange={(e) => setSelectedSuite(e.target.value)}
                  disabled={isRunning}
                  className="fw-medium"
                >
                  {suites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — {s.testCasesCount} Vectors
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Numeric Controls */}
              <Row className="g-3 mb-3">
                <Col xs={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    Sample Scenarios
                  </Form.Label>
                  <Form.Select
                    value={sampleSize}
                    onChange={(e) => setSampleSize(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value={50}>50 Quick Vectors</option>
                    <option value={100}>100 Standard Vectors</option>
                    <option value={250}>250 Exhaustive Matrix</option>
                    <option value={500}>500 Stress-Test Matrix</option>
                  </Form.Select>
                </Col>

                <Col xs={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    Parallel Concurrency
                  </Form.Label>
                  <Form.Select
                    value={concurrency}
                    onChange={(e) => setConcurrency(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value={8}>8x Threads</option>
                    <option value={16}>16x Threads (Recommended)</option>
                    <option value={32}>32x High-Throughput</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* Temperature Slider */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <Form.Label className="small fw-semibold text-secondary mb-0">
                    Temperature (Determinism)
                  </Form.Label>
                  <span className="font-mono small text-cyan fw-bold" style={{ color: '#22D3EE' }}>{temperature}</span>
                </div>
                <Form.Range
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  disabled={isRunning}
                />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                  <span>0.0 (Strict Reproducibility)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                className="btn-nexus-primary w-100 justify-content-center py-2.5"
                onClick={handleExecuteBenchmark}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <RefreshCw size={16} className="spinner-border spinner-border-sm border-0" style={{ animation: 'spin 2s linear infinite' }} />
                    <span>Executing Evaluation ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Launch Benchmark Run</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Col>

        {/* Right: Live Execution & Terminal Telemetry */}
        <Col xs={12} lg={6}>
          <div className="nexus-card h-100 d-flex flex-column" style={{ background: 'rgba(8, 13, 27, 0.85)', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
            <div className="nexus-card-header border-secondary border-opacity-25" style={{ background: 'rgba(16, 24, 43, 0.7)' }}>
              <div className="d-flex align-items-center gap-2">
                <Terminal size={17} className="text-cyan" style={{ color: '#22D3EE' }} />
                <h6 className="fw-bold mb-0 text-white">Execution Stream & Telemetry</h6>
              </div>
              <div className="d-flex align-items-center gap-2">
                {isRunning && <span className="pulse-blue"></span>}
                <span className="badge bg-secondary bg-opacity-25 text-light font-mono small">
                  {isRunning ? 'STREAMING' : 'READY'}
                </span>
              </div>
            </div>

            <div className="nexus-card-body p-3 flex-grow-1 font-mono small d-flex flex-column justify-content-between" style={{ minHeight: '340px' }}>
              <div>
                {isRunning && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Execution Harness Progress</span>
                      <span className="text-cyan fw-bold" style={{ color: '#22D3EE' }}>{progress}%</span>
                    </div>
                    <ProgressBar now={progress} animated variant="info" style={{ height: '6px' }} />
                  </div>
                )}

                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {terminalLogs.length > 0 ? (
                    terminalLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          log.includes('SUCCESS')
                            ? 'text-success fw-bold'
                            : log.includes('ERROR')
                            ? 'text-danger'
                            : log.includes('Harness') || log.includes('Suite')
                            ? 'text-info'
                            : 'text-light text-opacity-80'
                        }`}
                        style={{ fontSize: '0.8rem', lineHeight: '1.4' }}
                      >
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted text-center py-5">
                      <Cpu size={32} className="opacity-25 mb-2 d-block mx-auto text-cyan" />
                      Configure evaluation parameters and click "Launch Benchmark Run" to start real-time telemetry stream.
                    </div>
                  )}
                </div>
              </div>

              {lastResult && (
                <div className="mt-3 p-3 rounded-3 bg-dark bg-opacity-75 border border-primary border-opacity-40">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-success fw-bold d-flex align-items-center gap-1.5">
                      <ShieldCheck size={16} /> Run #{lastResult.id} Verified
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-cyan text-decoration-none small d-flex align-items-center gap-1"
                      style={{ color: '#22D3EE' }}
                      onClick={() => navigate('/benchmark-results')}
                    >
                      Compare on Leaderboard <ArrowRight size={13} />
                    </Button>
                  </div>
                  <div className="row g-2 text-center text-muted" style={{ fontSize: '0.78rem' }}>
                    <div className="col-4">
                      Trust: <span className="text-success font-mono fw-bold">{lastResult.trustScore}%</span>
                    </div>
                    <div className="col-4">
                      Accuracy: <span className="text-white font-mono fw-bold">{lastResult.accuracy}%</span>
                    </div>
                    <div className="col-4">
                      Latency: <span className="text-white font-mono fw-bold">{lastResult.latencyP95}ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Catalog of Benchmark Suites */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold mb-1 text-white">Available Benchmark Suites</h4>
            <p className="text-muted small mb-0">
              Evaluations addressing specialized autonomous agent capabilities, tool grounding, and security bounds.
            </p>
          </div>
          <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
            {suites.length} Suites Active
          </span>
        </div>

        <Row className="g-3">
          {suites.map((suite) => {
            const isSelected = suite.id === selectedSuite;
            return (
              <Col xs={12} md={6} key={suite.id}>
                <div
                  className={`nexus-card h-100 hover-lift d-flex flex-column justify-content-between ${
                    isSelected ? 'border-primary' : ''
                  }`}
                  style={isSelected ? { boxShadow: '0 0 24px -4px rgba(59, 130, 246, 0.3)' } : undefined}
                >
                  <div className="nexus-card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-primary bg-opacity-15 text-cyan font-mono small" style={{ color: '#22D3EE' }}>
                        {suite.category}
                      </span>
                      <span className="badge-trust-verified py-0.5 px-2">
                        <ShieldCheck size={12} /> {suite.passRate > 0 ? `${suite.passRate}% Pass` : 'Ready'}
                      </span>
                    </div>

                    <h6 className="fw-bold text-white mb-2">{suite.name}</h6>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.84rem', minHeight: '42px', lineHeight: '1.5' }}>
                      {suite.description}
                    </p>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-15 text-muted small" style={{ fontSize: '0.75rem' }}>
                      <span className="font-mono text-light">{Number(suite.testCasesCount || 0).toLocaleString()} Vectors</span>
                      <span>Avg: {suite.avgLatency}</span>
                      <span className="font-mono text-success fw-semibold">Risk: {suite.riskLevel}</span>
                    </div>
                  </div>

                  <div className="nexus-card-footer d-flex justify-content-between align-items-center">
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Last run: {suite.lastRunDate}
                    </span>
                    <Button
                      variant={isSelected ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="p-1 px-3 small fw-semibold"
                      onClick={() => handleQuickSuiteLaunch(suite.id)}
                    >
                      {isSelected ? 'Selected' : 'Select Suite'}
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default AgentBenchPage;
