import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { ChatProvider } from './context/ChatContext';
import ChatInterface from '../src/components/Chat/ChatInterface';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App; 