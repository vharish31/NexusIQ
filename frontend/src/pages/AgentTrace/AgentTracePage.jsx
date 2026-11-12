import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Badge, Tabs, Tab } from 'react-bootstrap';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Layers,
  Terminal,
  AlertTriangle,
  Code,
  FileText,
  Copy,
  Check
} from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import TrustScorePill from '../../components/common/TrustScorePill';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import api from '../../services/api';

export const AgentTracePage = () => {
  const [traces, setTraces] = useState([]);
  const [selectedTraceId, setSelectedTraceId] = useState('');
  const [activeTrace, setActiveTrace] = useState(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getAgentTraces();
        const traceList = res.data || [];
        setTraces(traceList);
        if (traceList.length > 0) {
          setSelectedTraceId(traceList[0].id);
          setActiveTrace(traceList[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load agent traces.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelectTrace = (id) => {
    setSelectedTraceId(id);
    const trace = traces.find(t => t.id === id);
    if (trace) {
      setActiveTrace(trace);
      setSelectedStepIndex(0);
    }
  };

  const activeStep = activeTrace?.steps?.[selectedStepIndex] || activeTrace?.steps?.[0];

  const handleCopyPayload = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingState message="Connecting to neural trace collector..." />;
  }

  return (
    <div className="workspace-agentbench">
      {error && <ErrorBanner message={error} />}

      <PageHeader
        title="Agent Trace & Execution Observability"
        subtitle="Granular step-by-step telemetry into autonomous LLM thought processes, vector retrieval, and microservice tool calls."
        badgeText="Workspace 1"
        badgeVariant="primary"
      >
        <Form.Select
          size="sm"
          className="fw-semibold border shadow-sm"
          style={{ width: 'auto', minWidth: '320px' }}
          value={selectedTraceId}
          onChange={(e) => handleSelectTrace(e.target.value)}
        >
          {traces.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id}: {t.name}
            </option>
          ))}
        </Form.Select>
      </PageHeader>

      {activeTrace ? (
        <>
          {/* Trace Metadata Overview Card */}
          <div className="nexus-card mb-4">
            <div className="nexus-card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-15">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1.5">
                    <span className="font-mono fs-5 fw-bold text-white">{activeTrace.id}</span>
                    <StatusBadge status={activeTrace.status} />
                    <TrustScorePill score={activeTrace.trustScore} />
                  </div>
                  <h4 className="fw-bold text-white mb-1">{activeTrace.name}</h4>
                  <p className="text-secondary small mb-0">{activeTrace.description}</p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono p-2">
                    Model: <strong className="text-white">{activeTrace.model}</strong>
                  </span>
                </div>
              </div>

              {/* Metrics Row */}
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3">
                    <div className="text-muted small d-flex align-items-center gap-1.5 mb-1">
                      <Clock size={14} /> Total Latency
                    </div>
                    <div className="fs-5 fw-bold text-white font-mono">{activeTrace.totalDurationMs}ms</div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3">
                    <div className="text-muted small d-flex align-items-center gap-1.5 mb-1">
                      <Cpu size={14} /> Tokens Consumed
                    </div>
                    <div className="fs-5 fw-bold text-white font-mono">{activeTrace.totalTokens}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {activeTrace.promptTokens} in / {activeTrace.completionTokens} out
                    </div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3">
                    <div className="text-muted small d-flex align-items-center gap-1.5 mb-1">
                      <Coins size={14} /> Estimated Cost
                    </div>
                    <div className="fs-5 fw-bold text-white font-mono">{activeTrace.estimatedCost}</div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3">
                    <div className="text-muted small d-flex align-items-center gap-1.5 mb-1">
                      <ShieldCheck size={14} className="text-success" /> Active Guardrails
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {activeTrace.guardrailsPassed.map((g, idx) => (
                        <span key={idx} className="badge bg-success-subtle text-success border border-success-subtle small font-mono" style={{ fontSize: '0.68rem' }}>
                          ✓ {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Main Inspection Arena: Waterfall Timeline on Left, Step Details on Right */}
          <Row className="g-4">
            {/* Waterfall Graph Column */}
            <Col xs={12} lg={5}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div>
                    <h6 className="fw-bold mb-0 text-white">Execution Waterfall</h6>
                    <span className="text-muted small">Select step node to inspect I/O payloads</span>
                  </div>
                  <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                    {activeTrace.steps.length} Steps
                  </Badge>
                </div>

                <div className="nexus-card-body p-4">
                  <div className="trace-waterfall">
                    {activeTrace.steps.map((step, idx) => {
                      const isSelected = selectedStepIndex === idx;
                      return (
                        <div
                          key={step.id}
                          className="trace-node"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedStepIndex(idx)}
                        >
                          <div
                            className="trace-bullet"
                            style={{
                              borderColor: isSelected ? 'var(--nexus-cyan)' : 'rgba(255, 255, 255, 0.2)',
                              backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.2)' : 'var(--nexus-bg-secondary)'
                            }}
                          >
                            <span
                              className="font-mono small fw-bold"
                              style={{ color: isSelected ? 'var(--nexus-cyan)' : '#94A3B8', fontSize: '0.75rem' }}
                            >
                              {idx + 1}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-3 border transition-all ${
                              isSelected
                                ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                                : 'border-secondary border-opacity-15 bg-secondary bg-opacity-10 hover-lift'
                            }`}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="badge bg-dark border border-secondary border-opacity-25 text-light font-mono small" style={{ fontSize: '0.72rem' }}>
                                {step.type}
                              </span>
                              <div className="d-flex align-items-center gap-1.5 font-mono text-muted small" style={{ fontSize: '0.75rem' }}>
                                <Clock size={12} />
                                <span>{step.durationMs}ms</span>
                              </div>
                            </div>

                            <div className="fw-bold text-white small mb-1">{step.name}</div>
                            <div className="text-muted small text-truncate" style={{ fontSize: '0.78rem' }}>
                              {step.notes}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Col>

            {/* Inspector Panel Column */}
            <Col xs={12} lg={7}>
              {activeStep ? (
                <div className="nexus-card h-100 d-flex flex-column">
                  <div className="nexus-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <Code size={18} className="text-cyan" style={{ color: '#22D3EE' }} />
                      <div>
                        <h6 className="fw-bold mb-0 text-white">
                          Step {selectedStepIndex + 1}: {activeStep.name}
                        </h6>
                        <span className="text-muted small font-mono">{activeStep.type} • {activeStep.durationMs}ms</span>
                      </div>
                    </div>
                    <StatusBadge status={activeStep.status} size="sm" />
                  </div>

                  <div className="nexus-card-body p-3 flex-grow-1">
                    {/* Step Notes Banner */}
                    <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3 mb-3 text-secondary small">
                      <strong className="text-white">Audit Annotation:</strong> {activeStep.notes}
                    </div>

                    <Tabs defaultActiveKey="output" className="mb-3">
                      {/* Output Payload Tab */}
                      <Tab eventKey="output" title="Output Payload">
                        <div className="position-relative">
                          <button
                            className="btn btn-sm btn-dark border border-secondary border-opacity-25 position-absolute top-0 end-0 m-2 z-1 d-flex align-items-center gap-1 text-light"
                            onClick={() => handleCopyPayload(activeStep.output)}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy JSON'}
                          </button>
                          <pre
                            className="p-3 rounded-3 font-mono small mb-0 text-light"
                            style={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '380px', overflowY: 'auto', fontSize: '0.8rem', lineHeight: '1.4' }}
                          >
                            {JSON.stringify(activeStep.output, null, 2)}
                          </pre>
                        </div>
                      </Tab>

                      {/* Input Payload Tab */}
                      <Tab eventKey="input" title="Input & Context">
                        <div className="position-relative">
                          <button
                            className="btn btn-sm btn-dark border border-secondary border-opacity-25 position-absolute top-0 end-0 m-2 z-1 d-flex align-items-center gap-1 text-light"
                            onClick={() => handleCopyPayload(activeStep.input)}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy JSON'}
                          </button>
                          <pre
                            className="p-3 rounded-3 font-mono small mb-0 text-light"
                            style={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '380px', overflowY: 'auto', fontSize: '0.8rem', lineHeight: '1.4' }}
                          >
                            {JSON.stringify(activeStep.input, null, 2)}
                          </pre>
                        </div>
                      </Tab>
                    </Tabs>
                  </div>

                  <div className="nexus-card-footer d-flex align-items-center justify-content-between">
                    <span className="text-muted small">
                      Step tokens: <strong className="text-white font-mono">{activeStep.tokens}</strong>
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={selectedStepIndex === 0}
                        onClick={() => setSelectedStepIndex(p => Math.max(0, p - 1))}
                      >
                        Previous Step
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="btn-nexus-primary"
                        disabled={selectedStepIndex === activeTrace.steps.length - 1}
                        onClick={() => setSelectedStepIndex(p => Math.min(activeTrace.steps.length - 1, p + 1))}
                      >
                        Next Step &rarr;
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Col>
          </Row>
        </>
      ) : (
        <EmptyState
          icon={Activity}
          title="No Agent Traces Recorded Yet"
          description="Execute a benchmark run in AgentBench or synthesize a pre-meeting research brief to capture real step-by-step telemetry."
        />
      )}
    </div>
  );
};

export default AgentTracePage;
