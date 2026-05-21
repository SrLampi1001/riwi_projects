import React, { useState } from 'react';

/**
 * InputBar — bottom input area.
 *
 * Props:
 *   onSend(text)        — called when the user submits a message
 *   isLoading           — disables input while agent is thinking
 *   onMicClick()        — toggles STT listening
 *   isListening         — true while microphone is active
 *   isSttSupported      — true if SpeechRecognition is available and usable
 *   sttLevel            — 'full' | 'partial' | 'none'
 *   sttMessage          — tooltip text when STT is unavailable (Firefox) or limited
 */
export function InputBar({
  onSend,
  isLoading,
  onMicClick,
  isListening,
  isSttSupported,
  sttLevel,
  sttMessage,
}) {
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

  // ─── Mic button state derived from sttLevel ────────────────────────────────
  // 'full'    → enabled, active
  // 'partial' → enabled, but a warning banner shows above
  // 'none'    → disabled with tooltip (button always visible)
  const micDisabled = sttLevel === 'none';
  const showMicButton = true; // always render; never hidden per spec
  const micTitle = micDisabled
    ? sttMessage || 'Voice input is not supported in this browser.'
    : isListening
    ? 'Stop listening'
    : 'Speak your message';

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
      {/* ── Mic Button ─────────────────────────────────────────────────────── */}
      {showMicButton && (
        <button
          onClick={micDisabled ? undefined : onMicClick}
          title={micTitle}
          disabled={micDisabled}
          aria-label={micTitle}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: micDisabled
              ? '1px solid var(--border)'
              : '1px solid var(--border)',
            background: micDisabled
              ? 'var(--surface-2)'
              : isListening
              ? 'rgba(192,132,252,0.15)'
              : 'var(--surface-2)',
            color: micDisabled
              ? 'var(--text-muted)'
              : isListening
              ? 'var(--accent)'
              : 'var(--text-secondary)',
            cursor: micDisabled ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            animation: isListening && !micDisabled ? 'pulse 1.2s ease infinite' : 'none',
            opacity: micDisabled ? 0.45 : 1,
          }}
        >
          🎤
        </button>
      )}

      {/* ── Text Input ─────────────────────────────────────────────────────── */}
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

      {/* ── Send Button ────────────────────────────────────────────────────── */}
      <button
        onClick={handleSend}
        disabled={isLoading || !value.trim()}
        title="Send message"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: 'none',
          background:
            isLoading || !value.trim() ? 'var(--surface-2)' : 'var(--accent)',
          color:
            isLoading || !value.trim() ? 'var(--text-muted)' : '#0f0e11',
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
