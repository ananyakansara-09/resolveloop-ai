import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AgentProvider } from './context/AgentContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AgentWorkspacePage } from './pages/AgentWorkspacePage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AgentProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/assistant" element={<AgentWorkspacePage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/cases/:id" element={<CaseDetailsPage />} />
              <Route path="/follow-ups" element={<FollowUpsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AgentProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
