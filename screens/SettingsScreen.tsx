import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore, AiModel, AI_MODEL_DISPLAY_NAMES } from '../store/useSettingsStore';
import SectionHeader from '../components/ui/SectionHeader';
import SelectField from '../components/ui/SelectField';

const SettingsScreen: React.FC = () => {
  const { showPromptLibrary, showMainMenu } = useGameStore(state => ({
    showPromptLibrary: state.showPromptLibrary,
    showMainMenu: state.showMainMenu,
  }));
  const { model, setModel, ragTopK, setRagTopK } = useSettingsStore();

  const buttonBaseClasses = "w-full max-w-sm px-8 py-4 text-xl font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4";
  const primaryButtonClasses = "border-yellow-400 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 hover:scale-105 focus:ring-yellow-500/50";
  const secondaryButtonClasses = "border-cyan-400 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 hover:scale-105 focus:ring-cyan-500/50";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-cyan-400 tracking-wider" style={{ fontFamily: 'serif' }}>
          Cài đặt & Tính năng
        </h1>
        <p className="text-cyan-100/70 mt-4 text-lg italic">Tùy chỉnh và khám phá các tính năng của trò chơi</p>
      </header>
      
      <div className="w-full space-y-8">
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-left space-y-6">
            <SectionHeader title="Cài đặt" />
            <div>
                <SelectField
                    id="ai-model"
                    label="Mô hình AI"
                    value={model}
                    onChange={(e) => setModel(e.target.value as AiModel)}
                >
                    {Object.entries(AI_MODEL_DISPLAY_NAMES).map(([value, name]) => (
                        <option key={value} value={value}>{name}</option>
                    ))}
                </SelectField>
                <p className="text-xs text-gray-500 mt-2">
                    Lựa chọn mô hình AI để vận hành câu chuyện. Các mô hình khác nhau có thể ảnh hưởng đến tốc độ, sự sáng tạo và phong cách kể chuyện.
                </p>
            </div>
            <div>
                <label htmlFor="rag-topk-slider" className="block mb-2 text-sm font-medium text-gray-300">
                    Số Lượng Thông Tin Ngữ Cảnh (RAG): <span className="font-bold text-yellow-300">{ragTopK}</span>
                </label>
                <input
                    id="rag-topk-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={ragTopK}
                    onChange={(e) => setRagTopK(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    aria-label="Điều chỉnh số lượng thông tin ngữ cảnh"
                />
                 <p className="text-xs text-gray-500 mt-2">
                    Điều chỉnh lượng thông tin "trí nhớ" của AI. Số lớn hơn giúp AI nhớ tốt hơn nhưng có thể tốn nhiều token hơn và chậm hơn. 0 để tắt, mặc định 10.
                </p>
            </div>
        </div>

        <div className="space-y-6 flex flex-col items-center">
            <button
            onClick={showPromptLibrary}
            className={`${buttonBaseClasses} ${primaryButtonClasses}`}
            >
            Thư Viện Lời Nhắc
            </button>
            <button
            onClick={showMainMenu}
            className={`${buttonBaseClasses} ${secondaryButtonClasses}`}
            >
            Quay Về
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;