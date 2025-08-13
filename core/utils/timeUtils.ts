import { GameTime } from '../types';

export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_MONTH = 30;
export const MONTHS_IN_YEAR = 12;

export const MINUTES_IN_DAY = MINUTES_IN_HOUR * HOURS_IN_DAY;
export const MINUTES_IN_MONTH = MINUTES_IN_DAY * DAYS_IN_MONTH;
export const MINUTES_IN_YEAR = MINUTES_IN_MONTH * MONTHS_IN_YEAR;

/**
 * Converts a GameTime object to a total number of minutes from an epoch.
 */
export const gameTimeToTotalMinutes = (time: GameTime): number => {
    return (
        time.year * MINUTES_IN_YEAR +
        (time.month - 1) * MINUTES_IN_MONTH + // month is 1-based
        (time.day - 1) * MINUTES_IN_DAY + // day is 1-based
        time.hour * MINUTES_IN_HOUR +
        time.minute
    );
};

/**
 * Formats a duration in minutes into a human-readable string (e.g., "3 ngày, 5 giờ").
 */
export const formatTimeDifference = (totalMinutes: number): string => {
    if (totalMinutes <= 0) {
        return "Bây giờ";
    }

    const years = Math.floor(totalMinutes / MINUTES_IN_YEAR);
    let remainingMinutes = totalMinutes % MINUTES_IN_YEAR;
    
    const months = Math.floor(remainingMinutes / MINUTES_IN_MONTH);
    remainingMinutes %= MINUTES_IN_MONTH;

    const days = Math.floor(remainingMinutes / MINUTES_IN_DAY);
    remainingMinutes %= MINUTES_IN_DAY;

    const hours = Math.floor(remainingMinutes / MINUTES_IN_HOUR);
    const minutes = remainingMinutes % MINUTES_IN_HOUR;

    const parts = [];
    if (years > 0) parts.push(`${years} năm`);
    if (months > 0) parts.push(`${months} tháng`);
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0 && parts.length < 2) parts.push(`${minutes} phút`); // Only show minutes if it's a short duration

    if (parts.length === 0) return "Chưa đầy một phút";
    
    return parts.slice(0, 2).join(', '); // Return at most 2 largest units for brevity
};

/**
 * Calculates the start date of an event based on the current time and a relative time string from the AI.
 */
export const calculateEventStartDate = (currentTime: GameTime, timeToStart: string): GameTime => {
    const newTime = { ...currentTime };
    
    const dayMatch = timeToStart.match(/(\d+)\s*ngày/);
    const monthMatch = timeToStart.match(/(\d+)\s*tháng/);
    const yearMatch = timeToStart.match(/(\d+)\s*năm/);
    
    newTime.day += dayMatch ? parseInt(dayMatch[1], 10) : 0;
    newTime.month += monthMatch ? parseInt(monthMatch[1], 10) : 0;
    newTime.year += yearMatch ? parseInt(yearMatch[1], 10) : 0;

    // Normalize the date
    while (newTime.day > DAYS_IN_MONTH) {
        newTime.day -= DAYS_IN_MONTH;
        newTime.month++;
    }
    while (newTime.month > MONTHS_IN_YEAR) {
        newTime.month -= MONTHS_IN_YEAR;
        newTime.year++;
    }
    
    return newTime;
};

/**
 * Determines the time of day based on the hour.
 * @param hour The current hour (0-23).
 * @returns A string representing the time of day.
 */
export const getTimeOfDay = (hour: number): string => {
    if (hour >= 5 && hour < 12) {
        return 'Buổi sáng';
    }
    if (hour >= 12 && hour < 17) {
        return 'Buổi trưa/chiều';
    }
    if (hour >= 17 && hour < 21) {
        return 'Buổi tối';
    }
    return 'Buổi đêm'; // Covers 21-23 and 0-4
};