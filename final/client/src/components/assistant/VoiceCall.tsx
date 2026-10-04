import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Phone, Volume2, VolumeX } from 'lucide-react';
import { ZivaAvatar } from './ZivaAvatar';
import {
  SpeechRecognitionController,
  loadVoices,
  speak,
  stopSpeaking,
  speechSynthesisSupported,
} from '@/lib/assistant/speech';
import type { ChatMessage } from '@/hooks/useAssistantChat';

interface VoiceTurn {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface VoiceCallProps {
  onSend: (text: string) => Promise<ChatMessage | null>;
}

type CallState = 'idle' | 'connecting' | 'active' | 'processing' | 'ended';

export function VoiceCall({ onSend }: VoiceCallProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);

  const recognitionRef = useRef<SpeechRecognitionController | null>(null);
  const callStateRef = useRef<CallState>('idle');
  const speakingRef = useRef(false);
  const mutedRef = useRef(false);
  const supportedRef = useRef(true);
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;
  const transcriptRef = useRef('');
  const turnIdRef = useRef(0);

  useEffect(() => {
    supportedRef.current = SpeechRecognitionController.isSupported();
    recognitionRef.current = new SpeechRecognitionController();
    void loadVoices();
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  function setCallStateSync(s: CallState) {
    callStateRef.current = s;
    setCallState(s);
  }
  function setSpeakingSync(v: boolean) {
    speakingRef.current = v;
    setSpeaking(v);
  }
  function pushTurn(role: 'user' | 'assistant', text: string) {
    setTurns((prev) => [...prev, { id: turnIdRef.current++, role, text }]);
  }

  function startCall() {
    setError(null);
    setTurns([]);
    setCallStateSync('connecting');
    setTimeout(() => {
      setCallStateSync('active');
      const greeting = "Namaste, I'm Ziva from Navjeevan Clinic. How can I help you today?";
      setLastReply(greeting);
      pushTurn('assistant', greeting);
      if (!mutedRef.current) {
        speakReply(greeting, () => {
          if (callStateRef.current === 'active' && !mutedRef.current) startListening();
        });
      }
    }, 1400);
  }

  function endCall() {
    recognitionRef.current?.stop();
    stopSpeaking();
    setSpeakingSync(false);
    setListening(false);
    setTranscript('');
    setCallStateSync('ended');
    setTimeout(() => setCallStateSync('idle'), 1500);
  }

  function speakReply(text: string, onDone?: () => void) {
    if (!speechSynthesisSupported()) {
      onDone?.();
      return;
    }
    setSpeakingSync(true);
    speak(text, {
      onEnd: () => {
        setSpeakingSync(false);
        onDone?.();
      },
    });
  }

  function startListening() {
    const rec = recognitionRef.current;
    if (!rec || !supportedRef.current) return;
    transcriptRef.current = '';
    setTranscript('');
    setListening(true);
    rec.start({
      onStart: () => setListening(true),
      onEnd: () => {
        setListening(false);
        const t = transcriptRef.current.trim();
        if (t && callStateRef.current === 'active') {
          void processUser(t);
        } else if (callStateRef.current === 'active' && !mutedRef.current) {
          // no speech detected — restart listening
          setTimeout(() => startListening(), 400);
        }
      },
      onError: (err) => {
        setListening(false);
        if (err === 'no-speech') {
          if (callStateRef.current === 'active' && !mutedRef.current) {
            setTimeout(() => startListening(), 300);
          }
        } else if (err === 'not-allowed') {
          setError('Microphone access was blocked. Please allow it in your browser settings.');
        }
      },
      onResult: ({ transcript, isFinal }) => {
        setTranscript(transcript);
        transcriptRef.current = transcript;
        if (isFinal) {
          rec.stop();
        }
      },
    });
  }

  async function processUser(text: string) {
    const clean = text.trim();
    if (!clean) return;
    pushTurn('user', clean);
    setCallStateSync('processing');
    try {
      const assistantMsg = await onSendRef.current(clean);
      if (!assistantMsg) {
        setError('I could not get a response from the AI assistant. Please try again.');
        if (callStateRef.current !== 'ended') setCallStateSync('active');
        if (callStateRef.current === 'active' && !mutedRef.current) setTimeout(() => startListening(), 300);
        return;
      }
    setLastReply(assistantMsg.content);
    pushTurn('assistant', assistantMsg.content);
      if (!mutedRef.current) {
        setCallStateSync('active');
        speakReply(assistantMsg.content, () => {
          if (callStateRef.current === 'active' && !mutedRef.current) startListening();
        });
      } else {
        setCallStateSync('active');
        setTimeout(() => startListening(), 600);
      }
    } catch (e) {
      console.error('Voice assistant error:', e);
      setError('The AI assistant could not respond. Please try again.');
      setCallStateSync('active');
      if (!mutedRef.current) setTimeout(() => startListening(), 300);
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (next) {
      stopSpeaking();
      setSpeakingSync(false);
      recognitionRef.current?.stop();
      setListening(false);
    }
  }

  function toggleMic() {
    if (speakingRef.current) {
      stopSpeaking();
      setSpeakingSync(false);
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      startListening();
    }
  }

  const isSupported = supportedRef.current;
  const isActive = callState === 'active';

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-pink-950">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8">
        {error && (
          <div className="mb-6 max-w-sm rounded-xl bg-rose-500/15 px-4 py-3 text-center text-sm text-rose-200 ring-1 ring-rose-500/30">
            {error}
          </div>
        )}

        {!isSupported && callState === 'idle' && (
          <div className="mb-6 max-w-sm rounded-xl bg-amber-500/15 px-4 py-3 text-center text-sm text-amber-200 ring-1 ring-amber-500/30">
            Voice call needs the Web Speech API, which your browser doesn't support. Try Chrome or Edge on desktop or Android.
          </div>
        )}

        <AvatarOrb active={isActive} speaking={speaking} listening={listening} state={callState} />

        <div className="mt-6 text-center">
          {callState === 'idle' && (
            <>
              <h2 className="text-2xl font-semibold text-white">Talk to Ziva</h2>
              <p className="mt-2 max-w-xs text-sm text-slate-300">
                Start a voice call and speak naturally. I'll listen and reply out loud.
              </p>
            </>
          )}
          {callState === 'connecting' && (
            <>
              <h2 className="text-2xl font-semibold text-white">Connecting…</h2>
              <p className="mt-2 text-sm text-slate-400">Waking up the assistant</p>
            </>
          )}
          {callState === 'processing' && (
            <>
              <h2 className="text-2xl font-semibold text-white">Ziva is thinking…</h2>
              <p className="mt-2 min-h-[2.5rem] max-w-xs text-sm text-slate-300">Getting your answer. This should only take a moment.</p>
            </>
          )}
          {callState === 'active' && (
            <>
              <h2 className="text-2xl font-semibold text-white">
                {speaking ? 'Ziva is speaking' : listening ? 'Listening…' : 'On call'}
              </h2>
              <p className="mt-2 min-h-[2.5rem] max-w-xs text-sm text-slate-300">
                {listening && transcript
                  ? `\u201C${transcript}\u201D`
                  : speaking
                    ? lastReply
                    : 'Go ahead, I\u2019m listening'}
              </p>
            </>
          )}
          {callState === 'ended' && (
            <>
              <h2 className="text-2xl font-semibold text-white">Call ended</h2>
              <p className="mt-2 text-sm text-slate-400">Take care of yourself</p>
            </>
          )}
        </div>

        {/* Call controls */}
        <div className="mt-8 flex items-center gap-4">
          {callState === 'idle' ? (
            <button
              onClick={startCall}
              disabled={!isSupported}
              className="flex items-center gap-2 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-pink-500/30 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Phone size={20} />
              Start call
            </button>
          ) : callState === 'active' ? (
            <>
              <button
                onClick={toggleMic}
                aria-label={listening ? 'Stop listening' : 'Start listening'}
                className={`flex h-14 w-14 items-center justify-center rounded-full transition active:scale-90 ${
                  listening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                    : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
                }`}
              >
                {listening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button
                onClick={toggleMute}
                aria-label={muted ? 'Unmute assistant' : 'Mute assistant'}
                className={`flex h-14 w-14 items-center justify-center rounded-full transition active:scale-90 ${
                  muted
                    ? 'bg-white/10 text-slate-400 ring-1 ring-white/20'
                    : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
                }`}
              >
                {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <button
                onClick={endCall}
                aria-label="End call"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 transition hover:bg-rose-700 active:scale-90"
              >
                <PhoneOff size={22} />
              </button>
            </>
          ) : null}
        </div>

        {isActive && (
          <p className="mt-5 text-center text-xs text-slate-500">
            Tap the mic to interrupt · tap the speaker to mute Ziva
          </p>
        )}
      </div>

      {/* Live transcript */}
      <div className="h-40 flex-shrink-0 overflow-y-auto border-t border-white/10 bg-slate-900/60 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Live transcript
          </p>
          {turns.length === 0 ? (
            <p className="text-sm text-slate-500">Your conversation will appear here.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {turns.map((t) => (
                <li key={t.id} className="flex gap-2 text-sm">
                  <span
                    className={`flex-shrink-0 font-semibold ${
                      t.role === 'user' ? 'text-pink-400' : 'text-rose-400'
                    }`}
                  >
                    {t.role === 'user' ? 'You' : 'Ziva'}:
                  </span>
                  <span className="text-slate-300">{t.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AvatarOrb({
  active,
  speaking,
  listening,
  state,
}: {
  active: boolean;
  speaking: boolean;
  listening: boolean;
  state: CallState;
}) {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const barsRoot = barsRef.current?.querySelectorAll<HTMLDivElement>('[data-bar]');
    if (!barsRoot) return;
    const bars = barsRoot;
    const count = bars.length;
    const t0 = performance.now();

    function tick(now: number) {
      const t = (now - t0) / 1000;
      for (let i = 0; i < count; i++) {
        const bar = bars[i];
        if (!bar) continue;
        let amp: number;
        if (speaking) {
          amp = 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + i * 0.5));
        } else if (listening) {
          amp = 0.15 + 0.25 * Math.abs(Math.sin(t * 3 + i * 0.7));
        } else if (active) {
          amp = 0.08 + 0.05 * Math.sin(t * 1.5 + i);
        } else {
          amp = 0.05;
        }
        bar.style.transform = `scaleY(${1 + amp * 6})`;
        bar.style.opacity = String(0.5 + amp * 0.5);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speaking, listening, active]);

  const ringClass =
    state === 'connecting' || state === 'processing'
      ? 'ring-amber-400/50 animate-pulse'
      : speaking
        ? 'ring-pink-400/60'
        : listening
          ? 'ring-rose-400/60'
          : active
            ? 'ring-pink-500/30'
            : 'ring-white/10';

  return (
    <div className={`relative flex h-44 w-44 items-center justify-center rounded-full ring-4 ${ringClass} transition-all duration-500`}>
      {active && (
        <span className="absolute inset-0 animate-ping-slow rounded-full bg-pink-400/10" />
      )}
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/5 shadow-2xl shadow-pink-500/40 backdrop-blur-sm">
        <ZivaAvatar size={96} />
      </div>
      <div
        ref={barsRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{ transform: `rotate(${(i * 360) / 24}deg) translateY(-86px)` }}
          >
            <div data-bar className="h-2 w-[3px] origin-center rounded-full bg-white/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
