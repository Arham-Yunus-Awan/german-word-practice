// src/App.jsx
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameUI from './components/GameUI';
import './styles/App.css';
import './styles/LandingPage.css';
import './styles/FeedbackMessage.css';
import './styles/WordColumn.css';

function App() {
  const [gameState, setGameState] = useState('landing');
  const [sessionScore, setSessionScore] = useState(0);

  const handleStartGame = (mode) => {
    setSessionScore(0);
    if (mode === 'timeAttack' || mode === 'clearTheBoard') {
      setGameState(mode);
    }
  };

  const handleGoHome = () => {
    setGameState('landing');
  };

  const handleIncrementScore = () => {
    setSessionScore(prevScore => prevScore + 1);
  };

  const handleResetScore = () => {
    setSessionScore(0);
  };

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
