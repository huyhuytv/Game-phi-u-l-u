import React, { useState } from 'react';
import { useCharacterCreationStore } from '../characterCreationStore';
import { AnySkill, SKILL_TYPE, SkillType } from '../../../core/types';
import Accordion from '../../../components/ui/Accordion';
import Button from '../../../components/ui/Button';
import SkillEditorModal from './modals/SkillEditorModal';

const SkillsManager: React.FC = () => {
    const { startingFactors, updateSingleFactorCategory } = useCharacterCreationStore();
    const skills = startingFactors.skills;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<AnySkill | null>(null);
    const [categoryForNewSkill, setCategoryForNewSkill] = useState<SkillType>('Công Pháp Tu Luyện');

    const updateSkills = (newSkills: AnySkill[]) => {
        updateSingleFactorCategory('skills', newSkills);
    };

    const handleAddNew = (category: SkillType) => {
        setEditingSkill(null);
        setCategoryForNewSkill(category);
        setIsModalOpen(true);
    };

    const handleEdit = (skill: AnySkill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        updateSkills(skills.filter(s => s.id !== id));
    };

    const handleSave = (skillToSave: AnySkill) => {
        const existingIndex = skills.findIndex(s => s.id === skillToSave.id);
        const newSkills = [...skills];
        if (existingIndex > -1) {
            newSkills[existingIndex] = skillToSave;
        } else {
            newSkills.push(skillToSave);
        }
        updateSkills(newSkills);
        setIsModalOpen(false);
        setEditingSkill(null);
    };
    
    return (
        <>
            <Accordion title="Kỹ Năng Khởi Đầu" count={skills.length}>
                <div className="space-y-3">
                    {Object.values(SKILL_TYPE).map((category) => {
                        const skillsInCategory = skills.filter(s => s.category === category);
                        return (
                            <div key={category} className="p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-300">{category} ({skillsInCategory.length})</h4>
                                    <Button onClick={() => handleAddNew(category)} className="bg-green-600 hover:bg-green-500 text-xs px-3 py-1">+ Thêm</Button>
                                </div>
                                {skillsInCategory.length > 0 && (
                                    <div className="space-y-2 border-t border-gray-700/50 pt-2">
                                        {skillsInCategory.map(skill => (
                                            <div key={skill.id} className="flex justify-between items-center text-sm p-2 bg-gray-900/50 rounded">
                                                <span>{skill.name}</span>
                                                <div className="space-x-2">
                                                    <button onClick={() => handleEdit(skill)} className="text-blue-400 hover:text-blue-300 font-semibold">Sửa</button>
                                                    <button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300 font-semibold">Xóa</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Accordion>
            
            <SkillEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                skill={editingSkill}
                onSave={handleSave}
                defaultCategory={categoryForNewSkill}
            />
        </>
    );
};

export default SkillsManager;