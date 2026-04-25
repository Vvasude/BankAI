import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
