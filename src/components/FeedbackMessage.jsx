// src/components/FeedbackMessage.jsx
import PropTypes from 'prop-types';

// The 'isVisible' prop is no longer needed
const FeedbackMessage = ({ message, type }) => {
  // The component will be empty if there's no message, but we'll prevent that in GameUI
  if (!message) {
    return null;
  }

  // The `is-visible` class is removed
  return (
    <div className={`feedback-message ${type}`}>
      {message}
    </div>
  );
};

FeedbackMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default FeedbackMessage;
