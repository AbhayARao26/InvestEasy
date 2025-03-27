import React, { useState } from 'react';
import { Box, Paper, Container, Alert, CircularProgress } from '@mui/material';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (message) => {
    try {
      setLoading(true);
      setError(null);
      
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

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Empty response received');
      }

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
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
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </Paper>
    </Container>
  );
};

export default ChatInterface;