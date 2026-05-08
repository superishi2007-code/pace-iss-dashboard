import React, { useState, useRef, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { clsx } from 'clsx';

const AIChatbot = () => {
  const { issData, newsData } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Dashboard Assistant. Ask me about the ISS or the current news!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const hfToken = import.meta.env.VITE_AI_TOKEN;
      if (!hfToken || hfToken === 'your_huggingface_token_here') {
        throw new Error('Hugging Face token is missing');
      }

      const hf = new HfInference(hfToken);
      
      // Prepare context for the AI
      const issInfo = `Current ISS Position: Lat ${issData.position.lat}, Lng ${issData.position.lng}. Speed: ${Math.round(issData.speed)} km/h. Astronauts: ${issData.astronauts.map(a => a.name).join(', ')}.`;
      const newsInfo = newsData.articles.slice(0, 5).map((a, i) => `Article ${i+1}: ${a.title} (Source: ${a.source.name})`).join('\n');
      
      const systemPrompt = `You are a dashboard assistant. Answer ONLY using the current ISS position, speed, and the news articles currently loaded in the dashboard.
      CONTEXT:
      ${issInfo}
      
      RECENT NEWS:
      ${newsInfo}`;

      const response = await hf.textGeneration({
        model: 'havenoammo/Qwen3.6-27B-MTP-UD-GGUF',
        inputs: `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userMessage}<|im_end|>\n<|im_start|>assistant\n`,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.generated_text.trim() }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your AI token." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FAB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-800 text-white rotate-90" : "bg-blue-600 text-white"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] glass rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-600/10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Dashboard Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="animate-spin text-blue-600" size={18} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
