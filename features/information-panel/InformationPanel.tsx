import React, { useState, useRef, useEffect } from 'react';
import GameLog from '../game-log/GameLog';
import ActionsPanel from '../actions/ActionsPanel';
import { useGameStore } from '../../store/useGameStore';
import WorldInfoPanel from './WorldInfoPanel';
import InventoryPanel from '../inventory/InventoryPanel';
import SkillsPanel from '../skills/SkillsPanel';
import CharacterPanel from '../character-panel/CharacterPanel';
import EventsPanel from '../events/EventsPanel';
import TurnRecap from './TurnRecap';
import DebugPanel from './DebugPanel';

type Tab = 'story' | 'inventory' | 'skills' | 'character' | 'world' | 'events' | 'debug';

const TABS: { id: Tab; label: string; }[] = [
    { id: 'story', label: 'Câu chuyện' },
    { id: 'inventory', label: 'Túi đồ' },
    { id: 'skills', label: 'Kỹ năng' },
    { id: 'character', label: 'Nhân vật' },
    { id: 'world', label: 'Thế giới' },
    { id: 'events', label: 'Sự Kiện' },
    { id: 'debug', label: 'Debug' },
];

const InformationPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('story');
    const { isLoading, isAwaitingPlayerAction, pages, currentPageIndex } = useGameStore((state) => ({
        isLoading: state.isLoading,
        isAwaitingPlayerAction: state.isAwaitingPlayerAction,
        pages: state.pages,
        currentPageIndex: state.currentPageIndex,
    }));
    const endOfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only scroll to bottom if we are on the story tab and it's the latest page
        if (activeTab === 'story' && currentPageIndex === pages.length - 1) {
            endOfContentRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [pages, currentPageIndex, activeTab]);

    const renderPanel = (tab: Tab) => {
        if (tab !== activeTab) {
            return null; // Render only active tab's content for performance
        }
        switch (tab) {
            case 'story':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto pr-2">
                            <GameLog />
                            <TurnRecap />
                            <div ref={endOfContentRef} />
                        </div>
                        {(isAwaitingPlayerAction || isLoading) && (
                            <div className="flex-shrink-0 pt-4">
                                <ActionsPanel />
                            </div>
                        )}
                    </div>
                );
            case 'world': return <WorldInfoPanel />;
            case 'inventory': return <InventoryPanel />;
            case 'skills': return <SkillsPanel />;
            case 'character': return <CharacterPanel />;
            case 'events': return <EventsPanel />;
            case 'debug': return <DebugPanel />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-inner flex flex-col h-[42rem]">
            {/* Content Area */}
            <div className="flex-grow p-6 overflow-hidden">
                {TABS.map(tab => (
                    <div
                        key={tab.id}
                        role="tabpanel"
                        id={`panel-${tab.id}`}
                        aria-labelledby={`tab-${tab.id}`}
                        hidden={activeTab !== tab.id}
                        className="h-full"
                    >
                        {renderPanel(tab.id)}
                    </div>
                ))}
            </div>

            {/* Tab Bar */}
            <nav role="tablist" aria-label="Bảng thông tin" className="flex justify-around border-t border-gray-700 bg-gray-900/30 rounded-b-xl">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        aria-controls={`panel-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 px-2 text-center font-semibold transition-colors duration-300 relative focus:outline-none 
                            ${activeTab === tab.id ? 'text-yellow-300' : 'text-gray-400 hover:text-yellow-200'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute left-0 right-0 -top-px h-1 bg-yellow-400 rounded-full shadow-[0_0_8px_theme(colors.yellow.400)]"></span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default InformationPanel;