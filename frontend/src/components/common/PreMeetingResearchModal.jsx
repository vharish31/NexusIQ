import React, { useState } from 'react';
import { Modal, Button, Form, ProgressBar } from 'react-bootstrap';
import { Brain, Search, Sparkles, Calendar, Target, Globe, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const PreMeetingResearchModal = ({ onResearchComplete }) => {
  const { isPreMeetingResearchOpen, setIsPreMeetingResearchOpen } = useWorkspace();
  const [subject, setSubject] = useState('');
  const [subjectType, setSubjectType] = useState('Company');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().substring(0, 10));
  const [meetingPurpose, setMeetingPurpose] = useState('Strategic Partnership');
  const [researchWindow, setResearchWindow] = useState(30);

  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');

  const handleClose = () => {
    if (!isSearching) {
      setIsPreMeetingResearchOpen(false);
      setSearchProgress(0);
      setSearchStatus('');
    }
  };

  const handleLaunchResearch = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsSearching(true);
    setSearchProgress(30);
    setSearchStatus(`Searching Tavily web intelligence & verifying sources for ${subject}...`);

    try {
      const response = await api.conductPreMeetingResearch({
        subject: subject.trim(),
        subjectType,
        meetingDate,
        meetingPurpose,
        researchWindowDays: Number(researchWindow)
      });
      setSearchProgress(100);
      setSearchStatus('Research dossier compiled and verified!');
      if (onResearchComplete) {
        onResearchComplete(response.data);
      }
      setIsSearching(false);
      handleClose();
    } catch (err) {
      setIsSearching(false);
      setSearchStatus('Error generating research dossier: ' + err.message);
    }
  };

  return (
    <Modal show={isPreMeetingResearchOpen} onHide={handleClose} size="lg" centered backdrop={isSearching ? 'static' : true}>
      <Modal.Header closeButton={!isSearching} className="border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 text-purple" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
            <Brain size={20} />
          </div>
          <div>
            <Modal.Title className="h5 mb-0 fw-bold text-white">Generate Pre-Meeting Intelligence Brief</Modal.Title>
            <span className="text-muted small">AI-powered executive research on companies, leadership, news & suggested questions</span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3">
        <Form onSubmit={handleLaunchResearch}>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <Form.Label className="small fw-semibold text-secondary">Target Company or Executive Name</Form.Label>
              <Form.Control
                placeholder="e.g. Stripe, Anthropic, Patrick Collison, Datadog, Snowflake"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={isSearching}
                autoFocus
              />
            </div>

            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary">Subject Type</Form.Label>
              <Form.Select
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value)}
                disabled={isSearching}
              >
                <option value="Company">Company / Enterprise</option>
                <option value="Person">Executive / Person</option>
              </Form.Select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary">Scheduled Meeting Date</Form.Label>
              <Form.Control
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary">Meeting Purpose</Form.Label>
              <Form.Select
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                disabled={isSearching}
              >
                <option value="Strategic Enterprise Partnership">Strategic Partnership</option>
                <option value="Enterprise Sales & Demo Pitch">Enterprise Sales Pitch</option>
                <option value="Executive C-Level Alignment">Executive C-Level Alignment</option>
                <option value="Technical Architecture Review">Technical Architecture Review</option>
                <option value="Investor & Financial Sync">Investor & Financial Sync</option>
              </Form.Select>
            </div>

            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary">Research Window</Form.Label>
              <Form.Select
                value={researchWindow}
                onChange={(e) => setResearchWindow(e.target.value)}
                disabled={isSearching}
              >
                <option value={7}>Past 7 Days (Latest Breaking)</option>
                <option value={30}>Past 30 Days (Recommended)</option>
                <option value={90}>Past 90 Days (Quarterly Depth)</option>
              </Form.Select>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-muted small">Quick Presets:</span>
            {['Stripe', 'Anthropic', 'NVIDIA', 'Datadog'].map((preset) => (
              <button
                key={preset}
                type="button"
                className="btn btn-sm btn-dark border border-secondary border-opacity-25 text-secondary py-0.5 px-2 rounded-pill small"
                onClick={() => setSubject(preset)}
                disabled={isSearching}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Progress bar when searching */}
          {isSearching && (
            <div className="my-3 p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
              <div className="d-flex justify-content-between text-muted small mb-1.5">
                <span className="text-white">{searchStatus}</span>
                <span className="font-mono text-purple">{searchProgress}%</span>
              </div>
              <ProgressBar now={searchProgress} animated variant="info" style={{ height: '6px' }} />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
            <Button variant="outline-secondary" size="sm" onClick={handleClose} disabled={isSearching}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="btn-nexus-purple"
              disabled={isSearching || !subject.trim()}
            >
              <Search size={15} />
              {isSearching ? 'Synthesizing Dossier...' : 'Generate Pre-Meeting Brief'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PreMeetingResearchModal;
