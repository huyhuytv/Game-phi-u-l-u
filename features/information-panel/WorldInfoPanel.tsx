
import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { StartingFactorCategory, StartingFactorItem, RealmState } from '../../core/types';
import EntityDetailModal from './modals/EntityDetailModal';
import SectionHeader from '../../components/ui/SectionHeader';

type WorldInfoCategory = Exclude<StartingFactorCategory, 'skills' | 'items' | 'wives' | 'slaves' | 'prisoners'>;

const CATEGORY_CONFIG: Record<WorldInfoCategory, { label: string }> = {
    npcs: { label: 'Nhân Vật Đã Gặp' },
    factions: { label: 'Phe Phái Đã Biết' },
    beasts: { label: 'Yêu Thú Đã Gặp' },
    locations: { label: 'Địa Điểm Đặc Biệt' },
    lore: { label: 'Tri Thức Về Thế Giới' },
};

const WorldInfoPanel: React.FC = () => {
    const { startingFactors } = useGameStore(state => ({
        startingFactors: state.startingFactors
    }));
    const [selectedEntity, setSelectedEntity] = useState<{ item: StartingFactorItem, category: WorldInfoCategory } | null>(null);

    if (!startingFactors) {
        return <div className="text-center text-gray-500">Không có dữ liệu thế giới.</div>;
    }

    const categoriesWithItems = Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => ({
        key: key as WorldInfoCategory,
        label: label,
        items: startingFactors[key as WorldInfoCategory] ?? []
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                {categoriesWithItems.length > 0 ? (
                    categoriesWithItems.map(({ key: category, label, items }) => (
                        <div key={category}>
                            <SectionHeader title={`${label} (${items.length})`} />
                            <div className="space-y-2">
                                {items.map((item) => {
                                    const name = 'title' in item ? item.title : item.name;
                                    const subtext = 'realm' in item ? (typeof item.realm === 'string' ? item.realm : (item.realm as RealmState)?.displayName) : ('alignment' in item ? item.alignment : null);
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedEntity({ item, category })}
                                            className="w-full text-left p-3 bg-gray-900/50 hover:bg-gray-800/70 rounded-lg border border-gray-700/60 transition-colors animate-fade-in"
                                        >
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-cyan-300">{name}</h4>
                                                {subtext && <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">{subtext}</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-center mt-8">Chưa có thông tin nào được ghi nhận trong thế giới này.</p>
                )}
            </div>

            {selectedEntity && (
                 <EntityDetailModal
                    isOpen={!!selectedEntity}
                    onClose={() => setSelectedEntity(null)}
                    item={selectedEntity.item}
                    category={selectedEntity.category}
                />
            )}
        </div>
    );
};

export default WorldInfoPanel;
