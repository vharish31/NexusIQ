import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Badge, Modal, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  Share2,
  Download,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  Tag,
  Check,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import TrustScorePill from '../../components/common/TrustScorePill';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import api from '../../services/api';

export const BriefingResultsPage = () => {
  const navigate = useNavigate();

  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(134);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Action Items State
  const [actionItems, setActionItems] = useState([]);
  const [syncToast, setSyncToast] = useState(null);

  // Transcript filter
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getMeetingBriefing('MTG-101');
        setBriefing(res.data);
        setActionItems(res.data?.actionItems || []);
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('not found')) {
          setBriefing(null);
        } else {
          setError(err.message || 'Failed to load executive briefing.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Audio player simulation timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= 2880) {
            setIsPlaying(false);
            return 2880;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (seconds) => {
    setPlaybackSeconds(seconds);
  };

  const handleToggleActionStatus = async (id) => {
    const currentItem = actionItems.find((item) => item.id === id);
    if (!currentItem) return;
    const nextStatus = currentItem.status === 'Completed' ? 'In Progress' : 'Completed';
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    if (briefing?.id) {
      api.updateActionItemStatus(briefing.id, id, nextStatus).catch(() => {});
    }
  };

  const handleSyncJira = (taskTitle) => {
    setSyncToast(`Successfully synced "${taskTitle}" to Jira Cloud!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const filteredTranscript = briefing?.transcriptSegments.filter((seg) => {
    const matchSpeaker = selectedSpeaker === 'all' || seg.speaker.toLowerCase() === selectedSpeaker.toLowerCase();
    const matchQuery = !transcriptSearch || seg.text.toLowerCase().includes(transcriptSearch.toLowerCase());
    return matchSpeaker && matchQuery;
  }) || [];

  const topicChartData = briefing?.topicsTimeline.map((t, i) => ({
    name: t.topic,
    value: t.percentage,
    color: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i % 4]
  })) || [];

  if (loading) {
    return <LoadingState message="Synthesizing executive briefing & decision logs..." />;
  }

  return (
    <div className="workspace-meeting">
      {error && <ErrorBanner message={error} />}

      {syncToast && (
        <Alert variant="success" className="border-success-subtle bg-success-subtle text-success-emphasis d-flex align-items-center justify-content-between p-2.5 px-3 rounded-3 mb-3">
          <div className="d-flex align-items-center gap-2 small fw-semibold">
            <CheckCircle2 size={16} />
            {syncToast}
          </div>
          <button className="btn-close btn-close-sm" onClick={() => setSyncToast(null)}></button>
        </Alert>
      )}

      {/* Header */}
      <PageHeader
        title="Executive Briefing & Action Center"
        subtitle="AI-synthesized strategic executive summary, verified decisions, and bi-directional task tracking."
        badgeText="Workspace 2"
        badgeVariant="info"
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-nexus-secondary"
          onClick={() => navigate('/meeting-intelligence')}
        >
          &larr; Back to Research & Meetings
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="btn-nexus-purple"
          onClick={() => setShowExportModal(true)}
        >
          <Download size={14} />
          Export Briefing
        </Button>
      </PageHeader>

      {!briefing && !error ? (
        <EmptyState
          icon={FileText}
          title="No Executive Briefings Available Yet"
          description="Generate a pre-meeting research dossier or ingest a meeting record in Meeting Intelligence to view synthesized briefings here."
        />
      ) : null}

      {briefing && (
        <>
          {/* Briefing Top Card */}
          <div className="nexus-card mb-4">
            <div className="nexus-card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-15">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono fs-5 fw-bold text-white">{briefing.id}</span>
                    <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                      {briefing.department}
                    </Badge>
                    <StatusBadge status={briefing.status} />
                    <TrustScorePill score={briefing.aiConfidenceScore} />
                  </div>
                  <h3 className="fw-bold text-white mb-1">{briefing.title}</h3>
                  <div className="d-flex align-items-center gap-3 text-muted small flex-wrap">
                    <span className="d-flex align-items-center gap-1">
                      <Calendar size={13} /> {briefing.date} ({briefing.time})
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Clock size={13} /> {briefing.duration}
                    </span>
                    <span className="badge-trust-verified py-0.5 px-2">
                      <Sparkles size={12} /> {briefing.sentimentOverall}
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-md-end gap-1">
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Diarization Accuracy:</span>
                  <div className="fs-5 fw-bold text-success font-mono">99.2%</div>
                </div>
              </div>

              {/* Integrated Audio Player Bar */}
              <div className="p-3 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-15">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="primary"
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center btn-nexus-purple"
                      style={{ width: '42px', height: '42px' }}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ms-0.5" />}
                    </Button>

                    <Button
                      variant="dark"
                      size="sm"
                      className="border border-secondary border-opacity-25 p-1.5 text-muted"
                      onClick={() => handleSeek(0)}
                      title="Restart Audio"
                    >
                      <RotateCcw size={15} />
                    </Button>

                    <div className="ms-2">
                      <div className="fw-semibold text-white small">Audio Stream Telemetry</div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                        {formatSeconds(playbackSeconds)} / {formatSeconds(2880)}
                      </div>
                    </div>
                  </div>

                  {/* Scrubber Range */}
                  <div className="flex-grow-1 mx-md-4 w-100">
                    <Form.Range
                      min={0}
                      max={2880}
                      value={playbackSeconds}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                    />
                  </div>

                  {/* Playback speed selector */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-muted small me-1">Speed:</span>
                    {[1, 1.25, 1.5].map((spd) => (
                      <Button
                        key={spd}
                        variant={playbackSpeed === spd ? 'primary' : 'dark'}
                        size="sm"
                        className={`py-0.5 px-2 font-mono small border border-secondary border-opacity-25 ${playbackSpeed === spd ? 'btn-nexus-purple' : 'text-muted'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setPlaybackSpeed(spd)}
                      >
                        {spd}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Executive Summary & Decisions */}
          <Row className="g-4 mb-4">
            {/* Executive Summary */}
            <Col xs={12} lg={7}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={18} className="text-purple" style={{ color: '#A78BFA' }} />
                    <h6 className="fw-bold mb-0 text-white">Executive Synthesis & TL;DR</h6>
                  </div>
                  <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                    AI Verified
                  </Badge>
                </div>

                <div className="nexus-card-body p-4">
                  <div className="d-flex flex-column gap-3">
                    {briefing.executiveSummary.map((point, idx) => (
                      <div key={idx} className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle text-purple p-1.5 flex-shrink-0 mt-0.5 border border-purple border-opacity-30"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}
                        >
                          <span className="fw-bold">{idx + 1}</span>
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.90rem', lineHeight: '1.5' }}>
                          {point}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            {/* Strategic Decisions */}
            <Col xs={12} lg={5}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <h6 className="fw-bold mb-0 text-white">Key Strategic Decisions</h6>
                  </div>
                  <span className="badge-trust-verified py-0.5 px-2">
                    {briefing.strategicDecisions.length} Ratified
                  </span>
                </div>

                <div className="nexus-card-body p-3">
                  <div className="d-flex flex-column gap-3">
                    {briefing.strategicDecisions.map((dec) => (
                      <div key={dec.id} className="p-3 rounded-3 border border-secondary border-opacity-15 bg-secondary bg-opacity-10">
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <span className="font-mono text-muted small fw-bold">{dec.id}</span>
                          <span className="badge-trust-verified py-0.5 px-2" style={{ fontSize: '0.70rem' }}>
                            {dec.status}
                          </span>
                        </div>
                        <h6 className="fw-bold text-white mb-1" style={{ fontSize: '0.88rem' }}>
                          {dec.decision}
                        </h6>
                        <p className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                          {dec.rationale}
                        </p>
                        <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-15 text-muted small" style={{ fontSize: '0.72rem' }}>
                          <span>Consensus: <strong className="text-white">{dec.consensus}</strong></span>
                          <span>Timestamp: {dec.verifiedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Section 3: Interactive Action Items Tracker */}
          <div className="nexus-card mb-4">
            <div className="nexus-card-header">
              <div>
                <h6 className="fw-bold mb-0 text-white">Action Items & Task Accountability Matrix</h6>
                <span className="text-muted small">
                  Extracted from conversational commitments; toggle status or sync to project trackers.
                </span>
              </div>
              <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                {actionItems.filter(a => a.status === 'Completed').length} of {actionItems.length} Closed
              </Badge>
            </div>

            <div className="table-responsive">
              <table className="nexus-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Done</th>
                    <th>Task Commitment</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Cloud Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item) => {
                    const isDone = item.status === 'Completed';
                    return (
                      <tr key={item.id} className={isDone ? 'opacity-75' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isDone}
                            onChange={() => handleToggleActionStatus(item.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <div className={`fw-semibold ${isDone ? 'text-decoration-line-through text-muted' : 'text-white'}`}>
                            {item.task}
                          </div>
                          <div className="text-muted font-mono" style={{ fontSize: '0.70rem' }}>
                            {item.id}
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium text-white small">{item.assignee}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.assigneeRole}</div>
                        </td>
                        <td>
                          <span className="font-mono text-secondary small">{item.dueDate}</span>
                        </td>
                        <td>
                          <Badge
                            bg={item.priority === 'Urgent' ? 'danger' : item.priority === 'High' ? 'warning' : 'info'}
                            className="small"
                          >
                            {item.priority}
                          </Badge>
                        </td>
                        <td>
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="p-1 px-2.5 small fw-semibold border-secondary border-opacity-25 text-purple"
                            style={{ fontSize: '0.75rem', color: '#A78BFA' }}
                            onClick={() => handleSyncJira(item.task)}
                          >
                            {item.syncedTo}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 & 5: Diarized Transcript & Topic Distribution */}
          <Row className="g-4">
            {/* Diarized Transcript */}
            <Col xs={12} lg={7}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div>
                    <h6 className="fw-bold mb-0 text-white">Diarized Speaker Transcript</h6>
                    <span className="text-muted small">Click any timestamp to seek audio playback</span>
                  </div>
                  <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                    Whisper v3
                  </Badge>
                </div>

                <div className="nexus-card-body p-3">
                  <div className="row g-2 mb-3">
                    <div className="col-8">
                      <Form.Control
                        size="sm"
                        placeholder="Search transcript..."
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                      />
                    </div>
                    <div className="col-4">
                      <Form.Select
                        size="sm"
                        value={selectedSpeaker}
                        onChange={(e) => setSelectedSpeaker(e.target.value)}
                      >
                        <option value="all">All Speakers</option>
                        <option value="Sarah Chen">Sarah Chen (CTO)</option>
                        <option value="David Miller">David Miller (CFO)</option>
                        <option value="Priya Sharma">Priya Sharma (VP AI)</option>
                        <option value="Marcus Vance">Marcus Vance (COO)</option>
                      </Form.Select>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-3" style={{ maxHeight: '440px', overflowY: 'auto' }}>
                    {filteredTranscript.map((seg) => (
                      <div
                        key={seg.id}
                        className="p-3 rounded-3 border border-secondary border-opacity-15 bg-secondary bg-opacity-10 hover-lift"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSeek(seg.seconds)}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-white small">{seg.speaker}</span>
                            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              ({seg.speakerRole})
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge-trust-verified py-0.5 px-2" style={{ fontSize: '0.68rem' }}>
                              {seg.sentiment}
                            </span>
                            <span className="badge bg-dark text-cyan font-mono border border-secondary border-opacity-25" style={{ fontSize: '0.70rem', color: '#22D3EE' }}>
                              {seg.timestamp}
                            </span>
                          </div>
                        </div>
                        <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                          "{seg.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            {/* Topic & Agenda Allocation */}
            <Col xs={12} lg={5}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div>
                    <h6 className="fw-bold mb-0 text-white">Discussion Topic Allocation</h6>
                    <span className="text-muted small">Meeting time distribution by topic</span>
                  </div>
                  <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                    4 Topics
                  </Badge>
                </div>

                <div className="nexus-card-body p-3">
                  <div style={{ width: '100%', height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topicChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {topicChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#151F35', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94A3B8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-2 pt-2 border-top border-secondary border-opacity-15">
                    {briefing.topicsTimeline.map((item, idx) => (
                      <div key={idx} className="p-2 border border-secondary border-opacity-15 rounded-2 bg-secondary bg-opacity-10 d-flex align-items-center justify-content-between small">
                        <div>
                          <span className="fw-semibold text-white">{item.topic}</span>
                          <div className="text-muted font-mono" style={{ fontSize: '0.70rem' }}>{item.time}</div>
                        </div>
                        <span className="badge bg-dark border border-secondary border-opacity-25 text-purple font-mono" style={{ color: '#A78BFA' }}>
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Export Briefing Modal */}
          <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
            <Modal.Header closeButton className="border-secondary border-opacity-25">
              <Modal.Title className="h5 fw-bold text-white">Export Meeting Briefing</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-3">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Export Format</Form.Label>
                <Form.Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                  <option value="pdf">Executive PDF Briefing (Corporate Branded)</option>
                  <option value="markdown">Markdown Summary (.md)</option>
                  <option value="json">Full Diarized JSON Archive</option>
                  <option value="email">Send Email Digest to Attendees</option>
                </Form.Select>
              </Form.Group>

              <div className="p-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 rounded-3 text-secondary small">
                Includes all 4 executive takeaways, 3 verified decisions, 4 action items, and complete speaker audit timestamps.
              </div>
            </Modal.Body>
            <Modal.Footer className="border-secondary border-opacity-25">
              <Button variant="outline-secondary" size="sm" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="btn-nexus-purple"
                onClick={() => {
                  alert(`Executive briefing exported successfully in ${exportFormat.toUpperCase()} format.`);
                  setShowExportModal(false);
                }}
              >
                <Download size={14} /> Download File
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default BriefingResultsPage;
