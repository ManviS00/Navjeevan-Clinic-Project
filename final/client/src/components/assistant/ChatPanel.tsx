import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ZivaAvatar } from './ZivaAvatar';
import { getSuggestions } from '@/lib/assistant/healthKnowledge';
import type { ChatMessage } from '@/hooks/useAssistantChat';

interface ChatPanelProps {
  messages: ChatMessage[];
  status: 'idle' | 'thinking';
  onSuggestionClick: (text: string) => void;
}

export function ChatPanel({ messages, status, onSuggestionClick }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, status]);

  const showWelcome = messages.length === 0;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {showWelcome ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 drop-shadow-lg">
              <ZivaAvatar size={72} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              Namaste, I'm Ziva
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Your AI health assistant from Navjeevan Clinic. Ask me anything about
              pregnancy, PCOS, fertility, periods, or booking a visit.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {getSuggestions().map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestionClick(s)}
                  className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} onSuggestionClick={onSuggestionClick} />
          ))
        )}

        {status === 'thinking' && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm ring-1 ring-pink-100">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
              <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
