const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../config/firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chatsRef = db.collection('chats').where('userId', '==', req.user.uid);
    const snapshot = await chatsRef.get();
    
    const chats = [];
    snapshot.forEach(doc => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(chats);
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Get specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chatRef = db.collection('chats').doc(req.params.chatId);
    const chatDoc = await chatRef.get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const chat = chatDoc.data();
    if (chat.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

// Create new chat
router.post('/new', auth, async (req, res) => {
  try {
    const { title } = req.body;
    const chatRef = db.collection('chats').doc();
    
    const chat = {
      userId: req.user.uid,
      title,
      messages: [],
      sentiment: 'neutral',
      relatedStocks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await chatRef.set(chat);
    res.json({ id: chatRef.id, ...chat });
  } catch (error) {
    console.error('New Chat Error:', error);
    res.status(500).json({ message: 'Error creating new chat' });
  }
});

// Send message to chat
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const chat = chatDoc.data();
    if (chat.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Get AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(content);
    const response = await result.response;
    const aiMessage = {
      role: 'assistant',
      content: response.text(),
      timestamp: new Date()
    };
    
    // Update chat with new messages
    const messages = [...chat.messages, userMessage, aiMessage];
    await chatRef.update({
      messages,
      updatedAt: new Date()
    });
    
    res.json({ id: chatId, messages });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const chat = chatDoc.data();
    if (chat.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await chatRef.delete();
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete Chat Error:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

module.exports = router; 