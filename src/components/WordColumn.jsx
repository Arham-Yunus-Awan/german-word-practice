// components/WordColumn.jsx
import PropTypes from 'prop-types';
import './../styles/WordColumn.css'; // Specific styles for word columns

const WordColumn = ({
  words,
  language,
  onCardClick,
  selectedCards,
  wordsBeingReplaced, // Words currently fading out
  disabled // General disable for column (e.g., game not running, game over)
}) => {
  // Defensive check for words prop to prevent "Cannot read properties of undefined (reading 'map')"
  if (!words || !Array.isArray(words)) {
    console.error(`WordColumn: 'words' prop is not a valid array for language: ${language}`, words);
    return null; // Render nothing if words is invalid
  }

  return (
    <div className={`words-column ${language}-words`}>
      <h2>{language === 'german' ? 'German' : 'English'}</h2>
      {words.map((word, index) => {
        // A word is 'fading' if it's in the wordsBeingReplaced array
        const isFading = wordsBeingReplaced.includes(word);
        // A word is 'selected' if it's the currently clicked card in its column
        const selected = selectedCards[language] === word;
        
        // A card is visually disabled if the column is generally disabled (game state)
        // OR if it's currently fading out.
        const cardIsDisabled = disabled || isFading;

        return (
          <div
            key={`${language}-${word}-${index}`} // Use index in key to ensure uniqueness for dynamic replacements
            className={`word ${language} ${selected ? 'selected' : ''} ${isFading ? 'fading' : ''} ${cardIsDisabled ? 'disabled' : ''}`}
            onClick={() => !cardIsDisabled && onCardClick(word, language)}
            data-word={word} // Useful for debugging or testing
          >
            {word}
          </div>
        );
      })}
    </div>
  );
};

WordColumn.propTypes = {
  words: PropTypes.array.isRequired,
  language: PropTypes.oneOf(['german', 'english']).isRequired,
  onCardClick: PropTypes.func.isRequired,
  selectedCards: PropTypes.object.isRequired,
  wordsBeingReplaced: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default WordColumn;