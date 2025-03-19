import React, { useMemo } from 'react';

const Keyboard = ({ onKeyPress, evaluations, guesses }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  // Calculate key status based on evaluations
  const keyStatus = useMemo(() => {
    const statuses = {};
    
    evaluations.forEach((evaluation, rowIndex) => {
      if (!evaluation) return;
      
      const guess = guesses[rowIndex];
      evaluation.forEach((status, colIndex) => {
        const letter = guess[colIndex];
        
        // Don't downgrade statuses
        if (statuses[letter] === 'correct') return;
        if (statuses[letter] === 'present' && status === 'absent') return;
        
        statuses[letter] = status;
      });
    });
    
    return statuses;
  }, [evaluations, guesses]);

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const status = key.length === 1 ? keyStatus[key] || '' : '';
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            
            return (
              <button
                key={key}
                className={`keyboard-key ${status} ${isWide ? 'wide' : ''}`}
                onClick={() => onKeyPress(key)}
              >
                {key === 'BACKSPACE' ? '←' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;