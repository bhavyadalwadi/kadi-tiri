import React from 'react';
import { useGameStore } from '@/store/gameStore';
import GameSetup from '@/components/game/GameSetup';
import GamePlayArea from '@/components/game/GamePlayArea';
import BiddingPanel from '@/components/game/BiddingPanel';
import PartnerSelectionPanel from '@/components/game/PartnerSelectionPanel';
import GameFinishedModal from '@/components/game/GameFinishedModal';
import TopGameControls from '@/components/game/TopGameControls';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';

const DEBUG_TOOLS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG_TOOLS === 'true';

const GamePage: React.FC = () => {
  const { gameState, currentPlayerId, resetGame, createGame, createWaitingRoom, joinGame, loadGameSession, syncGameFromStorage, applyServerGameState } = useGameStore();
  const router = useRouter();
  const [viewingPlayerId, setViewingPlayerId] = React.useState<string | undefined>();
  const activePlayerId = viewingPlayerId || currentPlayerId || '';

  // Initialize viewingPlayerId when currentPlayerId is available
  React.useEffect(() => {
    if (currentPlayerId && !viewingPlayerId) {
      setViewingPlayerId(currentPlayerId);
    }
  }, [currentPlayerId, viewingPlayerId]);
  
  // Check for join parameter in URL
  React.useEffect(() => {
    if (router.query.join && typeof router.query.join === 'string' && !gameState) {
      const gameId = router.query.join;

      void (async () => {
        const restored = await loadGameSession(gameId);
        if (!restored) {
          const playerName = `Player ${Math.floor(Math.random() * 1000)}`;
          await joinGame(gameId, playerName);
        }
      })();
    }
  }, [router.query.join, gameState, joinGame, loadGameSession]);

  React.useEffect(() => {
    if (!gameState?.id) {
      return;
    }

    let isActive = true;
    const syncCurrentGame = async () => {
      await syncGameFromStorage(gameState.id);
    };

    const handleWindowRefresh = () => {
      void syncCurrentGame();
    };

    const eventSource = new EventSource(`/api/game/stream?gameId=${encodeURIComponent(gameState.id)}`);
    eventSource.addEventListener('gameState', event => {
      if (!isActive) {
        return;
      }
      const nextState = JSON.parse((event as MessageEvent).data);
      applyServerGameState(nextState);
    });
    eventSource.onerror = () => {
      if (!isActive) {
        return;
      }
      void syncCurrentGame();
    };

    window.addEventListener('focus', handleWindowRefresh);
    document.addEventListener('visibilitychange', handleWindowRefresh);

    return () => {
      isActive = false;
      eventSource.close();
      window.removeEventListener('focus', handleWindowRefresh);
      document.removeEventListener('visibilitychange', handleWindowRefresh);
    };
  }, [gameState?.id, syncGameFromStorage, applyServerGameState]);

  const handleBackToHome = () => {
    resetGame();
    router.push('/');
  };

  // Quick start function for testing
  const quickStartGame = () => {
    const testPlayers = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    createGame(testPlayers, '4_players');
  };

  // Create a waiting room for multiplayer
  const createNewWaitingRoom = () => {
    const hostName = `Host ${Math.floor(Math.random() * 1000)}`;
    createWaitingRoom(hostName, '4_players');
  };

  // Enhanced CSS styles
  const gamePageStyles = `
    .custom-game-bg {
      background: linear-gradient(135deg, #000000 0%, #450a0a 50%, #000000 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .floating-bg {
      position: absolute;
      background: radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 70%);
      filter: blur(60px);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .glass-effect-red {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.3));
      backdrop-filter: blur(15px);
      border: 1px solid rgba(220, 38, 38, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .gradient-text-red {
      background: linear-gradient(45deg, #dc2626, #ef4444, #fca5a5);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .btn-red-custom {
      background: linear-gradient(45deg, #dc2626, #b91c1c);
      border: none;
      color: white;
      transition: all 0.3s ease;
    }
    .btn-red-custom:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
      color: white;
    }
    .card-red {
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(69, 10, 10, 0.4));
      border: 2px solid rgba(220, 38, 38, 0.4);
      backdrop-filter: blur(10px);
    }
    .card-red:hover {
      border-color: rgba(220, 38, 38, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(220, 38, 38, 0.2);
    }
    .text-red-custom { color: #dc2626; }
    .bg-red-custom { background: linear-gradient(45deg, #dc2626, #b91c1c); }
  `;

  if (!gameState) {
    return (
      <Layout title="Kadi Tiri - New Game">
        <style jsx>{`${gamePageStyles}`}</style>
        <div className="custom-game-bg">
          {/* Floating background elements */}
          <div className="floating-bg" style={{
            top: '15%', right: '10%', width: '400px', height: '400px', animationDelay: '0s'
          }}></div>
          <div className="floating-bg" style={{
            bottom: '20%', left: '15%', width: '300px', height: '300px', animationDelay: '2s'
          }}></div>
          <div className="floating-bg" style={{
            top: '60%', right: '60%', width: '150px', height: '150px', animationDelay: '4s'
          }}></div>

          <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">
              <div className="col-12 text-center">
                {/* Enhanced Header */}
                <div className="mb-5">
                  <h1 className="display-1 fw-bold text-white mb-4">
                    🃏 <span className="gradient-text-red">Kadi</span> <span className="text-white">Tiri</span>
                  </h1>
                  <p className="fs-3 text-light fw-medium">Experience the Traditional Card Game</p>
                </div>
            
                {/* Game Creation Options */}
                <div className="text-center mb-5">
                  <div className="row g-4 justify-content-center">
                    <div className="col-lg-5 col-md-6">
                      <div className="card-red glass-effect-red p-4 h-100">
                        <div className="mb-3">
                          <div className="fs-1 mb-3">🎮</div>
                          <h3 className="text-white fw-bold mb-3">Multiplayer Game</h3>
                          <p className="text-light mb-4">Create a room and invite friends to join</p>
                        </div>
                        <button
                          onClick={createNewWaitingRoom}
                          className="btn btn-red-custom btn-lg w-100 fw-bold"
                          data-testid="create-room-button"
                        >
                          Create Room
                        </button>
                      </div>
                    </div>
                    {DEBUG_TOOLS_ENABLED && (
                      <div className="col-lg-5 col-md-6">
                        <div className="card-red glass-effect-red p-4 h-100">
                          <div className="mb-3">
                            <div className="fs-1 mb-3">🛠️</div>
                            <h3 className="text-white fw-bold mb-3">Debug Quick Start</h3>
                            <p className="text-light mb-4">Start a local 4-player test table with seat-switch controls</p>
                          </div>
                          <button
                            onClick={quickStartGame}
                            className="btn btn-red-custom btn-lg w-100 fw-bold"
                          >
                            Start Debug Table
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="glass-effect-red rounded-4 p-4">
                  <GameSetup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Waiting room - players can join before the game starts
  if (gameState.status === 'waiting') {
    const maxPlayers = gameState.settings.mode.players;
    const currentPlayers = gameState.players.length;
    const isHost = gameState.players[0]?.id === currentPlayerId;
    
    return (
      <Layout title="Kadi Tiri - Waiting Room">
        <style jsx>{`${gamePageStyles}`}</style>
        <div className="custom-game-bg">
          {/* Floating background elements */}
          <div className="floating-bg" style={{
            top: '10%', right: '15%', width: '350px', height: '350px', animationDelay: '0s'
          }}></div>
          <div className="floating-bg" style={{
            bottom: '25%', left: '20%', width: '250px', height: '250px', animationDelay: '3s'
          }}></div>

          <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">
              <div className="col-12">
                <div className="text-center mb-5">
                  <h1 className="display-3 fw-bold text-white mb-4">
                    🃏 <span className="gradient-text-red">Kadi</span> <span className="text-white">Tiri</span>
                  </h1>
                  <p className="fs-4 text-light fw-medium">Waiting Room</p>
                </div>
                
                <div className="glass-effect-red rounded-4 shadow-lg mx-auto p-5" style={{ maxWidth: '800px' }}>
                  <div className="text-center mb-4" data-testid="waiting-room" data-game-id={gameState.id}>
                    <h2 className="text-white fw-bold mb-3">
                      {isHost ? '🎮 Your Game Room' : '🎯 Joined Game Room'}
                    </h2>
                    <div className="badge bg-red-custom px-4 py-2 rounded-pill mb-3 fs-6">
                      Game ID: <span className="font-monospace fw-bold" data-testid="game-id-short">{gameState.id.slice(-6)}</span>
                    </div>
                  </div>

                  {/* Share Game Link */}
                  <div className="glass-effect-red rounded-3 p-4 mb-4" style={{ border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="text-white mb-1">📋 Invite Players</h6>
                        <small className="text-light">Share this link with friends to join the game</small>
                      </div>
                      <button 
                        className="btn btn-red-custom"
                        data-testid="copy-link-button"
                        onClick={() => {
                          const gameUrl = `${window.location.origin}/game?join=${gameState.id}`;
                          navigator.clipboard.writeText(gameUrl);
                          alert('Game link copied to clipboard! 📋');
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>

                  {/* Players List */}
                  <div className="mb-4">
                    <h5 className="text-white mb-4">
                      👥 Players ({currentPlayers}/{maxPlayers})
                    </h5>
                    <div className="row g-3">
                      {gameState.players.map((player, index) => (
                        <div key={player.id} className="col-lg-6" data-testid="waiting-room-player">
                          <div className={`card-red p-3 rounded-3 ${player.id === currentPlayerId ? 'border border-success border-2' : ''}`}>
                            <div className="d-flex align-items-center">
                              <div className="me-3 fs-4">
                                {index === 0 ? '👑' : '🎮'}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="text-white mb-0 fw-bold">
                                  {player.name}
                                  {index === 0 && <small className="text-light ms-2">(Host)</small>}
                                  {player.id === currentPlayerId && <small className="text-red-custom ms-2">(You)</small>}
                                </h6>
                              </div>
                              <div className="badge bg-success rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty slots */}
                      {Array.from({ length: maxPlayers - currentPlayers }, (_, index) => (
                        <div key={`empty-${index}`} className="col-lg-6">
                          <div className="card-red p-3 rounded-3 text-center" style={{ 
                            border: '2px dashed rgba(220, 38, 38, 0.4)',
                            background: 'rgba(0, 0, 0, 0.3)'
                          }}>
                            <div className="text-light">
                              <div className="mb-1 fs-4">➕</div>
                              <small>Waiting for player...</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="text-center">
                    {currentPlayers < maxPlayers ? (
                      <div className="glass-effect-red rounded-3 p-3 mb-4" style={{ border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                        <div className="spinner-border spinner-border-sm text-warning me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <strong className="text-white">Waiting for {maxPlayers - currentPlayers} more player(s) to join...</strong>
                      </div>
                    ) : (
                      <div className="glass-effect-red rounded-3 p-3 mb-4" style={{ border: '1px solid rgba(40, 167, 69, 0.3)' }}>
                        <strong className="text-white">🎉 All players joined! Game starting soon...</strong>
                      </div>
                    )}
                    
                    <button
                      onClick={handleBackToHome}
                      className="btn btn-outline-light btn-lg"
                    >
                      {isHost ? '🚫 Cancel Game' : '🚪 Leave Room'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (gameState.status === 'setup') {
    return (
      <Layout title="Kadi Tiri - Game Setup">
        <style jsx>{`${gamePageStyles}`}</style>
        <div className="custom-game-bg">
          {/* Floating background elements */}
          <div className="floating-bg" style={{
            top: '20%', right: '10%', width: '300px', height: '300px', animationDelay: '1s'
          }}></div>
          <div className="floating-bg" style={{
            bottom: '30%', left: '15%', width: '200px', height: '200px', animationDelay: '3s'
          }}></div>

          <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">
              <div className="col-12">
                <div className="text-center mb-5">
                  <h1 className="display-3 fw-bold text-white mb-4">
                    🃏 <span className="gradient-text-red">Kadi</span> <span className="text-white">Tiri</span>
                  </h1>
                  <p className="fs-4 text-light fw-medium">Game Setup Complete</p>
                </div>
                
                <div className="glass-effect-red rounded-4 shadow-lg mx-auto p-5 text-center" style={{ maxWidth: '600px' }}>
                  <div className="mb-4">
                    <div className="fs-1 mb-3">🎯</div>
                    <h2 className="text-white fw-bold mb-4">Ready to Start!</h2>
                    <p className="text-light mb-4 fs-5">
                      All players have joined. Starting the game...
                    </p>
                  </div>
                  <button
                    onClick={handleBackToHome}
                    className="btn btn-outline-light btn-lg"
                  >
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main gameplay screen
  return (
    <Layout title={`Kadi Tiri - ${gameState.status}`}>
      <style jsx>{`${gamePageStyles}`}</style>
      <div className="custom-game-bg min-vh-100 position-relative">
        {/* Floating background elements */}
        <div className="floating-bg" style={{
          top: '10%', right: '5%', width: '200px', height: '200px', animationDelay: '0s'
        }}></div>
        <div className="floating-bg" style={{
          bottom: '15%', left: '10%', width: '150px', height: '150px', animationDelay: '2s'
        }}></div>
        <div className="floating-bg" style={{
          top: '50%', right: '80%', width: '100px', height: '100px', animationDelay: '4s'
        }}></div>

        {/* TopGameControls - Only show during playing and finished states */}
        {(gameState.status === 'playing' || gameState.status === 'finished') && (
          <div 
            style={{ 
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 10000,
              pointerEvents: 'auto'
            }}
          >
            <TopGameControls 
              gameState={gameState} 
              onExit={handleBackToHome}
            />
          </div>
        )}

        {/* Main Game Area */}
        <GamePlayArea 
          gameState={gameState} 
          currentPlayerId={activePlayerId} 
          viewingPlayerId={viewingPlayerId}
          onViewingPlayerChange={setViewingPlayerId}
          showDebugTools={DEBUG_TOOLS_ENABLED}
        />

        {/* Bidding Panel - Takes top position when TopGameControls is hidden */}
        {gameState.status === 'bidding' && (
          <div 
            style={{ 
              position: 'fixed',
              top: '20px', // Back to top position since TopGameControls is hidden
              right: '20px',
              width: '350px',
              zIndex: 9999,
              pointerEvents: 'auto'
            }}
          >
            <div className="glass-effect-red rounded-3 p-1">
              <BiddingPanel 
                gameState={gameState} 
                currentPlayerId={activePlayerId} 
                onExit={handleBackToHome}
                viewingPlayerId={viewingPlayerId}
                onViewingPlayerChange={setViewingPlayerId}
              />
            </div>
          </div>
        )}

        {/* Partner Selection Panel - Fixed positioning at center */}
        {gameState.status === 'partner-selection' && (
          <div 
            style={{ 
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px', 
              zIndex: 9999,
              pointerEvents: 'auto'
            }}
          >
            <div className="glass-effect-red rounded-3 p-1">
              <PartnerSelectionPanel gameState={gameState} currentPlayerId={activePlayerId} />
            </div>
          </div>
        )}

        {/* Game Finished Modal */}
        <GameFinishedModal
          gameState={gameState}
          isOpen={gameState.status === 'finished'}
          onNewGame={handleBackToHome}
          onPlayAgain={() => window.location.reload()}
        />
      </div>
    </Layout>
  );
};

export default GamePage;
