import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Bot, Plus, CheckCircle2, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const RegisterAgentModal = ({ onAgentRegistered }) => {
  const { isRegisterAgentOpen, setIsRegisterAgentOpen } = useWorkspace();
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('Nexus Sovereign Cluster');
  const [modelType, setModelType] = useState('Agentic Tool-Calling');
  const [endpoint, setEndpoint] = useState('https://agent-cluster.internal/v1/chat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleClose = () => {
    setIsRegisterAgentOpen(false);
    setModelName('');
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modelName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.registerAgentModel({
        name: modelName,
        provider,
        type: modelType,
        endpoint
      });
      setSuccessMsg(res.message);
      setIsSubmitting(false);
      if (onAgentRegistered) {
        onAgentRegistered(res.data);
      }
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isRegisterAgentOpen} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-primary bg-opacity-20 text-cyan" style={{ color: '#22D3EE' }}>
            <Cpu size={20} />
          </div>
          <div>
            <Modal.Title className="h5 mb-0 fw-bold text-white">Register New Agent Model</Modal.Title>
            <span className="text-muted small">Connect custom fine-tuned checkpoints or external LLM endpoints</span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3">
        {successMsg && (
          <Alert variant="success" className="d-flex align-items-center gap-2 py-2 text-success border-success-subtle bg-success-subtle">
            <CheckCircle2 size={16} />
            <span className="small fw-semibold">{successMsg}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Form.Label className="small fw-semibold text-secondary">Model Display Name</Form.Label>
            <Form.Control
              placeholder="e.g. Nexus-Finance-Agent-70B, Custom-Claude-Tool-Specialist"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Label className="small fw-semibold text-secondary">Provider / Hosting</Form.Label>
              <Form.Select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Nexus Sovereign Cluster">Nexus Sovereign Cluster</option>
                <option value="OpenAI Enterprise">OpenAI Enterprise</option>
                <option value="Anthropic Bedrock">Anthropic Bedrock</option>
                <option value="Self-Hosted vLLM / Ollama">Self-Hosted vLLM / Ollama</option>
                <option value="HuggingFace TGI">HuggingFace TGI</option>
              </Form.Select>
            </div>

            <div className="col-md-6">
              <Form.Label className="small fw-semibold text-secondary">Specialization / Archetype</Form.Label>
              <Form.Select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Agentic Tool-Calling">Agentic Tool-Calling</option>
                <option value="Cognitive Reasoning">Cognitive Reasoning</option>
                <option value="Long-Context RAG">Long-Context RAG (128k)</option>
                <option value="Code & SQL Specialist">Code & SQL Specialist</option>
              </Form.Select>
            </div>
          </div>

          <div className="mb-3">
            <Form.Label className="small fw-semibold text-secondary">Inference Endpoint URL</Form.Label>
            <Form.Control
              placeholder="https://your-internal-cluster.domain/v1/chat/completions"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              disabled={isSubmitting}
              className="font-mono small"
            />
          </div>

          <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-muted small mb-3">
            <div className="d-flex align-items-center gap-1.5 text-secondary fw-semibold mb-1">
              <ShieldCheck size={14} className="text-success" />
              <span>Automated Verification Harness</span>
            </div>
            Registered agents will be automatically provisioned for benchmark suites with zero-leakage enterprise token auditing.
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
            <Button variant="outline-secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="btn-nexus-primary" disabled={isSubmitting || !modelName.trim()}>
              <Plus size={16} />
              {isSubmitting ? 'Registering...' : 'Register Agent'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterAgentModal;
