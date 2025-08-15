

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GameLogEntry, GamePage } from '../../core/types';

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
        case 'summary':
            return 'text-yellow-200/90 italic bg-gray-900/40 p-4 rounded-lg border-l-4 border-yellow-500/50 shadow-inner';
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
        case 'summary':
            return '[Hồi Ký] ';
        default:
            return '';
    }
}

const PageNavigator: React.FC = () => {
    const { pages, currentPageIndex, setCurrentPageIndex } = useGameStore(state => ({
        pages: state.pages,
        currentPageIndex: state.currentPageIndex,
        setCurrentPageIndex: state.setCurrentPageIndex,
    }));

    if (pages.length <= 1) return null;

    const isAtStart = currentPageIndex === 0;
    const isAtEnd = currentPageIndex === pages.length - 1;

    return (
        <div className="flex items-center justify-center gap-4 my-4 sticky bottom-0 bg-gray-800/50 backdrop-blur-sm p-2 rounded-lg">
            <button
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
                disabled={isAtStart}
                className="px-4 py-2 text-white bg-yellow-600/80 rounded-lg hover:bg-yellow-600/100 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Hồi Trước"
            >
                &lt; Hồi Trước
            </button>
            <span className="font-bold text-lg text-yellow-200">
                Hồi {currentPageIndex + 1} / {pages.length}
            </span>
            <button
                onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
                disabled={isAtEnd}
                className="px-4 py-2 text-white bg-yellow-600/80 rounded-lg hover:bg-yellow-600/100 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Hồi Tiếp"
            >
                Hồi Tiếp &gt;
            </button>
        </div>
    );
};


const GameLog: React.FC = () => {
  const { pages, currentPageIndex } = useGameStore((state) => ({
      pages: state.pages,
      currentPageIndex: state.currentPageIndex,
  }));

  const currentPage: GamePage | undefined = pages[currentPageIndex];

  if (!currentPage) {
      return <div className="text-gray-500 italic">Nhật ký trống.</div>;
  }

  return (
    <div role="log" aria-label="Nhật ký game" className="text-base leading-relaxed animate-fade-in">
      {currentPage.logs.map((log) => (
        <p key={log.id} className={`${getLogStyle(log)} mb-3`}>
           {getLogPrefix(log)}{log.message}
        </p>
      ))}
      <PageNavigator />
    </div>
  );
};

export default GameLog;