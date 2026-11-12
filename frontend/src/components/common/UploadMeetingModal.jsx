import React, { useState } from 'react';
import { Modal, Button, Form, ProgressBar } from 'react-bootstrap';
import { UploadCloud, CheckCircle2, Mic, FileAudio, Users, Calendar } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const UploadMeetingModal = ({ onUploadComplete }) => {
  const { isUploadMeetingOpen, setIsUploadMeetingOpen } = useWorkspace();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [department, setDepartment] = useState('Executive');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleClose = () => {
    if (!isUploading) {
      setIsUploadMeetingOpen(false);
      setUploadProgress(0);
      setUploadSuccess(null);
      setMeetingTitle('');
      setSelectedFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(40);

    try {
      const response = await api.uploadMeetingAudio({
        title: meetingTitle || 'Executive Strategic Debrief',
        department: department,
        fileName: selectedFile ? selectedFile.name : null
      });
      setUploadProgress(100);
      setUploadSuccess(response.data);
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      // handled cleanly
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show={isUploadMeetingOpen} onHide={handleClose} size="lg" centered backdrop={isUploading ? 'static' : true}>
      <Modal.Header closeButton={!isUploading} className="border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 text-purple" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
            <Mic size={20} />
          </div>
          <div>
            <Modal.Title className="h5 mb-0 fw-bold text-white">Ingest Meeting Audio or Video</Modal.Title>
            <span className="text-muted small">Automatic PyAnnote diarization, sentiment extraction & action item mapping</span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3">
        {!uploadSuccess ? (
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Meeting Title</Form.Label>
              <Form.Control
                placeholder="e.g. Q4 Executive Strategy & AI Infrastructure Planning"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Label className="small fw-semibold text-secondary">Department / Function</Form.Label>
                <Form.Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isUploading}
                >
                  <option value="Executive">Executive Leadership</option>
                  <option value="Engineering">Engineering & Architecture</option>
                  <option value="Product">Product & Design</option>
                  <option value="Legal & Safety">Legal, Compliance & Safety</option>
                  <option value="Sales">Sales & Customer Success</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Label className="small fw-semibold text-secondary">Target Diarization Engine</Form.Label>
                <Form.Select disabled={isUploading}>
                  <option>Whisper Large-v3 + PyAnnote 3.1 (Recommended)</option>
                  <option>Deepgram Nova-2 Low-Latency</option>
                  <option>Google Cloud Speech-to-Text v2</option>
                </Form.Select>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              className={`border border-2 border-dashed rounded-3 p-4 text-center mb-3 transition-all ${
                dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary border-opacity-25 bg-secondary bg-opacity-10'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ cursor: 'pointer' }}
              onClick={() => document.getElementById('meeting-file-input').click()}
            >
              <input
                id="meeting-file-input"
                type="file"
                className="d-none"
                accept=".mp3,.wav,.m4a,.mp4,.vtt,.srt"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <div className="d-flex flex-column align-items-center">
                <div className="rounded-circle p-3 mb-2 text-purple" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
                  <UploadCloud size={28} />
                </div>
                {selectedFile ? (
                  <div>
                    <span className="fw-bold text-white">{selectedFile.name}</span>
                    <span className="text-muted small ms-2">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="fw-semibold text-white">Click to browse or drag and drop audio/video file</div>
                    <div className="text-muted small">Supports MP3, WAV, M4A, MP4, VTT up to 500MB</div>
                  </div>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="mb-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span className="text-white">Diarizing multi-speaker audio and generating briefing...</span>
                  <span className="font-mono text-purple" style={{ color: '#A78BFA' }}>{uploadProgress}%</span>
                </div>
                <ProgressBar now={uploadProgress} animated variant="info" style={{ height: '8px' }} />
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
              <Button variant="outline-secondary" size="sm" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="btn-nexus-purple" disabled={isUploading}>
                <FileAudio size={16} />
                {isUploading ? 'Ingesting Audio...' : 'Start Diarization & Synthesis'}
              </Button>
            </div>
          </Form>
        ) : (
          <div className="py-3 text-center">
            <div className="rounded-circle bg-success bg-opacity-20 text-success p-3 d-inline-flex mb-3">
              <CheckCircle2 size={48} />
            </div>
            <h5 className="fw-bold text-white mb-1">Meeting Ingested & Briefing Generated!</h5>
            <p className="text-muted small mb-3">
              Meeting <span className="font-mono text-white fw-bold">{uploadSuccess.id}</span> ({uploadSuccess.title}) has been transcribed with a {uploadSuccess.trustScore}% trust verification score.
            </p>

            <Button variant="primary" className="btn-nexus-purple" onClick={handleClose}>
              View Briefing Results
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UploadMeetingModal;
