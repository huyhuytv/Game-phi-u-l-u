import React, { useState, useRef, useEffect } from 'react';
import { useCharacterCreationStore } from './characterCreationStore';
import { AIStyle, WorldData } from '../../core/types';
import SectionHeader from '../../components/ui/SectionHeader';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextAreaField from '../../components/ui/TextAreaField';
import Button from '../../components/ui/Button';
import { useToastStore } from '../../store/useToastStore';
import CheckboxField from '../../components/ui/CheckboxField';
import DefaultRealmDetailsModal from './modals/DefaultRealmDetailsModal';

const AiStyleSimulator = ({ value, onChange }: { value: AIStyle, onChange: (style: AIStyle) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onChange({ type: 'upload', content: text, fileName: file.name });
            };
            reader.readAsText(file);
        } else {
            useToastStore.getState().addToast("Vui lòng chỉ chọn tệp văn bản (.txt)", "error");
        }
    };
    
    useEffect(() => {
        let currentStatus = '';
        if (value.type === 'upload' && value.fileName) {
            currentStatus = `Đã tải lên tệp: ${value.fileName}`;
        } else if (value.type === 'paste' && value.content) {
            currentStatus = `Đã dán ${value.content.length.toLocaleString()} ký tự.`;
        } else if (value.type === 'default' && value.content) {
            currentStatus = `Đã thêm ${value.content.length.toLocaleString()} ký tự tùy chỉnh.`;
        }
        
        if(currentStatus) {
            setStatus(currentStatus + ' ✓');
        } else {
            setStatus('');
        }
    }, [value]);

    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/80 space-y-4">
            <SelectField
                id="aiStyleType"
                label="Mô Phỏng Văn Phong AI"
                name="type"
                value={value.type}
                onChange={(e) => {
                    const newType = e.target.value as 'default' | 'paste' | 'upload';
                    if (value.type !== newType) {
                        // Reset content/file when switching types to avoid stale data
                        onChange({ type: newType, content: '', fileName: '' });
                    }
                }}
            >
                <option value="default">Mặc Định (Tùy chỉnh)</option>
                <option value="paste">Dán Văn Bản</option>
                <option value="upload">Tải Tệp Lên</option>
            </SelectField>

            {value.type === 'default' && (
                <div className="animate-fade-in">
                    <TextAreaField id="aiStyleDefault" label="Tùy Chỉnh Văn Phong Mặc Định" name="content"
                        value={value.content}
                        onChange={(e) => onChange({ ...value, content: e.target.value })}
                        placeholder="Nhập các quy tắc văn phong BỔ SUNG hoặc THAY THẾ tại đây. Nếu để trống, AI sẽ dùng văn phong mặc định của game."
                        rows={8}
                    />
                </div>
            )}
            
            {value.type === 'paste' && (
                <div className="animate-fade-in">
                    <TextAreaField id="aiStylePaste" label="Dán văn bản mẫu tại đây" name="content"
                        value={value.content}
                        onChange={(e) => onChange({ ...value, content: e.target.value })}
                        placeholder="Dán một đoạn văn bản (truyện, thơ,...) mà bạn muốn AI mô phỏng. Để có kết quả tốt nhất, văn bản nên dài..."
                        rows={8}
                    />
                </div>
            )}
            {value.type === 'upload' && (
                <div className="animate-fade-in text-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="hidden" />
                    <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-500">
                        Chọn Tệp Văn Bản (.txt)
                    </Button>
                </div>
            )}
             {status && <p className="mt-3 text-sm text-center text-green-400 animate-fade-in">{status}</p>}
        </div>
    );
};


const WorldSetupTab: React.FC = () => {
    const { 
        worldData, updateWorldData, status, generateWorld,
    } = useCharacterCreationStore();
    const [storyIdea, setStoryIdea] = useState('');
    const [isRealmDetailsModalOpen, setIsRealmDetailsModalOpen] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            updateWorldData({ [name]: (e.target as HTMLInputElement).checked });
            return;
        }

        if (name === 'cultivationSystemType') {
            const newType = value as WorldData['cultivationSystemType'];
            const updates: Partial<WorldData> = { cultivationSystemType: newType };
            // When switching away from user_defined, clear the custom system to avoid confusion.
            if (newType !== 'user_defined') {
                updates.cultivationSystem = [];
            }
            updateWorldData(updates);
        } else if (name === 'adultContentDescriptionStyle') {
            const updates: Partial<WorldData> = { adultContentDescriptionStyle: value as any };
            if (value !== 'Văn Bản Mẫu') {
                updates.adultContentExample = ''; // Clear example when switching away
            }
            updateWorldData(updates);
        } else {
            updateWorldData({ [name]: type === 'number' ? Number(value) : value });
        }
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) return;

        updateWorldData({
            startingDate: {
                ...worldData.startingDate,
                [name]: numValue,
            },
        });
    };

    const handleCustomSystemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const systemArray = e.target.value.split('-').map(s => s.trim()).filter(Boolean);
        updateWorldData({ cultivationSystem: systemArray });
    };

    const handleStyleChange = (aiStyle: AIStyle) => updateWorldData({ aiStyle });

    const handleGenerateClick = () => {
        if (!storyIdea.trim()) {
            useToastStore.getState().addToast("Vui lòng nhập ý tưởng cốt truyện!", "error");
            return;
        }
        generateWorld(storyIdea);
    }
    
    const isGeneratingWorld = status === 'generatingWorld';

    return (
        <div className="space-y-8 animate-fade-in">
             <div>
                <SectionHeader title="Tạo Thế Giới Bằng AI" />
                <div className="p-4 bg-gray-900/40 rounded-lg border border-yellow-700/40 space-y-4">
                    <TextAreaField
                        id="storyIdea"
                        label="Ý Tưởng Cốt Truyện"
                        value={storyIdea}
                        onChange={(e) => setStoryIdea(e.target.value)}
                        placeholder="Nhập một ý tưởng ngắn gọn về thế giới bạn muốn tạo, ví dụ: 'Một thế giới tu tiên rộng lớn và cổ xưa', hoặc 'Ma đạo trỗi dậy, chính đạo suy vong'..."
                        rows={3}
                    />
                     <Button
                        type="button"
                        onClick={handleGenerateClick}
                        isLoading={isGeneratingWorld}
                        disabled={!storyIdea.trim()}
                        loadingText="Đang tạo..."
                        className="w-full justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105"
                    >
                       Để AI Tạo Thế Giới
                    </Button>
                </div>
            </div>

            <hr className="border-gray-700/60" />

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="storyName" name="storyName" label="Tên Câu Chuyện" value={worldData.storyName} onChange={handleChange} placeholder="Ví dụ: Phàm Nhân Bất Tử"/>
                    <SelectField id="genre" name="genre" label="Thể Loại Thế Giới" value={worldData.genre} onChange={handleChange}>
                        <option>Tu Tiên (Mặc định)</option><option>Kiếm Hiệp</option><option>Huyền Huyễn</option><option>Dị Giới</option><option>Khoa Huyễn</option><option>Đô Thị</option>
                    </SelectField>
                </div>
                
                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <InputField id="startingDay" name="day" type="number" label="Ngày Bắt Đầu" value={worldData.startingDate.day || ''} onChange={handleDateChange} min="1" max="30" />
                    <InputField id="startingMonth" name="month" type="number" label="Tháng Bắt Đầu" value={worldData.startingDate.month || ''} onChange={handleDateChange} min="1" max="12" />
                    <InputField id="startingYear" name="year" type="number" label="Năm Bắt Đầu" value={worldData.startingDate.year || ''} onChange={handleDateChange} min="1" />
                </div>

                 <div className="mt-6">
                    <SelectField id="difficulty" name="difficulty" label="Độ Khó Game" value={worldData.difficulty} onChange={handleChange}>
                        <option>Dễ</option>
                        <option>Thường</option>
                        <option>Khó</option>
                        <option>Ác Mộng</option>
                    </SelectField>
                </div>
            </div>
            
            <hr className="border-gray-700/60" />
            
            <div>
                <div className="space-y-6">
                    <TextAreaField id="theme" name="theme" label="Chủ Đề Chính" value={worldData.theme} onChange={handleChange} placeholder="Ví dụ: Một thế giới nơi linh khí đang dần cạn kiệt, các môn phái tranh giành tài nguyên cuối cùng." />
                    <TextAreaField id="context" name="context" label="Bối Cảnh Chi Tiết" value={worldData.context} onChange={handleChange} placeholder="Mô tả về các quốc gia, phe phái, lịch sử, các quy tắc đặc biệt của thế giới..." rows={5} />
                    <AiStyleSimulator value={worldData.aiStyle} onChange={handleStyleChange} />
                    
                    <div className="space-y-4 p-4 border border-gray-700/60 rounded-lg bg-gray-900/20">
                         <CheckboxField 
                            id="isAdultContentEnabled" 
                            name="isAdultContentEnabled" 
                            label="Bật Chế Độ Nội Dung Người Lớn (18+)"
                            checked={worldData.isAdultContentEnabled}
                            onChange={handleChange}
                            aria-controls="adult-content-settings"
                            aria-expanded={worldData.isAdultContentEnabled}
                        />
                        {worldData.isAdultContentEnabled && (
                             <div id="adult-content-settings" className="pl-6 animate-fade-in space-y-4 mt-4 border-l-2 border-yellow-500/30">
                                <SelectField id="adultContentDescriptionStyle" name="adultContentDescriptionStyle" label="Phong Cách Miêu Tả Tình Dục" value={worldData.adultContentDescriptionStyle} onChange={handleChange}>
                                    <option>Hoa Mỹ</option>
                                    <option>Mạnh Bạo (BDSM)</option>
                                    <option>Văn Bản Mẫu</option>
                                </SelectField>
                                <SelectField id="violenceLevel" name="violenceLevel" label="Mức Độ Bạo Lực" value={worldData.violenceLevel} onChange={handleChange}>
                                    <option>Ẩn Dụ</option>
                                    <option>Thực Tế</option>
                                    <option>Tàn Bạo</option>
                                </SelectField>
                                {worldData.adultContentDescriptionStyle === 'Văn Bản Mẫu' && (
                                    <TextAreaField
                                        id="adultContentExample"
                                        name="adultContentExample"
                                        label="Dán Văn Bản Mẫu (18+)"
                                        value={worldData.adultContentExample || ''}
                                        onChange={handleChange}
                                        placeholder="Dán một đoạn văn bản 18+ mà bạn muốn AI mô phỏng văn phong..."
                                        rows={6}
                                        className="animate-fade-in"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className="border-gray-700/60" />

            <div>
                <div className="space-y-4 p-4 border border-gray-700/60 rounded-lg bg-gray-900/20">
                    <CheckboxField 
                        id="isCultivationEnabled" 
                        name="isCultivationEnabled" 
                        label="Bật Hệ Thống Tu Luyện/Sức Mạnh Đặc Thù"
                        checked={worldData.isCultivationEnabled}
                        onChange={handleChange}
                    />
                    {worldData.isCultivationEnabled && (
                        <div className="pl-6 animate-fade-in space-y-4 pt-4 mt-4 border-t border-gray-700/40">
                             <div>
                                <div className="flex justify-between items-center mb-2">
                                     <label htmlFor="cultivationSystemType" className="text-sm font-medium text-gray-300">Loại Hệ Thống Tu Luyện</label>
                                     {worldData.cultivationSystemType === 'default' && (
                                         <button type="button" onClick={() => setIsRealmDetailsModalOpen(true)} className="text-sm text-yellow-400 hover:text-yellow-300 hover:underline focus:outline-none font-semibold">
                                             Xem chi tiết
                                         </button>
                                     )}
                                 </div>
                                 <SelectField 
                                    id="cultivationSystemType" 
                                    name="cultivationSystemType" 
                                    value={worldData.cultivationSystemType} 
                                    onChange={handleChange}
                                >
                                    <option value="default">Hệ Thống Mặc Định (Tu Tiên)</option>
                                    <option value="user_defined">Tùy Chỉnh</option>
                                </SelectField>
                                {worldData.cultivationSystemType === 'user_defined' && (
                                    <div className="mt-4 animate-fade-in">
                                        <TextAreaField
                                            id="customCultivationSystem"
                                            name="customCultivationSystem"
                                            label="Hệ Thống Cảnh Giới Tùy Chỉnh"
                                            value={worldData.cultivationSystem.join(' - ')}
                                            onChange={handleCustomSystemChange}
                                            placeholder="Nhập các đại cảnh giới, phân tách bằng dấu gạch ngang (-). Ví dụ: Cấp 1 - Cấp 2 - Cấp 3..."
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputField
                                id="startingRealm"
                                name="startingRealm"
                                label="Cảnh Giới Khởi Đầu"
                                value={worldData.startingRealm}
                                onChange={handleChange}
                                placeholder="Ví dụ: Luyện Khí Tầng 1"
                            />
                        </div>
                    )}
                </div>
            </div>
            <DefaultRealmDetailsModal isOpen={isRealmDetailsModalOpen} onClose={() => setIsRealmDetailsModalOpen(false)} />
        </div>
    );
};

export default WorldSetupTab;