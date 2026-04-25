import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, CreditCard, MapPin, FileText, Loader2 } from 'lucide-react';
import { transactionsApi } from '../api/client';

export const TransactionDetailsPanel = ({ transaction, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState(null);

  useEffect(() => {
    if (transaction?.id) {
      fetchAuditLogs();
    }
  }, [transaction?.id]);

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const data = await transactionsApi.getAuditLogs(transaction.id);
      setAuditLogs(data);
    } catch (err) {
      setAuditError('Failed to load audit logs');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  if (!transaction) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const riskScore = parseFloat(transaction.riskScore);
  const isFlagged = transaction.flagged;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-lg z-50 overflow-y-auto shadow-xl transform transition-transform"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div 
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)' 
          }}
        >
          <div>
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Transaction Details
            </h2>
            <p 
              className="text-sm font-mono"
              style={{ color: 'var(--text-tertiary)' }}
            >
              #{transaction.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div 
            className={`p-4 rounded-xl ${
              isFlagged 
                ? 'bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20' 
                : 'bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {isFlagged ? (
                <div className="w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
              )}
              <div>
                <p className={`font-semibold ${isFlagged ? 'text-danger-700 dark:text-danger-400' : 'text-success-700 dark:text-success-400'}`}>
                  {isFlagged ? 'Flagged Transaction' : 'Safe Transaction'}
                </p>
                <p className={`text-sm ${isFlagged ? 'text-danger-600 dark:text-danger-300' : 'text-success-600 dark:text-success-300'}`}>
                  Risk Score: {(riskScore * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-4">
              <span 
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Amount
              </span>
              <span 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatCurrency(transaction.amount)}
              </span>
            </div>

            <div 
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <div 
                className={`h-full rounded-full transition-all ${
                  riskScore >= 0.7 
                    ? 'bg-danger-500' 
                    : riskScore >= 0.4 
                      ? 'bg-warning-500' 
                      : 'bg-success-500'
                }`}
                style={{ width: `${riskScore * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          <div 
            className="rounded-xl border divide-y"
            style={{ 
              borderColor: 'var(--border-color)',
              '--tw-divide-color': 'var(--border-color)'
            }}
          >
            <div className="flex items-center gap-3 p-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <CreditCard className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Merchant</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {transaction.merchant}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <MapPin className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Country</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {transaction.countryCode}
                </p>
              </div>
            </div>
          </div>

          {transaction.aiReason && (
            <div>
              <h3 
                className="font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <FileText className="w-5 h-5 text-primary-500" />
                AI Analysis
              </h3>
              <div 
                className="p-4 rounded-xl border text-sm leading-relaxed"
                style={{ 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-tertiary)'
                }}
              >
                {transaction.aiReason}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary-500" />
              <h3 
                className="font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Audit Log
              </h3>
            </div>

            {isLoadingAudit ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              </div>
            ) : auditError ? (
              <div className="p-4 text-center text-sm text-danger-500">
                {auditError}
              </div>
            ) : auditLogs.length === 0 ? (
              <div 
                className="p-4 text-center text-sm rounded-xl border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}
              >
                No audit logs available
              </div>
            ) : (
              <div 
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {auditLogs.map((log, index) => (
                  <div 
                    key={log.id}
                    className={`p-4 ${index !== auditLogs.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {log.model}
                      </span>
                      {log.riskContribution && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          parseFloat(log.riskContribution) >= 0.3 
                            ? 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400'
                            : 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400'
                        }`}>
                          +{(parseFloat(log.riskContribution) * 100).toFixed(0)}% risk
                        </span>
                      )}
                    </div>
                    <p 
                      className="font-medium text-sm mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {log.ruleName}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {log.message}
                    </p>
                    {log.createdAt && (
                      <p 
                        className="text-xs mt-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
