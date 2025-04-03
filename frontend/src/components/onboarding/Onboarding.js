'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import styles from './Onboarding.module.css';

const popularStocks = [
  { symbol: 'SENSEX', name: 'S&P BSE SENSEX' },
  { symbol: 'NIFTY', name: 'NIFTY 50' },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK' },
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  { symbol: 'SBIN', name: 'State Bank of India' }
];

const Onboarding = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { updatePortfolio, loading: firestoreLoading, error: firestoreError } = useFirestore();
  
  const [step, setStep] = useState(1);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [hasPortfolio, setHasPortfolio] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [financialGoals, setFinancialGoals] = useState({
    investmentAmount: '',
    targetReturn: '',
    timePeriod: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const handleStockSelect = (stock) => {
    setSelectedStocks(prev => {
      if (prev.find(s => s.symbol === stock.symbol)) {
        return prev.filter(s => s.symbol !== stock.symbol);
      }
      return [...prev, stock];
    });
  };

  const handlePortfolioAdd = () => {
    setPortfolio(prev => [...prev, { stockName: '', quantity: '', averageBuyPrice: '' }]);
  };

  const handlePortfolioUpdate = (index, field, value) => {
    setPortfolio(prev => {
      const newPortfolio = [...prev];
      newPortfolio[index] = { ...newPortfolio[index], [field]: value };
      return newPortfolio;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // Prepare portfolio data
      const portfolioData = {
        stocks: portfolio.map(stock => ({
          ...stock,
          quantity: Number(stock.quantity),
          averageBuyPrice: Number(stock.averageBuyPrice)
        })),
        selectedStocks: selectedStocks.map(stock => stock.symbol),
        goals: {
          ...financialGoals,
          investmentAmount: Number(financialGoals.investmentAmount),
          targetReturn: Number(financialGoals.targetReturn),
          timePeriod: Number(financialGoals.timePeriod)
        }
      };

      // Update portfolio in Firestore
      await updatePortfolio(portfolioData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Error saving your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.step}>
            <h2>Select Stocks of Interest</h2>
            <p>Choose the stocks you want to track and get insights about.</p>
            <div className={styles.stockGrid}>
              {popularStocks.map(stock => (
                <button
                  key={stock.symbol}
                  className={`${styles.stockButton} ${
                    selectedStocks.find(s => s.symbol === stock.symbol) ? styles.selected : ''
                  }`}
                  onClick={() => handleStockSelect(stock)}
                >
                  {stock.name}
                </button>
              ))}
            </div>
            <button
              className={styles.nextButton}
              onClick={() => setStep(2)}
              disabled={selectedStocks.length === 0}
            >
              Next
            </button>
          </div>
        );

      case 2:
        return (
          <div className={styles.step}>
            <h2>Do you have an existing portfolio?</h2>
            <div className={styles.portfolioOptions}>
              <button
                className={`${styles.optionButton} ${hasPortfolio === true ? styles.selected : ''}`}
                onClick={() => setHasPortfolio(true)}
              >
                Yes
              </button>
              <button
                className={`${styles.optionButton} ${hasPortfolio === false ? styles.selected : ''}`}
                onClick={() => setHasPortfolio(false)}
              >
                No
              </button>
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.backButton} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className={styles.nextButton}
                onClick={() => setStep(3)}
                disabled={hasPortfolio === null}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.step}>
            <h2>Enter Your Portfolio Details</h2>
            {portfolio.map((item, index) => (
              <div key={index} className={styles.portfolioForm}>
                <input
                  type="text"
                  placeholder="Stock Name"
                  value={item.stockName}
                  onChange={(e) => handlePortfolioUpdate(index, 'stockName', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handlePortfolioUpdate(index, 'quantity', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Average Buy Price"
                  value={item.averageBuyPrice}
                  onChange={(e) => handlePortfolioUpdate(index, 'averageBuyPrice', e.target.value)}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => setPortfolio(prev => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className={styles.addButton} onClick={handlePortfolioAdd}>
              Add Stock
            </button>
            <div className={styles.buttonGroup}>
              <button className={styles.backButton} onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className={styles.nextButton}
                onClick={() => setStep(4)}
                disabled={hasPortfolio && portfolio.length === 0}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.step}>
            <h2>Set Your Financial Goals</h2>
            <div className={styles.goalsForm}>
              <input
                type="number"
                placeholder="Investment Amount (₹)"
                value={financialGoals.investmentAmount}
                onChange={(e) =>
                  setFinancialGoals(prev => ({ ...prev, investmentAmount: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Target Return (%)"
                value={financialGoals.targetReturn}
                onChange={(e) =>
                  setFinancialGoals(prev => ({ ...prev, targetReturn: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Time Period (months)"
                value={financialGoals.timePeriod}
                onChange={(e) =>
                  setFinancialGoals(prev => ({ ...prev, timePeriod: e.target.value }))
                }
              />
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.backButton} onClick={() => setStep(3)}>
                Back
              </button>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={loading || firestoreLoading}
              >
                {loading || firestoreLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        {firestoreError && <div className={styles.error}>{firestoreError}</div>}
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding; 