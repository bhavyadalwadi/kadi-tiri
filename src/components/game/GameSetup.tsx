import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_MODES, Difficulty, getDifficultyConfig } from '@/types/game';

const GameSetup: React.FC = () => {
  const { createGame, isLoading, error, setError } = useGameStore();
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState<keyof typeof GAME_MODES>('4_players');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [nameError, setNameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Validate player name
  const validatePlayerName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Player name cannot be empty';
    }
    
    if (trimmedName.length < 2) {
      return 'Player name must be at least 2 characters long';
    }
    
    if (trimmedName.length > 20) {
      return 'Player name must be less than 20 characters';
    }
    
    // Check for duplicate names (case-insensitive)
    if (playerNames.some(existingName => 
      existingName.toLowerCase() === trimmedName.toLowerCase()
    )) {
      return 'Player name already exists';
    }
    
    return null;
  };

  // Add player function
  const addPlayer = () => {
    const validation = validatePlayerName(currentPlayerName);
    
    if (validation) {
      setNameError(validation);
      return;
    }

    const gameMode = GAME_MODES[selectedGameMode];
    if (playerNames.length >= gameMode.players) {
      setNameError(`Maximum ${gameMode.players} players allowed for this game mode`);
      return;
    }

    setPlayerNames([...playerNames, currentPlayerName.trim()]);
    setCurrentPlayerName('');
    setNameError(null);
    setError(null); // Clear any previous errors
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayer();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPlayerName(e.target.value);
    // Clear errors when user starts typing
    if (nameError) setNameError(null);
    if (error) setError(null);
  };

  // Remove player
  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
    setNameError(null);
    setError(null);
  };

  // Start game
  const handleStartGame = () => {
    const gameMode = GAME_MODES[selectedGameMode];
    
    if (playerNames.length < gameMode.players) {
      setError(`Need ${gameMode.players} players to start the game`);
      return;
    }
    
    if (playerNames.length > gameMode.players) {
      setError(`Too many players. Maximum ${gameMode.players} players allowed for this game mode`);
      return;
    }

    createGame(playerNames, selectedGameMode, selectedDifficulty);
  };

  const gameMode = GAME_MODES[selectedGameMode];
  const supportedDifficulties = gameMode.supportedDifficulties as readonly Difficulty[];
  const effectiveDifficulty = supportedDifficulties.includes(selectedDifficulty)
    ? selectedDifficulty
    : supportedDifficulties[0];
  const difficultyConfig = getDifficultyConfig(gameMode.players, effectiveDifficulty as Difficulty);
  const canAddMore = playerNames.length < gameMode.players;
  const canStart = playerNames.length === gameMode.players;

  return (
    <div className="glass-effect-red rounded-4 p-5 shadow-lg">
      <h2 className="text-white fw-bold text-center mb-4 fs-3">🎮 Game Setup</h2>
      
      {/* Game Mode Selection */}
      <div className="mb-4">
        <label className="text-white fw-medium mb-2 d-block">🎯 Game Mode</label>
        <div className="position-relative">
          <select
            value={selectedGameMode}
            onChange={(e) => setSelectedGameMode(e.target.value as keyof typeof GAME_MODES)}
            className="form-select text-white"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              borderColor: 'rgba(220, 38, 38, 0.5)',
              color: 'white',
              paddingRight: '3rem',
              backgroundImage: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(220, 38, 38, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="4_players" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>4 Players (1 deck, 13 cards each)</option>
            <option value="6_players_one_deck" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>6 Players (1 deck, 13 cards each)</option>
            <option value="6_players_two_decks" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>6 Players (2 decks, 17 cards each)</option>
            <option value="8_players" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>8 Players (2 decks, 13 cards each)</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="mt-2 p-2 rounded-2" style={{ 
          background: 'rgba(220, 38, 38, 0.1)', 
          border: '1px solid rgba(220, 38, 38, 0.2)' 
        }}>
          <small className="text-light d-flex align-items-center">
            <span className="me-2">🎮</span>
            <strong className="text-white me-1">Selected:</strong> 
            <span className="text-warning">{gameMode.players} players</span>
            <span className="text-light mx-1">•</span>
            <span className="text-warning">{gameMode.decks} deck(s)</span>
            <span className="text-light mx-1">•</span>
            <span className="text-warning">{gameMode.cardsPerPlayer} cards each</span>
          </small>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-white fw-medium mb-2 d-block">⚙️ Difficulty</label>
        <div className="d-flex gap-2">
          {supportedDifficulties.map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`btn flex-fill ${effectiveDifficulty === difficulty ? 'btn-danger' : 'btn-outline-light'}`}
            >
              {difficulty === 'easy' ? 'Easy' : 'Hard'}
            </button>
          ))}
        </div>
      </div>

      {/* Player Input */}
      <div className="mb-4">
        <label className="text-white fw-medium mb-2 d-block">
          👥 Add Players ({playerNames.length}/{gameMode.players})
        </label>
        <div className="row g-2">
          <div className="col">
            <input
              ref={inputRef}
              type="text"
              value={currentPlayerName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name and press Enter"
              disabled={!canAddMore || isLoading}
              className={`form-control bg-dark text-white ${
                nameError ? 'border-danger' : 'border-secondary'
              }`}
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                borderColor: nameError ? '#dc3545' : 'rgba(220, 38, 38, 0.5)',
                color: 'white'
              }}
              maxLength={20}
            />
          </div>
          <div className="col-auto">
            <button
              onClick={addPlayer}
              disabled={!canAddMore || !currentPlayerName.trim() || isLoading}
              className="btn"
              style={{ 
                background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
                border: 'none',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Add
            </button>
          </div>
        </div>
        
        {nameError && (
          <p className="text-danger small mt-1">{nameError}</p>
        )}
        
        {!canAddMore && playerNames.length < gameMode.players && (
          <p className="text-warning small mt-1">
            You have reached the maximum number of players for this game mode.
          </p>
        )}
      </div>

      {/* Player List */}
      {playerNames.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white fw-medium mb-3 fs-5">👥 Players</h3>
          <div className="row g-2">
            {playerNames.map((name, index) => (
              <div key={index} className="col-12">
                <div className="card-red rounded-3 p-3 d-flex align-items-center justify-content-between"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(69, 10, 10, 0.2))',
                       border: '1px solid rgba(220, 38, 38, 0.3)'
                     }}>
                  <span className="text-white fw-medium">
                    {index + 1}. {name}
                    {index === 0 && <span className="text-warning small ms-2">(Opening Bidder)</span>}
                  </span>
                  <button
                    onClick={() => removePlayer(index)}
                    className="btn btn-outline-danger btn-sm"
                    disabled={isLoading}
                    style={{ fontSize: '18px', lineHeight: '1' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger border-0 mb-4" style={{ 
          background: 'rgba(220, 53, 69, 0.2)', 
          color: '#fff' 
        }}>
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-3 p-4 mb-4" style={{ 
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0, 0, 0, 0.4))', 
        border: '1px solid rgba(220, 38, 38, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 fs-4">📋</div>
          <h4 className="text-white fw-bold mb-0">Quick Guide</h4>
        </div>
        <div className="row g-2">
          <div className="col-md-6">
            <div className="d-flex align-items-start mb-2">
              <span className="badge bg-danger me-2 mt-1" style={{ fontSize: '10px' }}>1</span>
              <small className="text-light">
                Type a player name and press <kbd className="bg-dark px-2 py-1 rounded text-warning fw-bold">Enter</kbd> to add
              </small>
            </div>
            <div className="d-flex align-items-start mb-2">
              <span className="badge bg-danger me-2 mt-1" style={{ fontSize: '10px' }}>2</span>
              <small className="text-light">Player names must be unique (case-insensitive)</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex align-items-start mb-2">
              <span className="badge bg-danger me-2 mt-1" style={{ fontSize: '10px' }}>3</span>
              <small className="text-light">
                {effectiveDifficulty === 'easy' ? 'Balanced teams and higher opening bid' : 'Smaller bid team and lower opening bid'}
              </small>
            </div>
            <div className="d-flex align-items-start">
              <span className="badge bg-danger me-2 mt-1" style={{ fontSize: '10px' }}>4</span>
              <small className="text-light">Need exactly <span className="text-warning fw-bold">{gameMode.players} players</span> to start</small>
            </div>
          </div>
        </div>
        <hr className="border-secondary my-3" />
        <div className="small text-light">
          <div><strong className="text-white">Team split:</strong> {difficultyConfig.bidderTeamSize} vs {gameMode.players - difficultyConfig.bidderTeamSize}</div>
          <div><strong className="text-white">Partner cards:</strong> {difficultyConfig.partnerCount}</div>
          <div><strong className="text-white">Opening bid:</strong> {difficultyConfig.bidding.startBid}</div>
          <div><strong className="text-white">Raise options:</strong> {difficultyConfig.bidding.increments.join(' or ')}</div>
          <div><strong className="text-white">Removed cards:</strong> {('removeCards' in gameMode && gameMode.removeCards?.length ? gameMode.removeCards.join(', ') : 'None')}</div>
        </div>
      </div>

      {/* Start Game Button */}
      <button
        onClick={handleStartGame}
        disabled={!canStart || isLoading}
        className={`btn w-100 py-3 fw-bold fs-5 ${
          canStart ? '' : 'btn-secondary'
        }`}
        style={canStart ? { 
          background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
          border: 'none',
          color: 'white',
          transition: 'all 0.3s ease'
        } : {}}
        onMouseEnter={(e) => {
          if (canStart && !e.currentTarget.disabled) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (canStart) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isLoading ? '🎮 Starting Game...' : 
         canStart ? '🚀 Start Game' : 
         `Need ${gameMode.players - playerNames.length} more player${gameMode.players - playerNames.length === 1 ? '' : 's'}`}
      </button>
    </div>
  );
};

export default GameSetup;
