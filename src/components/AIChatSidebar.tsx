import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flag, Plus, Mic, ArrowUp, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSend,
  isTyping,
}) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea uses Radix Viewport as the actual scrollable element
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col bg-background border-l border-border"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold text-foreground">
                {t('ai.chatTitle')}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">{t('ai.chatSubtitle')}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border text-foreground rounded-bl-md'
                    }`}
                  >
                    {message.role === 'ai' ? (
                      <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-headings:my-4 prose-strong:text-foreground prose-a:text-primary [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-[10px] mt-1 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input Area - Sticky Bottom */}
        <div className="px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-2 bg-input border border-border rounded-full px-4 py-3">
            {/* Plus icon */}
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder')}
              className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
            />
            
            {/* Microphone icon */}
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            
            {/* Send button */}
            <button 
              onClick={onSend}
              disabled={!inputValue.trim()}
              className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIChatSidebar;
