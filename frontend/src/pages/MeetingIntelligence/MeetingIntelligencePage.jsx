import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Badge, InputGroup, Tabs, Tab, ProgressBar, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Search,
  Sparkles,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  ArrowRight,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  HelpCircle,
  Download,
  Share2,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  Mic,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const MeetingIntelligencePage = () => {
  const navigate = useNavigate();
  const { setIsUploadMeetingOpen } = useWorkspace();

  const [activeTab, setActiveTab] = useState('research');

  // Pre-meeting Research State
  const [subject, setSubject] = useState('Google DeepMind');
  const [subjectType, setSubjectType] = useState('Company');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().substring(0, 10));
  const [meetingPurpose, setMeetingPurpose] = useState('Strategic Enterprise Partnership');
  const [researchWindow, setResearchWindow] = useState(30);

  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [researchStatusMsg, setResearchStatusMsg] = useState('');
  const [activeDossier, setActiveDossier] = useState(null);
  const [pastDossiers, setPastDossiers] = useState([]);

  // Audio Ingestion & Meetings Library State
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Copy / Export Feedback
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setMeetingsLoading(true);
        const [mtgRes, dossierRes] = await Promise.all([
          api.getMeetings(),
          api.getResearchDossiers()
        ]);
        setMeetings(mtgRes.data || []);
        const dossiers = dossierRes.data || [];
        setPastDossiers(dossiers);
        if (dossiers.length > 0) {
          setActiveDossier(dossiers[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize meeting intelligence.');
      } finally {
        setMeetingsLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleLaunchResearch = async (e) => {
    if (e) e.preventDefault();
    if (!subject.trim()) return;

    setIsResearching(true);
    setError(null);
    setResearchProgress(30);
    setResearchStatusMsg(`Querying Tavily intelligence & Trust Engine for ${subject}...`);

    try {
      const response = await api.conductPreMeetingResearch({
        subject: subject.trim(),
        subjectType,
        meetingDate,
        meetingPurpose,
        researchWindowDays: Number(researchWindow)
      });
      setResearchProgress(100);
      setActiveDossier(response.data);
      setPastDossiers(prev => {
        if (!prev.some(d => d.id === response.data.id)) {
          return [response.data, ...prev];
        }
        return prev;
      });
    } catch (err) {
      setError('Research synthesis failed: ' + err.message);
    } finally {
      setIsResearching(false);
    }
  };

  const handleCopyDossier = () => {
    if (!activeDossier) return;
    const questions = activeDossier.suggestedQuestions || [];
    const briefText = `NEXUSIQ PRE-MEETING EXECUTIVE BRIEFING\n\nSUBJECT: ${activeDossier.subject} (${activeDossier.subjectType})\nPURPOSE: ${activeDossier.meetingPurpose}\nDATE: ${activeDossier.meetingDate}\nTRUST VERIFICATION: ${activeDossier.trustVerificationScore}%\n\nEXECUTIVE SUMMARY:\n${activeDossier.executiveSummary}\n\nSUGGESTED QUESTIONS:\n${questions.map((q, i) => `${i+1}. [${q.category}] ${q.question}`).join('\n')}`;
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="workspace-meeting">
      {error && <ErrorBanner message={error} />}

      <PageHeader
        title="Meeting Intelligence — AI Research & Briefing Agent"
        subtitle="Automated pre-meeting company research, leadership verification, recent development discovery, and audio diarization."
        badgeText="Workspace 2"
        badgeVariant="info"
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-nexus-secondary"
          onClick={() => setIsUploadMeetingOpen(true)}
        >
          <UploadCloud size={14} />
          Ingest Audio / Video
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="btn-nexus-purple"
          onClick={() => {
            setActiveTab('research');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Search size={14} />
          New Research Brief
        </Button>
      </PageHeader>

      {/* Main Workspace Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="research"
          title={
            <span className="d-flex align-items-center gap-2">
              <Search size={16} />
              <span>Pre-Meeting Intelligence & Research</span>
              <Badge bg="purple" className="bg-opacity-20 text-purple font-mono small" style={{ color: '#A78BFA' }}>
                Primary
              </Badge>
            </span>
          }
        >
          {/* Research Workflow Section */}
          <Row className="g-4 mb-4">
            {/* Input Form Column */}
            <Col xs={12} lg={4}>
              <div className="nexus-card h-100">
                <div className="nexus-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <Search size={17} className="text-purple" style={{ color: '#A78BFA' }} />
                    <h6 className="fw-bold mb-0 text-white">Target Research Parameters</h6>
                  </div>
                </div>

                <div className="nexus-card-body">
                  <Form onSubmit={handleLaunchResearch}>
                    <div className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">
                        Company or Executive Name
                      </Form.Label>
                      <Form.Control
                        placeholder="e.g. Google DeepMind, Anthropic, Stripe, NVIDIA"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        disabled={isResearching}
                      />
                      <div className="d-flex flex-wrap gap-1.5 mt-2">
                        {['Google DeepMind', 'Anthropic', 'Stripe', 'NVIDIA'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className="btn btn-sm btn-dark border border-secondary border-opacity-25 text-secondary py-0.5 px-2 rounded-pill small"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => {
                              setSubject(preset);
                              const match = pastDossiers.find(d => d.subject.toLowerCase() === preset.toLowerCase());
                              if (match) setActiveDossier(match);
                            }}
                            disabled={isResearching}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Subject Type</Form.Label>
                      <Form.Select
                        value={subjectType}
                        onChange={(e) => setSubjectType(e.target.value)}
                        disabled={isResearching}
                      >
                        <option value="Company">Enterprise / Company</option>
                        <option value="Person">C-Level Executive / Person</option>
                      </Form.Select>
                    </div>

                    <div className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Meeting Purpose</Form.Label>
                      <Form.Select
                        value={meetingPurpose}
                        onChange={(e) => setMeetingPurpose(e.target.value)}
                        disabled={isResearching}
                      >
                        <option value="Strategic Enterprise Partnership">Strategic Enterprise Partnership</option>
                        <option value="Enterprise Sales & Demo Pitch">Enterprise Sales Pitch</option>
                        <option value="Executive C-Level Alignment">Executive C-Level Alignment</option>
                        <option value="Technical Architecture Review">Technical Architecture Review</option>
                        <option value="Investor & Financial Sync">Investor & Financial Sync</option>
                      </Form.Select>
                    </div>

                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <Form.Label className="small fw-semibold text-secondary">Meeting Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          disabled={isResearching}
                        />
                      </div>
                      <div className="col-6">
                        <Form.Label className="small fw-semibold text-secondary">Research Window</Form.Label>
                        <Form.Select
                          value={researchWindow}
                          onChange={(e) => setResearchWindow(e.target.value)}
                          disabled={isResearching}
                        >
                          <option value={7}>Past 7 Days</option>
                          <option value={30}>Past 30 Days</option>
                          <option value={90}>Past 90 Days</option>
                        </Form.Select>
                      </div>
                    </div>

                    {isResearching && (
                      <div className="mb-3 p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                        <div className="d-flex justify-content-between text-muted small mb-1">
                          <span className="text-white small">{researchStatusMsg}</span>
                          <span className="text-purple font-mono" style={{ color: '#A78BFA' }}>{researchProgress}%</span>
                        </div>
                        <ProgressBar now={researchProgress} animated variant="info" style={{ height: '6px' }} />
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="btn-nexus-purple w-100 justify-content-center py-2.5"
                      disabled={isResearching || !subject.trim()}
                    >
                      <Brain size={16} />
                      <span>{isResearching ? 'Synthesizing Brief...' : 'Synthesize Pre-Meeting Brief'}</span>
                    </Button>
                  </Form>

                  {/* Past Dossiers Quick Jump */}
                  {pastDossiers.length > 0 && (
                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-15">
                      <div className="text-uppercase small fw-bold text-muted mb-2" style={{ fontSize: '0.68rem' }}>
                        Recent Pre-Meeting Dossiers
                      </div>
                      <div className="d-flex flex-column gap-1.5">
                        {pastDossiers.slice(0, 3).map((d) => (
                          <button
                            key={d.id}
                            className={`p-2 rounded-2 text-start border-0 bg-transparent text-truncate small d-flex align-items-center justify-content-between ${
                              activeDossier?.id === d.id ? 'bg-secondary bg-opacity-20 text-white fw-bold' : 'text-secondary hover-lift'
                            }`}
                            onClick={() => {
                              setActiveDossier(d);
                              setSubject(d.subject);
                            }}
                          >
                            <span>{d.subject} ({d.subjectType})</span>
                            <span className="badge-trust-verified py-0 px-1.5" style={{ fontSize: '0.65rem' }}>
                              {d.trustVerificationScore}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Research Results Dossier Column */}
            <Col xs={12} lg={8}>
              {activeDossier ? (
                <div className="d-flex flex-column gap-3">
                  {/* Top Dossier Header Card */}
                  <div className="nexus-card">
                    <div className="nexus-card-body p-4">
                      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-15">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono fs-5 fw-bold text-white">{activeDossier.id}</span>
                            <span className="badge bg-purple bg-opacity-15 border border-purple border-opacity-30 font-mono small" style={{ color: '#A78BFA' }}>
                              {activeDossier.subjectType}
                            </span>
                            <span className="badge-trust-verified py-0.5 px-2">
                              <ShieldCheck size={13} /> {activeDossier.trustVerificationScore}% Verified
                            </span>
                          </div>
                          <h3 className="fw-bold text-white mb-1">{activeDossier.subject}</h3>
                          <div className="d-flex align-items-center gap-3 text-muted small flex-wrap">
                            <span><strong>Purpose:</strong> {activeDossier.meetingPurpose}</span>
                            <span><strong>Target Date:</strong> {activeDossier.meetingDate}</span>
                            <span><strong>Window:</strong> Past {activeDossier.researchWindowDays} Days</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="btn-nexus-secondary"
                            onClick={handleCopyDossier}
                          >
                            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="btn-nexus-purple"
                            onClick={() => setShowExportModal(true)}
                          >
                            <Download size={14} />
                            <span>Export PDF</span>
                          </Button>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <div>
                        <h6 className="fw-bold text-white small text-uppercase tracking-wider mb-2 d-flex align-items-center gap-1.5">
                          <Sparkles size={15} className="text-purple" style={{ color: '#A78BFA' }} />
                          Executive Pre-Meeting Synthesis
                        </h6>
                        <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 text-light small" style={{ lineHeight: '1.6' }}>
                          {activeDossier.executiveSummary}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* News & Official Announcements */}
                  <div className="nexus-card">
                    <div className="nexus-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <FileText size={17} className="text-purple" style={{ color: '#A78BFA' }} />
                        <h6 className="fw-bold mb-0 text-white">Recent Developments & Official Announcements</h6>
                      </div>
                      <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                        {(activeDossier.recentNews || []).length} Verified Sources
                      </Badge>
                    </div>

                    <div className="nexus-card-body p-3">
                      <div className="d-flex flex-column gap-3">
                        {(activeDossier.recentNews || []).map((news) => (
                          <div key={news.id} className="p-3 rounded-3 border border-secondary border-opacity-15 bg-secondary bg-opacity-10 hover-lift">
                            <div className="d-flex align-items-center justify-content-between mb-1.5 flex-wrap gap-2">
                              <span className="badge-trust-verified py-0.5 px-2" style={{ fontSize: '0.70rem' }}>
                                <CheckCircle2 size={11} /> {news.verificationStatus}
                              </span>
                              <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.75rem' }}>
                                <span>{news.source}</span>
                                <span>•</span>
                                <span>{news.publishedDate}</span>
                              </div>
                            </div>

                            <h6 className="fw-bold text-white mb-1.5" style={{ fontSize: '0.92rem' }}>
                              {news.headline}
                            </h6>
                            <p className="text-muted small mb-2" style={{ lineHeight: '1.5' }}>
                              {news.summary}
                            </p>

                            <a
                              href={news.url}
                              target="_blank"
                              rel="noreferrer"
                              className="small d-inline-flex align-items-center gap-1 text-cyan text-decoration-none"
                              style={{ fontSize: '0.75rem', color: '#22D3EE' }}
                            >
                              <span>View Source Reference</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Leadership Changes & Business Opportunities Grid */}
                  <Row className="g-3">
                    {/* Leadership Changes */}
                    <Col xs={12} md={6}>
                      <div className="nexus-card h-100">
                        <div className="nexus-card-header">
                          <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-1.5">
                            <Users size={16} className="text-purple" style={{ color: '#A78BFA' }} />
                            <span>Leadership & Key Hires</span>
                          </h6>
                        </div>
                        <div className="nexus-card-body p-3">
                          <div className="d-flex flex-column gap-2.5">
                            {(activeDossier.leadershipChanges || []).length > 0 ? (activeDossier.leadershipChanges || []).map((lead, idx) => (
                              <div key={idx} className="p-2.5 rounded-2 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 small">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <strong className="text-white">{lead.executive}</strong>
                                  <span className="badge-trust-verified py-0 px-1.5" style={{ fontSize: '0.65rem' }}>
                                    {lead.status}
                                  </span>
                                </div>
                                <div className="text-purple fw-semibold mb-1" style={{ color: '#A78BFA', fontSize: '0.78rem' }}>
                                  {lead.role}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                  {lead.notes}
                                </div>
                              </div>
                            )) : (
                              <div className="text-muted small py-2">No verified leadership changes flagged in retrieved sources.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Business Opportunities */}
                    <Col xs={12} md={6}>
                      <div className="nexus-card h-100">
                        <div className="nexus-card-header">
                          <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-1.5">
                            <TrendingUp size={16} className="text-cyan" style={{ color: '#22D3EE' }} />
                            <span>Business Opportunities</span>
                          </h6>
                        </div>
                        <div className="nexus-card-body p-3">
                          <div className="d-flex flex-column gap-2.5">
                            {(activeDossier.businessOpportunities || []).map((opp, idx) => (
                              <div key={idx} className="p-2.5 rounded-2 bg-secondary bg-opacity-10 border border-secondary border-opacity-15 small">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <strong className="text-white">{opp.title}</strong>
                                  <span className="badge bg-primary bg-opacity-20 text-cyan border border-primary border-opacity-30" style={{ fontSize: '0.65rem', color: '#22D3EE' }}>
                                    {opp.priority}
                                  </span>
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                  {opp.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Suggested Strategic Meeting Questions */}
                  <div className="nexus-card">
                    <div className="nexus-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <HelpCircle size={17} className="text-warning" />
                        <h6 className="fw-bold mb-0 text-white">Suggested Strategic Meeting Questions</h6>
                      </div>
                      <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                        {(activeDossier.suggestedQuestions || []).length} Questions
                      </Badge>
                    </div>

                    <div className="nexus-card-body p-3">
                      <div className="d-flex flex-column gap-2.5">
                        {(activeDossier.suggestedQuestions || []).map((q, idx) => (
                          <div key={idx} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-15">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="badge bg-warning bg-opacity-15 text-warning font-mono" style={{ fontSize: '0.68rem' }}>
                                {q.category}
                              </span>
                              <span className="text-muted font-mono" style={{ fontSize: '0.70rem' }}>Probe #{idx + 1}</span>
                            </div>
                            <p className="text-white small mb-0 fw-medium" style={{ lineHeight: '1.5' }}>
                              "{q.question}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Brain}
                  title="No Research Brief Selected"
                  description="Enter a company or executive name on the left and synthesize a comprehensive briefing dossier."
                />
              )}
            </Col>
          </Row>
        </Tab>

        {/* Tab 2: Secondary Audio/Video Ingestion & Diarization */}
        <Tab
          eventKey="audio"
          title={
            <span className="d-flex align-items-center gap-2">
              <Mic size={16} />
              <span>Audio Ingestion & Diarization</span>
            </span>
          }
        >
          {/* Integration Shortcuts Banner */}
          <div className="nexus-card mb-4">
            <div className="p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 p-2.5 text-white shadow-sm" style={{ background: '#8B5CF6' }}>
                  <Mic size={22} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-white">Automated Calendar & Audio Sync Bot</h6>
                  <span className="text-muted small">
                    Whisper v3 + PyAnnote 3.1 streaming diarization with automatic action item extraction.
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 p-2 d-flex align-items-center gap-1.5">
                  <span className="pulse-green"></span> Zoom Connected
                </span>
                <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 p-2 d-flex align-items-center gap-1.5">
                  <span className="pulse-green"></span> Google Meet Connected
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  className="btn-nexus-purple"
                  onClick={() => setIsUploadMeetingOpen(true)}
                >
                  <UploadCloud size={14} />
                  Upload Audio File
                </Button>
              </div>
            </div>
          </div>

          {/* Filter and View Toolbar */}
          <div className="nexus-card mb-4 p-3">
            <Row className="g-3 align-items-center justify-content-between">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroup.Text className="border-end-0">
                    <Search size={15} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by title, attendee, or keyword..."
                    className="border-start-0 ps-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Col>

              <Col xs={12} md={7}>
                <div className="d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                  <Form.Select
                    size="sm"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    style={{ width: 'auto', minWidth: '180px' }}
                  >
                    <option value="all">All Departments</option>
                    <option value="executive">Executive Leadership</option>
                    <option value="engineering">Engineering</option>
                    <option value="product">Product</option>
                    <option value="legal & safety">Legal & Safety</option>
                  </Form.Select>

                  {/* Grid / List Switcher */}
                  <div className="btn-group btn-group-sm border border-secondary border-opacity-25 rounded-2" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-dark text-muted'}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-dark text-muted'}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <ListIcon size={15} />
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Meetings Content View */}
          {meetingsLoading ? (
            <LoadingState message="Fetching diarized meeting records..." />
          ) : meetings.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="No Meeting Records Ingested Yet"
              description="Upload a meeting file or create a meeting record to view briefings and track action items."
            />
          ) : (
            <Row className="g-3">
              {meetings.map((meeting) => (
                <Col xs={12} md={6} key={meeting.id}>
                  <div className="nexus-card h-100 hover-lift d-flex flex-column justify-content-between">
                    <div className="nexus-card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary border-opacity-25 font-mono">
                          {meeting.department}
                        </Badge>
                        <span className="badge-trust-verified py-0.5 px-2">
                          <Sparkles size={12} /> {meeting.sentiment} ({meeting.sentimentScore}%)
                        </span>
                      </div>

                      <h5 className="fw-bold text-white mb-2">{meeting.title}</h5>
                      <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={13} /> {meeting.date}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={13} /> {meeting.duration}
                        </span>
                        <span className="font-mono text-white fw-semibold" style={{ fontSize: '0.75rem' }}>
                          {meeting.id}
                        </span>
                      </div>

                      <p className="text-secondary small mb-3" style={{ fontSize: '0.84rem' }}>
                        {meeting.summaryExcerpt}
                      </p>

                      <div className="d-flex align-items-center gap-2 pt-2 border-top border-secondary border-opacity-15">
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Attendees:</span>
                        <div className="d-flex align-items-center">
                          {meeting.participants.map((p, idx) => (
                            <div
                              key={idx}
                              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center border border-dark"
                              style={{
                                width: '26px',
                                height: '26px',
                                fontSize: '0.65rem',
                                backgroundColor: p.color,
                                marginLeft: idx > 0 ? '-6px' : '0'
                              }}
                              title={`${p.name} (${p.role})`}
                            >
                              {p.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="nexus-card-footer d-flex align-items-center justify-content-between p-3">
                      <div className="text-muted small">
                        <strong className="text-white">{meeting.actionItemsCount} Action Items</strong> • {meeting.keyDecisionsCount} Decisions
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="btn-nexus-purple p-1 px-3"
                        onClick={() => navigate('/briefing-results')}
                      >
                        <FileText size={14} />
                        View Briefing
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton className="border-secondary border-opacity-25">
          <Modal.Title className="h5 fw-bold text-white">Export Pre-Meeting Briefing Dossier</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-secondary small mb-3">
            Exporting verified research brief for <strong className="text-white">{activeDossier?.subject}</strong> including recent news, official claims, and suggested strategic questions.
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-secondary">Export Format</Form.Label>
            <Form.Select defaultValue="pdf">
              <option value="pdf">Corporate PDF Dossier (Executive Branded)</option>
              <option value="markdown">Markdown Document (.md)</option>
              <option value="json">Structured JSON Intelligence Feed</option>
            </Form.Select>
          </Form.Group>
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
              alert(`Pre-meeting brief for ${activeDossier?.subject} exported successfully.`);
              setShowExportModal(false);
            }}
          >
            <Download size={14} /> Download Dossier
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MeetingIntelligencePage;
