import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { AnySkill, SkillType } from '../../core/types';
import Accordion from '../../components/ui/Accordion';
import SkillCard from './SkillCard';

const SKILL_CATEGORY_ORDER: SkillType[] = [
    'Công Pháp Tu Luyện',
    'Linh Kĩ',
    'Thần Thông',
    'Cấm Thuật',
    'Nghề Nghiệp',
    'Khác',
];

const SkillsPanel: React.FC = () => {
    const skills = useGameStore((state) => state.player.skills);

    const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || 'Khác';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
    }, {} as Record<SkillType, AnySkill[]>);
    
    return (
         <div className="h-full overflow-y-auto space-y-4 pr-2">
            {skills.length === 0 ? (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 italic text-lg">Bạn chưa học được kỹ năng nào.</p>
                </div>
            ) : (
                SKILL_CATEGORY_ORDER.map(category => {
                    const skillsInCategory = groupedSkills[category];
                    if (!skillsInCategory || skillsInCategory.length === 0) {
                        return null;
                    }
                    return (
                        <Accordion key={category} title={category} count={skillsInCategory.length}>
                             <div className="grid grid-cols-1 gap-3">
                                {skillsInCategory.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                            </div>
                        </Accordion>
                    );
                })
            )}
        </div>
    );
};

export default SkillsPanel;
