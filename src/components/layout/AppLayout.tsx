import React, { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-wrapper">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="app-main">
        <TopNavbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="app-content">{children}</main>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 1030 }}
        />
      )}
    </div>
  );
};
