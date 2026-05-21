import { useCallback, useRef, useState, useEffect } from 'react';
import { detectBrowser, getSttSupport, STT_MESSAGES } from '../utils/browserDetect';
import { cleanTextForTTS } from '../utils/textCleaner';

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
 *   voicesLoaded             — true once voiceschanged has fired at least once
 */
export function useSpeech() {
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const pendingTextRef = useRef(null);
  const pendingLangRef = useRef(null);

  // ─── Browser & Support Detection ──────────────────────────────────────────
  const browser = detectBrowser();
  const sttLevel = getSttSupport();
  const isSupported = 'speechSynthesis' in window;
  const isSttSupported =
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    sttLevel !== 'none';

  const sttMessage = STT_MESSAGES[browser] ?? null;

  // ─── Voice Loading ─────────────────────────────────────────────────────────
  // Voices load asynchronously; wait for voiceschanged before attempting TTS
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      setVoicesLoaded(true);
      if (pendingTextRef.current !== null) {
        const text = pendingTextRef.current;
        const lang = pendingLangRef.current ?? 'en-US';
        pendingTextRef.current = null;
        pendingLangRef.current = null;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        const voices = synthRef.current.getVoices();
        const langPrefix = lang.split('-')[0];
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith(langPrefix) &&
              !v.localService &&
              v.name.includes('Google')
          ) ||
          voices.find(
            (v) => v.lang.startsWith(langPrefix) && !v.localService
          ) ||
          voices.find((v) => v.lang.startsWith(langPrefix));
        if (preferred) utterance.voice = preferred;
        synthRef.current.speak(utterance);
      }
    };

    const synth = synthRef.current;
    if (synth.getVoices().length > 0) {
      setVoicesLoaded(true);
      return;
    }
    synth.addEventListener('voiceschanged', loadVoices, { once: true });
    return () => synth.removeEventListener('voiceschanged', loadVoices);
  }, [isSupported]);

  // ─── TTS ──────────────────────────────────────────────────────────────────
  /**
   * Speak text aloud using the browser TTS engine.
   * Picks a Spanish or English voice depending on the target locale.
   * If voices haven't loaded yet, queues the text and speaks once voices are ready.
   */
  const speak = useCallback(
    (text, lang = 'en-US') => {
      if (!isSupported) {
        console.warn('[useSpeech] TTS not supported in this browser');
        return;
      }
      synthRef.current.cancel();

      const cleanText = cleanTextForTTS(text);
      const voices = synthRef.current.getVoices();
      const langPrefix = lang.split('-')[0];

      if (voices.length === 0 || !voicesLoaded) {
        if (voices.length === 0) {
          console.warn('[useSpeech] No voices available yet, queueing TTS');
          pendingTextRef.current = cleanText;
          pendingLangRef.current = lang;
        } else {
          console.warn('[useSpeech] Voices not yet loaded, queueing TTS');
          pendingTextRef.current = cleanText;
          pendingLangRef.current = lang;
        }
        return;
      }

      // Prefer remote/cloud voices for naturalness; fall back to any matching voice
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith(langPrefix) &&
            !v.localService &&
            v.name.includes('Google')
        ) ||
        voices.find(
          (v) => v.lang.startsWith(langPrefix) && !v.localService
        ) ||
        voices.find((v) => v.lang.startsWith(langPrefix));

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      if (preferred) utterance.voice = preferred;

      synthRef.current.speak(utterance);
    },
    [isSupported, voicesLoaded]
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
    voicesLoaded,
  };
}
