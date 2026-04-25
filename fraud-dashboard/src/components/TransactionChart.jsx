import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const TransactionChart = ({ flagged, safe }) => {
  const total = flagged + safe;
  
  const data = [
    { name: 'Flagged', value: flagged, color: '#ef4444' },
    { name: 'Safe', value: safe, color: '#22c55e' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg px-3 py-2 shadow-lg border"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <p 
            className="text-sm font-medium"
            style={{ color: payload[0].payload.color }}
          >
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="rounded-xl p-6"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Transaction Distribution
      </h3>
      
      {total === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p 
            className="text-sm text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No transactions yet
          </p>
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-danger-50 dark:bg-danger-500/10">
              <p className="text-2xl font-bold text-danger-600">{flagged}</p>
              <p className="text-sm text-danger-600/80">Flagged</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success-50 dark:bg-success-500/10">
              <p className="text-2xl font-bold text-success-600">{safe}</p>
              <p className="text-sm text-success-600/80">Safe</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
