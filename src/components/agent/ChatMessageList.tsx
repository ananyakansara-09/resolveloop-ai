import React from 'react';
import type { CaseMessage } from '../../types/case';
import { Bot, User, Mic, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChatMessageListProps {
  messages: CaseMessage[];
  isRunning: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isRunning }) => {
  // Simple, safe text formatter for bullet points, bold and quotes
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: '0.5rem' }} />;
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
            <span>{renderInlineStyles(text)}</span>
          </div>
        );
      }

      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="d-flex align-items-start gap-2 my-1 ps-2">
            <span className="fw-bold text-primary small">{numMatch[1]}.</span>
            <span>{renderInlineStyles(numMatch[2])}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="mb-2">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  // Safe inline styling for **bold** and `code`
  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-dark">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
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
