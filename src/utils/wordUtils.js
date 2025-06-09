// utils/wordUtils.js

// Helper to shuffle arrays
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Gets an initial set of random words for the game board.
 * Ensures 'count' unique German words and their direct English translations are selected.
 * @param {object} dict The dictionary object.
 * @param {number} count The number of pairs to select for the initial board.
 * @returns {{germanWords: string[], englishWords: string[], pairs: object[]}}
 * An object containing shuffled German words, shuffled English words, and the corresponding pairs.
 */
export const getRandomWords = (dict, count = 5) => {
  const allPossiblePairs = Object.entries(dict).flatMap(([de, en]) => {
    const translations = Array.isArray(en) ? en : [en];
    // For initial setup, pick one random translation if it's a list
    const chosenEn = translations[Math.floor(Math.random() * translations.length)];
    return { de, en: chosenEn, originalEn: en }; // Store original 'en' for later lookup if needed
  });

  const uniqueGermanWordsSet = new Set();
  const selectedPairs = [];
  const tempShuffledPairs = shuffleArray([...allPossiblePairs]);

  // Select 'count' unique German words to form the initial pairs
  while (selectedPairs.length < count && tempShuffledPairs.length > 0) {
    const pair = tempShuffledPairs.pop();
    if (!uniqueGermanWordsSet.has(pair.de)) {
      uniqueGermanWordsSet.add(pair.de);
      selectedPairs.push(pair);
    }
  }

  // If we couldn't find enough unique German words from shuffled pairs, fill with whatever available
  while (selectedPairs.length < count && allPossiblePairs.length > 0) {
      const remainingPair = allPossiblePairs.pop();
      selectedPairs.push(remainingPair);
  }

  const gameGermanWords = selectedPairs.map(p => p.de);
  const gameEnglishWords = selectedPairs.map(p => p.en);

  return {
    germanWords: shuffleArray(gameGermanWords), // Shuffle for initial display
    englishWords: shuffleArray(gameEnglishWords), // Shuffle for initial display
    pairs: selectedPairs // The actual matching pairs for game logic (with chosen 'en' translation)
  };
};

/**
 * Gets a single new random unique pair from the dictionary that is not present on the current board.
 * Prioritizes a pair where both German and English words are not currently visible.
 * Falls back to finding a pair where at least the German word is new.
 * Handles dictionary values that are lists of translations.
 * @param {object} dict The dictionary object.
 * @param {Array<object>} existingPairs An array of pairs currently on the board ({de, en}).
 * @returns {object} A new unique pair ({de, en}), or a potentially non-unique fallback if dictionary exhausted.
 */
export const getNewUniquePair = (dict, existingPairs) => {
  const allPossiblePairs = Object.entries(dict).flatMap(([de, en]) => {
    const translations = Array.isArray(en) ? en : [en];
    // Create a pair for each possible translation for checking uniqueness
    return translations.map(t => ({ de, en: t, originalEn: en }));
  });

  // Create sets for efficient lookup of existing German and English words on the board
  const existingGermanWords = new Set(existingPairs.map(p => p.de));
  const existingEnglishWords = new Set(existingPairs.map(p => p.en));

  const shuffledAllPairs = shuffleArray([...allPossiblePairs]);

  // Attempt 1: Find a pair where both German and English words are completely new to the board
  while (shuffledAllPairs.length > 0) {
    const candidatePair = shuffledAllPairs.pop();

    // Check if both the German word and the *specific* English translation
    // of the candidate pair are NOT currently on the board.
    // Also, ensure the exact pair itself isn't already there.
    const isExactDuplicatePair = existingPairs.some(
      (ep) => ep.de === candidatePair.de && ep.en === candidatePair.en
    );

    if (
      !existingGermanWords.has(candidatePair.de) &&
      !existingEnglishWords.has(candidatePair.en) &&
      !isExactDuplicatePair
    ) {
        // If the English translation chosen is from a list, make sure to pick one for display
        const finalEn = Array.isArray(candidatePair.originalEn)
            ? candidatePair.originalEn[Math.floor(Math.random() * candidatePair.originalEn.length)]
            : candidatePair.originalEn;
        return { de: candidatePair.de, en: finalEn, originalEn: candidatePair.originalEn };
    }
  }

  // Attempt 2: Fallback if no completely new unique pair is found.
  // Try to find a pair where at least the German word is new.
  const secondAttemptShuffledPairs = shuffleArray([...allPossiblePairs]);
  while (secondAttemptShuffledPairs.length > 0) {
    const candidatePair = secondAttemptShuffledPairs.pop();
     if (!existingGermanWords.has(candidatePair.de)) {
        const finalEn = Array.isArray(candidatePair.originalEn)
            ? candidatePair.originalEn[Math.floor(Math.random() * candidatePair.originalEn.length)]
            : candidatePair.originalEn;
        return { de: candidatePair.de, en: finalEn, originalEn: candidatePair.originalEn };
    }
  }

  // Last Resort: If dictionary is extremely limited, return a random pair.
  console.warn("Could not find a completely new unique pair. Reusing words from dictionary.");
  if (allPossiblePairs.length > 0) {
      const fallbackPair = allPossiblePairs[Math.floor(Math.random() * allPossiblePairs.length)];
      const finalEn = Array.isArray(fallbackPair.originalEn)
            ? fallbackPair.originalEn[Math.floor(Math.random() * fallbackPair.originalEn.length)]
            : fallbackPair.originalEn;
      return { de: fallbackPair.de, en: finalEn, originalEn: fallbackPair.originalEn };
  }
  return { de: "No Word", en: "No Translation" }; // Should only happen if dictionary is empty
};