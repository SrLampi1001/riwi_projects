import { useCallback, useRef } from 'react';
import { detectBrowser, getSttSupport, STT_MESSAGES } from '../utils/browserDetect';

/**
 * useSpeech — wraps the browser Web Speech API
 *
 * TTS: SpeechSynthesis — works in all target browsers.
 * STT: SpeechRecognition — support varies; granular status returned via sttLevel.
 *
 * Returns:
 *   speak(text, lang?)       — TTS playback
 *   stopSpeaking()           — cancel TTS
 *   startListening(onResult, onError?, lang?) — begin STT
 *   stopListening()          — stop STT
 *   detectLang(text)         — heuristic en/es detection
 *   isSupported              — TTS available
 *   isSttSupported           — any STT API present
 *   sttLevel                 — 'full' | 'partial' | 'none'
 *   browser                  — detected browser name
 *   sttMessage               — tooltip/banner text (if sttLevel !== 'full')
 */
export function useSpeech() {
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // ─── Browser & Support Detection ──────────────────────────────────────────
  const browser = detectBrowser();
  const sttLevel = getSttSupport();
  const isSupported = 'speechSynthesis' in window;
  const isSttSupported =
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    sttLevel !== 'none';

  // Message to surface in the UI when STT is unavailable or limited
  const sttMessage = STT_MESSAGES[browser] ?? null;

  // ─── TTS ──────────────────────────────────────────────────────────────────
  /**
   * Speak text aloud using the browser TTS engine.
   * Picks a Spanish or English voice depending on the target locale.
   */
  const speak = useCallback(
    (text, lang = 'en-US') => {
      if (!isSupported) return;
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = synthRef.current.getVoices();
      const preferred =
        voices.find(
          (v) => v.lang.startsWith(lang.split('-')[0]) && v.localService === false
        ) || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

      if (preferred) utterance.voice = preferred;
      synthRef.current.speak(utterance);
    },
    [isSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (isSupported) synthRef.current.cancel();
  }, [isSupported]);

  // ─── STT ──────────────────────────────────────────────────────────────────
  /**
   * Start speech-to-text listening.
   * onResult(transcript: string) — called when recognition succeeds.
   * onError(err?)               — optional error handler.
   */
  const startListening = useCallback(
    (onResult, onError, lang = 'en-US') => {
      if (!isSttSupported) return;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };

      rec.onerror = (e) => {
        if (onError) onError(e.error);
      };

      recognitionRef.current = rec;
      rec.start();
    },
    [isSttSupported]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // ─── Language Detection ────────────────────────────────────────────────────
  /**
   * Heuristic language detection for en/es.
   * Returns 'es-ES' or 'en-US'.
   */
  const detectLang = (text) => {
    const spanishWords =
      /\b(el|la|los|las|un|una|es|son|y|de|en|que|se|no|con|por|para|como|más|pero)\b/gi;
    const matches = (text.match(spanishWords) || []).length;
    return matches >= 2 ? 'es-ES' : 'en-US';
  };

  return {
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
  };
}
