import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GameTime, StatusEffect } from '../../core/types';
import { useToastStore } from '../../store/useToastStore';
import { gameTimeToTotalMinutes, formatTimeDifference } from '../../core/utils/timeUtils';

interface InfoLineProps {
    label: string;
    value: string | number;
    valueClass?: string;
    tooltip?: string;
    tooltipId?: string;
    isSmall?: boolean;
}

const InfoLine: React.FC<InfoLineProps> = ({ label, value, valueClass = 'text-gray-200', tooltip, tooltipId, isSmall = false }) => (
    <div className="group relative">
        <span className="font-semibold text-gray-400">{label}: </span>
        <span className={`${isSmall ? 'text-base' : 'text-lg'} ${valueClass}`} aria-describedby={tooltip ? tooltipId : undefined}>
            {value}
        </span>
        {tooltip && (
             <div id={tooltipId} role="tooltip" className="absolute bottom-full left-1/2 z-10 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-600">
                {tooltip}
             </div>
        )}
    </div>
);

const formatTime = (time: GameTime) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `Năm ${time.year}, ${time.day}/${time.month} - ${pad(time.hour)}:${pad(time.minute)}`;
};

const StatusEffectPill: React.FC<{ effect: StatusEffect; gameTime: GameTime }> = ({ effect, gameTime }) => {
    const colorClass = effect.type === 'buff' ? 'bg-green-600/30 text-green-300 border-green-500/50'
                   : effect.type === 'debuff' ? 'bg-red-600/30 text-red-300 border-red-500/50'
                   : 'bg-gray-600/30 text-gray-300 border-gray-500/50';

    const nowInMinutes = gameTimeToTotalMinutes(gameTime);
    let durationText: string;

    if (effect.endTick === 0) {
        durationText = '(Vĩnh viễn)';
    } else if (effect.endTick > nowInMinutes) {
        const remainingMinutes = effect.endTick - nowInMinutes;
        durationText = `(Còn lại: ${formatTimeDifference(remainingMinutes)})`;
    } else {
        durationText = '(Đã kết thúc)';
    }
    
    const tooltipText = `${effect.description}\n${durationText}`;

    return (
        <div className="group relative">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colorClass} cursor-help`}>
                {effect.name}
            </span>
             <div role="tooltip" className="absolute bottom-full left-1/2 z-10 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-600 whitespace-pre-line">
                {tooltipText}
             </div>
        </div>
    );
};


const PlayerStatus: React.FC = () => {
  const { player, gameTime, statusEffects, quickSaveGame, isLoading, showMainMenu } = useGameStore((state) => ({
    player: state.player,
    gameTime: state.gameTime,
    statusEffects: state.statusEffects,
    quickSaveGame: state.quickSaveGame,
    isLoading: state.isLoading,
    showMainMenu: state.showMainMenu,
  }));
  const addToast = useToastStore(state => state.addToast);

  const handleQuickSave = () => {
      if (isLoading) {
          addToast("Không thể lưu khi thiên cơ đang biến đổi.", "error");
          return;
      }
      quickSaveGame();
  };
  
   const handleExit = () => {
      if (isLoading) {
          addToast("Không thể thoát khi thiên cơ đang biến đổi.", "error");
          return;
      }
      if (window.confirm('Bạn có chắc muốn thoát về menu chính? Mọi tiến trình chưa lưu sẽ bị mất.')) {
         showMainMenu();
      }
  };

  return (
    <aside role="complementary" aria-labelledby="player-status-heading" className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 id="player-status-heading" className="text-2xl font-bold text-yellow-300 mb-4 tracking-wider">{player.name}</h2>
      
      <div className="space-y-3">
        <InfoLine label="Cảnh Giới" value={player.realm.displayName} valueClass="text-cyan-400 font-bold" />
        <InfoLine label="Tuổi/Thọ Nguyên" value={`${player.tuoi} (${player.thoNguyen}/${player.maxThoNguyen})`} valueClass="text-gray-300" />
      </div>

       <div className="border-t border-gray-700/60 my-4"></div>

        <div className="space-y-3">
            <div className="flex justify-between items-center">
                 <InfoLine label="Thời Gian" value={formatTime(gameTime)} isSmall={true} valueClass="text-gray-300" />
                 <div className="flex items-center gap-2">
                    <button
                        onClick={handleQuickSave}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 disabled:cursor-not-allowed disabled:bg-gray-600/50 disabled:text-gray-400 transition-colors"
                        aria-label="Lưu nhanh"
                        title="Lưu nhanh"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                            <path fillRule="evenodd" d="M10 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 13a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={handleExit}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-red-800/30 hover:bg-red-800/50 text-red-300 border border-red-700/50 disabled:cursor-not-allowed disabled:bg-gray-600/50 disabled:text-gray-400 transition-colors"
                        aria-label="Thoát về menu chính"
                        title="Thoát về menu chính"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </div>
            </div>
            {statusEffects.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 pt-2">
                    <span className="font-semibold text-gray-400 text-base">Hiệu Ứng:</span>
                    {statusEffects.map(effect => <StatusEffectPill key={effect.id} effect={effect} gameTime={gameTime} />)}
                </div>
            )}
        </div>
    </aside>
  );
};

export default PlayerStatus;