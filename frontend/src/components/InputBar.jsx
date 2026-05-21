import React, { useState } from 'react';

export function InputBar({ onSend, isLoading, onMicClick, isListening, isSttSupported }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}
    >
      {/* Mic button (STT) */}
      {isSttSupported && (
        <button
          onClick={onMicClick}
          title={isListening ? 'Stop listening' : 'Speak your message'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: isListening ? 'rgba(192,132,252,0.15)' : 'var(--surface-2)',
            color: isListening ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            animation: isListening ? 'pulse 1.2s ease infinite' : 'none',
          }}
        >
          🎤
        </button>
      )}

      {/* Text input */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message or ask something… / Escribe un mensaje…"
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: '1.5',
          outline: 'none',
          transition: 'border-color 0.2s',
          maxHeight: '120px',
          overflowY: 'auto',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        disabled={isLoading}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={isLoading || !value.trim()}
        title="Send message"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: 'none',
          background: isLoading || !value.trim() ? 'var(--surface-2)' : 'var(--accent)',
          color: isLoading || !value.trim() ? 'var(--text-muted)' : '#0f0e11',
          cursor: isLoading || !value.trim() ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        ➤
      </button>
    </div>
  );
}
