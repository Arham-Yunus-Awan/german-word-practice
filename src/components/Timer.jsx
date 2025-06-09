// components/Timer.jsx
import PropTypes from 'prop-types';
import './../styles/App.css'; // Assuming common styles are in App.css

const Timer = ({ time, isRunning }) => { // Removed bestTime prop as per requirements
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-container">
      <div className={`timer-display ${isRunning ? 'active' : ''}`}>
        {formatTime(time)}
        {isRunning && <span className="timer-pulse">●</span>}
      </div>
      {/* Best time display removed as per requirements */}
    </div>
  );
};

Timer.propTypes = {
  time: PropTypes.number.isRequired,
  isRunning: PropTypes.bool.isRequired
};

export default Timer;