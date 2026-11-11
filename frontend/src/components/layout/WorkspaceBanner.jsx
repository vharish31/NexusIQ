import React from 'react';
import { Button } from 'react-bootstrap';
import { Layers, Bot, Mic, X } from 'lucide-react';
import { useWorkspace, WORKSPACES } from '../../context/WorkspaceContext';

export const WorkspaceBanner = () => {
  const { activeWorkspace, setActiveWorkspace, workspaceMeta } = useWorkspace();

  if (activeWorkspace === WORKSPACES.ALL) {
    return null;
  }

  const isAgent = activeWorkspace === WORKSPACES.AGENT_BENCH;

  return (
    <div
      className="d-flex align-items-center justify-content-between p-2.5 px-3 rounded-3 mb-3 border text-dark"
      style={{
        backgroundColor: isAgent ? '#f0f9ff' : '#fbf8ff',
        borderColor: isAgent ? '#bae6fd' : '#e9d5ff'
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <div
          className="rounded-2 p-1 text-white"
          style={{ backgroundColor: workspaceMeta.accentColor }}
        >
          {isAgent ? <Bot size={15} /> : <Mic size={15} />}
        </div>
        <div className="small">
          <strong className="text-dark me-1">Focused Workspace:</strong>
          <span className="text-secondary">{workspaceMeta.name}</span>
          <span className="d-none d-md-inline text-muted ms-2">— {workspaceMeta.description}</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button
          variant="link"
          size="sm"
          className="text-decoration-none text-muted small p-0 hover-primary"
          onClick={() => setActiveWorkspace(WORKSPACES.ALL)}
        >
          Reset to All Workspaces
        </Button>
        <button
          className="btn btn-sm btn-link text-muted p-0"
          onClick={() => setActiveWorkspace(WORKSPACES.ALL)}
          title="Clear Filter"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default WorkspaceBanner;
