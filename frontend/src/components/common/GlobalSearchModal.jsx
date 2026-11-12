import React, { useState, useEffect } from 'react';
import { Modal, Form, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Search, FlaskConical, BarChart3, Activity, Brain, FileText, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const GlobalSearchModal = () => {
  const { isSearchOpen, setIsSearchOpen } = useWorkspace();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    suites: [],
    traces: [],
    dossiers: [],
    meetings: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSearchOpen || !query.trim()) {
      setSearchResults({ suites: [], traces: [], dossiers: [], meetings: [] });
      return;
    }
    const timer = setTimeout(() => {
      api.globalSearch(query)
        .then((res) => {
          if (res?.data) {
            setSearchResults(res.data);
          }
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const filteredSuites = searchResults.suites || [];
  const filteredTraces = searchResults.traces || [];
  const filteredDossiers = searchResults.dossiers || [];
  const filteredMeetings = searchResults.meetings || [];

  const totalResults = query.trim() ? filteredSuites.length + filteredTraces.length + filteredDossiers.length + filteredMeetings.length : 0;

  return (
    <Modal show={isSearchOpen} onHide={handleClose} size="lg" centered className="nexus-search-modal">
      <Modal.Header closeButton className="border-secondary border-opacity-25 pb-2">
        <InputGroup className="w-100">
          <InputGroup.Text className="bg-transparent border-0 ps-1 text-cyan" style={{ color: '#22D3EE' }}>
            <Search size={20} />
          </InputGroup.Text>
          <Form.Control
            autoFocus
            placeholder="Search across benchmarks, research dossiers, traces, and models..."
            className="border-0 shadow-none fs-5 fw-medium text-white bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </Modal.Header>
      <Modal.Body className="pt-2 pb-4">
        {!query.trim() ? (
          <div>
            <div className="small text-uppercase fw-bold text-muted px-2 mb-2 tracking-wider" style={{ fontSize: '0.72rem' }}>
              Quick Navigation
            </div>
            <div className="d-flex flex-column gap-1">
              <button
                className="btn btn-dark text-start border-0 p-2.5 rounded-3 d-flex align-items-center justify-content-between hover-lift text-light"
                onClick={() => handleNavigate('/agent-bench')}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <FlaskConical size={17} className="text-cyan" style={{ color: '#22D3EE' }} />
                  <span className="fw-medium text-white small">AgentBench Suite Runner</span>
                </div>
                <Badge bg="primary" className="bg-opacity-20 text-cyan border border-primary border-opacity-30 font-mono" style={{ color: '#22D3EE' }}>W1</Badge>
              </button>

              <button
                className="btn btn-dark text-start border-0 p-2.5 rounded-3 d-flex align-items-center justify-content-between hover-lift text-light"
                onClick={() => handleNavigate('/benchmark-results')}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <BarChart3 size={17} className="text-primary" />
                  <span className="fw-medium text-white small">Model Performance Leaderboard</span>
                </div>
                <Badge bg="primary" className="bg-opacity-20 text-cyan border border-primary border-opacity-30 font-mono" style={{ color: '#22D3EE' }}>W1</Badge>
              </button>

              <button
                className="btn btn-dark text-start border-0 p-2.5 rounded-3 d-flex align-items-center justify-content-between hover-lift text-light"
                onClick={() => handleNavigate('/agent-trace')}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Activity size={17} className="text-info" />
                  <span className="fw-medium text-white small">Execution Traces & Observability</span>
                </div>
                <Badge bg="primary" className="bg-opacity-20 text-cyan border border-primary border-opacity-30 font-mono" style={{ color: '#22D3EE' }}>W1</Badge>
              </button>

              <button
                className="btn btn-dark text-start border-0 p-2.5 rounded-3 d-flex align-items-center justify-content-between hover-lift text-light"
                onClick={() => handleNavigate('/meeting-intelligence')}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Brain size={17} className="text-purple" style={{ color: '#A78BFA' }} />
                  <span className="fw-medium text-white small">Pre-Meeting Research & Dossiers</span>
                </div>
                <Badge bg="purple" className="bg-opacity-20 text-purple border border-purple border-opacity-30 font-mono" style={{ color: '#A78BFA' }}>W2</Badge>
              </button>

              <button
                className="btn btn-dark text-start border-0 p-2.5 rounded-3 d-flex align-items-center justify-content-between hover-lift text-light"
                onClick={() => handleNavigate('/briefing-results')}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <FileText size={17} className="text-warning" />
                  <span className="fw-medium text-white small">Executive Briefing & Action Center</span>
                </div>
                <Badge bg="purple" className="bg-opacity-20 text-purple border border-purple border-opacity-30 font-mono" style={{ color: '#A78BFA' }}>W2</Badge>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="small text-muted px-2 mb-2">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            </div>

            {/* Research Dossiers */}
            {filteredDossiers.length > 0 && (
              <div className="mb-3">
                <div className="small text-uppercase fw-bold text-muted px-2 mb-1" style={{ fontSize: '0.70rem' }}>Pre-Meeting Research Dossiers</div>
                {filteredDossiers.map(d => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-2 d-flex align-items-center justify-content-between hover-lift mb-1 text-light cursor-pointer"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', cursor: 'pointer' }}
                    onClick={() => handleNavigate('/meeting-intelligence')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Brain size={16} className="text-purple" style={{ color: '#A78BFA' }} />
                      <div>
                        <div className="fw-semibold text-white small">{d.subject} ({d.subjectType})</div>
                        <div className="text-muted" style={{ fontSize: '0.74rem' }}>{d.meetingPurpose} • {d.trustVerificationScore}% Verified</div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-muted" />
                  </div>
                ))}
              </div>
            )}

            {/* Benchmark Suites */}
            {filteredSuites.length > 0 && (
              <div className="mb-3">
                <div className="small text-uppercase fw-bold text-muted px-2 mb-1" style={{ fontSize: '0.70rem' }}>Benchmark Suites</div>
                {filteredSuites.map(suite => (
                  <div
                    key={suite.id}
                    className="p-2.5 rounded-2 d-flex align-items-center justify-content-between hover-lift mb-1 text-light cursor-pointer"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', cursor: 'pointer' }}
                    onClick={() => handleNavigate('/agent-bench')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <FlaskConical size={16} className="text-cyan" style={{ color: '#22D3EE' }} />
                      <div>
                        <div className="fw-semibold text-white small">{suite.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.74rem' }}>{suite.category} • {suite.testCasesCount} Vectors</div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-muted" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GlobalSearchModal;
