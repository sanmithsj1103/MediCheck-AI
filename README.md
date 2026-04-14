# MediCheck AI — Symptom Checker & Triage System

An AI-powered medical symptom checker built with a fine-tuned **LLaMA 3.2 3B Instruct** model, **React**, and **FastAPI**.

## Features

- **AI-Powered Triage** — Chat with a fine-tuned LLM for symptom analysis and medical triage
- **Multi-Modal Input** — Text Chat, Voice Chat (Web Speech API), and Quick Select symptom picker
- **Google Maps Integration** — Find nearby hospitals/clinics with real-time data, timings, and ratings
- **Appointment Booking** — Book appointments at nearby hospitals with confirmation flow
- **Firebase Auth** — Secure user authentication and assessment history
- **Persistent Memory** — Conversation history stored in Firestore via LangChain

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.12, Ollama (Local LLM) |
| AI Model | LLaMA 3.2 3B Instruct (GGUF, fine-tuned) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Maps | Google Maps JavaScript API + Places API |

## Setup

### Prerequisites
- Python 3.12+, Node.js 18+, [Ollama](https://ollama.com) installed

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env           # Fill in your Firebase project ID
```

### AI Model
1. Download `llama.gguf` from [Hugging Face](https://huggingface.co/Shawn-vas/medicheck-ai)
2. Place it in `backend/`
3. Run: `ollama create medicheck-ai -f Modelfile`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env           # Fill in your Firebase & Google Maps keys
```

### Run
```bash
# Terminal 1 — Backend
cd backend && .\venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure
```
ai-symptom-checker/
├── backend/
│   ├── app/
│   │   ├── models/schemas.py         # Pydantic models
│   │   ├── routers/symptoms.py       # API endpoints
│   │   ├── services/llm_engine.py    # Ollama LLM adapter
│   │   ├── services/memory.py        # LangChain Firebase memory
│   │   └── main.py                   # FastAPI app
│   ├── Modelfile                     # Ollama model config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                    # All app pages
│   │   ├── components/               # Layout & UI components
│   │   ├── contexts/AuthContext.jsx   # Firebase auth
│   │   └── services/api.js           # Axios client
│   └── package.json
└── README.md
```

## License
This project is for educational and demonstration purposes.