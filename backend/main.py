from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="GenAI Financial Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Update the model name to the correct version
model = genai.GenerativeModel('gemini-1.5-flash')

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to GenAI Financial Assistant API"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Create a financial context prompt
        financial_context = """You are a knowledgeable financial advisor assistant. 
        Help users with financial queries, investment advice, and financial literacy. 
        Provide clear, informative responses while noting that this is general advice 
        and users should consult with professional financial advisors for personalized guidance.
        """
        
        # Convert messages to Gemini format
        chat = model.start_chat(history=[])
        
        # Add context to the user's message
        enhanced_prompt = f"{financial_context}\n\nUser Query: {request.messages[-1].content}"
        
        # Send message with context
        response = chat.send_message(enhanced_prompt)
        
        if not response.text:
            return ChatResponse(response="I apologize, but I couldn't generate a response. Please try rephrasing your question.")
            
        return ChatResponse(response=response.text)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 