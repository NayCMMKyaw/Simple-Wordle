import { useState, useEffect } from 'react';
import './App.css';
import Keyboard from './components/Keyboard';
import Grid from './components/Grid';
import Header from './components/Header';
import GameOverModal from './components/GameOverModal';

function App() {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [evaluations, setEvaluations] = useState(Array(6).fill(null));
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [targetWord, setTargetWord] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchNewWord();
  }, []);

  const fetchNewWord = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/word');
      const data = await response.json();
      setTargetWord(data.word.toUpperCase());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching word:', error);
      setTargetWord('REACT'); // Fallback word
      setIsLoading(false);
    }
  };

  const handleKeyPress = (key) => {
    if (gameState !== 'playing') return;
    
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const checkGuess = async (guess) => {
    try {
      const response = await fetch('http://localhost:5000/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: guess.toLowerCase(), target: targetWord.toLowerCase() }),
      });
      const data = await response.json();
      return data.evaluation;
    } catch (error) {
      console.error('Error checking guess:', error);
      // Fallback evaluation logic
      const evaluation = Array(5).fill('absent');
      const targetArray = targetWord.split('');
      
      for (let i = 0; i < 5; i++) {
        if (guess[i] === targetWord[i]) {
          evaluation[i] = 'correct';
          targetArray[i] = null;
        }
      }
      
      for (let i = 0; i < 5; i++) {
        if (evaluation[i] !== 'correct') {
          const targetIndex = targetArray.indexOf(guess[i]);
          if (targetIndex !== -1) {
            evaluation[i] = 'present';
            targetArray[targetIndex] = null;
          }
        }
      }
      
      return evaluation;
    }
  };

  const checkWordValidity = async (word) => {
    try {
      const response = await fetch('http://localhost:5000/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.toLowerCase() }),
      });
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Error validating word:', error);
      return true; // Fallback to allow any word if API fails
    }
  };

  const submitGuess = async () => {
    if (currentGuess.length !== 5) {
      displayMessage('Please enter a 5-letter word');
      return;
    }

    const isValid = await checkWordValidity(currentGuess);
    if (!isValid) {
      displayMessage('Word not found');
      return;
    }

    const evaluation = await checkGuess(currentGuess);
    
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    const newEvaluations = [...evaluations];
    newEvaluations[currentRow] = evaluation;
    setEvaluations(newEvaluations);

    if (currentGuess === targetWord) {
      setGameState('won');
    } else if (currentRow === 5) {
      setGameState('lost');
    } else {
      setCurrentRow(currentRow + 1);
    }

    setCurrentGuess('');
  };

  const displayMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const resetGame = () => {
    setCurrentGuess('');
    setGuesses(Array(6).fill(''));
    setEvaluations(Array(6).fill(null));
    setGameState('playing');
    setCurrentRow(0);
    fetchNewWord();
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentGuess, currentRow, gameState]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header />

      <button className="instructions-button" onClick={() => setShowInstructions(!showInstructions)}>
      ?
    </button>
      
      {showMessage && (
        <div className="message-container">
          <div className="message">{message}</div>
        </div>
      )}
      
      {showInstructions && (
      <div className="instructions">
        <p>
          You have 6 tries to guess the hidden 5-letter word.
          <br />
          After each guess, the color of the tiles will change:
        </p>
        <div className="example-tiles">
          <div className="example">
            <div className="tile correct">E</div>
            <span>Letter is in the word and in the correct spot (green)</span>
          </div>
          <div className="example">
            <div className="tile present">A</div>
            <span>Letter is in the word but in the wrong spot (yellow)</span>
          </div>
          <div className="example">
            <div className="tile absent">T</div>
            <span>Letter is not in the word (grey)</span>
          </div>
        </div>
      </div>
    )}
      
      <div className="game-container">
        <Grid 
          guesses={guesses} 
          currentGuess={currentGuess} 
          currentRow={currentRow}
          evaluations={evaluations}
        />
        
        <Keyboard 
          onKeyPress={handleKeyPress} 
          evaluations={evaluations}
          guesses={guesses}
        />
      </div>
      
      {gameState !== 'playing' && (
        <GameOverModal 
          gameState={gameState} 
          targetWord={targetWord} 
          attempts={currentRow + 1}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}

export default App;