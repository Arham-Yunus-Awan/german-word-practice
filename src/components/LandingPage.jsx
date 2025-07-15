// src/components/LandingPage.jsx
import PropTypes from 'prop-types';
import './../styles/LandingPage.css'; // We'll create this file next

const LandingPage = ({ onStartGame }) => {
  return (
    <div className="landing-container">
      <div className="landing-box">
        <h1>German-English Word Matcher</h1>
        <p>Choose your game mode:</p>
        <div className="game-modes">
          <button 
            className="mode-button time-attack" 
            onClick={() => onStartGame('timeAttack')}
          >
            <h3>Time Attack</h3>
            <p>Match pairs against the clock. New words replace matched ones instantly.</p>
          </button>
          <button 
            className="mode-button clear-board" 
            onClick={() => onStartGame('clearTheBoard')}
          >
            <h3>Clear the Board</h3>
            <p>Find all pairs on the board. One wrong move and the board resets!</p>
          </button>
        </div>
      </div>
    </div>
  );
};

LandingPage.propTypes = {
  onStartGame: PropTypes.func.isRequired,
};

export default LandingPage;
