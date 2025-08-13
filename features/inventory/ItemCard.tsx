import React from 'react';
import { AnyItem, EquipmentItem, PotionItem, ItemRarity } from '../../core/types';

const RARITY_CLASSES: Record<ItemRarity, string> = {
    'Phổ Thông': 'border-gray-500 text-gray-300',
    'Hiếm': 'border-blue-500 text-blue-300',
    'Quý Báu': 'border-purple-500 text-purple-300',
    'Cực Phẩm': 'border-yellow-500 text-yellow-300',
    'Thần Thoại': 'border-orange-500 text-orange-300',
    'Chí Tôn': 'border-red-500 text-red-300',
};

const StatBonus: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="text-sm">
        <span className="text-green-400">{label}: </span>
        <span className="text-white font-semibold">{value}</span>
    </div>
);

const ItemCard: React.FC<{ item: AnyItem }> = ({ item }) => {
    const rarityClass = RARITY_CLASSES[item.rarity] || RARITY_CLASSES['Phổ Thông'];

    const renderStatBonuses = (jsonString: string) => {
        try {
            const bonuses = JSON.parse(jsonString);
            const entries = Object.entries(bonuses);
            if (entries.length === 0) return null;

            return (
                <div className="mt-2 space-y-1">
                    {entries.map(([key, value]) => <StatBonus key={key} label={key} value={String(value)} />)}
                </div>
            );
        } catch (e) {
            return <p className="text-xs text-red-400 mt-1">Lỗi hiển thị chỉ số.</p>;
        }
    };
    
    const renderEffectsList = (effects: string) => {
        if (!effects || effects === "Không có gì đặc biệt") return null;
        return (
            <div className="mt-2 space-y-1">
                {effects.split(';').map((effect, index) => (
                    <div key={index} className="text-sm text-cyan-300 italic">
                       - {effect.trim()}
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className={`p-3 bg-gray-900/50 rounded-lg border-l-4 ${rarityClass} shadow-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className={`font-bold text-lg ${rarityClass.split(' ')[1]}`}>{item.name}</h4>
                    <p className="text-xs text-gray-400">
                        {item.itemRealm} - {item.rarity}
                    </p>
                </div>
                {item.quantity > 1 && <span className="text-lg font-bold text-gray-300">x{item.quantity}</span>}
            </div>
            
            <p className="text-sm text-gray-300 mt-2">{item.description}</p>
            
            {item.category === 'Equipment' && renderStatBonuses((item as EquipmentItem).statBonusesJSON)}
            {item.category === 'Equipment' && renderEffectsList((item as EquipmentItem).uniqueEffectsList)}
            {item.category === 'Potion' && renderEffectsList((item as PotionItem).effectsList)}

        </div>
    );
};

export default ItemCard;
