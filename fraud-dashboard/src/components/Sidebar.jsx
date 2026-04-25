import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Shield, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard?filter=flagged', icon: AlertTriangle, label: 'Flagged' },
  { path: '/dashboard?filter=safe', icon: Shield, label: 'Safe' },
];

const bottomNavItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
];

export const Sidebar = ({ isCollapsed, onToggle }) => {
  return (
    <aside 
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">FraudGuard</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 py-4">
        <div className="px-3 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </div>
        
        <button
          onClick={onToggle}
          className="w-full mt-4 px-3 flex items-center justify-center"
        >
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
};
