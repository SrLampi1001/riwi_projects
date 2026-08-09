import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

export function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '48px' }}>🌎</span>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          Hola! Hello!
        </p>
        <p style={{ fontSize: '14px', maxWidth: '320px', lineHeight: '1.7' }}>
          Ask me to translate a sentence, define a word, or help you practice English and Spanish.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          {[
            'Translate "good morning" to Spanish',
            'Define the word "serenity"',
            '¿Qué significa "ephemeral"?',
          ].map((hint) => (
            <span
              key={hint}
              style={{
                padding: '6px 12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '50px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '14px',
            paddingLeft: '4px',
            animation: 'fadeSlideUp 0.2s ease forwards',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          LinguaBot is thinking…
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
