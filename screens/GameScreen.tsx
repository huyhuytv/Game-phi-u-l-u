import React from 'react';
import PlayerStatus from '../features/player-status/PlayerStatus';
import InformationPanel from '../features/information-panel/InformationPanel';

const GameScreen: React.FC = () => {
  return (
    <div className="animate-fade-in relative">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 tracking-widest" style={{ fontFamily: 'serif' }}>
          Tiên Lộ Ký
        </h1>
        <p className="text-yellow-100/80 mt-2">Hành trình vạn dặm bắt đầu bằng một bước chân</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <PlayerStatus />
        </div>
        <div className="lg:col-span-2">
          <InformationPanel />
        </div>
      </main>
    </div>
  );
};

export default GameScreen;