import { useState } from 'react';
import { X, DollarSign, Store, Globe, Loader2 } from 'lucide-react';
import { transactionsApi } from '../api/client';

export const CreateTransactionModal = ({ onClose, onCreated }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!amount || !merchant || !countryCode) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const newTransaction = await transactionsApi.create(
        parseFloat(amount),
        merchant,
        countryCode.toUpperCase()
      );
      onCreated(newTransaction);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md rounded-2xl shadow-xl"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Create New Transaction
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label 
                htmlFor="amount" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
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
                htmlFor="merchant" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Merchant
              </label>
              <div className="relative">
                <Store 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="merchant"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Amazon, Walmart, etc."
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
                htmlFor="countryCode" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Country Code
              </label>
              <div className="relative">
                <Globe 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="countryCode"
                  type="text"
                  maxLength="2"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  placeholder="US, UK, CA, etc."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-500/10 text-danger-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg border font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Create Transaction'
                )}
              </button>
            </div>

            <p 
              className="text-xs text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              The transaction will be analyzed by AI for fraud detection
            </p>
          </form>
        </div>
      </div>
    </>
  );
};
