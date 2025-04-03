const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../config/firebase-admin');

// Get user's portfolio
router.get('/', auth, async (req, res) => {
  try {
    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();

    if (!portfolioDoc.exists) {
      return res.json([]);
    }

    res.json(portfolioDoc.data().stocks || []);
  } catch (error) {
    console.error('Portfolio Error:', error);
    res.status(500).json({ message: 'Error fetching portfolio' });
  }
});

// Add stock to portfolio
router.post('/add', auth, async (req, res) => {
  try {
    const { stockName, quantity, averageBuyPrice } = req.body;
    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();

    const newStock = {
      stockName,
      quantity: Number(quantity),
      averageBuyPrice: Number(averageBuyPrice),
      currentPrice: 0, // Will be updated by market data
      profitLoss: 0,
      profitLossPercentage: 0
    };

    if (!portfolioDoc.exists) {
      await portfolioRef.set({
        stocks: [newStock]
      });
    } else {
      const stocks = portfolioDoc.data().stocks || [];
      stocks.push(newStock);
      await portfolioRef.update({ stocks });
    }

    res.json(newStock);
  } catch (error) {
    console.error('Add Stock Error:', error);
    res.status(500).json({ message: 'Error adding stock' });
  }
});

// Update stock in portfolio
router.put('/update/:stockName', auth, async (req, res) => {
  try {
    const { stockName } = req.params;
    const { quantity, averageBuyPrice } = req.body;

    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();

    if (!portfolioDoc.exists) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const stocks = portfolioDoc.data().stocks || [];
    const stockIndex = stocks.findIndex(s => s.stockName === stockName);

    if (stockIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }

    stocks[stockIndex] = {
      ...stocks[stockIndex],
      quantity: Number(quantity),
      averageBuyPrice: Number(averageBuyPrice)
    };

    await portfolioRef.update({ stocks });
    res.json(stocks[stockIndex]);
  } catch (error) {
    console.error('Update Stock Error:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Remove stock from portfolio
router.delete('/remove/:stockName', auth, async (req, res) => {
  try {
    const { stockName } = req.params;
    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();

    if (!portfolioDoc.exists) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const stocks = portfolioDoc.data().stocks || [];
    const filteredStocks = stocks.filter(s => s.stockName !== stockName);

    await portfolioRef.update({ stocks: filteredStocks });
    res.json({ message: 'Stock removed successfully' });
  } catch (error) {
    console.error('Remove Stock Error:', error);
    res.status(500).json({ message: 'Error removing stock' });
  }
});

// Update financial goals
router.put('/goals', auth, async (req, res) => {
  try {
    const { investmentAmount, targetReturn, timePeriod } = req.body;
    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();

    const goals = {
      investmentAmount: Number(investmentAmount),
      targetReturn: Number(targetReturn),
      timePeriod: Number(timePeriod)
    };

    if (!portfolioDoc.exists) {
      await portfolioRef.set({ goals });
    } else {
      await portfolioRef.update({ goals });
    }

    res.json(goals);
  } catch (error) {
    console.error('Update Goals Error:', error);
    res.status(500).json({ message: 'Error updating goals' });
  }
});

module.exports = router; 