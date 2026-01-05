import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Minimize2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
}

const AGENT_NAME = "Tsion";
const AGENT_AVATAR = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face";

const QUICK_REPLIES = [
  "Tell me about your services",
  "I need a website",
  "What are your prices?",
  "Book a consultation",
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `ሰላም! 👋 I'm ${AGENT_NAME} from G-Squad. How can I help you today?`,
      timestamp: new Date(),
      status: 'seen',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Simulate typing delay for more human feel
  const simulateTypingDelay = () => {
    return new Promise<void>((resolve) => {
      const delay = 1000 + Math.random() * 2000; // 1-3 seconds
      setTimeout(resolve, delay);
    });
  };

  // Mark messages as seen when chat is opened
  useEffect(() => {
    if (isOpen) {
      setMessages(prev => prev.map(msg =>
        msg.role === 'assistant' ? { ...msg, status: 'seen' as const } : msg
      ));
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Update to sent status
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
      ));
    }, 300);

    // Update to delivered status
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'delivered' as const } : msg
      ));
    }, 800);

    // Show typing indicator
    setIsLoading(true);
    setIsTyping(true);

    // Update to seen status (Tsion is "reading")
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, status: 'seen' as const } : msg
      ));
    }, 1200);

    try {
      // Simulate human typing delay
      await simulateTypingDelay();

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: text,
          sessionId,
          conversationId,
        },
      });

      if (error) throw error;

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      setIsTyping(false);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        status: 'delivered',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Mark as seen after a moment
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id ? { ...msg, status: 'seen' as const } : msg
        ));
      }, 500);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having connection issues. Please try again or email us at hello@g-squad.dev",
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageStatus = (message: Message) => {
    if (message.role !== 'user') return null;

    switch (message.status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin opacity-50" />;
      case 'sent':
        return <Check className="w-3 h-3 opacity-50" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-50" />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Chat Button - animations disabled */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat widget"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-2xl flex items-center justify-center text-primary-foreground hover:shadow-primary/25 transition-shadow"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
        </button>
      )}

      {/* Chat Window - animations disabled */}
      {isOpen && (
        <div
          style={{ height: isMinimized ? 'auto' : '600px' }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={AGENT_AVATAR}
                  alt={AGENT_NAME}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{AGENT_NAME}</h3>
                <p className="text-xs opacity-80">
                  {isTyping ? 'Typing...' : 'Online • G-Squad Support'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {message.role === 'assistant' ? (
                        <img
                          src={AGENT_AVATAR}
                          alt={AGENT_NAME}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`max-w-[75%] p-3 rounded-2xl ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${message.role === 'user' ? 'justify-end' : ''
                          }`}>
                          <p className={`text-[10px] ${message.role === 'user' ? 'opacity-70' : 'text-muted-foreground'
                            }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {renderMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <img
                        src={AGENT_AVATAR}
                        alt={AGENT_NAME}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1 items-center">
                          <span className="text-xs text-muted-foreground mr-2">{AGENT_NAME} is typing</span>
                          <span className="w-2 h-2 bg-foreground/40 rounded-full" />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full" />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(reply)}
                        className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${AGENT_NAME}...`}
                    className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Chat with {AGENT_NAME} • Powered by G-Squad AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatWidget;