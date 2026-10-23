import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  playAlexaChime,
  startVoiceRecognition,
  stopVoiceRecognition,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
} from '../../utils/speechService';

interface VoiceSimulationModalProps {
  show: boolean;
  onHide: () => void;
  onSendVoiceQuery: (query: string, orderId?: string) => void;
  initialQuery?: string;
}

const VOICE_PRESETS = [
  {
    id: 'p1',
    orderId: 'KL-1042',
    phrase: 'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
    label: 'Order KL-1042 Weather Delay Investigation',
    tag: 'Primary Hackathon Demo',
    badgeClass: 'bg-primary text-white',
  },
  {
    id: 'p2',
    orderId: 'KL-1089',
    phrase: 'Check order KL-1089 return eligibility and generate return label instructions.',
    label: 'Order KL-1089 Size Exchange Policy Check',
    tag: 'Apparel SLA',
    badgeClass: 'bg-info-subtle text-info-emphasis border',
  },
  {
    id: 'p3',
    orderId: 'KL-1025',
    phrase: 'Review damaged shipment report for order KL-1025 and propose replacement options.',
    label: 'Order KL-1025 Damaged Item Claim',
    tag: 'Damage Claim',
    badgeClass: 'bg-warning-subtle text-warning-emphasis border',
  },
];

export const VoiceSimulationModal: React.FC<VoiceSimulationModalProps> = ({
  show,
  onHide,
  onSendVoiceQuery,
  initialQuery = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialQuery);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const [simulatedVoiceActive, setSimulatedVoiceActive] = useState(false);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setHasMicSupport(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
      setTranscript(initialQuery || '');
      setInterimTranscript('');
      setSimulatedVoiceActive(false);
    } else {
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
      stopVoiceRecognition();
      stopSpeaking();
      setIsListening(false);
    }
  }, [show, initialQuery]);

  const handleStartListening = () => {
    setErrorMsg(null);
    setInterimTranscript('');

    const cleanup = startVoiceRecognition({
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onFinal: (text) => {
        setTranscript(prev => (prev ? `${prev} ${text}` : text));
        setInterimTranscript('');
      },
      onError: (err) => {
        setErrorMsg(err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    cleanupFnRef.current = cleanup;
  };

  const handleStopListening = () => {
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }
    stopVoiceRecognition();
    setIsListening(false);
  };

  const handleSelectPreset = (preset: typeof VOICE_PRESETS[0]) => {
    stopVoiceRecognition();
    setIsListening(false);
    setSimulatedVoiceActive(true);
    setTranscript(preset.phrase);
    setInterimTranscript('');

    // Play chime and speak the query in simulated voice
    playAlexaChime();
    speakText(
      `Alexa, ${preset.phrase}`,
      undefined,
      () => {
        setSimulatedVoiceActive(false);
      }
    );
  };

  const handleSend = () => {
    const finalQuery = (transcript || interimTranscript).trim();
    if (!finalQuery) {
      setErrorMsg('Please speak or select a simulated voice query first.');
      return;
    }

    stopVoiceRecognition();
    stopSpeaking();
    onSendVoiceQuery(finalQuery);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton className="border-bottom bg-light py-2 px-3">
        <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: '28px', height: '28px', backgroundColor: '#0055ff' }}
          >
            <Mic size={15} />
          </div>
          <span>Simulate Alexa+ Voice Interaction</span>
          <span
            className="badge bg-primary-subtle text-primary border border-primary-subtle ms-1"
            style={{ fontSize: '0.68rem' }}
          >
            Alexa+ Track
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {errorMsg && (
          <div className="alert alert-warning py-2 px-3 small mb-3 d-flex align-items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Alexa Orb Visualizer */}
        <div className="text-center py-3 mb-3 bg-light rounded-3 border position-relative overflow-hidden">
          {/* Animated Glow Halo */}
          <div
            className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center shadow"
            style={{
              width: '84px',
              height: '84px',
              background: isListening
                ? 'radial-gradient(circle, #00CAFF 0%, #0055FF 100%)'
                : simulatedVoiceActive
                ? 'radial-gradient(circle, #38bdf8 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              boxShadow: isListening || simulatedVoiceActive
                ? '0 0 25px rgba(0, 202, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
          >
            {isListening ? (
              <Mic size={36} className="text-white animate-pulse" />
            ) : simulatedVoiceActive ? (
              <Volume2 size={36} className="text-white animate-pulse" />
            ) : (
              <Sparkles size={34} className="text-info" />
            )}
          </div>

          <div className="fw-bold text-dark small mb-1">
            {isListening
              ? 'Listening to your voice... Speak your inquiry now.'
              : simulatedVoiceActive
              ? 'Simulating Alexa+ Voice Input (Audio Playing)...'
              : 'Alexa+ Simulated Voice Ready'}
          </div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {isListening
              ? 'Say: "Investigate order KL-1042 and check the store policy"'
              : 'Use your live microphone or click a simulated voice inquiry below'}
          </div>

          {/* Sound Wave Animation Bars */}
          {(isListening || simulatedVoiceActive) && (
            <div className="d-flex align-items-center justify-content-center gap-1 mt-3" style={{ height: '24px' }}>
              {[12, 20, 16, 24, 18, 14, 22, 12].map((height, i) => (
                <span
                  key={i}
                  className="bg-primary rounded-pill"
                  style={{
                    width: '3.5px',
                    height: `${height}px`,
                    animation: `pulse 0.8s ease-in-out infinite alternate ${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Mic Controls */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
          {hasMicSupport && (
            <>
              {isListening ? (
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm fw-semibold"
                  onClick={handleStopListening}
                >
                  <MicOff size={15} />
                  <span>Stop Listening</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm fw-semibold"
                  onClick={handleStartListening}
                >
                  <Mic size={15} />
                  <span>Speak via Microphone</span>
                </button>
              )}
            </>
          )}

          {transcript && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
                stopVoiceRecognition();
                stopSpeaking();
              }}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Transcript Box */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-secondary mb-1">
            Voice Command Transcript:
          </label>
          <div
            className="p-3 bg-white border rounded-2 text-dark font-monospace small"
            style={{ minHeight: '80px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.84rem' }}
          >
            {transcript || interimTranscript ? (
              <div>
                <span>{transcript}</span>
                {interimTranscript && (
                  <span className="text-muted fst-italic ms-1">{interimTranscript}</span>
                )}
              </div>
            ) : (
              <span className="text-muted fst-italic">
                (Click &quot;Speak via Microphone&quot; or select one of the simulated voice queries below...)
              </span>
            )}
          </div>
        </div>

        {/* One-Click Simulated Voice Presets */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="small fw-semibold text-dark d-flex align-items-center gap-1">
              <Sparkles size={13} className="text-primary" />
              <span>One-Click Simulated Alexa Voice Queries:</span>
            </span>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              Plays wake chime & synthesizes voice
            </span>
          </div>

          <div className="d-flex flex-column gap-2">
            {VOICE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-2 rounded-2 border bg-light d-flex align-items-center justify-content-between gap-2 cursor-pointer hover-shadow transition"
                onClick={() => handleSelectPreset(preset)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelectPreset(preset);
                }}
              >
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <button
                    type="button"
                    className="btn btn-sm btn-white border rounded-circle d-flex align-items-center justify-content-center text-primary flex-shrink-0"
                    style={{ width: '28px', height: '28px' }}
                    title="Simulate Voice"
                  >
                    <Play size={12} className="ms-0.5" />
                  </button>
                  <div className="text-truncate">
                    <div className="fw-semibold text-dark small lh-sm">{preset.label}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                      &quot;{preset.phrase}&quot;
                    </div>
                  </div>
                </div>

                <span className={`badge ${preset.badgeClass} flex-shrink-0`} style={{ fontSize: '0.65rem' }}>
                  {preset.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top bg-light py-2 px-3 d-flex justify-content-between">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={!transcript.trim() && !interimTranscript.trim()}
          className="d-inline-flex align-items-center gap-1 px-3 shadow-sm fw-semibold"
        >
          <span>Run Investigation</span>
          <ArrowRight size={14} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
