'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { getPortfolio, getChatHistory, createChat, updateChat } = useFirestore();
  
  const [portfolio, setPortfolio] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [news, setNews] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, router]);

  const getAuthHeaders = async () => {
    try {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (err) {
      console.error('Error getting auth token:', err);
      throw new Error('Authentication failed');
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Get auth headers
      const headers = await getAuthHeaders();

      // Fetch portfolio
      const portfolioData = await getPortfolio();
      if (!portfolioData) {
        throw new Error('Failed to fetch portfolio data');
      }
      setPortfolio(portfolioData?.stocks || []);

      // Fetch market overview
      const marketResponse = await fetch(`${API_BASE_URL}/news/market-overview`, {
        headers
      });
      if (!marketResponse.ok) {
        const errorData = await marketResponse.json();
        throw new Error(errorData.message || 'Failed to fetch market data');
      }
      const marketData = await marketResponse.json();
      setMarketOverview(marketData);

      // Fetch news feed
      const newsResponse = await fetch(`${API_BASE_URL}/news/feed`, {
        headers
      });
      if (!newsResponse.ok) {
        const errorData = await newsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch news data');
      }
      const newsData = await newsResponse.json();
      setNews(newsData);

      // Fetch chat history
      const chats = await getChatHistory();
      if (!chats) {
        throw new Error('Failed to fetch chat history');
      }
      setChatHistory(chats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error fetching dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const chat = await createChat('New Chat');
      setCurrentChat(chat);
      setChatHistory(prev => [chat, ...prev]);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Error creating new chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChat || !user) return;

    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX
    
    try {
      setLoading(true);
      setError('');
      
      // Get auth headers
      const headers = await getAuthHeaders();

      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      
      const updatedMessages = [...currentChat.messages, userMessage];
      setCurrentChat(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      // Send message to backend
      const response = await fetch(`${API_BASE_URL}/chat/${currentChat.id}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: messageText
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get AI response');
      }
      
      const { messages: newMessages } = await response.json();
      
      // Update chat in Firestore and local state
      await updateChat(currentChat.id, newMessages);
      setCurrentChat(prev => ({
        ...prev,
        messages: newMessages
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Error sending message. Please try again.');
      
      // Revert the optimistic update if there's an error
      setCurrentChat(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Error signing out');
    }
  };

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>InvestEasy</h1>
        <div className={styles.userMenu}>
          <span>{user?.displayName}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        <nav className={styles.sidebar}>
          <div className={styles.menu}>
            <button className={styles.menuButton}>Home</button>
            <button className={styles.menuButton}>Update Portfolio</button>
            <button className={styles.menuButton}>News & Alerts</button>
            <button className={styles.menuButton}>Old Chats</button>
            <button className={styles.menuButton}>Settings</button>
          </div>

          <div className={styles.chatHistory}>
            <h3>Chat History</h3>
            <button onClick={handleNewChat} className={styles.newChatButton}>
              New Chat
            </button>
            {chatHistory.map(chat => (
              <button
                key={chat.id}
                className={`${styles.chatButton} ${
                  currentChat?.id === chat.id ? styles.active : ''
                }`}
                onClick={() => setCurrentChat(chat)}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.portfolioSection}>
            <h2>Your Portfolio</h2>
            <div className={styles.portfolioGrid}>
              {portfolio.map(stock => (
                <div key={stock.stockName} className={styles.portfolioCard}>
                  <h3>{stock.stockName}</h3>
                  <div className={styles.stockDetails}>
                    <p>Quantity: {stock.quantity}</p>
                    <p>Avg Price: ₹{stock.averageBuyPrice}</p>
                    <p>Current: ₹{stock.currentPrice || 'Loading...'}</p>
                    {stock.profitLoss != null && (
                      <p className={stock.profitLoss >= 0 ? styles.positive : styles.negative}>
                        P/L: ₹{stock.profitLoss.toFixed(2)} ({stock.profitLossPercentage?.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.marketSection}>
            <h2>Market Overview</h2>
            {marketOverview && (
              <div className={styles.marketGrid}>
                {marketOverview.indices.map(index => (
                  <div key={index.symbol} className={styles.marketCard}>
                    <h3>{index.symbol}</h3>
                    <p>₹{index.price}</p>
                    <p className={index.change >= 0 ? styles.positive : styles.negative}>
                      {index.change > 0 ? '+' : ''}{index.change} ({index.changePercent})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentChat && (
            <div className={styles.chatSection}>
              <h2>AI Assistant</h2>
              <div className={styles.chatMessages}>
                {currentChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about your investments..."
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  className={styles.sendButton}
                  disabled={loading || !message.trim()}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 