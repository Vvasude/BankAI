import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Lock, Eye, EyeOff, Sun, Moon, User } from 'lucide-react';

export const Login = () => {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegisterMode) {
      const result = await register(email, password, name);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            FraudGuard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fraud Detection System
          </p>
        </div>

        <div 
          className="rounded-2xl p-8"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <h2 
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            {isRegisterMode ? 'Create an account' : 'Sign in to your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterMode && (
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Full name
                </label>
                <div className="relative">
                  <User 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@bank.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-500/10 text-danger-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isRegisterMode ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
              }}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <p 
          className="text-center text-sm mt-6"
          style={{ color: 'var(--text-tertiary)' }}
        >
          © 2026 FraudGuard. Secure fraud detection for modern banking.
        </p>
      </div>
    </div>
  );
};
