import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronDown, Minimize2 } from 'lucide-react';
import { getBotResponse, WELCOME_MESSAGE, type BotResponse } from '../lib/chatbot';
import { backendRequest } from '../lib/backendApi';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  followUps?: string[];
  timestamp: Date;
}

function formatText(text: string) {
  // Convert **bold**, newlines, and bullet points into JSX
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;

    // Bold text
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    return (
      <div key={i} className="leading-relaxed">
        {rendered}
      </div>
    );
  });
}

function BotMessage({ msg, onFollowUp }: { msg: Message; onFollowUp: (text: string) => void }) {
  return (
    <div className="flex gap-2.5 items-start group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center shadow-sm mt-0.5">
        <Bot size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
          <div className="text-sm text-gray-700 space-y-0.5">
            {formatText(msg.text)}
          </div>
        </div>
        {msg.followUps && msg.followUps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.followUps.map((q) => (
              <button
                key={q}
                onClick={() => onFollowUp(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors font-medium leading-tight text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-2.5 items-start justify-end">
      <div className="flex-1 flex flex-col items-end min-w-0">
        <div className="bg-gradient-to-br from-[#c51e3a] to-[#e72b61] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[85%]">
          <p className="text-sm text-white leading-relaxed">{msg.text}</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 mr-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
        <User size={14} className="text-gray-500" />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center shadow-sm">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

let msgCounter = 0;
function makeId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  // Show welcome message on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      setUnread(0);
      setTyping(true);
      typingTimer.current = setTimeout(() => {
        setTyping(false);
        setMessages([
          {
            id: makeId(),
            from: 'bot',
            text: WELCOME_MESSAGE.text,
            followUps: WELCOME_MESSAGE.followUps,
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }
    if (open) setUnread(0);
  }, [open, hasOpened]);

  // Nudge with unread badge after 5s if not opened
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasOpened) setUnread(1);
    }, 5000);
    return () => clearTimeout(t);
  }, [hasOpened]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setInput('');
      const userMsg: Message = {
        id: makeId(),
        from: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);

      // Prefer the real server-side Gemini assistant. If the API is unavailable
      // (for example, before a GEMINI_API_KEY is configured), fall back to the
      // clinic knowledge base so the public chatbot still works offline.
      (async () => {
        let response: BotResponse;
        try {
          const history = [...messages, userMsg].slice(-20).map((m) => ({
            role: m.from === 'bot' ? 'assistant' as const : 'user' as const,
            content: m.text,
          }));
          const result = await backendRequest<{ success: boolean; text: string }>('/assistant/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: history, mode: 'text' }),
          });
          response = { text: result.text || getBotResponse(trimmed).text, followUps: [] };
        } catch {
          response = getBotResponse(trimmed);
        }

        const delay = Math.min(350 + response.text.length * 2, 1200);
        typingTimer.current = setTimeout(() => {
          setTyping(false);
          const botMsg: Message = {
            id: makeId(),
            from: 'bot',
            text: response.text,
            followUps: response.followUps,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMsg]);
        }, delay);
      })();
    },
    [messages]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleFollowUp(text: string) {
    sendMessage(text);
  }

  function toggleOpen() {
    if (!open) {
      setOpen(true);
      setMinimized(false);
    } else if (minimized) {
      setMinimized(false);
    } else {
      setMinimized(true);
    }
  }

  function closeChat() {
    setOpen(false);
    setMinimized(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat window */}
        {open && !minimized && (
          <div
            className="w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-chat-open"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#171e3b] via-[#28365f] to-[#c51e3a] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight tracking-wide">ZIVA</p>
                <p className="text-rose-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" />
                  Online · Navjeevan Women’s Health Companion
                </p>
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="text-white/70 hover:text-white transition-colors p-1"
                title="Minimise"
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={closeChat}
                className="text-white/70 hover:text-white transition-colors p-1"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-4 py-2">
              <p className="text-[10px] text-amber-700 leading-tight">
                ⚕️ I'm an ZIVA — not a doctor. For medical advice, always consult Dr. Aayushi.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/60">
              {messages.map((msg) =>
                msg.from === 'bot' ? (
                  <BotMessage key={msg.id} msg={msg} onFollowUp={handleFollowUp} />
                ) : (
                  <UserMessage key={msg.id} msg={msg} />
                )
              )}
              {typing && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex-shrink-0 border-t border-gray-100 px-3 py-3 flex gap-2 items-center bg-white"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={typing}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder:text-gray-400 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none"
              >
                <Send size={15} className="-translate-x-px" />
              </button>
            </form>
          </div>
        )}

        {/* Minimized pill */}
        {open && minimized && (
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#171e3b] via-[#28365f] to-[#c51e3a] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all animate-fade-in"
          >
            <Bot size={15} />
            ZIVA
            <ChevronDown size={13} />
            <button
              onClick={(e) => { e.stopPropagation(); closeChat(); }}
              className="ml-1 text-white/70 hover:text-white"
            >
              <X size={13} />
            </button>
          </button>
        )}

        {/* FAB */}
        {!open && (
          <button
            onClick={toggleOpen}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-rose-300/50 hover:-translate-y-1 transition-all group"
            aria-label="Open AI Chat Assistant"
          >
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow">
                {unread}
              </span>
            )}
          </button>
        )}

        {/* Already-open FAB (minimise/restore) */}
        {open && !minimized && (
          <button
            onClick={toggleOpen}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-rose-300/50 hover:-translate-y-1 transition-all"
            aria-label="Minimise chat"
          >
            <ChevronDown size={22} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes chat-open {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-chat-open {
          animation: chat-open 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
      `}</style>
    </>
  );
}
