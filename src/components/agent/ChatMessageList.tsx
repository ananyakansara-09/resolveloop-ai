import React, { useState, useEffect } from 'react';
import type { CaseMessage } from '../../types/case';
import { Bot, User, Mic, Sparkles, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speechService';

interface ChatMessageListProps {
  messages: CaseMessage[];
  isRunning: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isRunning }) => {
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleToggleSpeech = (msgId: string, content: string) => {
    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      stopSpeaking();
      setCurrentlySpeakingId(msgId);
      speakText(
        content,
        () => setCurrentlySpeakingId(msgId),
        () => setCurrentlySpeakingId(null)
      );
    }
  };

  // Simple, safe text formatter for bullet points, bold and quotes
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: '0.4rem' }} />;
      }

      // Markdown Headings
      if (line.startsWith('### ')) {
        return (
          <h6 key={idx} className="fw-bold text-dark mt-3 mb-1.5" style={{ fontSize: '0.92rem' }}>
            {renderInlineStyles(line.replace(/^###\s*/, ''))}
          </h6>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h5 key={idx} className="fw-bold text-dark mt-3 mb-1.5" style={{ fontSize: '1rem' }}>
            {renderInlineStyles(line.replace(/^##\s*/, ''))}
          </h5>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h5 key={idx} className="fw-bold text-dark mt-3 mb-2">
            {renderInlineStyles(line.replace(/^#\s*/, ''))}
          </h5>
        );
      }

      // Blockquote
      if (line.startsWith('>')) {
        return (
          <blockquote
            key={idx}
            className="border-start border-3 border-primary ps-3 py-1 my-2 bg-light rounded-end small text-secondary fst-italic"
          >
            {line.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Bullet line
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        return (
          <div key={idx} className="d-flex align-items-start gap-2 my-1 ps-2">
            <span className="text-primary mt-1" style={{ fontSize: '0.6rem' }}>●</span>
            <span className="text-secondary">{renderInlineStyles(text)}</span>
          </div>
        );
      }

      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="d-flex align-items-start gap-2 my-1 ps-2">
            <span className="fw-bold text-primary small">{numMatch[1]}.</span>
            <span className="text-secondary">{renderInlineStyles(numMatch[2])}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="mb-2 text-secondary">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  // Safe inline styling for **bold**, *italic*, and `code`
  const renderInlineStyles = (text: string) => {
    // Split by bold (**...**), code (`...`), and italic (*...*)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="text-dark fw-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
        return <em key={i} className="text-secondary fst-italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={i} className="px-1 py-0.5 bg-light border rounded text-primary small">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="chat-messages-container d-flex flex-column gap-3 mb-3" style={{ minHeight: '350px' }}>
      {messages.map(msg => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';

        if (isSystem) {
          return (
            <div key={msg.id} className="text-center my-2">
              <span className="badge bg-light text-secondary border px-3 py-2 small fw-normal d-inline-flex align-items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                <span>{msg.content}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                  ({msg.timestamp})
                </span>
              </span>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`d-flex gap-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
          >
            {!isUser && (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#0b1329',
                  color: '#ffffff',
                }}
              >
                <Bot size={18} />
              </div>
            )}

            <div style={{ maxWidth: '82%' }}>
              <div
                className="d-flex align-items-center gap-2 mb-1 px-1"
                style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
              >
                <span className="small fw-semibold text-secondary">
                  {isUser ? 'Store Owner' : 'ResolveLoop AI'}
                </span>
                {!isUser && (
                  <button
                    type="button"
                    className={`btn btn-link btn-sm p-0 d-inline-flex align-items-center gap-1 text-decoration-none ${
                      currentlySpeakingId === msg.id ? 'text-primary fw-semibold' : 'text-muted'
                    }`}
                    onClick={() => handleToggleSpeech(msg.id, msg.content)}
                    title={currentlySpeakingId === msg.id ? 'Stop speaking voice' : 'Listen to Alexa voice response'}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {currentlySpeakingId === msg.id ? (
                      <>
                        <VolumeX size={12} className="text-danger" />
                        <span className="text-danger">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
                {msg.isVoiceInput && (
                  <span
                    className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                  >
                    <Mic size={10} />
                    <span>Alexa+ Simulated Voice</span>
                  </span>
                )}
                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                  {msg.timestamp}
                </span>
              </div>

              <div
                className={`p-3 rounded-3 shadow-sm ${
                  isUser
                    ? 'bg-primary text-white'
                    : 'bg-white border text-dark'
                }`}
                style={{
                  borderColor: isUser ? undefined : 'var(--border-subtle)',
                  lineHeight: '1.5',
                  fontSize: '0.9rem',
                }}
              >
                {isUser ? (
                  <div className="text-white">{msg.content}</div>
                ) : (
                  <div>{renderFormattedContent(msg.content)}</div>
                )}
              </div>
            </div>

            {isUser && (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm bg-light text-secondary border"
                style={{ width: '36px', height: '36px' }}
              >
                <User size={18} />
              </div>
            )}
          </div>
        );
      })}

      {isRunning && (
        <div className="d-flex gap-2 justify-content-start align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-dark text-white"
            style={{ width: '36px', height: '36px' }}
          >
            <Sparkles size={18} className="text-info" />
          </div>
          <div className="p-3 bg-white border rounded-3 text-secondary small d-flex align-items-center gap-2 shadow-sm">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
            <span>ResolveLoop AI is querying telemetry and evaluating policies...</span>
          </div>
        </div>
      )}
    </div>
  );
};
