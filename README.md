# InvestEasy - GenAI Financial Assistant

A conversational AI-powered financial assistant that helps users make informed investment decisions and improve their financial literacy.

## Features

- 🤖 Conversational AI for financial queries
- 📊 Personalized investment recommendations
- 📈 Real-time market insights
- 💼 Portfolio tracking
- ⚠️ Regulatory compliance & risk warnings

## Tech Stack

- Frontend: React.js
- Backend: Python (FastAPI)
- AI/ML: Google Gemini API
- Database: Firebase
- Cloud Services: Google Cloud Platform
  - Cloud Functions
  - Cloud Run
  - BigQuery

## Project Structure

```
financial-assistant/
├── frontend/           # React.js frontend application
├── backend/           # FastAPI backend service
├── functions/         # Cloud Functions
├── models/           # ML models and utilities
└── docs/             # Documentation
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt

   # Frontend
   cd frontend
   npm install
   ```
3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary API keys and configuration

4. Run the application:
   ```bash
   # Backend
   cd backend
   uvicorn main:app --reload

   # Frontend
   cd frontend
   npm start
   ```

## Development Roadmap

1. Phase 1: Basic Setup & Core Features
   - Project structure setup
   - Basic frontend UI
   - Backend API setup
   - Gemini API integration

2. Phase 2: Investment Features
   - User profile management
   - Risk assessment
   - Basic investment recommendations
   - Portfolio tracking

3. Phase 3: Advanced Features
   - Real-time market data
   - Advanced analytics
   - Regulatory compliance checks
   - Performance optimization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 