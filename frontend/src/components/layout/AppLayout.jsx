import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Breadcrumbs from './Breadcrumbs';
import WorkspaceBanner from './WorkspaceBanner';
import GlobalSearchModal from '../common/GlobalSearchModal';
import RunBenchmarkModal from '../common/RunBenchmarkModal';
import RegisterAgentModal from '../common/RegisterAgentModal';
import UploadMeetingModal from '../common/UploadMeetingModal';
import PreMeetingResearchModal from '../common/PreMeetingResearchModal';

export const AppLayout = () => {
  const location = useLocation();

  // If on landing page "/", don't show the workspace sidebar and top navbar
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <>
        <Outlet />
        <GlobalSearchModal />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <TopNavbar />

        <main className="main-content">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Interactive Global Modals */}
      <GlobalSearchModal />
      <RunBenchmarkModal />
      <RegisterAgentModal />
      <UploadMeetingModal />
      <PreMeetingResearchModal />
    </div>
  );
};

export default AppLayout;
