import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, X, Send, Bot, User, ChevronDown,
  Minimize2, Volume2, VolumeX, MessageCircle, Loader2,
  Phone, Maximize2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

type ChatMode = 'text' | 'voice';
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

let msgCounter = 0;
const makeId = () => `msg-${++msgCounter}-${Date.now()}`;

function stripMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/#{1,6}\s/g, '').replace(/•/g, '').replace(/\n+/g, ' ').trim();
}

function formatText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return <div key={i} className="leading-relaxed">{parts.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j} className="font-semibold">{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>)}</div>;
  });
}

async function callAI(history: { role: 'user'|'assistant'; content: string }[], mode: ChatMode): Promise<string> {
  const res = await fetch(`${API_URL}/assistant/chat`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:history,mode})
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message || data.error || `AI error ${res.status}`);
  return data.text as string;
}

// ─── Speech synthesis ─────────────────────────────────────────────────────────

function useTTS() {
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== 'undefined' ? window.speechSynthesis : null
  );
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, onDone?: () => void) => {
    const synth = synthRef.current;
    if (!synth || muted) { onDone?.(); return; }
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(stripMarkdown(text));
    utteranceRef.current = utt;

    // Prefer Indian English or Hindi voice
    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang.startsWith('hi')) ||
      voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;
    if (preferred) utt.voice = preferred;
    utt.lang = preferred?.lang ?? 'en-IN';
    utt.rate = 0.92;
    utt.pitch = 1.05;
    utt.volume = 1;

    setSpeaking(true);
    utt.onend = () => { setSpeaking(false); onDone?.(); };
    utt.onerror = () => { setSpeaking(false); onDone?.(); };
    synth.speak(utt);
  }, [muted]);

  const cancel = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    if (muted) synthRef.current?.cancel();
  }, [muted]);

  useEffect(() => () => { synthRef.current?.cancel(); }, []);

  return { speak, cancel, speaking, muted, setMuted };
}

// ─── Speech recognition ───────────────────────────────────────────────────────

type SpeechRecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { isFinal: boolean; 0: { transcript: string } };
};

function createRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR() as SpeechRecognitionInstance;
  r.lang = 'en-IN';
  r.continuous = false;
  r.interimResults = true;
  return r;
}

// ─── Waveform animation ───────────────────────────────────────────────────────

function Waveform({ active, color = '#e11d48' }: { active: boolean; color?: string }) {
  const bars = 20;
  return (
    <div className="flex items-center gap-[2px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: '3px',
            background: color,
            height: active
              ? `${8 + Math.sin((Date.now() / 200 + i * 0.6)) * 10 + Math.random() * 14}px`
              : '4px',
            opacity: active ? 0.8 + (i % 3) * 0.07 : 0.3,
            animation: active ? `wave ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${(i * 0.05).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Voice Orb ────────────────────────────────────────────────────────────────

function VoiceOrb({
  state,
  onClick,
}: {
  state: VoiceState;
  onClick: () => void;
}) {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center focus:outline-none"
      style={{ width: 96, height: 96 }}
      aria-label={isListening ? 'Stop recording' : 'Start speaking'}
    >
      {/* Outer pulse rings */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-ping" style={{ animationDuration: '1.2s' }} />
          <span className="absolute inset-[-8px] rounded-full border-2 border-rose-400 opacity-30 animate-ping" style={{ animationDuration: '1.8s' }} />
        </>
      )}
      {isSpeaking && (
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" style={{ animationDuration: '1s' }} />
      )}

      {/* Main orb */}
      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isListening
            ? 'bg-gradient-to-br from-rose-500 to-red-600 scale-110 shadow-rose-300'
            : isSpeaking
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 scale-105 shadow-emerald-300'
            : isProcessing
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300'
            : 'bg-gradient-to-br from-[#c51e3a] to-[#e72b61] hover:scale-105 hover:shadow-rose-300'
        }`}
        style={{ boxShadow: isListening ? '0 0 40px rgba(225,29,72,0.4)' : isSpeaking ? '0 0 40px rgba(16,185,129,0.4)' : undefined }}
      >
        {isProcessing ? (
          <Loader2 size={32} className="text-white animate-spin" />
        ) : isListening ? (
          <MicOff size={32} className="text-white" />
        ) : isSpeaking ? (
          <Volume2 size={32} className="text-white animate-pulse" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </div>
    </button>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function BotBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center shadow-sm mt-0.5">
        <Bot size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm max-w-[88%] text-sm text-gray-700">
          {formatText(msg.text)}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 ml-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {msg.isVoice && <span className="ml-1 text-rose-400">🎤</span>}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-2.5 items-start justify-end">
      <div className="flex-1 flex flex-col items-end min-w-0">
        <div className="bg-gradient-to-br from-[#c51e3a] to-[#e72b61] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm max-w-[88%] text-sm text-white">
          {msg.text}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 mr-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {msg.isVoice && <span className="ml-1 text-rose-400">🎤</span>}
        </p>
      </div>
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
        <User size={13} className="text-gray-500" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VoiceChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mode, setMode] = useState<ChatMode>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimText, setInterimText] = useState('');
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);
  const { speak, cancel: cancelSpeech, speaking, muted, setMuted } = useTTS();

  // ── Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, interimText]);

  // ── Focus input on open
  useEffect(() => {
    if (open && !minimized && mode === 'text') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized, mode]);

  // ── Welcome message on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      setUnread(0);
      sendAI([{ role: 'user', content: '__GREETING__' }], true);
    }
    if (open) setUnread(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Nudge badge
  useEffect(() => {
    const t = setTimeout(() => { if (!hasOpened) setUnread(1); }, 6000);
    return () => clearTimeout(t);
  }, [hasOpened]);

  // ── Cleanup recognition on unmount
  useEffect(() => () => {
    recogRef.current?.abort();
    cancelSpeech();
  }, [cancelSpeech]);

  // ── Core AI call
  const sendAI = useCallback(async (
    msgs: { role: 'user' | 'assistant'; content: string }[],
    isGreeting = false
  ) => {
    setLoading(true);
    setError(null);
    try {
      // For greeting, don't actually send "__GREETING__", use a warm opener
      const effectiveMsgs = isGreeting
        ? [{ role: 'user' as const, content: 'Hello, I need some health guidance.' }]
        : msgs;

      const text = await callAI(effectiveMsgs, mode);
      const botMsg: Message = {
        id: makeId(),
        from: 'bot',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Update conversation history (not for greeting seed)
      if (!isGreeting) {
        setHistory((prev) => [
          ...prev,
          { role: 'user', content: msgs[msgs.length - 1].content },
          { role: 'assistant', content: text },
        ]);
      } else {
        setHistory([{ role: 'assistant', content: text }]);
      }

      // Speak the response in voice mode
      if (mode === 'voice') {
        setVoiceState('speaking');
        speak(text, () => setVoiceState('idle'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('AI service not configured')
        ? 'AI service needs a Gemini API key. Please configure GEMINI_API_KEY.'
        : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, speak]);

  // ── Send text message
  const sendText = useCallback((text: string, isVoiceInput = false) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setInterimText('');

    const userMsg: Message = {
      id: makeId(), from: 'user', text: trimmed, timestamp: new Date(), isVoice: isVoiceInput,
    };
    setMessages((prev) => [...prev, userMsg]);

    const newHistory = [
      ...history,
      { role: 'user' as const, content: trimmed },
    ];
    sendAI(newHistory);
  }, [history, loading, sendAI]);

  // ── Voice recording
  const startListening = useCallback(() => {
    if (speaking) cancelSpeech();
    const recog = createRecognition();
    if (!recog) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    recogRef.current = recog;
    setInterimText('');
    setVoiceState('listening');

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim || final);
      if (final) {
        recog.stop();
        setVoiceState('processing');
        sendText(final, true);
      }
    };

    recog.onend = () => {
      if (voiceState === 'listening') setVoiceState('idle');
    };

    recog.onerror = (e: { error: string }) => {
      if (e.error !== 'aborted') setError(`Microphone error: ${e.error}`);
      setVoiceState('idle');
      setInterimText('');
    };

    recog.start();
  }, [speaking, cancelSpeech, sendText, voiceState]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setVoiceState('idle');
    setInterimText('');
  }, []);

  const toggleVoice = useCallback(() => {
    if (voiceState === 'listening') stopListening();
    else if (voiceState === 'idle') startListening();
    else if (voiceState === 'speaking') { cancelSpeech(); setVoiceState('idle'); }
  }, [voiceState, startListening, stopListening, cancelSpeech]);

  function switchMode(m: ChatMode) {
    setMode(m);
    cancelSpeech();
    if (voiceState !== 'idle') { recogRef.current?.abort(); setVoiceState('idle'); }
    setInterimText('');
  }

  function closeChat() {
    setOpen(false);
    setMinimized(false);
    cancelSpeech();
    recogRef.current?.abort();
    setVoiceState('idle');
    setInterimText('');
  }

  const isVoiceSupported = typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* ── Chat window ── */}
        {open && !minimized && (
          <div
            className="flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-chat-open"
            style={{ width: 370, maxWidth: 'calc(100vw - 24px)', height: 580 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#171e3b] via-[#28365f] to-[#c51e3a] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-rose-500 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">ZIVA</p>
                  <p className="text-rose-100 text-xs truncate">
                    {voiceState === 'listening' ? '🎤 Listening...'
                      : voiceState === 'processing' ? '⏳ Processing...'
                      : voiceState === 'speaking' ? '🔊 Speaking...'
                      : loading ? '💭 Thinking...'
                      : 'ZIVA · Navjeevan Clinic'}
                  </p>
                </div>
                {/* Open full assistant page (with saved conversation history) */}
                <Link
                  to="/assistant"
                  className="text-white/70 hover:text-white transition-colors p-1"
                  title="Open full-page assistant with chat history"
                >
                  <Maximize2 size={14} />
                </Link>
                {/* Mute */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                  title={muted ? 'Unmute' : 'Mute voice'}
                >
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white p-1">
                  <Minimize2 size={15} />
                </button>
                <button onClick={closeChat} className="text-white/70 hover:text-white p-1">
                  <X size={17} />
                </button>
              </div>

              {/* Mode tabs */}
              <div className="flex mt-3 bg-white/10 rounded-lg p-0.5 gap-0.5">
                {(['text', 'voice'] as ChatMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      mode === m
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {m === 'text' ? <><MessageCircle size={12} /> Text Chat</> : <><Phone size={12} /> Voice Call</>}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-4 py-1.5">
              <p className="text-[10px] text-amber-700 leading-tight">
                ⚕️ ZIVA only — not a substitute for medical consultation. For emergencies call 74289 26418.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex-shrink-0 bg-red-50 border-b border-red-100 px-4 py-2 flex items-start gap-2">
                <span className="text-red-500 text-xs flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* ── TEXT MODE ── */}
            {mode === 'text' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-gray-50/50">
                  {messages.map((msg) =>
                    msg.from === 'bot'
                      ? <BotBubble key={msg.id} msg={msg} />
                      : <UserBubble key={msg.id} msg={msg} />
                  )}
                  {loading && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center">
                        <Bot size={13} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); sendText(input); }}
                  className="flex-shrink-0 border-t border-gray-100 px-3 py-3 flex gap-2 items-center bg-white"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your health..."
                    disabled={loading}
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder:text-gray-400 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none flex-shrink-0"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} className="-translate-x-px" />}
                  </button>
                </form>
              </>
            )}

            {/* ── VOICE MODE ── */}
            {mode === 'voice' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Conversation transcript (scrollable) */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-gray-50/50">
                  {messages.map((msg) =>
                    msg.from === 'bot'
                      ? <BotBubble key={msg.id} msg={msg} />
                      : <UserBubble key={msg.id} msg={msg} />
                  )}
                  {/* Interim speech text */}
                  {interimText && (
                    <div className="flex gap-2.5 items-start justify-end opacity-60">
                      <div className="bg-rose-100 rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm text-rose-700 italic max-w-[88%]">
                        {interimText}...
                      </div>
                    </div>
                  )}
                  {loading && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center">
                        <Bot size={13} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Voice controls panel */}
                <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-5">
                  {/* Waveform */}
                  <div className="flex justify-center mb-4">
                    <Waveform
                      active={voiceState === 'listening' || voiceState === 'speaking'}
                      color={voiceState === 'speaking' ? '#10b981' : '#e11d48'}
                    />
                  </div>

                  {/* Status label */}
                  <p className="text-center text-xs text-gray-500 mb-4 h-4">
                    {voiceState === 'listening' && (
                      <span className="text-rose-600 font-medium animate-pulse">Listening — speak now...</span>
                    )}
                    {voiceState === 'processing' && (
                      <span className="text-amber-600 font-medium">Processing your question...</span>
                    )}
                    {voiceState === 'speaking' && (
                      <span className="text-emerald-600 font-medium">ZIVA is speaking...</span>
                    )}
                    {voiceState === 'idle' && !loading && (
                      <span className="text-gray-400">Tap the mic to speak</span>
                    )}
                    {loading && voiceState === 'idle' && (
                      <span className="text-amber-600 font-medium">Thinking...</span>
                    )}
                  </p>

                  {/* Orb */}
                  <div className="flex justify-center">
                    {isVoiceSupported ? (
                      <VoiceOrb state={voiceState} onClick={toggleVoice} />
                    ) : (
                      <div className="text-center text-sm text-gray-500 px-4">
                        <p className="mb-1">Voice not supported in this browser.</p>
                        <p className="text-xs text-gray-400">Please use Chrome or Edge.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Minimized pill */}
        {open && minimized && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#171e3b] via-[#28365f] to-[#c51e3a] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
            <button onClick={() => setMinimized(false)} className="flex items-center gap-2">
              <Bot size={14} />
              <span>ZIVA</span>
              <ChevronDown size={13} />
            </button>
            <button onClick={closeChat} className="ml-1 text-white/70 hover:text-white transition-colors">
              <X size={13} />
            </button>
          </div>
        )}

        {/* FAB */}
        {!open && (
          <button
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-rose-300/50 hover:-translate-y-1 transition-all group"
            aria-label="Open ZIVA"
          >
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                {unread}
              </span>
            )}
          </button>
        )}

        {/* FAB when open (shows ChevronDown) */}
        {open && !minimized && (
          <button
            onClick={() => setMinimized(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c51e3a] to-[#e72b61] flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-rose-300/50 hover:-translate-y-1 transition-all"
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
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.5); }
        }
      `}</style>
    </>
  );
}
