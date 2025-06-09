// components/Controls.jsx
import PropTypes from 'prop-types';
import './../styles/App.css'; // Assuming common styles are in App.css

const Controls = ({ onReset, onStartStop, isRunning, gameOver }) => {
  return (
    <div className="controls">
      <button className="reset-button" onClick={onReset}>
        {gameOver ? 'Play Again' : 'Reset'}
      </button>
      {/* Show Start/Stop button only if game is not over */}
      {!gameOver && (
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
  gameOver: PropTypes.bool.isRequired
};

export default Controls;