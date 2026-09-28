import React from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ProjectDetailModal } from './components/project/ProjectDetailModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RiskAnalyticsPage } from './pages/RiskAnalyticsPage';
import { EarlyWarningsPage } from './pages/EarlyWarningsPage';
import { ProjectMapPage } from './pages/ProjectMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { AssistantPage } from './pages/AssistantPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const {
    activeTab,
    selectedProject,
    isDetailModalOpen,
    closeProjectDetails,
  } = useProjects();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'risk-analytics':
        return <RiskAnalyticsPage />;
      case 'early-warnings':
        return <EarlyWarningsPage />;
      case 'map':
        return <ProjectMapPage />;
      case 'reports':
        return <ReportsPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'data-quality':
        return <DataQualityPage />;
      case 'methodology':
        return <MethodologyPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Persistent Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 min-w-0 pb-16 md:pb-6">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Project Details Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={closeProjectDetails}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
