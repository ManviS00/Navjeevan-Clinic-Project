// Web Speech API wrapper — speech recognition (SpeechRecognition) and
// speech synthesis (SpeechSynthesis). Falls back gracefully when the
// browser does not support either.

type SpeechRecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

export interface RecognitionHandlers {
  onResult: (result: SpeechRecognitionResult) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class SpeechRecognitionController {
  private recognition: any | null = null;
  private listening = false;

  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))
    );
  }

  constructor() {
    if (SpeechRecognitionController.isSupported()) {
      const Ctor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new Ctor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';
      this.recognition.maxAlternatives = 1;
    }
  }

  start(handlers: RecognitionHandlers) {
    if (!this.recognition || this.listening) return;

    this.recognition.onstart = () => {
      this.listening = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }
      if (final) {
        handlers.onResult({ transcript: final.trim(), isFinal: true });
      } else if (interim) {
        handlers.onResult({ transcript: interim.trim(), isFinal: false });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.listening = false;
      handlers.onError?.(event.error || 'unknown');
    };

    this.recognition.onend = () => {
      this.listening = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch {
      // start() throws if already started; ignore.
    }
  }

  stop() {
    if (this.recognition && this.listening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.listening = false;
    }
  }

  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.listening = false;
    }
  }

  isListening() {
    return this.listening;
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true });
    // Safety timeout — some browsers never fire voiceschanged.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const prefer = [
    'Google UK English Female',
    'Samantha',
    'Microsoft Zira',
    'Microsoft Aria',
    'Google हिन्दी',
  ];
  for (const name of prefer) {
    const found = voices.find((v) => v.name === name);
    if (found) return found;
  }
  const enFemale = voices.find(
    (v) => v.lang.startsWith('en') && /female|woman|zira|aria|samantha/i.test(v.name)
  );
  if (enFemale) return enFemale;
  const en = voices.find((v) => v.lang.startsWith('en'));
  return en || voices[0];
}

export interface SpeakHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

export function speak(text: string, handlers: SpeakHandlers = {}) {
  if (!speechSynthesisSupported() || !text) {
    handlers.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  const voice = pickVoice(voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-IN';
  }
  utterance.rate = 1;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  utterance.onstart = () => handlers.onStart?.();
  utterance.onend = () => handlers.onEnd?.();
  utterance.onerror = () => handlers.onEnd?.();
  utterance.onboundary = (e) => handlers.onBoundary?.(e.charIndex);

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (speechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return speechSynthesisSupported() && window.speechSynthesis.speaking;
}
