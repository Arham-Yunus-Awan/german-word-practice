// src/components/Controls.jsx
import PropTypes from 'prop-types';
import './../styles/App.css'; // Assuming common styles are in App.css

const Controls = ({ onReset, onStartStop, isRunning, gameOver, gameMode }) => {
  return (
    <div className="controls">
      <button className="reset-button" onClick={onReset}>
        {/* The text logic can be simplified if 'gameOver' is only for Time Attack */}
        {gameOver ? 'Play Again' : 'Reset Board'}
      </button>

      {/* --- Conditional Rendering Logic --- */}
      {/* Only show the Start/Stop button in Time Attack mode AND if the game is not over */}
      {gameMode === 'timeAttack' && !gameOver && (
        <button
          className={`start-stop-button ${isRunning ? 'stop' : 'start'}`}
          onClick={onStartStop}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      )}
    </div>
  );
};

Controls.propTypes = {
  onReset: PropTypes.func.isRequired,
  onStartStop: PropTypes.func.isRequired,
  isRunning: PropTypes.bool.isRequired,
  gameOver: PropTypes.bool.isRequired,
  // Add the new gameMode prop for conditional logic
  gameMode: PropTypes.oneOf(['timeAttack', 'clearTheBoard']).isRequired,
};

export default Controls;
