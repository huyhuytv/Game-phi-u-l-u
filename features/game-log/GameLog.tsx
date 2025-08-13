
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GameLogEntry } from '../../core/types';

const getLogStyle = (log: GameLogEntry) => {
    switch(log.type) {
        case 'system':
            return 'text-gray-500 italic';
        case 'event':
            return 'text-yellow-300 font-semibold';
        case 'player_action':
             return 'text-cyan-300 italic';
        case 'choice':
            return 'text-purple-400';
        case 'story':
        default:
            return 'text-gray-300';
    }
}

const getLogPrefix = (log: GameLogEntry) => {
     switch(log.type) {
        case 'system':
            return '[Hệ Thống] ';
        case 'player_action':
            return '> ';
        default:
            return '';
    }
}


const GameLog: React.FC = () => {
  const logs = useGameStore((state) => state.logs);

  return (
    <div role="log" aria-label="Nhật ký game" className="text-base leading-relaxed animate-fade-in">
      {logs.map((log) => (
        <p key={log.id} className={`${getLogStyle(log)} mb-3`}>
           {getLogPrefix(log)}{log.message}
        </p>
      ))}
    </div>
  );
};

export default GameLog;
