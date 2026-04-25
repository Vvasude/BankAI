import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<SettingsPlaceholder />} />
              <Route path="help" element={<HelpPlaceholder />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function SettingsPlaceholder() {
  return (
    <div 
      className="rounded-xl p-8 text-center"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      <h2 
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </h2>
      <p style={{ color: 'var(--text-tertiary)' }}>
        Settings page coming soon.
      </p>
    </div>
  );
}

function HelpPlaceholder() {
  return (
    <div 
      className="rounded-xl p-8 text-center"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      <h2 
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Help & Support
      </h2>
      <p style={{ color: 'var(--text-tertiary)' }}>
        Help documentation coming soon.
      </p>
    </div>
  );
}

export default App;
