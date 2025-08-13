

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Choice } from '../../core/types';

const ChoiceButton: React.FC<{ choice: Choice }> = ({ choice }) => {
    const handlePlayerChoice = useGameStore(state => state.handlePlayerChoice);
  
    return (
        <button
            onClick={() => handlePlayerChoice(choice)}
            title={choice.fullText} // Native tooltip for the full text
            className="w-full px-4 py-3 bg-cyan-800/70 text-cyan-200 rounded-lg hover:bg-cyan-700/90 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 text-left"
        >
            <span className="font-semibold text-base align-middle">
                {choice.action}
                {(choice.benefit || choice.risk) && (
                     <span className="text-gray-400 font-normal ml-2">
                        (
                        {choice.benefit && <span className="text-green-400">Được: {choice.benefit}</span>}
                        {choice.benefit && choice.risk && <span className="text-gray-500 mx-1">;</span>}
                        {choice.risk && <span className="text-red-400">Mất: {choice.risk}</span>}
                        )
                    </span>
                )}
            </span>
        </button>
    );
};

const ActionsPanel: React.FC = () => {
  const { currentChoices, isLoading, isAwaitingPlayerAction } = useGameStore((state) => ({
    currentChoices: state.currentChoices,
    isLoading: state.isLoading,
    isAwaitingPlayerAction: state.isAwaitingPlayerAction,
  }));

  return (
    <div className="mt-4 border-t border-gray-700/50 pt-4">
      <h3 className="text-xl font-semibold text-yellow-200 mb-4 text-center">Hành Động</h3>
      <div className="flex flex-col space-y-3 items-center">
        {isLoading && (
            <div role="status" className="flex items-center justify-center space-x-3 text-gray-400 animate-fade-in">
                 <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Thiên cơ đang biến đổi, xin chờ...</span>
            </div>
        )}
        
        {!isLoading && isAwaitingPlayerAction && currentChoices.length > 0 && (
             <div className="w-full space-y-3 animate-fade-in">
                {currentChoices.map((choice) => (
                    <ChoiceButton key={choice.id} choice={choice} />
                ))}
             </div>
        )}

        {!isLoading && isAwaitingPlayerAction && currentChoices.length === 0 && (
             <p className="text-gray-500 italic animate-fade-in">Câu chuyện đã đến hồi kết?</p>
        )}
      </div>
    </div>
  );
};

export default ActionsPanel;