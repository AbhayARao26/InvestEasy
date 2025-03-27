import React, { useState } from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about investing..."
        disabled={disabled}
        variant="outlined"
      />
      <IconButton 
        type="submit" 
        color="primary" 
        disabled={disabled || !message.trim()}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput; 