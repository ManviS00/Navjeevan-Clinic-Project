import { User } from 'lucide-react';
import { ZivaAvatar } from './ZivaAvatar';
import type { ChatMessage } from '@/hooks/useAssistantChat';

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick: (text: string) => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-[fadeSlide_0.4s_ease-out]`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm">
            <User size={16} />
          </div>
        ) : (
          <ZivaAvatar size={36} />
        )}
      </div>

      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-pink-600 text-white'
              : 'rounded-tl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-100'
          }`}
        >
          {message.content}
          {message.relatedConditions && message.relatedConditions.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Possible causes
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {message.relatedConditions.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                These are possibilities, not a diagnosis. Please book a consultation for an evaluation.
              </p>
            </div>
          )}
        </div>
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick(s)}
                className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 transition hover:border-pink-300 hover:bg-pink-100 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <span className="mt-1 px-1 text-[10px] text-slate-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
