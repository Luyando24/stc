import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minus, Send, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! How can we help you with your shipping needs today?',
      sender: 'svc',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: userMsg,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay then redirect to WhatsApp
    setTimeout(() => {
      setIsTyping(false);
      const whatsappUrl = `https://wa.me/8613434313227?text=${encodeURIComponent(userMsg)}`;
      window.open(whatsappUrl, '_blank');
      
      // Add a system message explaining the redirect
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Redirecting you to our WhatsApp support team to continue this conversation...',
        sender: 'svc',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "bg-white rounded-2xl shadow-2xl border border-[hsl(var(--chat-border))] overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-slide-up mb-4",
            isMinimized ? "h-14 w-[300px]" : "h-[500px] max-h-[80vh] w-[90vw] sm:w-[350px] md:w-[380px]"
          )}
        >
          {/* Header */}
          <div 
            className="bg-[hsl(var(--chat-primary))] text-white p-4 flex items-center justify-between cursor-pointer shrink-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[hsl(var(--chat-primary))] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">STC Logistics Support</h3>
                {!isMinimized && <p className="text-xs text-white/70 mt-1">Typically replies instantly</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%] animate-fade-in-up",
                      msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        msg.sender === 'user' 
                          ? "bg-[hsl(var(--chat-message-user))] text-white rounded-br-sm" 
                          : "bg-[hsl(var(--chat-message-svc))] text-[hsl(var(--chat-text))] rounded-bl-sm border border-[hsl(var(--chat-border))]"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col max-w-[85%] mr-auto items-start animate-fade-in-up">
                    <div className="px-4 py-3.5 rounded-2xl bg-[hsl(var(--chat-message-svc))] rounded-bl-sm border border-[hsl(var(--chat-border))] shadow-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot animation-delay-200"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot animation-delay-400"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-[hsl(var(--chat-border))] shrink-0">
                <form 
                  onSubmit={handleSend}
                  className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:ring-1 focus-within:ring-[hsl(var(--chat-primary))] focus-within:border-[hsl(var(--chat-primary))] transition-all"
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-sm text-[hsl(var(--chat-text))] placeholder:text-gray-400"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 mb-0.5 mr-0.5 bg-[hsl(var(--chat-accent))] text-white rounded-lg hover:bg-[hsl(var(--chat-accent))/90] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-14 h-14 bg-[hsl(var(--chat-primary))] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group relative"
          aria-label="Open chat"
        >
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--chat-primary))] animate-ping opacity-20 group-hover:opacity-40 transition-opacity duration-300"></span>
          <MessageSquare className="w-6 h-6 relative z-10" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;