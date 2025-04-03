const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../config/firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get personalized news feed
router.get('/feed', auth, async (req, res) => {
  try {
    // Get user's portfolio
    const portfolioRef = db.collection('portfolios').doc(req.user.uid);
    const portfolioDoc = await portfolioRef.get();
    
    let stocks = [];
    if (portfolioDoc.exists) {
      stocks = portfolioDoc.data().stocks || [];
    }

    // Get news for user's stocks
    const newsPromises = stocks.map(async (stock) => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=${stock.stockName}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`
        );
        return response.data.articles;
      } catch (error) {
        console.error(`Error fetching news for ${stock.stockName}:`, error);
        return [];
      }
    });

    const newsResults = await Promise.all(newsPromises);
    const allNews = newsResults.flat();

    // Analyze sentiment for each article
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const analyzedNews = await Promise.all(
      allNews.slice(0, 10).map(async (article) => {
        try {
          const prompt = `Analyze the sentiment of this article title: "${article.title}"`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const sentiment = response.text().toLowerCase().includes('positive') ? 'positive' :
                          response.text().toLowerCase().includes('negative') ? 'negative' : 'neutral';
          
          return {
            ...article,
            sentiment
          };
        } catch (error) {
          console.error('Error analyzing sentiment:', error);
          return {
            ...article,
            sentiment: 'neutral'
          };
        }
      })
    );

    res.json(analyzedNews);
  } catch (error) {
    console.error('News Feed Error:', error);
    res.status(500).json({ message: 'Error fetching news feed' });
  }
});

// Get market overview
router.get('/market-overview', auth, async (req, res) => {
  try {
    const indices = ['SENSEX', 'NIFTY50', 'BANKNIFTY'];
    const marketData = await Promise.all(
      indices.map(async (index) => {
        try {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${index}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
          );
          const quote = response.data['Global Quote'];
          return {
            symbol: index,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent']
          };
        } catch (error) {
          console.error(`Error fetching data for ${index}:`, error);
          return null;
        }
      })
    );

    res.json({
      indices: marketData.filter(data => data !== null)
    });
  } catch (error) {
    console.error('Market Overview Error:', error);
    res.status(500).json({ message: 'Error fetching market overview' });
  }
});

// Get stock-specific news
router.get('/stock/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get stock price
    const priceResponse = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const priceData = priceResponse.data['Global Quote'];

    // Get news
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=${symbol}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json({
      price: {
        current: parseFloat(priceData['05. price']),
        change: parseFloat(priceData['09. change']),
        changePercent: priceData['10. change percent']
      },
      news: newsResponse.data.articles
    });
  } catch (error) {
    console.error('Stock News Error:', error);
    res.status(500).json({ message: 'Error fetching stock news' });
  }
});

module.exports = router; 