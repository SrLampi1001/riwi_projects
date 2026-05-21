/**
 * browserDetect.js
 * Detects the user's browser and returns a standardized name.
 * Note: Brave is intentionally treated as Chrome (same Chromium engine,
 * same full STT support via SpeechRecognition API).
 */

/**
 * Returns the browser name as a lowercase string.
 * @returns {'chrome' | 'brave' | 'firefox' | 'safari' | 'edge' | 'unknown'}
 */
export function detectBrowser() {
  const ua = navigator.userAgent;

  // Edge (Chromium-based) — must be checked before Chrome
  if (ua.includes('Edg')) return 'edge';

  // Firefox
  if (ua.includes('Firefox')) return 'firefox';

  // Safari (must be checked before Chrome, since Safari UA doesn't include 'Chrome')
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';

  // Brave — exposes a async API; for UX purposes treat it as 'chrome'
  // (both use the same Chromium SpeechRecognition implementation)
  if (navigator.brave) return 'chrome';

  // Chrome (standard Chromium)
  if (ua.includes('Chrome')) return 'chrome';

  return 'unknown';
}

/**
 * STT support level per browser.
 *   'full'    — SpeechRecognition API available, reliable.
 *   'partial' — Available via webkit prefix but limited (Safari).
 *   'none'    — No STT support (Firefox).
 */
export const STT_SUPPORT = {
  chrome:  'full',
  edge:    'full',
  safari:  'partial',
  firefox: 'none',
  unknown: 'none',
};

/**
 * Tooltip/banner messages per browser when STT is limited or unavailable.
 */
export const STT_MESSAGES = {
  firefox:
    'Voice input is not supported in Firefox. Please type your message.',
  safari:
    'Voice input may be limited in Safari. Try typing for best results.',
};

/**
 * Returns the STT support level for the current browser.
 * @returns {'full' | 'partial' | 'none'}
 */
export function getSttSupport() {
  const browser = detectBrowser();
  return STT_SUPPORT[browser] ?? 'none';
}
