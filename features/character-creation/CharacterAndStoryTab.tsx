import React, { useState, useMemo, useEffect } from 'react';
import { useCharacterCreationStore, OBJECTIVE_OPTIONS, StartingBonusType } from './characterCreationStore';
import { generateInitialTalents, generateFactorSuggestions } from '../../core/services/geminiService';
import { Talent } from '../../core/types';
import SectionHeader from '../../components/ui/SectionHeader';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextAreaField from '../../components/ui/TextAreaField';
import Button from '../../components/ui/Button';

const AiGeneratorCard = ({ title, buttonText, onGenerate, isLoading, items, selectedItem, onSelect, itemTypeClass, children }: { title?: string, buttonText: string, onGenerate: () => void, isLoading: boolean, items: Talent[], selectedItem: Talent | null, onSelect: (item: Talent) => void, itemTypeClass: string, children?: React.ReactNode }) => {
    
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (isLoading) {
            setStatusMessage(`Đang tìm kiếm ${buttonText.toLowerCase()}...`);
        } else if (items.length > 0) {
            setStatusMessage(`Đã tìm thấy ${items.length} gợi ý.`);
        } else {
            setStatusMessage('');
        }
    }, [isLoading, items, buttonText]);
    
    return (
    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/80 space-y-4">
        <div role="status" aria-live="polite" className="sr-only">
            {statusMessage}
        </div>
        {title && <label className="block text-sm font-medium text-yellow-200/80">{title}</label>}
        
        {children}
        
        <div>
            <Button
                type="button"
                onClick={onGenerate}
                isLoading={isLoading}
                loadingText="Đang tìm..."
                className={`w-full justify-center space-x-2 ${itemTypeClass}`}
            >
                {`${buttonText}`}
            </Button>
            {(items.length > 0 || selectedItem) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                    {items.map(item => (
                        <button type="button" key={item.name} onClick={() => onSelect(item)}
                            aria-pressed={selectedItem?.name === item.name}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 text-left ${selectedItem?.name === item.name ? 'scale-105 shadow-lg' : 'bg-gray-800/50 hover:bg-gray-700/70'} ${selectedItem?.name === item.name ? itemTypeClass.replace('bg-', 'border-').replace(/-\d+$/, '-400') + ' bg-opacity-20' : 'border-gray-600'}`}>
                            <h4 className={`font-bold text-lg ${itemTypeClass.replace('bg-','text-').replace(/-\d+$/, '-300')}`}>{item.name}</h4>
                            <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                        </button>
                    ))}
                     {selectedItem && !items.some(i => i.name === selectedItem.name) && (
                         <div
                            className={`p-4 border-2 rounded-lg transition-all duration-300 scale-105 shadow-lg md:col-span-3 ${itemTypeClass.replace('bg-', 'border-').replace(/-\d+$/, '-400')} bg-opacity-20`}>
                            <h4 className={`font-bold text-lg ${itemTypeClass.replace('bg-','text-').replace(/-\d+$/, '-300')}`}>{selectedItem.name}</h4>
                            <p className="text-sm text-gray-300 mt-1">{selectedItem.description}</p>
                        </div>
                     )}
                </div>
            )}
        </div>
    </div>
)};


const CharacterAndStoryTab = () => {
    const { 
        characterData, updateCharacterData, 
        startingBonusType, setStartingBonusType,
        worldData, updateWorldData
    } = useCharacterCreationStore();

    // State for AI suggestions
    const [talents, setTalents] = useState<Talent[]>([]);
    const [isFetchingTalents, setIsFetchingTalents] = useState(false);
    const [spiritualRoots, setSpiritualRoots] = useState<Talent[]>([]);
    const [isFetchingSpiritualRoots, setIsFetchingSpiritualRoots] = useState(false);
    const [specialPhysiques, setSpecialPhysiques] = useState<Talent[]>([]);
    const [isFetchingSpecialPhysiques, setIsFetchingSpecialPhysiques] = useState(false);
    
    const ageFromStore = useMemo(() => {
        const max = characterData.maxThoNguyen ?? 0;
        const remaining = characterData.thoNguyen ?? 0;
        if (max > 0) {
            const age = max - remaining;
            return age >= 0 ? age : 0;
        }
        return ''; // Return empty if maxThoNguyen is not set
    }, [characterData.maxThoNguyen, characterData.thoNguyen]);

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAgeStr = e.target.value;
        if (newAgeStr === '') {
            updateCharacterData({ thoNguyen: characterData.maxThoNguyen || 0 });
            return;
        }
        const newAge = parseInt(newAgeStr, 10);
        if (isNaN(newAge) || newAge < 0) return;

        const max = characterData.maxThoNguyen || 0;
        updateCharacterData({ thoNguyen: max - newAge });
    };
    
    const handleMaxThoNguyenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMaxStr = e.target.value;
        if (newMaxStr === '') {
            updateCharacterData({ maxThoNguyen: 0, thoNguyen: 0 });
            return;
        }
        const newMax = parseInt(newMaxStr, 10);
        if (isNaN(newMax) || newMax < 0) return;

        const currentAge = typeof ageFromStore === 'number' ? ageFromStore : 0;
        updateCharacterData({
            maxThoNguyen: newMax,
            thoNguyen: newMax - currentAge
        });
    };


    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        updateCharacterData({ [e.target.name]: e.target.value });
    };

    const handleWorldDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'startingCurrency') {
            const numValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(numValue) || numValue < 0) return;
            updateWorldData({ [name]: numValue });
        } else {
            updateWorldData({ [name]: value });
        }
    };

    const handleObjectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value !== 'Tùy Chỉnh...') {
            updateCharacterData({ objective: value });
        } else {
             // When user selects "Tùy Chỉnh...", clear the objective to allow for custom input.
             updateCharacterData({ objective: '' });
        }
    };
    
    const handleCustomObjectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCharacterData({ objective: e.target.value });
    }

    const handleStartingBonusTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as StartingBonusType;
        setStartingBonusType(newType);
        // Clear local suggestion states when switching
        if (newType === 'talent') {
            setSpecialPhysiques([]);
        } else {
            setTalents([]);
        }
    };

    // --- Suggestion Fetchers ---
    const handleFetchTalents = async () => { setIsFetchingTalents(true); updateCharacterData({ talent: { name: '', description: '' } }); const fetched = await generateInitialTalents(); setTalents(fetched); setIsFetchingTalents(false); };
    const handleFetchSpiritualRoots = async () => { setIsFetchingSpiritualRoots(true); updateCharacterData({linhCan: ''}); const fetched = await generateFactorSuggestions("Linh Căn", worldData.genre, worldData.theme); setSpiritualRoots(fetched); setIsFetchingSpiritualRoots(false); };
    const handleFetchSpecialPhysiques = async () => { setIsFetchingSpecialPhysiques(true); updateCharacterData({theChat: {name: '', description: ''}}); const fetched = await generateFactorSuggestions("Thể Chất Đặc Biệt", worldData.genre, worldData.theme); setSpecialPhysiques(fetched); setIsFetchingSpecialPhysiques(false); };
    
    // --- Suggestion Selectors ---
    const handleSelectTalent = (talent: Talent) => { updateCharacterData({ talent }); };
    const handleSelectSpiritualRoot = (talent: Talent) => { updateCharacterData({ linhCan: talent.name }); };
    const handleSelectSpecialPhysique = (talent: Talent) => { updateCharacterData({ theChat: { name: talent.name, description: talent.description } }); };
    
    // --- Custom Input Handlers ---
    const handleCustomTalentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const currentTalent = characterData.talent || { name: '', description: '' };
        const newTalent = {
            name: name === 'name' ? value : currentTalent.name,
            description: name === 'description' ? value : currentTalent.description,
        };
        updateCharacterData({ talent: newTalent.name ? newTalent : { name: '', description: '' } });
    };
    const handleCustomLinhCanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCharacterData({ linhCan: e.target.value });
    }
    const handleCustomTheChatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newPhysique = {
            name: name === 'name' ? value : characterData.theChat?.name || '',
            description: name === 'description' ? value : characterData.theChat?.description || '',
        };
        updateCharacterData({ theChat: newPhysique });
    }

    // --- Derived Selected Items for Generator Cards ---
    const selectedSpiritualRootAsTalent = useMemo(() => {
        if (!characterData.linhCan) return null;
        return spiritualRoots.find(r => r.name === characterData.linhCan) ?? { name: characterData.linhCan, description: '(Tự tạo)' };
    }, [characterData.linhCan, spiritualRoots]);

    const selectedSpecialPhysiqueAsTalent = useMemo(() => {
        if (!characterData.theChat?.name) return null;
        return specialPhysiques.find(p => p.name === characterData.theChat.name) ?? { name: characterData.theChat.name, description: characterData.theChat.description || '(Tự tạo)' };
    }, [characterData.theChat, specialPhysiques]);


    const finalObjectiveValue = (characterData.objective && OBJECTIVE_OPTIONS.includes(characterData.objective)) ? characterData.objective : 'Tùy Chỉnh...';


    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="characterName" name="name" label="Tên Nhân Vật" value={characterData.name} onChange={handleDataChange} placeholder="Nhập danh xưng của bạn..." required/>
                    <SelectField id="gender" name="gender" label="Giới Tính" value={characterData.gender} onChange={handleDataChange}><option>Bí Mật</option><option>Nam</option><option>Nữ</option></SelectField>
                </div>
                <div className="mt-6"><SelectField id="race" name="race" label="Chủng Tộc" value={characterData.race} onChange={handleDataChange}><option>Nhân Tộc</option><option>Yêu Tộc</option><option>Ma Tộc</option><option>Linh Tộc</option></SelectField></div>

                <div className="mt-6 pt-6 border-t border-gray-700/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <InputField id="age" name="age" type="number" label="Tuổi" value={ageFromStore} onChange={handleAgeChange} placeholder="Ví dụ: 18" />
                         <InputField id="maxThoNguyen" name="maxThoNguyen" type="number" label="Thọ Nguyên Tối Đa" value={characterData.maxThoNguyen || ''} onChange={handleMaxThoNguyenChange} placeholder="Ví dụ: 120" />
                    </div>
                </div>
            </div>
            <hr className="border-gray-700/60" />
            <div>
                <div className="space-y-6">
                    <div>
                        <SelectField id="objective" name="objective" label="Mục Tiêu" value={finalObjectiveValue} onChange={handleObjectiveChange}>
                            {OBJECTIVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            <option value="Tùy Chỉnh...">Tùy Chỉnh...</option>
                        </SelectField>
                        {finalObjectiveValue === 'Tùy Chỉnh...' && (<div className="mt-4 animate-fade-in"><InputField id="customObjective" name="customObjective" label="Mục Tiêu Tùy Chỉnh" value={characterData.objective} onChange={handleCustomObjectiveChange} placeholder="Nhập mục tiêu của bạn..." required/></div>)}
                    </div>
                    <TextAreaField id="personality" name="personality" label="Tính Cách (Tùy chọn)" value={characterData.personality} onChange={handleDataChange} placeholder="Ví dụ: Lạnh lùng, quyết đoán, trọng tình nghĩa..."/>
                    <TextAreaField id="biography" name="biography" label="Tiểu Sử (Tùy chọn)" value={characterData.biography} onChange={handleDataChange} placeholder="Ví dụ: Là cô nhi được tán tu nuôi lớn..."/>
                </div>
            </div>
            <hr className="border-gray-700/60" />
            
            <div>
                 <div className="space-y-8">
                     {/* Linh Căn - Always visible */}
                    <AiGeneratorCard title="Linh Căn (Bắt buộc)" buttonText="Gợi Ý Linh Căn" onGenerate={handleFetchSpiritualRoots} isLoading={isFetchingSpiritualRoots} items={spiritualRoots} selectedItem={selectedSpiritualRootAsTalent} onSelect={handleSelectSpiritualRoot} itemTypeClass="bg-blue-600 hover:bg-blue-500">
                        <InputField id="linhCan" name="linhCan" label="Tên Linh Căn Tùy Chỉnh" value={characterData.linhCan || ''} onChange={handleCustomLinhCanChange} placeholder="Ví dụ: Hỗn Độn Linh Căn" required />
                    </AiGeneratorCard>
                </div>
            </div>

            <hr className="border-gray-700/60" />

            <div>
                <SelectField id="startingBonusType" name="startingBonusType" label="Chọn Vận Mệnh Khởi Đầu" value={startingBonusType} onChange={handleStartingBonusTypeChange}>
                    <option value="talent">Thiên Phú Bẩm Sinh</option>
                    <option value="specialPhysique">Thể Chất Đặc Biệt</option>
                </SelectField>

                <div className="mt-8 space-y-8">
                    {startingBonusType === 'talent' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                 <AiGeneratorCard buttonText="Gợi Ý Thiên Phú" onGenerate={handleFetchTalents} isLoading={isFetchingTalents} items={talents} selectedItem={characterData.talent} onSelect={handleSelectTalent} itemTypeClass="bg-purple-600 hover:bg-purple-500">
                                    <fieldset>
                                        <legend className="block mb-2 text-sm font-medium text-gray-300">Tự Tạo Thiên Phú</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField name="name" id="customTalentName" label="Tên" value={characterData.talent?.name || ''} onChange={handleCustomTalentChange} placeholder="Ví dụ: Bất Diệt Kim Thân"/>
                                            <InputField name="description" id="customTalentDesc" label="Mô Tả" value={characterData.talent?.description || ''} onChange={handleCustomTalentChange} placeholder="Ví dụ: Khả năng hồi phục vết thương cực nhanh."/>
                                        </div>
                                    </fieldset>
                                </AiGeneratorCard>
                            </div>
                        </div>
                    )}
                    
                    {startingBonusType === 'specialPhysique' && (
                         <div className="space-y-4 animate-fade-in">
                            <AiGeneratorCard title="Thể Chất Đặc Biệt" buttonText="Gợi Ý Thể Chất" onGenerate={handleFetchSpecialPhysiques} isLoading={isFetchingSpecialPhysiques} items={specialPhysiques} selectedItem={selectedSpecialPhysiqueAsTalent} onSelect={handleSelectSpecialPhysique} itemTypeClass="bg-teal-600 hover:bg-teal-500">
                                 <fieldset>
                                    <legend className="block mb-2 text-sm font-medium text-gray-300">Tự Tạo Thể Chất</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField id="theChatName" name="name" label="Tên" value={characterData.theChat?.name || ''} onChange={handleCustomTheChatChange} placeholder="Ví dụ: Thái Âm Thần Thể"/>
                                        <InputField id="theChatDesc" name="description" label="Mô Tả" value={characterData.theChat?.description || ''} onChange={handleCustomTheChatChange} placeholder="Mô tả ngắn về thể chất..."/>
                                    </div>
                                </fieldset>
                            </AiGeneratorCard>
                        </div>
                    )}
                </div>
            </div>
            
            <hr className="border-gray-700/60" />
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="currencyName" name="currencyName" label="Tên Đơn Vị Tiền Tệ" value={worldData.currencyName} onChange={handleWorldDataChange} placeholder="Ví dụ: Linh Thạch"/>
                    <InputField id="startingCurrency" name="startingCurrency" type="number" label="Số Tiền Khởi Đầu" value={worldData.startingCurrency || ''} onChange={handleWorldDataChange} />
                </div>
            </div>
        </div>
    );
};

export default CharacterAndStoryTab;