// src/utils/wordUtils.js

// Helper to shuffle arrays - no changes needed here, it's efficient enough.
const shuffleArray = (array) => {
  // Fisher-Yates shuffle is more robust, but sort is fine for this scale.
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Gets an initial set of random words.
 * This function is only called once at the start, so its efficiency is less critical,
 * but we can still make it slightly cleaner.
 */
export const getRandomWords = (dict, count = 5) => {
  const germanKeys = Object.keys(dict);
  const shuffledKeys = shuffleArray(germanKeys);
  const selectedPairs = [];

  // Ensure we don't get stuck in a loop if count > dictionary size
  const numPairsToGet = Math.min(count, shuffledKeys.length);

  for (let i = 0; i < numPairsToGet; i++) {
    const de = shuffledKeys[i];
    const en = dict[de];
    const translations = Array.isArray(en) ? en : [en];
    const chosenEn = translations[Math.floor(Math.random() * translations.length)];
    selectedPairs.push({ de, en: chosenEn, originalEn: en });
  }

  const gameGermanWords = selectedPairs.map(p => p.de);
  const gameEnglishWords = selectedPairs.map(p => p.en);

  return {
    germanWords: shuffleArray(gameGermanWords),
    englishWords: shuffleArray(gameEnglishWords),
    pairs: selectedPairs,
  };
};

/**
 * Gets a single new random unique pair from the dictionary.
 * This is the most critical function to optimize as it's called on every correct match.
 *
 * @param {object} dict The dictionary object.
 * @param {Array<object>} existingPairs An array of pairs currently on the board.
 * @returns {object} A new unique pair.
 */
export const getNewUniquePair = (dict, existingPairs) => {
  // Create lookup sets for existing words on the board. This is very fast.
  const existingGermanWords = new Set(existingPairs.map(p => p.de));

  // Get all possible German words from the dictionary and shuffle them.
  // This is more efficient than creating all possible pairs.
  const allGermanKeys = Object.keys(dict);
  const shuffledKeys = shuffleArray(allGermanKeys);

  // Find the first key that is not already on the board.
  for (const de of shuffledKeys) {
    if (!existingGermanWords.has(de)) {
      // Found a new German word. Create a pair from it.
      const en = dict[de];
      const translations = Array.isArray(en) ? en : [en];
      const chosenEn = translations[Math.floor(Math.random() * translations.length)];
      
      // Return the new pair immediately.
      return { de, en: chosenEn, originalEn: en };
    }
  }

  // Fallback: If all German words are somehow on the board (small dictionary),
  // return a random pair to prevent the game from crashing.
  console.warn("Could not find a new unique German word. Reusing a word.");
  const fallbackKey = allGermanKeys[Math.floor(Math.random() * allGermanKeys.length)];
  const en = dict[fallbackKey];
  const translations = Array.isArray(en) ? en : [en];
  const chosenEn = translations[Math.floor(Math.random() * translations.length)];
  return { de: fallbackKey, en: chosenEn, originalEn: en };
};
