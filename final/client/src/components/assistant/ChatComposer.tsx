import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import {
  SpeechRecognitionController,
  loadVoices,
  stopSpeaking,
} from '@/lib/assistant/speech';

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(() => SpeechRecognitionController.isSupported());
  const recognitionRef = useRef<SpeechRecognitionController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    recognitionRef.current = new SpeechRecognitionController();
    void loadVoices();
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  function toggleListen() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setText('');
      rec.start({
        onStart: () => setListening(true),
        onEnd: () => setListening(false),
        onError: () => setListening(false),
        onResult: ({ transcript }) => {
          setText(transcript);
        },
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    stopSpeaking();
    onSend(value);
    setText('');
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleListen}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
              listening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <div className="flex flex-1 items-end rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening… speak now' : 'Type your health question…'}
            rows={1}
            className="max-h-32 w-full resize-none bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg shadow-pink-600/30 transition hover:bg-pink-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <Send size={18} />
        </button>
      </form>
      <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-slate-400">
        For emergencies call <span className="font-semibold text-slate-600">7428926418</span>. This assistant provides general information, not a diagnosis.
      </p>
    </div>
  );
}
