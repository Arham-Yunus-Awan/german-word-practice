import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import dictionary from '../data/words';
import { getRandomWords, getNewUniquePair } from '../utils/wordUtils';
import { speak } from '../utils/speechUtils';
import Controls from './Controls';
import WordColumn from './WordColumn';
import Timer from './Timer';
import FeedbackMessage from './FeedbackMessage';

// --- Constants ---
const PAIR_COUNT = 5;
const REPLACE_APPEAR_DELAY = 400;
const INCORRECT_MATCH_RESET_DELAY = 1500;
const INITIAL_GAME_TIME = 60;
const FEEDBACK_MESSAGE_DURATION = 1600;
const FEEDBACK_ANIMATION_DURATION = 400;

const GameUI = ({ gameMode, onGoHome, sessionScore, onIncrementScore, onResetScore }) => {
  // --- State & Refs ---
  const [germanWords, setGermanWords] = useState([]);
  const [englishWords, setEnglishWords] = useState([]);
  const [currentPairs, setCurrentPairs] = useState([]);
  const [boardMatches, setBoardMatches] = useState(0);
  const [selectedCards, setSelectedCards] = useState({ german: null, english: null });
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(INITIAL_GAME_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [permanentlyMatched, setPermanentlyMatched] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const hasInitialized = useRef(false);

  // --- Game Initialization ---
  const initializeGame = useCallback((isHardReset = false) => {
    if (isHardReset) {
      onResetScore();
    }
    const { germanWords: initialGermanWords, englishWords: initialEnglishWords, pairs: initialPairs } = getRandomWords(dictionary, PAIR_COUNT);
    setGermanWords(initialGermanWords);
    setEnglishWords(initialEnglishWords);
    setCurrentPairs(initialPairs);
    setPermanentlyMatched([]);
    setBoardMatches(0);
    setSelectedCards({ german: null, english: null });
    setTime(INITIAL_GAME_TIME);
    setIsRunning(true);
    setGameOver(false);
    setFeedback({ message: '', type: '' });
    setIsFeedbackVisible(false);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [onResetScore]);

  // --- Feedback Helper ---
  const showFeedback = (message, type) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ message, type });
    setIsFeedbackVisible(true);
    feedbackTimeoutRef.current = setTimeout(() => {
      setIsFeedbackVisible(false);
      setTimeout(() => setFeedback({ message: '', type: '' }), FEEDBACK_ANIMATION_DURATION);
    }, FEEDBACK_MESSAGE_DURATION);
  };

  // --- Core Game Logic ---
  const handleCardClick = (word, language) => {
    if (language === 'german') {
      speak(word, 'de-DE');
    }
    if (!isRunning || gameOver || permanentlyMatched.includes(word) || selectedCards[language] === word) {
      return;
    }
    const newSelection = { ...selectedCards, [language]: word };
    setSelectedCards(newSelection);

    if (newSelection.german && newSelection.english) {
      const matchedPair = currentPairs.find(p => p.de === newSelection.german && (Array.isArray(p.originalEn) ? p.originalEn.includes(newSelection.english) : p.en === newSelection.english));

      if (matchedPair) {
        // --- CORRECT MATCH ---
        showFeedback('Correct!', 'correct');
        onIncrementScore();
        setBoardMatches(prev => prev + 1);
        setSelectedCards({ german: null, english: null });

        if (gameMode === 'timeAttack') {
          setTimeout(() => {
            const newPair = getNewUniquePair(dictionary, currentPairs);
            setGermanWords(prev => prev.map(w => w === matchedPair.de ? newPair.de : w));
            setEnglishWords(prev => prev.map(w => w === matchedPair.en ? newPair.en : w));
            setCurrentPairs(prev => [...prev.filter(p => p.de !== matchedPair.de), newPair]);
          }, REPLACE_APPEAR_DELAY);
        } else {
          setPermanentlyMatched(prev => [...prev, matchedPair.de, matchedPair.en]);
        }
      } else {
        // --- INCORRECT MATCH ---
        // 1. Check if the game mode is 'clearTheBoard'
        if (gameMode === 'clearTheBoard') {
          // 2. Show a specific feedback message
          showFeedback('Incorrect! Your score has been reset.', 'incorrect');
          // 3. Call the parent function to reset the score to 0
          onResetScore();
        } else {
          // For Time Attack mode, just show a simple "Incorrect!"
          showFeedback('Incorrect!', 'incorrect');
        }
        
        // 4. Clear the user's selection so they can try again
        setSelectedCards({ german: null, english: null });
      }
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (!hasInitialized.current) {
      initializeGame(true);
      hasInitialized.current = true;
    }
  }, [initializeGame]);

  useEffect(() => {
    if (gameMode === 'timeAttack' && isRunning && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, gameOver, gameMode]);

  useEffect(() => {
    if (gameMode === 'clearTheBoard' && boardMatches > 0 && boardMatches === PAIR_COUNT) {
      showFeedback('Board Cleared!', 'correct');
      setIsRunning(false);
      setTimeout(() => initializeGame(false), INCORRECT_MATCH_RESET_DELAY);
    }
  }, [boardMatches, gameMode, initializeGame]);

  return (
    <div className="app">
      <button onClick={onGoHome} className="home-button">← Go Home</button>
      <h1>{gameMode === 'timeAttack' ? 'Time Attack Mode' : 'Clear the Board Mode'}</h1>
      
      {gameMode === 'timeAttack' && <Timer time={time} isRunning={isRunning} />}
      
      <Controls 
        onReset={() => initializeGame(true)}
        onStartStop={() => setIsRunning(p => !p)} 
        isRunning={isRunning} 
        gameOver={gameOver}
        gameMode={gameMode}
      />

      <FeedbackMessage message={feedback.message} type={feedback.type} isVisible={isFeedbackVisible} />
      
      <div className="words-container">
        <WordColumn words={germanWords} language="german" onCardClick={handleCardClick} selectedCards={selectedCards} permanentlyMatched={permanentlyMatched} disabled={!isRunning || gameOver} wordsBeingReplaced={[]} />
        <WordColumn words={englishWords} language="english" onCardClick={handleCardClick} selectedCards={selectedCards} permanentlyMatched={permanentlyMatched} disabled={!isRunning || gameOver} wordsBeingReplaced={[]} />
      </div>
      
      <div className="game-info">
        <p>Total Score: {sessionScore}</p>
      </div>
    </div>
  );
};

GameUI.propTypes = {
  gameMode: PropTypes.oneOf(['timeAttack', 'clearTheBoard']).isRequired,
  onGoHome: PropTypes.func.isRequired,
  sessionScore: PropTypes.number.isRequired,
  onIncrementScore: PropTypes.func.isRequired,
  onResetScore: PropTypes.func.isRequired,
};

export default GameUI;
