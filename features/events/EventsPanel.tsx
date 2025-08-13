import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import EventCard from './EventCard';
import { WorldEvent } from '../../core/types';
import { gameTimeToTotalMinutes } from '../../core/utils/timeUtils';

type EventFilter = 'all' | 'upcoming' | 'ongoing' | 'past';

const EventsPanel: React.FC = () => {
    const { worldEvents, gameTime } = useGameStore(state => ({
        worldEvents: state.worldEvents,
        gameTime: state.gameTime,
    }));
    const [filter, setFilter] = useState<EventFilter>('all');

    const sortedAndFilteredEvents = useMemo(() => {
        const nowInMinutes = gameTimeToTotalMinutes(gameTime);

        return worldEvents
            .map(event => {
                const startInMinutes = gameTimeToTotalMinutes(event.startDate);
                const endInMinutes = startInMinutes + (event.durationDays * 24 * 60);
                let status: 'upcoming' | 'ongoing' | 'past';

                if (nowInMinutes < startInMinutes) {
                    status = 'upcoming';
                } else if (nowInMinutes >= startInMinutes && nowInMinutes <= endInMinutes) {
                    status = 'ongoing';
                } else {
                    status = 'past';
                }

                return { ...event, status, startInMinutes };
            })
            .filter(event => {
                if (filter === 'all') return true;
                return event.status === filter;
            })
            .sort((a, b) => a.startInMinutes - b.startInMinutes); // Sort by start date
    }, [worldEvents, gameTime, filter]);
    
    const filterButtons: { id: EventFilter; label: string }[] = [
        { id: 'all', label: 'Tất Cả' },
        { id: 'upcoming', label: 'Sắp Diễn Ra' },
        { id: 'ongoing', label: 'Đang Diễn Ra' },
        { id: 'past', label: 'Đã Kết Thúc' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4 p-1 bg-gray-900/40 rounded-lg flex space-x-1 border border-gray-700">
                 {filterButtons.map(({id, label}) => (
                    <button 
                        key={id} 
                        onClick={() => setFilter(id)}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${filter === id ? 'bg-yellow-500 text-gray-900' : 'bg-transparent text-gray-300 hover:bg-gray-600/50'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {sortedAndFilteredEvents.length > 0 ? (
                    sortedAndFilteredEvents.map(event => (
                        <EventCard key={event.id} event={event} currentTime={gameTime} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 italic text-lg">Không có sự kiện nào được ghi nhận.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsPanel;
