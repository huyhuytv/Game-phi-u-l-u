import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { AnyItem, ItemCategory } from '../../core/types';
import Accordion from '../../components/ui/Accordion';
import ItemCard from './ItemCard';

const ITEM_CATEGORY_ORDER: ItemCategory[] = [
    'Equipment', 
    'Potion', 
    'CongPhap', 
    'LinhKi',
    'ProfessionSkillBook',
    'ProfessionTool',
    'Material', 
    'QuestItem', 
    'Miscellaneous'
];

const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
    Equipment: 'Trang Bị',
    Potion: 'Đan Dược',
    Material: 'Nguyên Liệu',
    QuestItem: 'Vật Phẩm Nhiệm Vụ',
    Miscellaneous: 'Linh Tinh',
    CongPhap: 'Sách Công Pháp',
    LinhKi: 'Sách Linh Kĩ',
    ProfessionSkillBook: 'Sách Nghề',
    ProfessionTool: 'Dụng Cụ Nghề',
};


const InventoryPanel: React.FC = () => {
    const inventory = useGameStore((state) => state.player.inventory);
    
    const groupedItems = inventory.reduce((acc, item) => {
        const category = item.category || 'Miscellaneous';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<ItemCategory, AnyItem[]>);


    return (
        <div className="h-full overflow-y-auto space-y-4 pr-2">
            {inventory.length === 0 ? (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 italic text-lg">Túi đồ của bạn trống rỗng.</p>
                </div>
            ) : (
                ITEM_CATEGORY_ORDER.map(category => {
                    const itemsInCategory = groupedItems[category];
                    if (!itemsInCategory || itemsInCategory.length === 0) {
                        return null;
                    }
                    return (
                        <Accordion key={category} title={ITEM_CATEGORY_LABELS[category]} count={itemsInCategory.length}>
                             <div className="grid grid-cols-1 gap-3">
                                {itemsInCategory.map(item => <ItemCard key={item.id} item={item} />)}
                            </div>
                        </Accordion>
                    );
                })
            )}
        </div>
    );
};

export default InventoryPanel;
