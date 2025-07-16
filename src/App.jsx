// src/App.jsx
import { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import GameUI from './components/GameUI';

// --- CSS IMPORTS ---
import './styles/App.css';
import './styles/LandingPage.css';
import './styles/WordColumn.css';

// --- ADD THIS LINE ---
import './styles/FeedbackMessage.css'; 
// --- END OF ADDITION ---


function App() {
  // ... (the rest of your App.jsx logic is correct)
  const [gameState, setGameState] = useState('landing');
  const [sessionScore, setSessionScore] = useState(0);

  const handleStartGame = useCallback((mode) => {
    setSessionScore(0);
    if (mode === 'timeAttack' || mode === 'clearTheBoard') {
      setGameState(mode);
    }
  }, []);

  const handleGoHome = useCallback(() => {
    setGameState('landing');
  }, []);

  const handleIncrementScore = useCallback(() => {
    setSessionScore(prevScore => prevScore + 1);
  }, []);

  const handleResetScore = useCallback(() => {
    setSessionScore(0);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case 'timeAttack':
      case 'clearTheBoard':
        return (
          <GameUI 
            gameMode={gameState} 
            onGoHome={handleGoHome}
            sessionScore={sessionScore}
            onIncrementScore={handleIncrementScore}
            onResetScore={handleResetScore}
          />
        );
      case 'landing':
      default:
        return <LandingPage onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;
