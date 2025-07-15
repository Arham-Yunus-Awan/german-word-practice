// src/components/FeedbackMessage.jsx
import PropTypes from 'prop-types';
import './../styles/FeedbackMessage.css';

const FeedbackMessage = ({ message, type, isVisible }) => {
  // The component stays mounted as long as there is a message,
  // allowing the fade-out animation to complete.
  if (!message) {
    return null;
  }

  // The 'visible' class will be added or removed to trigger the animation.
  const visibilityClass = isVisible ? 'visible' : '';

  return (
    <div className={`feedback-container ${type} ${visibilityClass}`}>
      <p className="feedback-message">{message}</p>
    </div>
  );
};

FeedbackMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['correct', 'incorrect', '']),
  isVisible: PropTypes.bool.isRequired,
};

export default FeedbackMessage;
