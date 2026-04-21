import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

const Home: NextPage = () => {
  const router = useRouter();

  const handleNewGame = () => {
    router.push('/game');
  };

  return (
    <Layout title="Kadi Tiri - Traditional Card Game">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 40px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.4); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .glass-effect {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.3));
          backdrop-filter: blur(15px);
          border: 1px solid rgba(220, 38, 38, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .red-glow {
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.3);
        }
        .gradient-text {
          background: linear-gradient(45deg, #dc2626, #ef4444, #fca5a5);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .custom-bg {
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
        .game-card {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(69, 10, 10, 0.4));
          border: 2px solid rgba(220, 38, 38, 0.4);
          border-radius: 1rem;
          transition: all 0.3s ease;
          height: 100%;
        }
        .game-card:hover {
          border-color: rgba(220, 38, 38, 0.8);
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        }
        .card-icon {
          font-size: 4rem;
          transition: transform 0.3s ease;
        }
        .game-card:hover .card-icon {
          transform: scale(1.1);
        }
        .text-red-custom {
          color: #dc2626;
        }
        .bg-red-custom {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
        }
        .popular-badge {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          color: white;
          font-weight: bold;
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
      `}</style>

      <div className="custom-bg">
        {/* Floating background elements */}
        <div className="floating-bg" style={{
          top: '20%',
          right: '20%',
          width: '300px',
          height: '300px',
          animationDelay: '0s'
        }}></div>
        <div className="floating-bg" style={{
          bottom: '30%',
          left: '30%',
          width: '200px',
          height: '200px',
          animationDelay: '2s'
        }}></div>

        {/* Floating card symbols */}
        <div className="position-absolute" style={{
          top: '10%', left: '10%', fontSize: '3rem', opacity: 0.2,
          animation: 'float 4s ease-in-out infinite'
        }}>♠️</div>
        <div className="position-absolute" style={{
          top: '20%', right: '15%', fontSize: '2.5rem', opacity: 0.15,
          animation: 'float 5s ease-in-out infinite', animationDelay: '1s'
        }}>♥️</div>
        <div className="position-absolute" style={{
          bottom: '20%', left: '20%', fontSize: '3.5rem', opacity: 0.1,
          animation: 'float 6s ease-in-out infinite', animationDelay: '2s'
        }}>♦️</div>
        <div className="position-absolute" style={{
          bottom: '15%', right: '10%', fontSize: '2.5rem', opacity: 0.2,
          animation: 'float 4.5s ease-in-out infinite', animationDelay: '1.5s'
        }}>♣️</div>

        {/* Main Content */}
        <div className="position-relative" style={{zIndex: 10}}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center py-5">
                
                {/* Hero Section */}
                <div className="mb-5 animate-fade-in">
                  <div className="position-relative mb-4">
                    <h1 className="display-1 fw-bold text-white mb-4">
                      🃏 <span className="gradient-text">Kadi</span> <span className="text-white">Tiri</span>
                    </h1>
                  </div>
                  
                  <p className="fs-3 text-light mb-3 fw-medium">
                    The Ultimate Strategic Card Experience
                  </p>
                  <p className="fs-5 text-secondary mb-5 mx-auto" style={{maxWidth: '600px'}}>
                    Master the art of bidding, forge secret alliances, and dominate the table in this 
                    captivating traditional card game where every decision shapes your destiny.
                  </p>
                  
                  <button
                    onClick={handleNewGame}
                    className="btn btn-lg bg-red-custom text-white fw-bold px-5 py-3 rounded-3 shadow-lg animate-glow"
                    style={{fontSize: '1.5rem', border: 'none'}}
                  >
                    🎮 Launch Game
                  </button>
                  <p className="text-red-custom mt-3 fw-medium">
                    Ready to test your strategy?
                  </p>
                </div>

                {/* Game Features */}
                <div className="row g-4 mb-5">
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="glass-effect rounded-3 p-4 h-100 text-center">
                      <div className="fs-1 mb-3">🎯</div>
                      <h3 className="fs-4 fw-bold text-white mb-3">Strategic Bidding</h3>
                      <p className="text-secondary">Master the art of calculated risks. Bid wisely, choose your trump suit, and lead your team to glorious victory.</p>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="glass-effect rounded-3 p-4 h-100 text-center">
                      <div className="fs-1 mb-3">🤝</div>
                      <h3 className="fs-4 fw-bold text-white mb-3">Secret Alliances</h3>
                      <p className="text-secondary">Forge powerful partnerships through strategic card selection. Keep your alliances hidden until the perfect moment.</p>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="glass-effect rounded-3 p-4 h-100 text-center">
                      <div className="fs-1 mb-3">🏆</div>
                      <h3 className="fs-4 fw-bold text-white mb-3">Epic Battles</h3>
                      <p className="text-secondary">Engage in thrilling multiplayer showdowns with 4, 6, or 8 players. Each mode offers unique strategies.</p>
                    </div>
                  </div>
                </div>

                {/* Game Modes Section */}
                <div className="glass-effect rounded-3 p-5 red-glow">
                  <div className="text-center mb-5">
                    <h3 className="display-5 fw-bold text-white mb-3">
                      <span className="gradient-text">Choose Your</span> Battle
                    </h3>
                    <p className="fs-5 text-secondary">Select your preferred game mode and dive into the action</p>
                  </div>
                  
                  {/* Bootstrap 3-column grid for game modes */}
                  <div className="row g-4 justify-content-center">
                    {/* 4 Players */}
                    <div className="col-lg-4 col-md-6 col-12">
                      <div className="game-card p-4 text-center">
                        <div className="card-icon mb-3">👥</div>
                        <h4 className="fw-bold text-white mb-3">4 Players</h4>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-center mb-2">
                            <span className="text-red-custom me-2">🃏</span>
                            <span className="text-secondary">Single Deck Battle</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-center mb-2">
                            <span className="text-red-custom me-2">🎯</span>
                            <span className="text-secondary">250 Victory Points</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-center">
                            <span className="text-red-custom me-2">⚡</span>
                            <span className="text-secondary">Lightning Fast</span>
                          </div>
                        </div>
                        <div className="mt-4 p-2 rounded" style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.5)'}}>
                          <span className="text-red-custom fw-medium">Perfect for Quick Duels</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 6 Players - Popular */}
                    <div className="col-lg-4 col-md-6 col-12">
                      <div className="position-relative">
                        <div className="popular-badge">POPULAR</div>
                        <div className="game-card p-4 text-center" style={{borderColor: 'rgba(220, 38, 38, 0.6)'}}>
                          <div className="card-icon mb-3 mt-2">👥👥</div>
                          <h4 className="fw-bold text-white mb-3">6 Players</h4>
                          <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                              <span className="text-red-custom me-2">🃏</span>
                              <span className="text-secondary">Enhanced Deck Size</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mb-2">
                              <span className="text-red-custom me-2">🎯</span>
                              <span className="text-secondary">250-500 Points</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="text-red-custom me-2">⚖️</span>
                              <span className="text-secondary">Perfect Balance</span>
                            </div>
                          </div>
                          <div className="mt-4 p-2 rounded" style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.5)'}}>
                            <span className="text-red-custom fw-medium">Ideal Strategy Mix</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 8 Players */}
                    <div className="col-lg-4 col-md-6 col-12">
                      <div className="game-card p-4 text-center">
                        <div className="card-icon mb-3">👥👥👥</div>
                        <h4 className="fw-bold text-white mb-3">8 Players</h4>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-center mb-2">
                            <span className="text-red-custom me-2">🃏</span>
                            <span className="text-secondary">Double Deck Chaos</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-center mb-2">
                            <span className="text-red-custom me-2">🎯</span>
                            <span className="text-secondary">500 Victory Points</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-center">
                            <span className="text-red-custom me-2">🔥</span>
                            <span className="text-secondary">Maximum Intensity</span>
                          </div>
                        </div>
                        <div className="mt-4 p-2 rounded" style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.5)'}}>
                          <span className="text-red-custom fw-medium">Ultimate Challenge</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 text-center">
                    <div className="d-inline-flex align-items-center p-3 rounded-pill" style={{background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(220, 38, 38, 0.5)'}}>
                      <span className="text-red-custom fs-3 me-3">🎲</span>
                      <span className="text-secondary">Choose your battlefield and prove your mastery</span>
                      <span className="text-red-custom fs-3 ms-3">🏅</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;