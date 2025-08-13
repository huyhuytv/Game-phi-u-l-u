import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';

const TurnRecap: React.FC = () => {
    const notifications = useGameStore((state) => state.currentTurnNotifications);
    const [isOpen, setIsOpen] = useState(false);

    if (notifications.length === 0) {
        return null;
    }

    const toggleAccordion = () => setIsOpen(!isOpen);

    return (
        <div role="status" className="my-4 animate-fade-in">
            <button
                onClick={toggleAccordion}
                className="w-full flex justify-between items-center p-3 bg-gray-700/60 hover:bg-gray-700/80 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-expanded={isOpen}
                aria-controls="turn-recap-content"
            >
                <span className="font-semibold text-yellow-300">
                    Có {notifications.length} thông báo mới
                </span>
                <svg
                    className={`w-6 h-6 text-yellow-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div
                    id="turn-recap-content"
                    className="mt-2 p-4 bg-gray-900/50 rounded-b-lg border border-t-0 border-gray-700 space-y-2"
                >
                    {notifications.map((notification, index) => (
                        <p key={index} className="text-gray-300 text-sm">
                            {notification}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TurnRecap;