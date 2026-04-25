import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header 
      className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30"
      style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderColor: 'var(--border-color)' 
      }}
    >
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Fraud Detection Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Monitor and analyze suspicious transactions
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 relative"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        <div className="w-px h-8" style={{ backgroundColor: 'var(--border-color)' }} />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <div 
              className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user?.name || 'User')
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {showDropdown && (
            <div 
              className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border py-1 z-50"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <button
                onClick={() => {
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
