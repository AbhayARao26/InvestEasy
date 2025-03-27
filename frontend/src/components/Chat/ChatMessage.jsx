import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          backgroundColor: isUser ? 'primary.light' : 'grey.100',
          color: isUser ? 'white' : 'text.primary'
        }}
      >
        <Typography variant="body1">
          {message.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage; 