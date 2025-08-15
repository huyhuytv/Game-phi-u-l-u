import React, { useState, useEffect, useRef } from 'react';
import { useCharacterCreationStore } from './characterCreationStore';
import CharacterAndStoryTab from './CharacterAndStoryTab';
import WorldSetupTab from './WorldSetupTab';
import StartingFactorsTab from './StartingFactorsTab';
import { useToastStore } from '../../store/useToastStore';
import { useGameStore } from '../../store/useGameStore';

const CharacterCreationScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'character' | 'world' | 'factors'>('character');
    const { 
        status, startGame, 
        characterData, worldData, startingFactors,
        reset, importFullData,
    } = useCharacterCreationStore();
    const { showMainMenu } = useGameStore();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset store on component mount to ensure clean state
    useEffect(() => {
        reset();
    }, [reset]);

    const isStartingGame = status === 'startingGame';
    const isGeneratingWorld = status === 'generatingWorld';
    
    const isBonusSelected = () => {
        return !!characterData.talent?.name?.trim() || !!characterData.theChat?.name?.trim();
    }

    const isSubmitDisabled = 
        !characterData.name?.trim() || 
        !characterData.objective?.trim() ||
        !characterData.linhCan?.trim() ||
        !isBonusSelected() ||
        !worldData.storyName.trim() || 
        isStartingGame || 
        isGeneratingWorld;
    
    const handleSubmit = () => {
        if (!isSubmitDisabled) {
            startGame();
        }
    };

    const handleBack = () => {
        showMainMenu();
    };

    const handleExport = () => {
        try {
            const stateToSave = {
                characterData,
                worldData,
                startingFactors,
            };
            const jsonString = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safeStoryName = worldData.storyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.href = url;
            a.download = `TienLoKy_Template_${safeStoryName || 'vo_danh'}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            useToastStore.getState().addToast("Xuất dữ liệu thành công!", "success");
        } catch (error) {
            console.error("Failed to export data:", error);
            useToastStore.getState().addToast("Xuất dữ liệu thất bại.", "error");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                importFullData(data);
            } catch (error) {
                console.error("Failed to import data:", error);
                useToastStore.getState().addToast("File không hợp lệ hoặc bị lỗi.", "error");
            }
        };
        reader.onerror = () => {
             useToastStore.getState().addToast("Không thể đọc file.", "error");
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'character':
                return <CharacterAndStoryTab />;
            case 'world':
                return <WorldSetupTab />;
            case 'factors':
                return <StartingFactorsTab />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-800/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">Cuộc Phiêu Lưu Mới</h1>
            <p className="text-center text-gray-400 mb-6">Tạo nhân vật và định hình thế giới của riêng bạn.</p>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept=".json,application/json"
                    className="hidden"
                    aria-label="Nhập file dữ liệu"
                />
                <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-base font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4 bg-green-600/20 border-green-400 text-green-300 hover:bg-green-600/30 hover:scale-105 focus:ring-green-500/50"
                >
                    Xuất Dữ Liệu
                </button>
                <button
                    onClick={handleImportClick}
                    className="w-full px-4 py-2 text-base font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4 bg-blue-600/20 border-blue-400 text-blue-300 hover:bg-blue-600/30 hover:scale-105 focus:ring-blue-500/50"
                >
                    Nhập Dữ Liệu
                </button>
            </div>

            <div className="border-b border-gray-600 mb-6">
                <nav className="-mb-px flex space-x-6" role="tablist" aria-label="Tạo nhân vật">
                    <button role="tab" aria-selected={activeTab === 'character'} id="tab-character" aria-controls="panel-character" onClick={() => setActiveTab('character')} className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${activeTab === 'character' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Nhân Vật & Cốt Truyện</button>
                    <button role="tab" aria-selected={activeTab === 'world'} id="tab-world" aria-controls="panel-world" onClick={() => setActiveTab('world')} className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${activeTab === 'world' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Thiết Lập Thế Giới</button>
                    <button role="tab" aria-selected={activeTab === 'factors'} id="tab-factors" aria-controls="panel-factors" onClick={() => setActiveTab('factors')} className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${activeTab === 'factors' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Yếu Tố Khởi Đầu</button>
                </nav>
            </div>
      
            <div 
                role="tabpanel" 
                id="panel-character" 
                aria-labelledby="tab-character" 
                hidden={activeTab !== 'character'}
                tabIndex={0}
            >
                {activeTab === 'character' && <CharacterAndStoryTab />}
            </div>
            <div 
                role="tabpanel" 
                id="panel-world" 
                aria-labelledby="tab-world" 
                hidden={activeTab !== 'world'}
                tabIndex={0}
            >
                {activeTab === 'world' && <WorldSetupTab />}
            </div>
            <div 
                role="tabpanel" 
                id="panel-factors" 
                aria-labelledby="tab-factors" 
                hidden={activeTab !== 'factors'}
                tabIndex={0}
            >
                {activeTab === 'factors' && <StartingFactorsTab />}
            </div>


            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={handleBack}
                    className="w-full sm:w-auto px-8 py-4 text-xl font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4 bg-gray-600/20 border-gray-500 text-gray-300 hover:bg-gray-600/30 hover:scale-105 focus:ring-gray-400/50">
                    Quay Về
                </button>
                <button onClick={handleSubmit} disabled={isSubmitDisabled}
                    className="w-full px-8 py-4 text-xl font-semibold border-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4 bg-yellow-400/20 border-yellow-400 text-yellow-300 hover:bg-yellow-400/30 hover:scale-105 focus:ring-yellow-500/50 disabled:bg-gray-800/20 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed">
                    {isStartingGame ? "Đang Tạo Thế Giới..." : isGeneratingWorld ? "AI Đang Sáng Tạo..." : "Bắt Đầu Hành Trình"}
                </button>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;