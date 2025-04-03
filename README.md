# InvestEasy - AI-Powered Financial Assistant

InvestEasy is a comprehensive financial assistant platform that helps users make informed investment decisions using AI-driven insights, real-time market data, and personalized recommendations.

## Features

- User Authentication & Onboarding
- Personalized Investment Dashboard
- AI-Powered Chatbot Assistant
- Real-time Stock Market Data
- Portfolio Management
- News & Alerts with Sentiment Analysis
- Chat History
- Personalized Recommendations

## Tech Stack

- Frontend: Next.js (React)
- Backend: Node.js with Express
- Database: MongoDB
- APIs: AlphaVantage, News API
- AI: Gemini/LLM for chatbot, Reinforcement Learning for recommendations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- API keys for:
  - AlphaVantage
  - News API
  - Gemini/LLM API

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add required API keys and configuration

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
investeasy/
├── frontend/           # Next.js frontend application
├── backend/           # Node.js backend server
├── docs/             # Documentation
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 