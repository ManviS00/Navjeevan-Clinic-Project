import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Volume2, VolumeX, RotateCw, Pause, SkipBack, SkipForward } from 'lucide-react';
import { getServiceVideo, type VideoScene, type DialogueLine } from '../data/serviceVideos';

// ── Character components ────────────────────────────────────────

function DoctorCharacter({ scale = 1, talking = false }: { scale?: number; talking?: boolean }) {
  return (
    <g transform={`scale(${scale})`}>
      {/* Body / coat */}
      <rect x="-25" y="0" width="50" height="70" rx="14" fill="#e11d48" />
      <rect x="-25" y="0" width="50" height="14" rx="14" fill="#be123c" />
      <path d="M -3 0 L 0 70 L 3 0 Z" fill="#fecdd3" opacity="0.6" />
      {/* Head */}
      <circle cx="0" cy="-22" r="20" fill="#fde68a" />
      {/* Hair */}
      <path d="M -20 -25 Q 0 -48 20 -25 Q 20 -40 0 -44 Q -20 -40 -20 -25 Z" fill="#451a03" />
      {/* Eyes */}
      <circle cx="-7" cy="-22" r="2" fill="#1e293b" />
      <circle cx="7" cy="-22" r="2" fill="#1e293b" />
      {/* Mouth — animates when talking */}
      {talking ? (
        <ellipse cx="0" cy="-13" rx="4" ry="3" fill="#1e293b">
          <animate attributeName="ry" values="1;4;1.5;3;1" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M -6 -14 Q 0 -10 6 -14" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {/* Stethoscope */}
      <path d="M -10 5 Q -15 20 -10 35" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      <circle cx="-10" cy="38" r="5" fill="#64748b" />
      <path d="M 10 5 Q 15 20 10 35" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      {/* Arms */}
      <rect x="-37" y="5" width="13" height="45" rx="6.5" fill="#e11d48" />
      <rect x="24" y="5" width="13" height="45" rx="6.5" fill="#e11d48" />
      {/* Hands */}
      <circle cx="-31" cy="52" r="7" fill="#fde68a" />
      <circle cx="31" cy="52" r="7" fill="#fde68a" />
      {/* Name badge */}
      <rect x="-12" y="18" width="24" height="7" rx="2" fill="white" opacity="0.85" />
    </g>
  );
}

function PatientCharacter({ scale = 1, talking = false, worried = false }: { scale?: number; talking?: boolean; worried?: boolean }) {
  return (
    <g transform={`scale(${scale})`}>
      {/* Body */}
      <rect x="-23" y="0" width="46" height="65" rx="14" fill="#6366f1" />
      <rect x="-23" y="0" width="46" height="12" rx="14" fill="#4f46e5" />
      {/* Head */}
      <circle cx="0" cy="-20" r="18" fill="#fde68a" />
      {/* Hair */}
      <path d="M -18 -22 Q 0 -42 18 -22 Q 18 -36 0 -40 Q -18 -36 -18 -22 Z" fill="#1e293b" />
      {/* Eyes */}
      <circle cx="-6" cy="-20" r="2" fill="#1e293b" />
      <circle cx="6" cy="-20" r="2" fill="#1e293b" />
      {/* Mouth */}
      {talking ? (
        <ellipse cx="0" cy="-11" rx="3.5" ry="2.5" fill="#1e293b">
          <animate attributeName="ry" values="1;3;1.5;2.5;1" dur="0.28s" repeatCount="indefinite" />
        </ellipse>
      ) : worried ? (
        <path d="M -5 -10 Q 0 -14 5 -10" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -5 -10 Q 0 -6 5 -10" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {/* Arms */}
      <rect x="-34" y="5" width="12" height="40" rx="6" fill="#6366f1" />
      <rect x="22" y="5" width="12" height="40" rx="6" fill="#6366f1" />
      {/* Hands */}
      <circle cx="-28" cy="47" r="6" fill="#fde68a" />
      <circle cx="28" cy="47" r="6" fill="#fde68a" />
    </g>
  );
}

// ── ForeignObject speech bubble ─────────────────────────────────

function SpeechBubble({
  x,
  y,
  width,
  height,
  speaker,
  text,
  accent,
  tailX,
  tailY,
  tailDir,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  speaker: 'doctor' | 'patient';
  text: string;
  accent: string;
  tailX: number;
  tailY: number;
  tailDir: 'left' | 'right';
}) {
  const bubbleColor = speaker === 'doctor' ? accent : '#6366f1';
  return (
    <g className="animate-fade-in">
      {/* Bubble background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill="white"
        stroke={bubbleColor}
        strokeWidth={1.5}
        opacity={0.97}
      />
      {/* Tail */}
      <path
        d={tailDir === 'left'
          ? `M ${x + 15} ${y + height} L ${tailX} ${tailY} L ${x + 30} ${y + height}`
          : `M ${x + width - 15} ${y + height} L ${tailX} ${tailY} L ${x + width - 30} ${y + height}`}
        fill="white"
        stroke={bubbleColor}
        strokeWidth={1}
        opacity={0.97}
      />
      {/* Text inside bubble via foreignObject */}
      <foreignObject x={x + 6} y={y + 4} width={width - 12} height={height - 8}>
        <div
          // @ts-expect-error xmlns is valid on div in foreignObject
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '7px',
            fontWeight: 600,
            color: '#1e293b',
            lineHeight: 1.35,
            padding: '2px 4px',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: '6px',
              fontWeight: 700,
              color: 'white',
              background: bubbleColor,
              padding: '1px 4px',
              borderRadius: '4px',
              marginBottom: '2px',
            }}
          >
            {speaker === 'doctor' ? 'Dr. Aayushi' : 'Patient'}
          </span>
          <div style={{ marginTop: '2px' }}>{text}</div>
        </div>
      </foreignObject>
    </g>
  );
}

// ── Scene visual ────────────────────────────────────────────────

function SceneVisual({
  scene,
  sceneIdx,
  currentLineIdx,
  isDoctorTalking,
  isPatientTalking,
}: {
  scene: VideoScene;
  sceneIdx: number;
  currentLineIdx: number;
  isDoctorTalking: boolean;
  isPatientTalking: boolean;
}) {
  const currentLine: DialogueLine | undefined = scene.dialogue[currentLineIdx];
  const patientWorried = currentLineIdx < scene.dialogue.length - 1;

  // Character positions
  const doctorX = 95;
  const doctorY = 155;
  const patientX = 305;
  const patientY = 160;

  return (
    <svg viewBox="0 0 400 225" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${sceneIdx}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={scene.bgFrom} />
          <stop offset="100%" stopColor={scene.bgTo} />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill={`url(#bg-${sceneIdx})`} />

      {/* Floor */}
      <rect x="0" y="185" width="400" height="40" fill={scene.accent} opacity="0.06" />

      {/* Desk in the middle */}
      <rect x="170" y="155" width="60" height="30" rx="6" fill={scene.accent} opacity="0.1" />

      {/* Doctor on left */}
      <g transform={`translate(${doctorX},${doctorY})`}>
        <DoctorCharacter scale={0.8} talking={isDoctorTalking} />
      </g>
      {/* Doctor name tag — directly below doctor character */}
      <g transform={`translate(${doctorX},${doctorY + 70})`}>
        <rect x="-22" y="0" width="44" height="12" rx="6" fill={scene.accent} opacity="0.9" />
        <text x="0" y="8.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Dr. Aayushi</text>
      </g>

      {/* Patient on right */}
      <g transform={`translate(${patientX},${patientY})`}>
        <PatientCharacter scale={0.75} talking={isPatientTalking} worried={patientWorried} />
      </g>
      {/* Patient name tag — directly below patient character */}
      <g transform={`translate(${patientX},${patientY + 62})`}>
        <rect x="-18" y="0" width="36" height="12" rx="6" fill="#6366f1" opacity="0.9" />
        <text x="0" y="8.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Patient</text>
      </g>

      {/* Speech bubble — aligned with the speaking character */}
      {currentLine && (
        <SpeechBubble
          key={`bubble-${sceneIdx}-${currentLineIdx}`}
          x={currentLine.speaker === 'doctor' ? 30 : 210}
          y={currentLine.speaker === 'doctor' ? 50 : 50}
          width={160}
          height={52}
          speaker={currentLine.speaker}
          text={currentLine.text}
          accent={scene.accent}
          tailX={currentLine.speaker === 'doctor' ? doctorX : patientX}
          tailY={currentLine.speaker === 'doctor' ? doctorY - 30 : patientY - 30}
          tailDir={currentLine.speaker === 'doctor' ? 'left' : 'right'}
        />
      )}

      {/* Scene icon floating */}
      <g className="animate-float" style={{ animationDuration: '5s' }}>
        <text x="350" y="35" fontSize="22" opacity="0.25">{scene.icon}</text>
      </g>
      <g className="animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>
        <text x="30" y="40" fontSize="20" opacity="0.2">{scene.icon}</text>
      </g>
    </svg>
  );
}

// ── Speech synthesis engine ────────────────────────────────────

function useSpeechEngine(muted: boolean, playing: boolean) {
  const [isDoctorTalking, setIsDoctorTalking] = useState(false);
  const [isPatientTalking, setIsPatientTalking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices (async on some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((line: DialogueLine, onDone: () => void) => {
    if (muted || typeof window === 'undefined' || !window.speechSynthesis) {
      setIsDoctorTalking(false);
      setIsPatientTalking(false);
      onDone();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = 0.88;
    utterance.volume = 1;

    // Both voices female — doctor slightly lower pitch, patient slightly higher
    if (line.speaker === 'doctor') {
      utterance.pitch = 0.9;
    } else {
      utterance.pitch = 1.2;
    }

    // Try to pick a Hindi or female English voice for Hinglish
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices();

    // Prefer Hindi voices, then female English voices
    const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
    const femaleEnVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    );
    const anyEnVoice = voices.find((v) => v.lang.startsWith('en'));

    utterance.voice = hindiVoice ?? femaleEnVoice ?? anyEnVoice ?? null;
    if (hindiVoice) {
      utterance.lang = hindiVoice.lang;
    } else {
      utterance.lang = 'en-IN';
    }

    if (line.speaker === 'doctor') {
      setIsDoctorTalking(true);
      setIsPatientTalking(false);
    } else {
      setIsPatientTalking(true);
      setIsDoctorTalking(false);
    }

    utterance.onend = () => {
      setIsDoctorTalking(false);
      setIsPatientTalking(false);
      onDone();
    };

    utterance.onerror = () => {
      setIsDoctorTalking(false);
      setIsPatientTalking(false);
      onDone();
    };

    window.speechSynthesis.speak(utterance);
  }, [muted]);

  // Cancel speech when paused or unmounted
  useEffect(() => {
    if (!playing && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsDoctorTalking(false);
      setIsPatientTalking(false);
    }
  }, [playing]);

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, isDoctorTalking, isPatientTalking };
}

// ── Main component ─────────────────────────────────────────────

export default function ServiceVideoPreview({ serviceId }: { serviceId: string }) {
  const video = getServiceVideo(serviceId);

  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [lineElapsed, setLineElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const { speak, isDoctorTalking, isPatientTalking } = useSpeechEngine(muted, playing);

  const totalDuration = video
    ? video.scenes.reduce((sum, s) => sum + s.dialogue.reduce((s2, l) => s2 + l.duration, 0), 0)
    : 0;

  const timeline = useRef<{ sceneIdx: number; lineIdx: number; start: number; duration: number; line: DialogueLine; scene: VideoScene }[]>([]);

  if (video && timeline.current.length === 0) {
    let t = 0;
    video.scenes.forEach((scene, si) => {
      scene.dialogue.forEach((line, li) => {
        timeline.current.push({ sceneIdx: si, lineIdx: li, start: t, duration: line.duration, line, scene });
        t += line.duration;
      });
    });
  }

  useEffect(() => {
    timeline.current = [];
    if (video) {
      let t = 0;
      video.scenes.forEach((scene, si) => {
        scene.dialogue.forEach((line, li) => {
          timeline.current.push({ sceneIdx: si, lineIdx: li, start: t, duration: line.duration, line, scene });
          t += line.duration;
        });
      });
    }
    setElapsed(0);
    setSceneIdx(0);
    setLineIdx(0);
    setLineElapsed(0);
    setPlaying(true);
    setReplayKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    if (!playing || !video) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = performance.now() - elapsed * 1000;

    const tick = () => {
      const now = performance.now();
      const t = (now - startRef.current) / 1000;
      if (t >= totalDuration) {
        setElapsed(totalDuration);
        setPlaying(false);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        return;
      }
      setElapsed(t);

      const entry = timeline.current.find((e) => t >= e.start && t < e.start + e.duration);
      if (entry) {
        if (entry.sceneIdx !== sceneIdx) setSceneIdx(entry.sceneIdx);
        if (entry.lineIdx !== lineIdx) setLineIdx(entry.lineIdx);
        setLineElapsed(t - entry.start);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, replayKey, serviceId]);

  const lastSpokenRef = useRef<string>('');
  useEffect(() => {
    if (!playing || !video || muted) return;
    const entry = timeline.current.find((e) => elapsed >= e.start && elapsed < e.start + e.duration);
    if (!entry) return;
    const key = `${entry.sceneIdx}-${entry.lineIdx}`;
    if (key !== lastSpokenRef.current) {
      lastSpokenRef.current = key;
      speak(entry.line, () => {});
    }
  }, [elapsed, playing, video, muted, speak]);

  useEffect(() => {
    if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [muted]);

  if (!video) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
            <Play size={24} className="text-rose-600 ml-1" />
          </div>
          <p className="text-sm text-gray-400">Video coming soon</p>
        </div>
      </div>
    );
  }

  const scene = video.scenes[sceneIdx];
  const progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  const isFinished = elapsed >= totalDuration;

  function togglePlay() {
    if (isFinished) {
      handleReplay();
      return;
    }
    if (!playing) {
      setPlaying(true);
    } else {
      setPlaying(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }

  function handleReplay() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    lastSpokenRef.current = '';
    setElapsed(0);
    setSceneIdx(0);
    setLineIdx(0);
    setLineElapsed(0);
    setReplayKey((k) => k + 1);
    setPlaying(true);
  }

  function toggleMute() {
    if (!muted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setMuted(!muted);
  }

  function seekTo(target: number) {
    const clamped = Math.max(0, Math.min(target, totalDuration));
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    lastSpokenRef.current = '';
    setElapsed(clamped);
    const entry = timeline.current.find((e) => clamped >= e.start && clamped < e.start + e.duration);
    if (entry) {
      setSceneIdx(entry.sceneIdx);
      setLineIdx(entry.lineIdx);
      setLineElapsed(clamped - entry.start);
    } else {
      const last = timeline.current[timeline.current.length - 1];
      if (last) {
        setSceneIdx(last.sceneIdx);
        setLineIdx(last.lineIdx);
      }
    }
    if (clamped >= totalDuration) {
      setPlaying(false);
    } else {
      setPlaying(true);
      setReplayKey((k) => k + 1);
    }
  }

  function skipBy(delta: number) {
    seekTo(elapsed + delta);
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct * totalDuration);
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black select-none">
      {/* Scene visual */}
      <div className="absolute inset-0">
        <SceneVisual
          scene={scene}
          sceneIdx={sceneIdx}
          currentLineIdx={lineIdx}
          isDoctorTalking={isDoctorTalking}
          isPatientTalking={isPatientTalking}
        />
      </div>

      {/* Top bar — scene title */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/40 to-transparent px-4 pt-3 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-semibold tracking-wide drop-shadow">PATIENT-DOCTOR CONSULTATION</span>
          </div>
          <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors p-1">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
        <h3
          key={`title-${sceneIdx}`}
          className="text-white font-serif text-lg font-bold mt-2 drop-shadow-lg animate-fade-in"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {scene.title}
        </h3>
        <p className="text-white/70 text-xs mt-0.5">{scene.subtitle}</p>
      </div>
      {/* Scene transition flash */}
      <div
        key={`flash-${sceneIdx}`}
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ background: 'white', opacity: 0, animation: 'sceneFlash 0.4s ease-out both' }}
      />

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
        <div
          className="group relative h-1.5 bg-white/20 rounded-full mb-2 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <div
            className="h-full rounded-full transition-all duration-75 relative"
            style={{ width: `${progress}%`, background: scene.accent }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              style={{ background: scene.accent }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => skipBy(-5)} className="text-white/70 hover:text-white transition-colors" title="Skip back 5s">
              <SkipBack size={16} />
            </button>
            <button onClick={togglePlay} className="text-white hover:text-rose-300 transition-colors">
              {isFinished || !playing ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>
            <button onClick={() => skipBy(5)} className="text-white/70 hover:text-white transition-colors" title="Skip forward 5s">
              <SkipForward size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-xs font-mono">
              {Math.floor(elapsed)}s / {Math.ceil(totalDuration)}s
            </span>
            <button onClick={handleReplay} className="text-white/70 hover:text-white transition-colors">
              <RotateCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Finished overlay */}
      {isFinished && (
        <button
          onClick={handleReplay}
          className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 text-white animate-bounce-in">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <RotateCw size={28} />
            </div>
            <span className="text-sm font-medium">Replay Conversation</span>
          </div>
        </button>
      )}

      <style>{`
        @keyframes sceneFlash {
          0% { opacity: 0.5; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}