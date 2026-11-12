import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppLayout from './components/layout/AppLayout';
import LoadingState from './components/common/LoadingState';

// Lazy-loaded workspace pages for fast initial load & Vite responsiveness
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const AgentBenchPage = lazy(() => import('./pages/AgentBench/AgentBenchPage'));
const BenchmarkResultsPage = lazy(() => import('./pages/BenchmarkResults/BenchmarkResultsPage'));
const AgentTracePage = lazy(() => import('./pages/AgentTrace/AgentTracePage'));
const MeetingIntelligencePage = lazy(() => import('./pages/MeetingIntelligence/MeetingIntelligencePage'));
const BriefingResultsPage = lazy(() => import('./pages/BriefingResults/BriefingResultsPage'));

export function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingState message="Loading NexusIQ workspace..." />}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<LandingPage />} />

              {/* AgentBench Workspace routes */}
              <Route path="agent-bench" element={<AgentBenchPage />} />
              <Route path="benchmark-results" element={<BenchmarkResultsPage />} />
              <Route path="agent-trace" element={<AgentTracePage />} />

              {/* Meeting Intelligence Workspace routes */}
              <Route path="meeting-intelligence" element={<MeetingIntelligencePage />} />
              <Route path="briefing-results" element={<BriefingResultsPage />} />

              {/* Platform Overview Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;
