import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, Alert, Badge } from 'react-bootstrap';
import { Play, CheckCircle2, ShieldCheck, Terminal, Cpu, FlaskConical } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const RunBenchmarkModal = ({ onRunComplete }) => {
  const { isRunBenchmarkOpen, setIsRunBenchmarkOpen } = useWorkspace();
  const [models, setModels] = useState([]);
  const [suites, setSuites] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemini/gemini-1.5-flash');
  const [selectedSuite, setSelectedSuite] = useState('fever-validation');
  const [sampleSize, setSampleSize] = useState(50);
  const [temperature, setTemperature] = useState(0.2);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState([]);
  const [runSuccess, setRunSuccess] = useState(null);

  useEffect(() => {
    if (!isRunBenchmarkOpen) return;
    Promise.all([api.getModels(), api.getBenchmarkSuites()])
      .then(([mRes, sRes]) => {
        const mList = mRes.data || [];
        const sList = sRes.data || [];
        setModels(mList);
        setSuites(sList);
        if (mList.length > 0 && !mList.some((m) => m.id === selectedModel)) {
          setSelectedModel(mList[0].id);
        }
        if (sList.length > 0 && !sList.some((s) => s.id === selectedSuite)) {
          setSelectedSuite(sList[0].id);
        }
      })
      .catch(() => {});
  }, [isRunBenchmarkOpen]);

  const handleClose = () => {
    if (!isRunning) {
      setIsRunBenchmarkOpen(false);
      setProgress(0);
      setStatusLog([]);
      setRunSuccess(null);
    }
  };

  const handleLaunch = async () => {
    setIsRunning(true);
    setProgress(30);
    setStatusLog([
      `[Harness] Dispatching ${sampleSize} dataset vectors from ${selectedSuite}...`,
      `[Model] Evaluating ${selectedModel} via NexusIQ Trust Engine & Bifrost Gateway...`,
    ]);
    setRunSuccess(null);

    try {
      const response = await api.runBenchmark({
        modelId: selectedModel,
        suiteId: selectedSuite,
        sampleSize: Number(sampleSize),
        temperature: Number(temperature),
      });
      setProgress(100);
      setStatusLog((prev) => [
        ...prev,
        `[Complete] Trust Score: ${response.data.trustScore}% | Accuracy: ${response.data.accuracy}% | Mode: ${response.data.evaluationMode}`,
      ]);
      setRunSuccess(response.data);
      if (onRunComplete) {
        onRunComplete(response.data);
      }
    } catch (err) {
      setStatusLog((prev) => [...prev, `[ERROR] Failed to finalize benchmark: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Modal show={isRunBenchmarkOpen} onHide={handleClose} size="lg" centered backdrop={isRunning ? 'static' : true}>
      <Modal.Header closeButton={!isRunning} className="border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-primary bg-opacity-20 text-cyan" style={{ color: '#22D3EE' }}>
            <FlaskConical size={20} />
          </div>
          <div>
            <Modal.Title className="h5 mb-0 fw-bold text-white">Launch Agent Benchmark Run</Modal.Title>
            <span className="text-muted small">Evaluate agent models across safety, tool-use, and hallucination bounds</span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3">
        {!runSuccess ? (
          <div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Target Agent Model</Form.Label>
                  <Form.Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isRunning}
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Benchmark Evaluation Suite</Form.Label>
                  <Form.Select
                    value={selectedSuite}
                    onChange={(e) => setSelectedSuite(e.target.value)}
                    disabled={isRunning}
                  >
                    {suites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <Form.Group>
                  <div className="d-flex justify-content-between mb-1">
                    <Form.Label className="small fw-semibold text-secondary mb-0">Evaluation Sample Size</Form.Label>
                    <span className="small text-muted font-mono">{sampleSize} Scenarios</span>
                  </div>
                  <Form.Select
                    value={sampleSize}
                    onChange={(e) => setSampleSize(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value={50}>50 Quick Test Prompts</option>
                    <option value={100}>100 Standard Enterprise Suite</option>
                    <option value={250}>250 Exhaustive Adversarial Test</option>
                    <option value={500}>500 Stress-Test Matrix</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <div className="d-flex justify-content-between mb-1">
                    <Form.Label className="small fw-semibold text-secondary mb-0">Temperature (Determinism)</Form.Label>
                    <span className="small text-cyan font-mono" style={{ color: '#22D3EE' }}>{temperature}</span>
                  </div>
                  <Form.Range
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    disabled={isRunning}
                  />
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                    <span>Strict (0.0)</span>
                    <span>Balanced (0.5)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </Form.Group>
              </div>
            </div>

            {/* Execution logs / progress */}
            {isRunning && (
              <div className="mb-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span className="text-white">Executing live evaluation harness...</span>
                  <span className="font-mono text-cyan" style={{ color: '#22D3EE' }}>{progress}%</span>
                </div>
                <ProgressBar now={progress} animated variant="info" style={{ height: '8px' }} />
              </div>
            )}

            {statusLog.length > 0 && (
              <div className="p-3 rounded-3 font-mono small mb-2 text-light" style={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '160px', overflowY: 'auto' }}>
                <div className="d-flex align-items-center gap-1.5 text-muted mb-2 border-bottom border-secondary border-opacity-25 pb-1">
                  <Terminal size={14} className="text-cyan" style={{ color: '#22D3EE' }} />
                  <span>Telemetry Console Output</span>
                </div>
                {statusLog.map((log, idx) => (
                  <div key={idx} className="text-opacity-80 small py-0.5">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center">
            <div className="rounded-circle bg-success bg-opacity-20 text-success p-3 d-inline-flex mb-3">
              <ShieldCheck size={48} />
            </div>
            <h5 className="fw-bold text-white mb-1">Benchmark Run Verified!</h5>
            <p className="text-muted small mb-3">
              Run <span className="font-mono text-white fw-bold">{runSuccess.id}</span> completed and logged to the enterprise leaderboard.
            </p>

            <div className="row g-2 p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3 mb-3 text-start">
              <div className="col-4">
                <div className="text-muted small">Trust Index</div>
                <div className="fs-5 fw-bold text-success font-mono">{runSuccess.trustScore}%</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Accuracy</div>
                <div className="fs-5 fw-bold text-white font-mono">{runSuccess.accuracy}%</div>
              </div>
              <div className="col-4">
                <div className="text-muted small">Latency (p95)</div>
                <div className="fs-5 fw-bold text-white font-mono">{runSuccess.latencyP95}ms</div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-secondary border-opacity-25">
        {!runSuccess ? (
          <>
            <Button variant="outline-secondary" size="sm" onClick={handleClose} disabled={isRunning}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" className="btn-nexus-primary" onClick={handleLaunch} disabled={isRunning}>
              <Play size={16} />
              {isRunning ? 'Running Tests...' : 'Execute Benchmark'}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" className="btn-nexus-primary" onClick={handleClose}>
            <CheckCircle2 size={16} />
            Close & Review Results
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RunBenchmarkModal;
