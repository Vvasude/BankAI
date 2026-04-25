export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, variant = 'default' }) => {
  const variants = {
    default: 'bg-primary-500/10 text-primary-600',
    danger: 'bg-danger-500/10 text-danger-600',
    success: 'bg-success-500/10 text-success-600',
    warning: 'bg-warning-500/10 text-warning-600'
  };

  return (
    <div 
      className="rounded-xl p-6"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p 
            className="text-sm font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${variants[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
