import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowLeft, Volume2, Bot, User, Loader2, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function VoiceChatPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am MediCheck AI. Please tell me what symptoms you are experiencing. I am listening.' }
  ]);
  
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript;
      setTranscript(resultTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Auto-submit if we have a transcript
      if (transcript.trim()) {
        handleSubmitTranscript(transcript.trim());
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    // Initial greeting
    speakMessage(messages[0].content);

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speakMessage = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      if (synthRef.current) synthRef.current.cancel(); // Don't speak while I'm listening
    }
  };

  const handleSubmitTranscript = async (text) => {
    if (!text) return;
    
    setIsAnalyzing(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    try {
      const response = await api.post('/symptoms/chat', {
        message: text,
        session_id: sessionId,
        input_method: 'voice'
      });
      
      const data = response.data;
      if (data.sessionId) setSessionId(data.sessionId);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      speakMessage(data.reply);
      setTranscript('');

      if (data.is_complete && data.analysis) {
        toast.success("Analysis complete. Redirecting to results...");
        setTimeout(() => {
          navigate(`/results/${data.assessment_id || 'latest'}`, { 
            state: { result: data.analysis } 
          });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process voice command.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-4rem)] relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate('/symptom-input')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Voice Assistant</h1>
          <p className="text-sm text-slate-500">Conversational AI triage</p>
        </div>
      </div>

      {/* Main Voice UI */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Animated Visualization */}
        <div className="relative mb-12">
          <div className={`absolute inset-0 bg-cyan-400/20 rounded-full transition-all duration-300 ${isListening ? 'animate-ping scale-150' : 'scale-100'}`} />
          <div className={`absolute inset-4 bg-cyan-400/40 rounded-full transition-all duration-500 ${isListening ? 'animate-ping scale-125' : 'scale-100'}`} />
          
          <button 
            onClick={toggleListening}
            disabled={isAnalyzing}
            className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all shadow-xl hover:scale-105 active:scale-95 ${
              isListening 
              ? 'bg-rose-500 text-white animate-pulse-soft shadow-rose-500/30' 
              : 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-cyan-500/30'
            }`}
          >
            {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
          </button>
        </div>

        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-slate-800">
            {isListening ? "I'm listening..." : isAnalyzing ? "Thinking..." : "Tap to Speak"}
          </h2>
          <div className="min-h-[3rem] max-w-lg mx-auto">
            {transcript ? (
              <p className="text-xl text-slate-600 font-medium italic">"{transcript}"</p>
            ) : (
              <p className="text-slate-400">Tell me things like "I have a headache and I'm feeling dizzy"</p>
            )}
          </div>
        </div>

        {/* Message Log (Bottom Sheet style) */}
        <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-48">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Conversation</span>
            {isAnalyzing && <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />}
          </div>
          <div className="p-4 overflow-y-auto space-y-3 text-left">
            {messages.slice(-2).map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`p-2.5 rounded-xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-cyan-500 text-white ml-8' 
                  : 'bg-slate-100 text-slate-700 mr-8'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 flex justify-center gap-4">
        <button 
          onClick={() => navigate('/symptom-input/text')}
          className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-full transition-colors"
        >
          Switch to Text
        </button>
        <button 
          onClick={() => { if (synthRef.current) synthRef.current.cancel(); }}
          className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          title="Mute AI"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
