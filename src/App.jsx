// src/App.jsx
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameUI from './components/GameUI';
import './styles/App.css';
import './styles/LandingPage.css';
import './styles/FeedbackMessage.css';
import './styles/WordColumn.css';

function App() {
  // Three possible states: 'landing', 'timeAttack', 'clearTheBoard'
  const [gameState, setGameState] = useState('landing');

  const [sessionScore, setSessionScore] = useState(0);

  const handleStartGame = (mode) => {
    setSessionScore(0); // Reset score when starting a new game
    if (mode === 'timeAttack' || mode === 'clearTheBoard') {
      setGameState(mode);
    }
  };

  const handleGoHome = () => {
    setGameState('landing');
    setSessionScore(0); 
  };

  const handleIncrementScore = () => {
    setSessionScore(prevScore => prevScore + 1);
  };

  const handleResetScore = () => {
    setSessionScore(0);
  };

  // Render content based on the current game state
  const renderContent = () => {
    switch (gameState) {
      case 'timeAttack':
      case 'clearTheBoard':
        return <GameUI 
            gameMode={gameState} 
            onGoHome={handleGoHome}
            sessionScore={sessionScore}
            onIncrementScore={handleIncrementScore}
            onResetScore={handleResetScore}
          />;
      case 'landing':
      default:
        return <LandingPage onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="app-container">
      {renderContent()}
    </div>
  );
}

export default App;
