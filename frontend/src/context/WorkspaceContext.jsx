import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export const WORKSPACES = {
  ALL: 'all',
  AGENT_BENCH: 'agent-bench',
  MEETING_INTEL: 'meeting-intel'
};

export const WORKSPACE_METADATA = {
  [WORKSPACES.ALL]: {
    id: WORKSPACES.ALL,
    name: 'NexusAI Platform',
    shortName: 'Overview',
    badge: 'Dual Engine',
    description: 'Cross-platform synthesis across Autonomous Agents & Meeting Intelligence',
    color: 'primary',
    accentColor: '#3B82F6',
    secondaryColor: '#22D3EE',
    themeClass: 'workspace-all'
  },
  [WORKSPACES.AGENT_BENCH]: {
    id: WORKSPACES.AGENT_BENCH,
    name: 'AgentBench',
    shortName: 'AgentBench',
    badge: 'Evaluation Engine',
    description: 'Benchmark, compare and discover the best-performing AI agents',
    color: 'info',
    accentColor: '#3B82F6',
    secondaryColor: '#22D3EE',
    themeClass: 'workspace-agentbench'
  },
  [WORKSPACES.MEETING_INTEL]: {
    id: WORKSPACES.MEETING_INTEL,
    name: 'Meeting Intelligence',
    shortName: 'Meeting Intel',
    badge: 'Research & Briefing',
    description: 'Research companies and people, discover recent developments, and generate intelligent briefs',
    color: 'purple',
    accentColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    themeClass: 'workspace-meeting'
  }
};

export const WorkspaceProvider = ({ children }) => {
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return localStorage.getItem('nexus_workspace') || WORKSPACES.AGENT_BENCH;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRunBenchmarkOpen, setIsRunBenchmarkOpen] = useState(false);
  const [isRegisterAgentOpen, setIsRegisterAgentOpen] = useState(false);
  const [isUploadMeetingOpen, setIsUploadMeetingOpen] = useState(false);
  const [isPreMeetingResearchOpen, setIsPreMeetingResearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_workspace', activeWorkspace);
  }, [activeWorkspace]);

  // Handle Ctrl+K shortcut for quick search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    activeWorkspace,
    setActiveWorkspace,
    workspaceMeta: WORKSPACE_METADATA[activeWorkspace] || WORKSPACE_METADATA[WORKSPACES.AGENT_BENCH],
    isSearchOpen,
    setIsSearchOpen,
    isRunBenchmarkOpen,
    setIsRunBenchmarkOpen,
    isRegisterAgentOpen,
    setIsRegisterAgentOpen,
    isUploadMeetingOpen,
    setIsUploadMeetingOpen,
    isPreMeetingResearchOpen,
    setIsPreMeetingResearchOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
