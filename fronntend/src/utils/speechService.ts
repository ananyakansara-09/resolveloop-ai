// ==========================================
// ResolveLoop AI - Web Speech & Alexa+ Audio Service
// Supports: Web Audio chimes, Speech-to-Text (Dictation),
// and Speech-to-Text / Text-to-Speech (TTS)
// ==========================================

// Web Speech API interface definitions for TypeScript
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => IWindowSpeechRecognition;
    webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
  }
}

let activeRecognition: IWindowSpeechRecognition | null = null;
let audioContextInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContextInstance && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextInstance = new AudioCtx();
      }
    }
    if (audioContextInstance && audioContextInstance.state === 'suspended') {
      audioContextInstance.resume().catch(() => {});
    }
    return audioContextInstance;
  } catch {
    return null;
  }
}

/**
 * Play authentic Alexa+ two-tone chime using Web Audio API synthesis
 * Tone 1: 587 Hz (D5), Tone 2: 880 Hz (A5)
 */
export function playAlexaChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First Tone: 587Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.13);

    // Second Tone: 880Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.11);

    gain2.gain.setValueAtTime(0, now + 0.11);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.11);
    osc2.stop(now + 0.33);
  } catch {
    // AudioContext blocked or not supported
  }
}

/**
 * Check if the browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if the browser supports speech synthesis (text-to-speech)
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Start listening to microphone using Web Speech API
 */
export function startVoiceRecognition(options: {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}): () => void {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    options.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use the simulated voice presets.');
    options.onEnd?.();
    return () => {};
  }

  // Stop any active session
  stopVoiceRecognition();

  try {
    const recognition = new SpeechRec();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      playAlexaChime();
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        options.onInterim?.(interim);
      }

      if (final) {
        options.onFinal(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      let message = 'Voice recognition error occurred.';
      if (event.error === 'not-allowed') {
        message = 'Microphone access was denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please try speaking again.';
      } else if (event.error === 'network') {
        message = 'Network error during voice recognition.';
      }
      options.onError?.(message);
    };

    recognition.onend = () => {
      activeRecognition = null;
      options.onEnd?.();
    };

    recognition.start();

    return () => {
      stopVoiceRecognition();
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not initialize speech recognition.';
    options.onError?.(msg);
    options.onEnd?.();
    return () => {};
  }
}

/**
 * Stop active speech recognition
 */
export function stopVoiceRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      // Ignore
    }
    activeRecognition = null;
  }
}

/**
 * Clean markdown symbols for natural Text-to-Speech reading
 */
function cleanMarkdownForSpeech(text: string): string {
  return text
    .replace(/###\s+/g, '')
    .replace(/##\s+/g, '')
    .replace(/#\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/>\s*/g, '')
    .replace(/-\s+/g, '')
    .replace(/\d+\.\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speak text aloud using browser Text-to-Speech (Alexa simulation)
 */
export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return () => {};
  }

  stopSpeaking();

  const clean = cleanMarkdownForSpeech(text);
  if (!clean) {
    onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'en-US';
  utterance.rate = 1.02;
  utterance.pitch = 1.05; // Slightly pleasant high-mid pitch for virtual assistant

  // Try to pick a natural sounding English female voice if available
  const voices = window.speechSynthesis.getVoices();
  const alexaLikeVoice = voices.find(
    v =>
      (v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Google US English') ||
        v.name.includes('Zira') ||
        v.name.includes('Natural') ||
        v.name.includes('Female')) &&
      v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en'));

  if (alexaLikeVoice) {
    utterance.voice = alexaLikeVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    stopSpeaking();
  };
}

/**
 * Stop any active text-to-speech audio
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Check if browser speech synthesis is currently playing
 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
