

import React from 'react';
import { WorldEvent, GameTime, WorldEventType } from '../../core/types';
import { gameTimeToTotalMinutes, formatTimeDifference, MINUTES_IN_DAY } from '../../core/utils/timeUtils';

const EVENT_TYPE_INFO: Record<WorldEventType, { label: string; color: string }> = {
    'Chiến Tranh': { label: 'Chiến Tranh', color: 'text-red-400 border-red-500/60' },
    'Thiên Tai': { label: 'Thiên Tai', color: 'text-orange-400 border-orange-500/60' },
    'Cơ Duyên': { label: 'Cơ Duyên', color: 'text-yellow-400 border-yellow-500/60' },
    'Đại Hội': { label: 'Đại Hội', color: 'text-green-400 border-green-500/60' },
    'Khác': { label: 'Khác', color: 'text-gray-400 border-gray-500/60' },
};

const EventCard: React.FC<{ event: WorldEvent; currentTime: GameTime }> = ({ event, currentTime }) => {
    const nowInMinutes = gameTimeToTotalMinutes(currentTime);
    const startInMinutes = gameTimeToTotalMinutes(event.startDate);
    const endInMinutes = startInMinutes + (event.durationDays * MINUTES_IN_DAY);

    let status: 'upcoming' | 'ongoing' | 'past';
    let statusText: string;
    let statusColor: string;
    let timeInfo: string;

    if (nowInMinutes < startInMinutes) {
        status = 'upcoming';
        statusText = 'Sắp Diễn Ra';
        statusColor = 'bg-blue-600/30 text-blue-300 border-blue-500/50';
        timeInfo = `Bắt đầu sau: ${formatTimeDifference(startInMinutes - nowInMinutes)}`;
    } else if (nowInMinutes <= endInMinutes) {
        status = 'ongoing';
        statusText = 'Đang Diễn Ra';
        statusColor = 'bg-green-600/30 text-green-300 border-green-500/50';
        timeInfo = `Kết thúc sau: ${formatTimeDifference(endInMinutes - nowInMinutes)}`;
    } else {
        status = 'past';
        statusText = 'Đã Kết Thúc';
        statusColor = 'bg-gray-600/30 text-gray-300 border-gray-500/50';
        timeInfo = `Kéo dài: ${event.durationDays} ngày`;
    }

    const typeInfo = EVENT_TYPE_INFO[event.type] || EVENT_TYPE_INFO['Khác'];

    return (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/80 animate-fade-in shadow-md">
            <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className={`text-xl font-bold ${typeInfo.color}`}>
                    {event.title}
                </h3>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${statusColor}`}>
                    {statusText}
                </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400 mb-3">
                <span>Địa điểm: <span className="font-semibold text-gray-300">{event.locationName}</span></span>
                <span>Thời gian: <span className="font-semibold text-gray-300">{timeInfo}</span></span>
            </div>

            <p className="text-sm text-gray-300 mb-4 italic">{event.description}</p>
            
            {event.revealedDetails && event.revealedDetails.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-2">
                    <h4 className="text-sm font-semibold text-purple-300">Thông Tin Tình Báo:</h4>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        {event.revealedDetails.map((detail, index) => (
                            <li key={index} className="text-sm text-gray-300">{detail}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EventCard;