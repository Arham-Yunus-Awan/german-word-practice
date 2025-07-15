// src/utils/speechUtils.js

// Get the global speech synthesis object from the browser window.
const synth = window.speechSynthesis;

/**
 * Speaks the given text using the browser's Web Speech API.
 * @param {string} text The text to be spoken.
 * @param {string} lang The language code (e.g., 'en-US', 'de-DE').
 */
export const speak = (text, lang = 'de-DE') => {
  // Do nothing if speech synthesis is not supported by the browser.
  if (!synth) {
    console.error("Sorry, your browser does not support text-to-speech.");
    return;
  }

  // Do nothing if the synth is already speaking to prevent interruptions.
  if (synth.speaking) {
    // Optional: You could uncomment the next line to stop the current speech and start a new one.
    // synth.cancel();
    return;
  }

  // Create a new speech utterance instance.
  const utterance = new SpeechSynthesisUtterance(text);

  // Set the language for the utterance.
  utterance.lang = lang;

  // Optional: You can fine-tune the voice, rate, and pitch if desired.
  // utterance.pitch = 1; // From 0 to 2
  // utterance.rate = 1;  // From 0.1 to 10

  // Tell the synthesizer to speak the utterance.
  synth.speak(utterance);
};
