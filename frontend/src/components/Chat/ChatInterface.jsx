import React, { useState } from 'react';
import { Box, Paper, Container } from '@mui/material';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (message) => {
    try {
      setLoading(true);
      // Add user message to chat
      const userMessage = { role: 'user', content: message };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage]
        }),
      });

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </Box>
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </Paper>
    </Container>
  );
};

export default ChatInterface; 