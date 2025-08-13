import React from 'react';
import SectionHeader from '../../components/ui/SectionHeader';
import SkillsManager from './factors/SkillsManager';
import FactorManager from './factors/FactorManager';
import { StartingFactorCategory } from '../../core/types';

const factorCategories: Exclude<StartingFactorCategory, 'skills' | 'wives' | 'slaves' | 'prisoners'>[] = [
    'items',
    'npcs',
    'beasts',
    'lore',
    'locations',
    'factions',
];

const StartingFactorsTab: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <SectionHeader title="Yếu Tố Ban Đầu" />
            <p className="text-gray-400 -mt-4 mb-4">
                Thêm hoặc chỉnh sửa các yếu tố khởi đầu để AI tạo ra một câu chuyện phong phú và có chiều sâu hơn. (Tùy chọn)
            </p>
            
            <div className="space-y-4">
                <SkillsManager />
                {factorCategories.map(category => (
                    <FactorManager key={category} category={category} />
                ))}
            </div>
        </div>
    );
};

export default StartingFactorsTab;