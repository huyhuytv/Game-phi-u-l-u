
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import * as saveLoadService from '../core/services/saveLoadService';
import { SaveGame } from '../core/types';
import { useToastStore } from '../store/useToastStore';
import Button from '../components/ui/Button';

interface SaveCardProps {
    saveData: SaveGame;
    onLoad: (save: SaveGame) => void;
    onDelete: (id: string, characterName: string) => void;
    onExport: (save: SaveGame) => void;
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.41a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 2.954V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);

const SaveCard: React.FC<SaveCardProps> = ({ saveData, onLoad, onDelete, onExport }) => {
    const { characterName, realmDisplayName, timestamp, worldState } = saveData;
    const storyName = worldState.worldData?.storyName;

    return (
        <div className="p-4 bg-gray-800/80 border-2 border-gray-700 rounded-lg flex flex-col justify-between h-48 animate-fade-in">
            <div>
                <h3 className="font-bold text-lg text-yellow-300 truncate" title={storyName}>
                    {storyName || 'Hành trình vô danh'}
                </h3>
                <p className="text-sm text-cyan-300">{characterName} - {realmDisplayName}</p>
                <p className="text-xs text-gray-400 mt-1">Lưu lần cuối: {new Date(timestamp).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 mt-4">
                <Button onClick={() => onLoad(saveData)} className="flex-1 bg-blue-600 hover:bg-blue-500">Tải</Button>
                <Button onClick={() => onExport(saveData)} className="!px-3 bg-green-700 hover:bg-green-600" title="Xuất file">
                    <ExportIcon />
                </Button>
                <Button onClick={() => onDelete(saveData.id, characterName)} className="!px-3 bg-red-700 hover:bg-red-600">Xóa</Button>
            </div>
        </div>
    );
};

const SaveLoadScreen: React.FC = () => {
    const { saveOrigin, setGameState, loadGame, showMainMenu } = useGameStore(state => ({
        saveOrigin: state.saveOrigin,
        setGameState: state.setGameState,
        loadGame: state.loadGame,
        showMainMenu: state.showMainMenu,
    }));

    const [saves, setSaves] = useState<SaveGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const addToast = useToastStore(state => state.addToast);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSaves = useCallback(async () => {
        setIsLoading(true);
        try {
            const savesData = await saveLoadService.getSaves();
            savesData.sort((a, b) => b.timestamp - a.timestamp);
            setSaves(savesData);
        } catch (error) {
            console.error("Failed to fetch saves:", error);
            addToast("Không thể tải danh sách lưu.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchSaves();
    }, [fetchSaves]);
    
    const handleBack = () => {
        if (saveOrigin && saveOrigin !== 'SaveLoadMenu') {
            setGameState(saveOrigin);
        } else {
            showMainMenu();
        }
    };
    
    const handleLoad = (save: SaveGame) => {
        loadGame(save);
    };

    const handleDelete = async (id: string, characterName: string) => {
        if (window.confirm(`Bạn có chắc muốn XÓA vĩnh viễn hành trình của "${characterName}" không? Hành động này không thể hoàn tác.`)) {
            try {
                await saveLoadService.deleteGameInSlot(id);
                addToast("Đã xóa bản lưu.", "success");
                fetchSaves();
            } catch (error) {
                console.error("Failed to delete save:", error);
                addToast("Xóa bản lưu thất bại!", "error");
            }
        }
    };
    
    const handleExport = (saveData: SaveGame) => {
        try {
            const jsonString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safeCharName = saveData.characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dateStr = new Date(saveData.timestamp).toISOString().split('T')[0];
            a.href = url;
            a.download = `TienLoKy_Save_${safeCharName}_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast("Xuất dữ liệu thành công!", "success");
        } catch (error) {
            console.error("Failed to export save:", error);
            addToast("Xuất dữ liệu thất bại.", "error");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const isValidSaveFile = (data: any): data is SaveGame => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.timestamp === 'number' &&
            typeof data.characterName === 'string' &&
            typeof data.playerState === 'object' &&
            typeof data.worldState === 'object' &&
            typeof data.sessionState === 'object';
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const importedData = JSON.parse(text);

                if (!isValidSaveFile(importedData)) {
                    throw new Error("Tệp không chứa dữ liệu lưu hợp lệ.");
                }
                
                const existingSave = saves.find(s => s.id === importedData.id);
                if (existingSave) {
                    if (!window.confirm(`Hành trình của "${importedData.characterName}" đã tồn tại. Bạn có muốn ghi đè lên nó không?`)) {
                        return;
                    }
                }

                await saveLoadService.saveGameToSlot(importedData);
                addToast(`Đã nhập thành công hành trình của "${importedData.characterName}".`, 'success');
                fetchSaves();

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "File không hợp lệ hoặc bị lỗi.";
                console.error("Failed to import data:", error);
                addToast(errorMessage, "error");
            }
        };
        reader.onerror = () => {
             addToast("Không thể đọc file.", "error");
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };

    if (isLoading) {
        return <div className="text-center text-xl text-yellow-300">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="animate-fade-in p-4 max-w-5xl mx-auto">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".json,application/json"
                className="hidden"
            />
             <header className="text-center mb-8">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 tracking-widest" style={{ fontFamily: 'serif' }}>
                    Tải/Lưu Trò Chơi
                </h1>
                <p className="text-yellow-100/80 mt-2">Quản lý các hành trình đã lưu của bạn.</p>
            </header>
            
            {saves.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {saves.map(save => (
                        <SaveCard 
                            key={save.id}
                            saveData={save}
                            onLoad={handleLoad}
                            onDelete={handleDelete}
                            onExport={handleExport}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 bg-gray-800/50 rounded-lg">
                    <p className="text-xl text-gray-400">Không tìm thấy hành trình nào đã lưu.</p>
                </div>
            )}


            <div className="mt-8 flex justify-center items-center gap-4">
                <Button onClick={handleImportClick} className="bg-green-600 hover:bg-green-500">
                    Nhập Từ Tập Tin
                </Button>
                <Button onClick={handleBack} className="bg-cyan-600 hover:bg-cyan-500">
                    Quay Về
                </Button>
            </div>
        </div>
    );
};

export default SaveLoadScreen;
