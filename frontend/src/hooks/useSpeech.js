import { useCallback, useRef } from 'react';

/**
 * useSpeech — wraps the browser Web Speech API
 * Provides: speak(text), stopSpeaking(), isSupported
 * Also provides: startListening(onResult), stopListening for STT (bonus)
 */
export function useSpeech() {
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  const isSupported = 'speechSynthesis' in window;
  const isSttSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  /**
   * Speak text aloud using the browser TTS engine.
   * Picks a Spanish or English voice depending on detected language.
   */
  const speak = useCallback((text, lang = 'en-US') => {
    if (!isSupported) return;
    synthRef.current.cancel(); // stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Try to find a natural-sounding voice for the language
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith(lang.split('-')[0]) && v.localService === false
    ) || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

    if (preferred) utterance.voice = preferred;

    synthRef.current.speak(utterance);
  }, [isSupported]);

  const stopSpeaking = useCallback(() => {
    if (isSupported) synthRef.current.cancel();
  }, [isSupported]);

  /**
   * Start speech-to-text listening.
   * onResult(transcript: string) — called when recognition succeeds.
   * onError(err) — optional error handler.
   */
  const startListening = useCallback((onResult, onError, lang = 'en-US') => {
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
  }, [isSttSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  /**
   * Detect language from text (simple heuristic — good enough for en/es).
   * Returns 'es-ES' or 'en-US'.
   */
  const detectLang = (text) => {
    const spanishWords = /\b(el|la|los|las|un|una|es|son|y|de|en|que|se|no|con|por|para|como|más|pero)\b/gi;
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
  };
}
