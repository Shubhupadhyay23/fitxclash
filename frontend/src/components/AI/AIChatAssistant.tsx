import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Send, User, Bot, X } from 'lucide-react';
import api from '../../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am ForgeBot, your personal fitness assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/api/llm/chat', {
        message: userMessage,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my central brain. Please check your connection!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-24 right-4 w-[350px] md:w-[400px] h-[500px] bg-black/90 backdrop-blur-2xl border-cyan-500/50 shadow-2xl shadow-cyan-500/20 flex flex-col z-[100] animate-in slide-in-from-right-10 duration-300">
      <CardHeader className="p-4 border-b border-cyan-500/20 flex flex-row items-center justify-between">
        <CardTitle className="text-lg audiowide-regular text-cyan-400 flex items-center">
          <Bot className="mr-2 h-5 w-5" /> FORGEBOT
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-neutral-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-black rounded-tr-none' 
                : 'bg-neutral-800 text-white rounded-tl-none border border-neutral-700'
            }`}>
              <div className="flex items-center mb-1 opacity-60 text-[10px] uppercase tracking-tighter">
                {m.role === 'user' ? <User size={10} className="mr-1" /> : <Bot size={10} className="mr-1" />}
                {m.role === 'user' ? 'You' : 'ForgeBot'}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 text-white p-3 rounded-2xl rounded-tl-none border border-neutral-700 animate-pulse">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-cyan-500/20 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about exercises, form, or tips..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
        />
        <Button 
          onClick={handleSend}
          className="rounded-full bg-cyan-600 hover:bg-cyan-500 h-10 w-10 p-0 flex items-center justify-center text-black"
        >
          <Send size={18} />
        </Button>
      </div>
    </Card>
  );
}
