import React from 'react';

const TOOL_ICONS = {
  dictionary_lookup: '📖',
  translate_and_analyze: '🌐',
};

const TOOL_LABELS = {
  dictionary_lookup: 'Dictionary Lookup',
  translate_and_analyze: 'Translate & Analyze',
};

function ToolBadge({ name }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--tool-bg)',
        border: '1px solid rgba(251,146,60,0.3)',
        color: 'var(--tool-color)',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '8px',
        letterSpacing: '0.02em',
      }}
    >
      <span>{TOOL_ICONS[name] || '🔧'}</span>
      <span>Tool used: {TOOL_LABELS[name] || name}</span>
    </div>
  );
}

export function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        animation: 'fadeSlideUp 0.25s ease forwards',
      }}
    >
      {/* Tool badges — shown before bot reply when tools were used */}
      {!isUser && message.toolsUsed?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px', paddingLeft: '4px' }}>
          {message.toolsUsed.map((t, i) => (
            <ToolBadge key={i} name={t.name} />
          ))}
        </div>
      )}

      <div
        style={{
          maxWidth: '78%',
          padding: '12px 16px',
          borderRadius: isUser
            ? '18px 18px 4px 18px'
            : '4px 18px 18px 18px',
          background: isUser ? 'var(--user-bubble)' : 'var(--bot-bubble)',
          border: isUser
            ? '1px solid rgba(168,85,247,0.3)'
            : '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: '15px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>

      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '4px',
          paddingLeft: isUser ? '0' : '4px',
          paddingRight: isUser ? '4px' : '0',
        }}
      >
        {isUser ? 'You' : 'LinguaBot'} · {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
