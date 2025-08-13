
import React, { useState } from 'react';
import { useCharacterCreationStore } from '../characterCreationStore';
import { generateFactorSuggestions } from '../../../core/services/geminiService';
import { StartingFactorCategory, StartingFactorItem, Talent, AnyItem, NPC, Beast, Lore, Location, Faction } from '../../../core/types';
import Accordion from '../../../components/ui/Accordion';
import Button from '../../../components/ui/Button';
import FactorEditorModal from './modals/FactorEditorModal';
import { useToastStore } from '../../../store/useToastStore';

const FACTOR_CATEGORIES_INFO: Record<Exclude<StartingFactorCategory, 'skills' | 'wives' | 'slaves' | 'prisoners'>, { label: string; suggestionPrompt: string; }> = {
    items: { label: 'Vật Phẩm', suggestionPrompt: 'Gợi Ý Vật Phẩm' },
    npcs: { label: 'NPC', suggestionPrompt: 'Gợi Ý NPC' },
    beasts: { label: 'Yêu Thú', suggestionPrompt: 'Gợi Ý Yêu Thú' },
    lore: { label: 'Tri Thức', suggestionPrompt: 'Gợi Ý Tri Thức' },
    locations: { label: 'Địa Điểm', suggestionPrompt: 'Gợi Ý Địa Điểm' },
    factions: { label: 'Phe Phái', suggestionPrompt: 'Gợi Ý Phe Phái' },
};

const FactorManager: React.FC<{ category: keyof typeof FACTOR_CATEGORIES_INFO }> = ({ category }) => {
    const { startingFactors, updateSingleFactorCategory, worldData } = useCharacterCreationStore();
    const items = startingFactors[category] as StartingFactorItem[];
    
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StartingFactorItem | null>(null);

    const categoryInfo = FACTOR_CATEGORIES_INFO[category];

    const onUpdate = (updatedItems: StartingFactorItem[]) => {
        updateSingleFactorCategory(category, updatedItems);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: StartingFactorItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        onUpdate(items.filter(item => item.id !== id));
    };

    const handleSave = (itemToSave: StartingFactorItem) => {
        const existingIndex = items.findIndex(item => item.id === itemToSave.id);
        if (existingIndex > -1) {
            const newItems = [...items];
            newItems[existingIndex] = itemToSave;
            onUpdate(newItems);
        } else {
            onUpdate([...items, itemToSave]);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    const handleGetSuggestions = async () => {
        if (!worldData.theme.trim() && !worldData.context.trim()) {
            useToastStore.getState().addToast('Vui lòng nhập Chủ Đề hoặc Bối Cảnh trong tab "Thiết Lập Thế Giới" để AI có thể đưa ra gợi ý phù hợp.', 'error');
            return;
        }
        setIsSuggesting(true);
        try {
            const fetchedSuggestions = await generateFactorSuggestions(categoryInfo.label, worldData.genre, worldData.theme || worldData.context);
            if(fetchedSuggestions[0]?.name === "Gợi Ý Thất Bại") {
                 useToastStore.getState().addToast(`Không thể tạo gợi ý cho ${categoryInfo.label}.`, 'error');
                 return;
            }
            
            const newItems = fetchedSuggestions.map(suggestion => {
                const base = { id: crypto.randomUUID() };
                switch (category) {
                    case 'npcs': return { ...base, name: suggestion.name, details: suggestion.description, gender: 'Không rõ', race: 'Nhân Tộc', personality: '', affinity: 0, realm: 'Người Thường', tuChat: 'Hạ Đẳng', spiritualRoot: 'Không có', specialPhysique: 'Không có', thoNguyen: 0, maxThoNguyen: 0, relationshipToPlayer: 'Người xa lạ' } as NPC;
                    case 'lore': return { ...base, title: suggestion.name, content: suggestion.description } as Lore;
                    default: return { ...base, name: suggestion.name, description: suggestion.description, quantity: 1, category: 'Miscellaneous', rarity: 'Phổ Thông', itemRealm: 'Phàm Nhân' } as AnyItem;
                }
            });
            onUpdate([...items, ...newItems]);
            useToastStore.getState().addToast(`Đã thêm ${newItems.length} gợi ý mới cho ${categoryInfo.label}.`, 'success');

        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <>
            <Accordion title={categoryInfo.label} count={items.length}>
                <div className="space-y-2">
                    {items.map(item => {
                         const name = 'title' in item ? item.title : ('name' in item ? item.name : 'Vật phẩm mới');
                         return (
                            <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-gray-900/50 rounded">
                                <span className="truncate pr-4">{name}</span>
                                <div className="space-x-2 flex-shrink-0">
                                    <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 font-semibold">Sửa</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 font-semibold">Xóa</button>
                                </div>
                            </div>
                         )
                    })}
                </div>
                <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-600">
                    <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-500">+ Thêm Mới</Button>
                    <Button onClick={handleGetSuggestions} isLoading={isSuggesting} loadingText="Đang tìm..." disabled={!worldData.theme.trim() && !worldData.context.trim()} className="bg-blue-600 hover:bg-blue-500">
                       {categoryInfo.suggestionPrompt}
                    </Button>
                </div>
            </Accordion>
            <FactorEditorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                category={category}
                item={editingItem}
                onSave={handleSave}
            />
        </>
    );
};

export default FactorManager;
