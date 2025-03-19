# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/"

def is_valid_word(word):
    """Check if the word exists in an online dictionary."""
    response = requests.get(DICTIONARY_API_URL + word)
    return response.status_code == 200 

def get_random_secret_word():
    """Fetch a random 5-letter word from Datamuse API."""
    while True:
        response = requests.get("https://random-word-api.vercel.app/api?words=1&length=5")
        if response.status_code == 200:
            word = response.json()[0].upper()
            if is_valid_word(word): 
                return word  

# Load a fallback list of words in case the API fails
fallback_words = ['APPLE', 'BEACH', 'CHILD', 'DANCE', 'EARTH', 'FLAME', 'GHOST', 'HEART', 'ISSUE', 'JUICE',
                  'TABLE', 'HAPPY', 'QUICK', 'ROBOT', 'WATER', 'MOVIE', 'SMART', 'TRAIN', 'MUSIC', 'POWER']

@app.route('/api/word', methods=['GET'])
def get_word():
    """Return a random word from the target words list"""
    try:
        word = get_random_secret_word()
    except:
        word = random.choice(fallback_words)  # Use fallback if API fails
    
    # Log the target word to the console
    print(f"Target Word: {word}")
    
    return jsonify({'word': word})

@app.route('/api/validate', methods=['POST'])
def validate_word():
    """Check if a word is valid using the online dictionary"""
    data = request.json
    word = data.get('word', '').upper()
    
    # Check if word is valid
    is_valid = is_valid_word(word)
    
    return jsonify({'valid': is_valid})

@app.route('/api/check', methods=['POST'])
def check_guess():
    """
    Check a guess against the target word and return evaluation based on the Wordle rules:
    - 'correct': letter is in the correct position (green)
    - 'present': letter is in the word but in the wrong position (yellow)
    - 'absent': letter is not in the word (grey)
    """
    data = request.json
    guess = data.get('guess', '').upper()
    target = data.get('target', '').upper()
    
    if len(guess) != 5 or len(target) != 5:
        return jsonify({'error': 'Both guess and target must be 5 letters'}), 400
    
    # Create initial evaluation (all grey/absent)
    evaluation = ['absent'] * 5
    
    # Create a copy of the target word to keep track of matched letters
    target_letters = list(target)
    
    # First pass: Find correct letters (green)
    for i in range(5):
        if guess[i] == target[i]:
            evaluation[i] = 'correct'
            target_letters[i] = '_'  # Mark as used
    
    # Second pass: Find present letters in wrong positions (yellow)
    for i in range(5):
        if evaluation[i] != 'correct' and guess[i] in target_letters:
            evaluation[i] = 'present'
            target_letters[target_letters.index(guess[i])] = '_'  # Mark as used
    
    return jsonify({'evaluation': evaluation})

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True)