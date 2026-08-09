import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '50px',
    padding: '4px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s ease',
  },
  active: {
    background: 'var(--accent)',
    color: '#0f0e11',
  },
  inactive: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};

export function VoiceToggle({ mode, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={styles.label}>Response</span>
      <div style={styles.wrapper}>
        <button
          style={{ ...styles.btn, ...(mode === 'text' ? styles.active : styles.inactive) }}
          onClick={() => onChange('text')}
          title="Text mode"
        >
          <span>📝</span> Text
        </button>
        <button
          style={{ ...styles.btn, ...(mode === 'voice' ? styles.active : styles.inactive) }}
          onClick={() => onChange('voice')}
          title="Voice mode"
        >
          <span>🔊</span> Voice
        </button>
      </div>
    </div>
  );
}
