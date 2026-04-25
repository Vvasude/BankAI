import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Activity,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';
import { transactionsApi } from '../api/client';
import { TransactionDetailsPanel } from '../components/TransactionDetailsPanel';
import { StatsCard } from '../components/StatsCard';
import { TransactionChart } from '../components/TransactionChart';
import { CreateTransactionModal } from '../components/CreateTransactionModal';

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filter = searchParams.get('filter') || 'all';

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsApi.list();
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const setFilter = (newFilter) => {
    if (newFilter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', newFilter);
    }
    setSearchParams(searchParams);
  };

  const stats = useMemo(() => {
    const flagged = transactions.filter(t => t.flagged).length;
    const safe = transactions.filter(t => !t.flagged).length;
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgRiskScore = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + parseFloat(t.riskScore), 0) / transactions.length 
      : 0;

    return {
      total: transactions.length,
      flagged,
      safe,
      totalAmount,
      avgRiskScore: avgRiskScore.toFixed(2),
      flaggedPercentage: transactions.length > 0 
        ? ((flagged / transactions.length) * 100).toFixed(1) 
        : '0'
    };
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (filter === 'flagged') {
      result = result.filter(t => t.flagged);
    } else if (filter === 'safe') {
      result = result.filter(t => !t.flagged);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.merchant.toLowerCase().includes(query) ||
        t.countryCode.toLowerCase().includes(query) ||
        t.userEmail.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'amount' || sortBy === 'riskScore') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [transactions, filter, searchQuery, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getRiskBadgeColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 0.7) return 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400';
    if (numScore >= 0.4) return 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400';
    return 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400';
  };

  const handleTransactionCreated = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }}>Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-danger-500 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Transactions"
          value={stats.total}
          subtitle="All time"
          icon={Activity}
          variant="default"
        />
        <StatsCard
          title="Flagged Transactions"
          value={stats.flagged}
          subtitle={`${stats.flaggedPercentage}% of total`}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Safe Transactions"
          value={stats.safe}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Total Volume"
          value={formatCurrency(stats.totalAmount)}
          subtitle={`Avg Risk: ${(stats.avgRiskScore * 100).toFixed(0)}%`}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div 
            className="rounded-xl overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <div 
              className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                    {['all', 'flagged', 'safe'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                          filter === f 
                            ? 'bg-primary-500 text-white' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        style={filter !== f ? { color: 'var(--text-secondary)' } : {}}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Transaction
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <button
                  onClick={fetchTransactions}
                  disabled={isLoading}
                  className="p-2 rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'amount', label: 'Amount' },
                      { key: 'merchant', label: 'Merchant' },
                      { key: 'countryCode', label: 'Country' },
                      { key: 'riskScore', label: 'Risk Score' },
                      { key: 'flagged', label: 'Status' },
                      { key: 'actions', label: '', sortable: false }
                    ].map((col) => (
                      <th 
                        key={col.key}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                          col.sortable !== false ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''
                        }`}
                        style={{ color: 'var(--text-tertiary)' }}
                        onClick={() => col.sortable !== false && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable !== false && sortBy === col.key && (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--border-color)' }}>
                  {filteredAndSortedTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <td className="px-4 py-4">
                        <span 
                          className="text-sm font-mono"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          #{transaction.id}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span 
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p 
                          className="font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {transaction.merchant}
                        </p>
                      </td>
                      <td 
                        className="px-4 py-4 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {transaction.countryCode}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-16 h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <div 
                              className={`h-full rounded-full ${
                                parseFloat(transaction.riskScore) >= 0.7 
                                  ? 'bg-danger-500' 
                                  : parseFloat(transaction.riskScore) >= 0.4 
                                    ? 'bg-warning-500' 
                                    : 'bg-success-500'
                              }`}
                              style={{ width: `${parseFloat(transaction.riskScore) * 100}%` }}
                            />
                          </div>
                          <span 
                            className={`text-sm font-medium px-2 py-0.5 rounded ${getRiskBadgeColor(transaction.riskScore)}`}
                          >
                            {(parseFloat(transaction.riskScore) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {transaction.flagged ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400">
                            <AlertTriangle className="w-3 h-3" />
                            Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400">
                            <CheckCircle className="w-3 h-3" />
                            Safe
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button 
                          className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: 'var(--text-tertiary)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedTransactions.length === 0 && (
              <div className="p-8 text-center">
                <p style={{ color: 'var(--text-tertiary)' }}>
                  {transactions.length === 0 
                    ? 'No transactions yet. Create your first transaction to get started.'
                    : 'No transactions found matching your criteria.'}
                </p>
              </div>
            )}

            <div 
              className="px-4 py-3 border-t flex items-center justify-between text-sm"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-tertiary)'
              }}
            >
              <span>
                Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
              </span>
              <div className="flex items-center gap-2">
                <span>Sort by: {sortBy} ({sortOrder})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <TransactionChart flagged={stats.flagged} safe={stats.safe} />
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetailsPanel 
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {showCreateModal && (
        <CreateTransactionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTransactionCreated}
        />
      )}
    </div>
  );
};
