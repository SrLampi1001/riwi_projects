import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { VoiceToggle } from './components/VoiceToggle';
import { useSpeech } from './hooks/useSpeech';

// Stable session ID — persists for the lifetime of this browser tab.
const SESSION_ID = uuidv4();

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMode, setResponseMode] = useState('text'); // 'text' | 'voice'
  const [isListening, setIsListening] = useState(false);
  const [safariBannerDismissed, setSafariBannerDismissed] = useState(false);

  const {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    detectLang,
    isSupported,
    isSttSupported,
    sttLevel,
    browser,
    sttMessage,
  } = useSpeech();

  // Safari warning banner: shown when sttLevel === 'partial' and not yet dismissed
  const showSafariBanner = sttLevel === 'partial' && !safariBannerDismissed;

  // ─── Send message to the backend agent ────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return;

      const userMsg = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      if (isSupported) stopSpeaking();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: SESSION_ID, message: text.trim() }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Server error ${res.status}`);
        }

        const { reply, toolsUsed } = await res.json();

        const botMsg = {
          id: uuidv4(),
          role: 'assistant',
          content: reply,
          toolsUsed: toolsUsed || [],
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);

        if (responseMode === 'voice' && isSupported) {
          const lang = detectLang(reply);
          speak(reply, lang);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: 'assistant',
            content: `⚠️ Something went wrong: ${error.message}`,
            toolsUsed: [],
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, responseMode, isSupported, stopSpeaking, speak, detectLang]
  );

  // ─── Toggle microphone for STT ─────────────────────────────────────────────
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening(
        (transcript) => {
          setIsListening(false);
          sendMessage(transcript);
        },
        (err) => {
          console.error('STT error:', err);
          setIsListening(false);
        },
        'en-US'
      );
    }
  }, [isListening, startListening, stopListening, sendMessage]);

  // ─── Response mode change ──────────────────────────────────────────────────
  const handleModeChange = useCallback(
    (mode) => {
      setResponseMode(mode);
      if (mode === 'text' && isSupported) stopSpeaking();
    },
    [isSupported, stopSpeaking]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🌎</span>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                color: 'var(--text-primary)',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              LinguaBot
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              English · Spanish AI Assistant
            </p>
          </div>
        </div>

        <VoiceToggle mode={responseMode} onChange={handleModeChange} />
      </header>

      {/* ── Safari STT Warning Banner ────────────────────────────────────────
           Shown once per session when the browser is Safari (partial STT).
           The user can dismiss it with the ✕ button.
      ─────────────────────────────────────────────────────────────────────── */}
      {showSafariBanner && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '10px 20px',
            background: 'rgba(251,191,36,0.10)',
            borderBottom: '1px solid rgba(251,191,36,0.25)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#fbbf24',
                lineHeight: 1.4,
              }}
            >
              {sttMessage}
            </p>
          </div>
          <button
            onClick={() => setSafariBannerDismissed(true)}
            title="Dismiss"
            aria-label="Dismiss warning"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fbbf24',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Chat History ─────────────────────────────────────────────────────── */}
      <ChatWindow messages={messages} isLoading={isLoading} />

      {/* ── Input Area ───────────────────────────────────────────────────────── */}
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
        onMicClick={handleMicClick}
        isListening={isListening}
        isSttSupported={isSttSupported}
        sttLevel={sttLevel}
        sttMessage={sttMessage}
      />
    </div>
  );
}
