import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/Landing/LandingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AgentBenchPage from './pages/AgentBench/AgentBenchPage';
import BenchmarkResultsPage from './pages/BenchmarkResults/BenchmarkResultsPage';
import AgentTracePage from './pages/AgentTrace/AgentTracePage';
import MeetingIntelligencePage from './pages/MeetingIntelligence/MeetingIntelligencePage';
import BriefingResultsPage from './pages/BriefingResults/BriefingResultsPage';

export function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Landing Page as default root experience */}
            <Route index element={<LandingPage />} />
            
            {/* AgentBench Workspace routes */}
            <Route path="agent-bench" element={<AgentBenchPage />} />
            <Route path="benchmark-results" element={<BenchmarkResultsPage />} />
            <Route path="agent-trace" element={<AgentTracePage />} />

            {/* Meeting Intelligence Workspace routes */}
            <Route path="meeting-intelligence" element={<MeetingIntelligencePage />} />
            <Route path="briefing-results" element={<BriefingResultsPage />} />

            {/* Platform Overview Dashboard (preserved) */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;
