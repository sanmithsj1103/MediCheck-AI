import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function TextChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am MediCheck AI. Please describe your symptoms in as much detail as possible. For example: "I have had a severe headache and fever for 2 days."',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userMessage },
    ]);
    setIsLoading(true);

    try {
      const response = await api.post('/symptoms/chat', { message: userMessage });
      const data = response.data;
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '1', role: 'assistant', content: data.reply },
      ]);

      if (data.is_complete && data.analysis) {
        setAnalysisResult(data.analysis);
        // Pre-cache the result to pass state to results page
        setTimeout(() => {
          navigate(`/results/latest`, { state: { result: data.analysis } });
        }, 3000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get a response from the AI. Please try again.');
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now().toString() + 'err', 
          role: 'assistant', 
          content: 'Sorry, I encountered an error connecting to the server. Let\'s try that again.',
          isError: true 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/symptom-input')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">AI Chat Assessment</h1>
            <p className="text-sm text-slate-500">Text-based symptom analysis</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium border border-cyan-100">
          <Bot className="w-4 h-4" /> MediCheck AI is online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'user' 
                  ? 'bg-cyan-600 text-white' 
                  : message.isError 
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-sm'
              }`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${
                message.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : message.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-100 rounded-tl-none'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {/* Result Indicator (if complete) */}
                {message.role === 'assistant' && analysisResult && message.id === messages[messages.length-1].id && (
                  <div className="mt-4 p-4 bg-cyan-50 border border-cyan-100 rounded-xl">
                    <p className="font-medium text-cyan-900 mb-2">Analysis Complete</p>
                    <p className="text-sm text-cyan-700 mb-3">I've evaluated your symptoms. Redirecting to your detailed triage report...</p>
                    <div className="flex items-center gap-2 text-cyan-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Generating results...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="mt-auto relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || analysisResult !== null}
            placeholder="Type your symptoms here..."
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500 text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || analysisResult !== null}
            className="absolute right-2 p-2.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3 font-medium">
          MediCheck AI can make mistakes. In emergencies, call your local emergency services immediately.
        </p>
      </form>
    </div>
  );
}
