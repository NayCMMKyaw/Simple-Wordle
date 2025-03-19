import React from 'react';

const Grid = ({ guesses, currentGuess, currentRow, evaluations }) => {
  const rows = [...guesses];
  if (currentRow < 6) {
    rows[currentRow] = currentGuess.padEnd(5, ' ').substring(0, 5);
  }

  return (
    <div className="grid">
      {rows.map((word, rowIndex) => (
        <div key={rowIndex} className="row">
          {Array.from({ length: 5 }).map((_, colIndex) => {
            const letter = word[colIndex] || '';
            let status = 'empty';
            
            if (rowIndex < currentRow && evaluations[rowIndex]) {
              status = evaluations[rowIndex][colIndex];
            } else if (letter !== '' && letter !== ' ') {
              status = 'tbd';
            }
            
            return (
              <div key={colIndex} className={`tile ${status}`}>
                {letter !== ' ' ? letter : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;