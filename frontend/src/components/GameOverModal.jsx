import React from 'react';

const GameOverModal = ({ gameState, targetWord, attempts, onPlayAgain }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{gameState === 'won' ? 'You Won!' : 'Game Over'}</h2>
        <p>
          {gameState === 'won' 
            ? `You guessed the word in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}!` 
            : `The word was ${targetWord}.`}
        </p>
        <button className="play-again" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;