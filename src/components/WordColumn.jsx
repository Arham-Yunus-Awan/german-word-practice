// src/components/WordColumn.jsx
import PropTypes from 'prop-types';
import './../styles/WordColumn.css';

const WordColumn = ({
  words,
  language,
  onCardClick,
  selectedCards,
  // Provide default empty arrays for props that might not be passed
  wordsBeingReplaced = [], 
  permanentlyMatched = [], 
  disabled,
}) => {
  return (
    <div className="words-column">
      <h2>{language === 'german' ? 'German' : 'English'}</h2>
      {words.map((word) => {
        const isSelected = selectedCards[language] === word;
        // This line will now be safe because wordsBeingReplaced defaults to []
        const isFading = wordsBeingReplaced.includes(word); 
        const isMatched = permanentlyMatched.includes(word);

        const cardClass = `
          word 
          ${isSelected ? 'selected' : ''}
          ${isFading ? 'fading' : ''}
          ${isMatched ? 'matched' : ''} 
          ${disabled && !isMatched ? 'disabled' : ''}
        `;

        return (
          <button
            key={word}
            className={cardClass}
            onClick={() => onCardClick(word, language)}
            disabled={disabled || isMatched}
          >
            {word}
          </button>
        );
      })}
    </div>
  );
};

WordColumn.propTypes = {
  words: PropTypes.arrayOf(PropTypes.string).isRequired,
  language: PropTypes.string.isRequired,
  onCardClick: PropTypes.func.isRequired,
  selectedCards: PropTypes.object.isRequired,
  // These are optional now, but if provided, must be arrays of strings
  wordsBeingReplaced: PropTypes.arrayOf(PropTypes.string), 
  permanentlyMatched: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool.isRequired,
};

export default WordColumn;
