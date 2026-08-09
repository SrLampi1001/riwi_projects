const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args));

// ─────────────────────────────────────────────
// Tool Definitions (OpenAI function-calling format)
// ─────────────────────────────────────────────
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'dictionary_lookup',
      description:
        'Look up the definition, phonetic pronunciation, part of speech, and an example sentence for a specific word in English or Spanish.',
      parameters: {
        type: 'object',
        properties: {
          word: {
            type: 'string',
            description: 'The word to look up (e.g. "ephemeral", "serenidad")',
          },
          language: {
            type: 'string',
            enum: ['en', 'es'],
            description: 'Language of the word: "en" for English, "es" for Spanish',
          },
        },
        required: ['word', 'language'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'translate_and_analyze',
      description:
        'Translate a word, phrase, or sentence from English to Spanish or vice versa, and return a quality score for the translation.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to translate',
          },
          source_language: {
            type: 'string',
            enum: ['en', 'es'],
            description: 'Source language code: "en" or "es"',
          },
          target_language: {
            type: 'string',
            enum: ['en', 'es'],
            description: 'Target language code: "en" or "es"',
          },
        },
        required: ['text', 'source_language', 'target_language'],
      },
    },
  },
];

// ─────────────────────────────────────────────
// Tool Implementations
// ─────────────────────────────────────────────

/**
 * dictionary_lookup
 * Uses the free DictionaryAPI.dev (English) and a fallback for Spanish.
 */
async function dictionary_lookup({ word, language }) {
  try {
    // DictionaryAPI.dev supports English natively
    // For Spanish we use the same API with 'es' locale
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`;
    const res = await fetch(url);

    if (!res.ok) {
      return {
        success: false,
        word,
        language,
        error: `No definition found for "${word}" in ${language === 'en' ? 'English' : 'Spanish'}.`,
      };
    }

    const data = await res.json();
    const entry = data[0];
    const meaning = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];

    return {
      success: true,
      word: entry.word,
      language,
      phonetic: entry.phonetic || null,
      partOfSpeech: meaning?.partOfSpeech || null,
      definition: definition?.definition || null,
      example: definition?.example || null,
    };
  } catch (err) {
    return {
      success: false,
      word,
      language,
      error: `Dictionary lookup failed: ${err.message}`,
    };
  }
}

/**
 * translate_and_analyze
 * Uses the free MyMemory API (no key required, 1000 req/day).
 */
async function translate_and_analyze({ text, source_language, target_language }) {
  try {
    const langPair = `${source_language}|${target_language}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const res = await fetch(url);

    if (!res.ok) {
      return {
        success: false,
        originalText: text,
        error: 'Translation service unavailable.',
      };
    }

    const data = await res.json();
    const translation = data.responseData?.translatedText || null;
    const quality = data.responseData?.match ?? null; // 0–1 quality score

    return {
      success: true,
      originalText: text,
      translatedText: translation,
      sourceLanguage: source_language,
      targetLanguage: target_language,
      qualityScore: quality !== null ? Math.round(quality * 100) : null,
    };
  } catch (err) {
    return {
      success: false,
      originalText: text,
      error: `Translation failed: ${err.message}`,
    };
  }
}

// ─────────────────────────────────────────────
// Dispatcher — called by agent.js
// ─────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
    case 'dictionary_lookup':
      return await dictionary_lookup(args);
    case 'translate_and_analyze':
      return await translate_and_analyze(args);
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool };
