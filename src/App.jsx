// App.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import dictionary from './data/words'; // Your dictionary
import { getRandomWords, getNewUniquePair } from './utils/wordUtils';
import Controls from './components/Controls';
import WordColumn from './components/WordColumn';
import Timer from './components/Timer';
import './styles/App.css'; // Global app styles

// --- Game Configuration Constants ---
const PAIR_COUNT = 5; // Number of pairs on the board at all times (e.g., 5 German, 5 English words)
const INCORRECT_SELECTION_CLEAR_DELAY = 500; // Delay to clear selected cards on incorrect match
const FADE_OUT_DURATION = 400; // Duration for fade-out animation in ms (should match CSS transition)
const REPLACE_APPEAR_DELAY = 400; // Time after fade starts when new words should appear

const INITIAL_GAME_TIME = 60; // Initial game time in seconds

function App() {
  // --- State Declarations ---
  const [germanWords, setGermanWords] = useState([]); // Words displayed in German column
  const [englishWords, setEnglishWords] = useState([]); // Words displayed in English column
  const [currentPairs, setCurrentPairs] = useState([]); // The actual German-English pairs currently on the board
  const [matchedPairsCount, setMatchedPairsCount] = useState(0); // Cumulative score of matched pairs
  const [selectedCards, setSelectedCards] = useState({ german: null, english: null }); // Tracks currently selected cards
  const [isRunning, setIsRunning] = useState(false); // Is the game timer running?
  const [time, setTime] = useState(INITIAL_GAME_TIME); // Current time left in seconds
  const [gameOver, setGameOver] = useState(false); // Is the game over?
  const [wordsBeingReplaced, setWordsBeingReplaced] = useState([]); // Words currently fading out

  // Refs for timer and dictionary (to avoid re-creating/passing as dependency)
  const timerRef = useRef(null);
  const dictionaryRef = useRef(dictionary); // Use ref for dictionary to prevent unnecessary re-renders/dependencies

  // --- Helper Functions (Memoized with useCallback) ---

  // Helper to shuffle arrays (used for initial display)
  const shuffleArray = useCallback((array) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  // Initializes or resets the entire game state
  const initializeGame = useCallback(() => {
    // Get initial random words and pairs from the dictionary
    const { germanWords: initialGermanWords, englishWords: initialEnglishWords, pairs: initialPairs } = getRandomWords(dictionaryRef.current, PAIR_COUNT);
    
    // Set initial word lists (shuffled for display)
    setGermanWords(shuffleArray(initialGermanWords));
    setEnglishWords(shuffleArray(initialEnglishWords));
    setCurrentPairs(initialPairs); // Store the active pairs

    // Reset game-specific states
    setMatchedPairsCount(0);
    setSelectedCards({ german: null, english: null });
    setTime(INITIAL_GAME_TIME);
    setIsRunning(true); // Game starts immediately on reset/init
    setGameOver(false);
    setWordsBeingReplaced([]);

    // Clear any existing timer interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [shuffleArray]); // Dependency on shuffleArray

  // --- Core Game Logic: Handling Card Clicks ---
  const handleCardClick = (word, language) => {
    // 1. Pre-click checks: If game is not running or over, ignore clicks.
    if (!isRunning || gameOver) {
      return;
    }
    // Prevent selecting the same card twice in a row (e.g., clicking the same German word)
    if ((language === 'german' && selectedCards.german === word) ||
        (language === 'english' && selectedCards.english === word)) {
      return;
    }
    // Prevent selecting a word that's currently fading out (it's already 'gone')
    if (wordsBeingReplaced.includes(word)) {
      return;
    }

    // 2. Update selected cards state
    setSelectedCards(prev => {
      const newSelection = { ...prev, [language]: word };

      // 3. Check for a complete selection (one German, one English)
      if (newSelection.german && newSelection.english) {
        // Find the actual pair that matches the selection from currentPairs
        // For matching, we need to check if the German word and *any* of its potential English translations match.
        const matchedPair = currentPairs.find(pair =>
          pair.de === newSelection.german && (
            Array.isArray(pair.originalEn) ? pair.originalEn.includes(newSelection.english) : pair.en === newSelection.english
          )
        );

        if (matchedPair) {
          // --- It's a Match! ---
          setWordsBeingReplaced([matchedPair.de, matchedPair.en]); // Mark for fading visuals
          setMatchedPairsCount(prevCount => prevCount + 1); // Increment score by 1 for a matched pair

          // Immediately clear selected cards so player can select next
          setSelectedCards({ german: null, english: null });

          // Set a timeout for replacement *after* fade out duration
          setTimeout(() => {
            // Get a new unique pair to replace the matched one
            const newPair = getNewUniquePair(dictionaryRef.current, currentPairs);

            // Update word lists: Replace old words with new ones in their exact positions
            setGermanWords(prevWords => {
              const updatedWords = [...prevWords];
              const index = updatedWords.indexOf(matchedPair.de);
              if (index !== -1) {
                updatedWords[index] = newPair.de; // Replace in place
              }
              return updatedWords; // No shuffling, keep other words in place
            });

            setEnglishWords(prevWords => {
              const updatedWords = [...prevWords];
              const index = updatedWords.indexOf(matchedPair.en);
              if (index !== -1) {
                updatedWords[index] = newPair.en; // Replace in place
              }
              return updatedWords; // No shuffling, keep other words in place
            });

            // Update currentPairs: Remove the old matched pair, add the new one
            setCurrentPairs(prevPairs => {
              const updatedPairs = prevPairs.filter(
                p => !(p.de === matchedPair.de && (
                  Array.isArray(p.originalEn) ? p.originalEn.includes(matchedPair.en) : p.en === matchedPair.en
                ))
              );
              return [...updatedPairs, newPair];
            });

            // Remove the words from the wordsBeingReplaced list
            setWordsBeingReplaced(current =>
              current.filter(w => w !== matchedPair.de && w !== matchedPair.en)
            );

          }, REPLACE_APPEAR_DELAY); // New words appear after this delay

        } else {
          // --- No Match ---
          // Clear selected cards after a short delay for visual feedback of incorrectness
          setTimeout(() => {
            setSelectedCards({ german: null, english: null });
          }, INCORRECT_SELECTION_CLEAR_DELAY);
        }
        return newSelection; // Return the new selection for immediate visual feedback
      }
      // If only one card is selected, just update and return
      return newSelection;
    });
  };

  // --- Controls Handlers ---
  const handleStartStop = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // --- Effects ---

  // Timer Effect: Manages the game countdown
  useEffect(() => {
    if (isRunning && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) { // If time runs out
            clearInterval(timerRef.current);
            setIsRunning(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Decrement every second
    } else {
      clearInterval(timerRef.current); // Stop timer if game not running or over
    }
    // Cleanup function: Clear interval when component unmounts or dependencies change
    return () => clearInterval(timerRef.current);
  }, [isRunning, gameOver]); // Dependencies: Re-run effect if these change

  // Initial Game Setup on Component Mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]); // Dependency on useCallback initializeGame

  // --- Render ---
  return (
    <div className="app">
      <h1>German-English Word Matcher</h1>
      <Timer time={time} isRunning={isRunning} /> {/* Removed bestTime prop */}
      <Controls
        onReset={initializeGame}
        onStartStop={handleStartStop}
        isRunning={isRunning}
        gameOver={gameOver}
      />

      <div className="words-container">
        <WordColumn
          words={germanWords}
          language="german"
          onCardClick={handleCardClick}
          selectedCards={selectedCards}
          wordsBeingReplaced={wordsBeingReplaced}
          // Disable column if game is not running or is over (but allow clicks on non-fading cards)
          disabled={!isRunning || gameOver}
        />
        <WordColumn
          words={englishWords}
          language="english"
          onCardClick={handleCardClick}
          selectedCards={selectedCards}
          wordsBeingReplaced={wordsBeingReplaced}
          // Disable column if game is not running or is over (but allow clicks on non-fading cards)
          disabled={!isRunning || gameOver}
        />
      </div>

      <div className="game-info">
        {gameOver ? (
          <div className="final-stats">
            <h3 className={time === 0 ? '' : 'won'}>
                {time === 0 ? 'Game Over!' : 'Time Left: ' + time + 's'}
            </h3>
            <p>Matched: {matchedPairsCount} pairs</p>
          </div>
        ) : (
          <p>Matched Pairs: {matchedPairsCount}</p>
        )}
      </div>
    </div>
  );
}

export default App;