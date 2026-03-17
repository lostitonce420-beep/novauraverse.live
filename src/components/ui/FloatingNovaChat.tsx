import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Minus, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { aiOrchestrator } from '../../services/aiOrchestrator';
import { useAuthStore } from '../../stores/authStore';

interface FloatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

const STORAGE_PREFIX = 'novaura-float-chat';

// Routes where the widget is suppressed (Aura already lives there)
const HIDDEN_ROUTES = ['/ide'];

const FloatingNovaChat: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const storageKey = `${STORAGE_PREFIX}-${user?.id ?? 'guest'}`;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FloatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [positionSet, setPositionSet] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from storage when key changes (login/logout)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: FloatMessage[] = stored ? JSON.parse(stored) : [];
      if (parsed.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Hey — I'm Nova. Always here when you need me. Ask me anything about the platform, your projects, or just think out loud.",
          ts: new Date().toISOString(),
        }]);
      } else {
        setMessages(parsed);
      }
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Set default position once window is available
  useEffect(() => {
    if (!positionSet) {
      setPosition({
        x: window.innerWidth - 388,
        y: window.innerHeight - 560,
      });
      setPositionSet(true);
    }
  }, [positionSet]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Drag — attach to document so cursor can move freely
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 368, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 520, e.clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    };
    const onUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isThinking) return;

    const userMsg = prompt.trim();
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, ts: new Date().toISOString() }]);
    setIsThinking(true);

    try {
      const response = await aiOrchestrator.sendMessage(
        userMsg,
        'Nova Global Chat — persistent floating companion, user is browsing NovAura',
        'float_chat'
      );
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content || 'Signal lost. Try again.',
        ts: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Neural link interrupted. Check your connection.',
        ts: new Date().toISOString(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClear = () => {
    const seed: FloatMessage = {
      role: 'assistant',
      content: "Fresh start. What's on your mind?",
      ts: new Date().toISOString(),
    };
    setMessages([seed]);
    localStorage.setItem(storageKey, JSON.stringify([seed]));
  };

  // Hide on IDE page — Aura already lives there
  const isHidden = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));
  if (isHidden || !positionSet) return null;

  return (
    <>
      {/* Floating orb — shown when collapsed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="nova-orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-void-light border border-neon-cyan/30 shadow-[0_0_24px_rgba(0,240,255,0.12)] flex items-center justify-center hover:border-neon-cyan/60 hover:shadow-[0_0_36px_rgba(0,240,255,0.22)] transition-all group"
            title="Chat with Nova"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window — shown when expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nova-window"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ left: position.x, top: position.y }}
            className="fixed z-[9998] w-[368px] flex flex-col bg-void-light border border-white/10 rounded-2xl shadow-[0_12px_60px_rgba(0,0,0,0.7),0_0_1px_rgba(0,240,255,0.08)] overflow-hidden"
          >
            {/* Header / drag handle */}
            <div
              onMouseDown={handleHeaderMouseDown}
              className="flex items-center justify-between px-4 py-3 bg-void-lighter border-b border-white/5 cursor-grab active:cursor-grabbing select-none shrink-0"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-4 h-4 text-neon-cyan" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-primary">Nova</span>
                <span className="text-[9px] text-neon-cyan/50 font-mono tracking-tight">● live</span>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Clear history */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Clear chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {/* Open full chat */}
                <a
                  href="/chat"
                  onMouseDown={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
                  title="Open full chat"
                >
                  <Maximize2 className="w-3 h-3" />
                </a>
                {/* Minimize */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar" style={{ maxHeight: 380 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-white rounded-tr-none'
                      : 'bg-void-lighter border border-white/5 text-text-secondary rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-neon-cyan/50 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-mono">Nova is thinking...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-white/5 bg-void-lighter shrink-0"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Message Nova..."
                  disabled={isThinking}
                  className="w-full bg-void border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/40 disabled:opacity-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isThinking || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-text-muted/40 text-center mt-1.5 font-mono tracking-tight">
                continuous memory · drag to reposition
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNovaChat;
