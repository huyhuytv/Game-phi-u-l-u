import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

const MainMenu: React.FC = () => {
  const { 
      showCharacterCreation, 
      showSettings, 
      showLoadMenu,
      continueGame,
      checkForAutoSave,
      hasAutoSave
  } = useGameStore(state => ({
    showCharacterCreation: state.showCharacterCreation,
    showSettings: state.showSettings,
    showLoadMenu: state.showLoadMenu,
    continueGame: state.continueGame,
    checkForAutoSave: state.checkForAutoSave,
    hasAutoSave: state.hasAutoSave,
  }));

  // Check for an autosave file when the component mounts
  useEffect(() => {
    checkForAutoSave();
  }, [checkForAutoSave]);


  const buttonBaseClasses = "w-full max-w-sm px-8 py-4 text-xl font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4";
  const primaryButtonClasses = "border-yellow-400 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 hover:scale-105 focus:ring-yellow-500/50";
  const disabledButtonClasses = "border-gray-600 text-gray-500 bg-gray-800/20 cursor-not-allowed hover:scale-100";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <header className="mb-12">
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 tracking-widest" style={{ fontFamily: 'serif' }}>
          Tiên Lộ Ký
        </h1>
        <p className="text-yellow-100/70 mt-4 text-lg italic">Một thế giới tu tiên đang chờ bạn khám phá</p>
      </header>

      <div className="space-y-6 flex flex-col items-center">
        <button
          onClick={showCharacterCreation}
          className={`${buttonBaseClasses} ${primaryButtonClasses}`}
        >
          Bắt đầu hành trình mới
        </button>
        <button
          onClick={continueGame}
          disabled={!hasAutoSave}
          className={`${buttonBaseClasses} ${!hasAutoSave ? disabledButtonClasses : primaryButtonClasses}`}
        >
          Tiếp tục
        </button>
        <button
          onClick={() => showLoadMenu()}
          title="Tải lại hành trình đã lưu"
          className={`${buttonBaseClasses} ${primaryButtonClasses}`}
        >
          Tải trò chơi
        </button>
        <button
          onClick={showSettings}
          title="Xem cài đặt và các thông tin khác"
          className={`${buttonBaseClasses} ${primaryButtonClasses}`}
        >
          Cài đặt & Tính năng
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
