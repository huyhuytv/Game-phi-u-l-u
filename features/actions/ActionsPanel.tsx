import React, { useState } from 'react';
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
    const { 
        currentChoices, 
        isLoading, 
        isAwaitingPlayerAction,
        handlePlayerFreeInputAction 
    } = useGameStore((state) => ({
        currentChoices: state.currentChoices,
        isLoading: state.isLoading,
        isAwaitingPlayerAction: state.isAwaitingPlayerAction,
        handlePlayerFreeInputAction: state.handlePlayerFreeInputAction,
    }));

    const [mode, setMode] = useState<'action' | 'story'>('action');
    const [inputText, setInputText] = useState('');

    const handleModeToggle = () => {
        setMode(prev => prev === 'action' ? 'story' : 'action');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputText.trim() && !isLoading) {
            handlePlayerFreeInputAction(inputText, mode);
            setInputText(''); // Clear input after submission
        }
    };

    const placeholders: Record<typeof mode, string> = {
        action: "Nhập hành động của bạn (ví dụ: 'Tôi rút kiếm ra')...",
        story: "Nhập diễn biến bạn muốn xảy ra (ví dụ: 'Một cơn bão tuyết bất ngờ ập đến')...",
    };

    const submitLabels: Record<typeof mode, string> = {
        action: 'Thực Hiện',
        story: 'Kiến Tạo',
    };
    
    const modeButtonClasses: Record<typeof mode, string> = {
        action: 'bg-blue-600/30 text-blue-300 border-blue-500/50 hover:bg-blue-600/50',
        story: 'bg-purple-600/30 text-purple-300 border-purple-500/50 hover:bg-purple-600/50',
    }

    return (
        <div className="mt-4 border-t border-gray-700/50 pt-4">
            {isLoading && (
                <div role="status" className="flex items-center justify-center space-x-3 text-gray-400 animate-fade-in">
                    <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Thiên cơ đang biến đổi, xin chờ...</span>
                </div>
            )}
        
            {!isLoading && isAwaitingPlayerAction && (
                <div className='animate-fade-in'>
                    {currentChoices.length > 0 && (
                        <div className="w-full space-y-3">
                            <h3 className="text-xl font-semibold text-yellow-200 mb-2 text-center">Lựa Chọn</h3>
                            {currentChoices.map((choice) => (
                                <ChoiceButton key={choice.id} choice={choice} />
                            ))}
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-600/50">
                        <h3 className="text-lg font-semibold text-yellow-200/90 mb-3 text-center">
                            {currentChoices.length > 0 ? "Hoặc, Tự Do Hành Động..." : "Tự Do Hành Động..."}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="flex items-start gap-3">
                                <button
                                    type="button"
                                    onClick={handleModeToggle}
                                    title="Chuyển đổi chế độ"
                                    className={`px-3 py-2 rounded-lg border transition-colors flex-shrink-0 font-semibold ${modeButtonClasses[mode]}`}
                                >
                                    {mode === 'action' ? '⚔️ Hành động' : '📖 Câu chuyện'}
                                </button>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as any);
                                        }
                                    }}
                                    placeholder={placeholders[mode]}
                                    className="flex-grow bg-gray-700/50 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition resize-none"
                                    rows={3}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                className="w-full px-4 py-3 bg-yellow-600/80 text-white rounded-lg hover:bg-yellow-600/100 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 font-semibold text-lg"
                            >
                                {submitLabels[mode]}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!isLoading && !isAwaitingPlayerAction && (
                 <p className="text-gray-500 italic animate-fade-in text-center">Câu chuyện dường như đang tạm dừng, chờ đợi một biến cố mới...</p>
            )}
        </div>
    );
};

export default ActionsPanel;