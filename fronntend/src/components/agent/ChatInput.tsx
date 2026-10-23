import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Sparkles, RotateCcw, Volume2 } from 'lucide-react';
import { VoiceSimulationModal } from './VoiceSimulationModal';
import {
  startVoiceRecognition,
  stopVoiceRecognition,
  isSpeechRecognitionSupported,
} from '../../utils/speechService';

interface ChatInputProps {
  onSendMessage: (message: string, orderId?: string, isVoiceInput?: boolean) => void;
  onClear: () => void;
  isRunning: boolean;
}

const STARTER_PROMPTS = [
  {
    label: 'Primary Demo: Investigate KL-1042 Weather Delay',
    orderId: 'KL-1042',
    text: 'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
    icon: '❄️',
  },
  {
    label: 'Exchange Eligibility: KL-1089',
    orderId: 'KL-1089',
    text: 'Check order KL-1089 return eligibility and generate return label instructions.',
    icon: '🔄',
  },
  {
    label: 'Damage Claim: KL-1025',
    orderId: 'KL-1025',
    text: 'Review damaged shipment report for order KL-1025 and propose replacement options.',
    icon: '📦',
  },
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onClear, isRunning }) => {
  const [inputText, setInputText] = useState('');
  const [isVoiceSimulated, setIsVoiceSimulated] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const dictationCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setHasMicSupport(isSpeechRecognitionSupported());
    return () => {
      if (dictationCleanupRef.current) {
        dictationCleanupRef.current();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isRunning) return;

    if (isDictating && dictationCleanupRef.current) {
      dictationCleanupRef.current();
      setIsDictating(false);
    }

    onSendMessage(inputText.trim(), undefined, isVoiceSimulated || isDictating);
    setInputText('');
  };

  const handlePromptClick = (text: string, orderId: string) => {
    if (isRunning) return;
    setInputText(text);
    onSendMessage(text, orderId, isVoiceSimulated);
  };

  const handleInlineMicToggle = () => {
    if (!hasMicSupport) {
      // If browser doesn't have Web Speech API, open the Voice Simulation modal
      setVoiceModalOpen(true);
      return;
    }

    if (isDictating) {
      if (dictationCleanupRef.current) {
        dictationCleanupRef.current();
        dictationCleanupRef.current = null;
      }
      stopVoiceRecognition();
      setIsDictating(false);
    } else {
      setIsVoiceSimulated(true);
      const cleanup = startVoiceRecognition({
        onStart: () => {
          setIsDictating(true);
        },
        onInterim: (text) => {
          setInputText(text);
        },
        onFinal: (text) => {
          setInputText(text);
          setIsDictating(false);
        },
        onError: () => {
          setIsDictating(false);
          // If mic fails or is denied, open voice simulation modal as helper
          setVoiceModalOpen(true);
        },
        onEnd: () => {
          setIsDictating(false);
        },
      });

      dictationCleanupRef.current = cleanup;
    }
  };

  const handleVoiceQueryFromModal = (query: string, orderId?: string) => {
    setIsVoiceSimulated(true);
    setInputText(query);
    onSendMessage(query, orderId, true);
  };

  return (
    <>
      <div className="border-top pt-3 bg-white">
        {/* Starter Prompts */}
        <div className="mb-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={13} className="text-primary me-1" />
              Suggested Alexa+ Starter Inquiries:
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
              onClick={onClear}
              style={{ fontSize: '0.75rem' }}
              title="Clear current workspace and start fresh"
            >
              <RotateCcw size={12} className="me-1" />
              Reset Workspace
            </button>
          </div>

          <div className="d-flex flex-wrap gap-1">
            {STARTER_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-sm btn-outline-secondary text-start d-inline-flex align-items-center gap-1 border-secondary-subtle bg-light text-dark py-1 px-2"
                onClick={() => handlePromptClick(p.text, p.orderId)}
                disabled={isRunning}
                style={{ fontSize: '0.75rem', borderRadius: '6px' }}
              >
                <span>{p.icon}</span>
                <span className="fw-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Field and Controls */}
        <form onSubmit={handleSubmit} className="position-relative">
          <div
            className={`d-flex align-items-center gap-2 p-1 border rounded-3 bg-white shadow-sm transition ${
              isDictating
                ? 'border-danger ring-2 ring-danger-subtle'
                : isVoiceSimulated
                ? 'border-primary ring-2 ring-primary-subtle'
                : 'border-secondary-subtle'
            }`}
          >
            {/* Open Voice Simulator Modal */}
            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1.5 px-2.5 py-1 ${
                isVoiceSimulated
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-primary'
              }`}
              onClick={() => setVoiceModalOpen(true)}
              title="Click to open Alexa+ Simulated Voice Assistant dialog"
              style={{ borderRadius: '6px', fontSize: '0.78rem' }}
            >
              <Volume2 size={15} className={isVoiceSimulated ? 'animate-pulse' : ''} />
              <span className="d-none d-sm-inline fw-semibold">Simulate Voice</span>
            </button>

            {/* Live Inline Dictation Button */}
            <button
              type="button"
              className={`btn btn-sm p-1.5 d-flex align-items-center justify-content-center rounded-circle border-0 ${
                isDictating
                  ? 'btn-danger text-white animate-pulse'
                  : 'btn-light text-secondary'
              }`}
              onClick={handleInlineMicToggle}
              title={
                isDictating
                  ? 'Listening... Click to stop voice dictation'
                  : 'Click to speak via microphone'
              }
              style={{ width: '32px', height: '32px' }}
            >
              {isDictating ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              className="form-control form-control-sm border-0 shadow-none px-2 py-2"
              placeholder={
                isDictating
                  ? 'Listening to your microphone... Speak your resolution request now'
                  : isVoiceSimulated
                  ? 'Simulated Alexa+ mode active. Ask or click "Simulate Voice"'
                  : 'Ask ResolveLoop AI (e.g. "Investigate order KL-1042 and check store policy...")'
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isRunning}
              style={{ fontSize: '0.88rem' }}
              aria-label="Agent request input"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3 py-1 fw-medium"
              disabled={!inputText.trim() || isRunning}
              style={{ borderRadius: '6px' }}
              aria-label="Send resolution request"
            >
              <Send size={15} />
              <span className="d-none d-sm-inline">Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Voice Simulation Modal */}
      <VoiceSimulationModal
        show={voiceModalOpen}
        onHide={() => setVoiceModalOpen(false)}
        onSendVoiceQuery={handleVoiceQueryFromModal}
        initialQuery={inputText}
      />
    </>
  );
};
