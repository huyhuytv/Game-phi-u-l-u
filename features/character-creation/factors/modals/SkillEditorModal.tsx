import React, { useState, useEffect } from 'react';
import { AnySkill, SKILL_TYPE, SkillType, CongPhapSkill, CongPhapType, CongPhapGrade, LinhKiSkill, LinhKiCategory, LinhKiActivation, CamThuatSkill, NgheNghiepSkill, ProfessionType, ProfessionGrade, WeaponFocus } from '../../../../core/types';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import InputField from '../../../../components/ui/InputField';
import SelectField from '../../../../components/ui/SelectField';
import TextAreaField from '../../../../components/ui/TextAreaField';
import { useToastStore } from '../../../../store/useToastStore';

interface SkillEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: AnySkill | null;
    onSave: (skill: AnySkill) => void;
    defaultCategory: SkillType;
}

const WEAPON_FOCUS_OPTIONS: WeaponFocus[] = ['Quyền', 'Kiếm', 'Đao', 'Thương', 'Côn', 'Cung', 'Trượng', 'Phủ', 'Chỉ', 'Trảo', 'Chưởng'];

const SkillEditorModal: React.FC<SkillEditorModalProps> = ({ isOpen, onClose, skill, onSave, defaultCategory }) => {
    
    const getInitialState = (): AnySkill => {
        if (skill) return skill;
        
        const base = { id: crypto.randomUUID(), name: '', description: '', otherEffects: '' };
        switch(defaultCategory) {
            case 'Công Pháp Tu Luyện': return { ...base, category: 'Công Pháp Tu Luyện', congPhapType: 'Khí Tu', congPhapGrade: 'Phàm Phẩm' };
            case 'Linh Kĩ': return { ...base, category: 'Linh Kĩ', linhKiCategory: 'Tấn công', linhKiActivation: 'Chủ động', manaCost: 0, cooldown: 0, baseDamage: 0, damageMultiplier: 0, baseHealing: 0, healingMultiplier: 0 };
            case 'Thần Thông': return { ...base, category: 'Thần Thông', manaCost: 0, cooldown: 0 };
            case 'Cấm Thuật': return { ...base, category: 'Cấm Thuật', sideEffects: '', manaCost: 0, cooldown: 0 };
            case 'Nghề Nghiệp': return { ...base, category: 'Nghề Nghiệp', professionType: 'Luyện Đan Sư', professionGrade: 'Nhất phẩm', skillDescription: '' };
            default: return { ...base, category: 'Khác' };
        }
    };
    
    const [formData, setFormData] = useState<AnySkill>(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, skill, defaultCategory]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' && value !== '' ? Number(value) : value;

        setFormData(prev => {
            // If category changes, we must return a completely new, correctly typed object.
            if (name === 'category') {
                const newCategory = value as SkillType;
                // Common properties from the previous state
                const baseProps = { id: prev.id, name: prev.name, description: prev.description, otherEffects: prev.otherEffects ?? '' };
                
                switch(newCategory) {
                    case 'Công Pháp Tu Luyện': 
                        return { ...baseProps, category: 'Công Pháp Tu Luyện', congPhapType: 'Khí Tu', congPhapGrade: 'Phàm Phẩm' };
                    case 'Linh Kĩ': 
                        return { ...baseProps, category: 'Linh Kĩ', linhKiCategory: 'Tấn công', linhKiActivation: 'Chủ động', manaCost: 0, cooldown: 0, baseDamage: 0, damageMultiplier: 0, baseHealing: 0, healingMultiplier: 0 };
                    case 'Thần Thông': 
                        return { ...baseProps, category: 'Thần Thông', manaCost: 0, cooldown: 0 };
                    case 'Cấm Thuật': 
                        return { ...baseProps, category: 'Cấm Thuật', sideEffects: '', manaCost: 0, cooldown: 0 };
                    case 'Nghề Nghiệp': 
                        return { ...baseProps, category: 'Nghề Nghiệp', professionType: 'Luyện Đan Sư', professionGrade: 'Nhất phẩm', skillDescription: '' };
                    default: 
                        return { ...baseProps, category: 'Khác' };
                }
            }
            
            // For all other property changes, just update the existing state.
            return { ...prev, [name]: finalValue };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            useToastStore.getState().addToast('Tên Kỹ Năng không được để trống.', 'error');
            return;
        }
        onSave(formData);
    };

    const title = `${skill ? 'Chỉnh Sửa' : 'Thêm Mới'} Kỹ Năng`;
    
    const showCombatStats = formData.category === 'Linh Kĩ' || formData.category === 'Thần Thông' || formData.category === 'Cấm Thuật';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField name="name" label="Tên Kỹ Năng" value={formData.name} onChange={handleChange} placeholder="Ví dụ: Thái Ất Chân Kinh" />
                <TextAreaField name="description" label="Mô Tả Kỹ Năng" value={formData.description} onChange={handleChange} placeholder="Mô tả công dụng, lai lịch của kỹ năng..." />
                
                <SelectField name="category" label="Loại Kỹ Năng" value={formData.category} onChange={handleChange}>
                    {Object.values(SKILL_TYPE).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </SelectField>

                {formData.category === 'Công Pháp Tu Luyện' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField name="congPhapType" label="Loại Công Pháp" value={(formData as CongPhapSkill).congPhapType} onChange={handleChange}>
                                {(['Khí Tu', 'Thể Tu', 'Võ Ý', 'Hồn Tu', 'Thôn Phệ', 'Song Tu', 'Cổ Tu', 'Âm Tu'] as CongPhapType[]).map(t => <option key={t} value={t}>{t}</option>)}
                            </SelectField>
                            <SelectField name="congPhapGrade" label="Phẩm Chất Công Pháp" value={(formData as CongPhapSkill).congPhapGrade} onChange={handleChange}>
                                {(['Phàm Phẩm', 'Hoàng Phẩm', 'Huyền Phẩm', 'Địa Phẩm', 'Thiên Phẩm', 'Tiên Phẩm', 'Chưa xác định'] as CongPhapGrade[]).map(q => <option key={q} value={q}>{q}</option>)}
                            </SelectField>
                        </div>

                        {(formData as CongPhapSkill).congPhapType === 'Võ Ý' && (
                             <div className="animate-fade-in mt-4">
                                <SelectField name="weaponFocus" label="Chuyên Về Vũ Khí" value={(formData as CongPhapSkill).weaponFocus || ''} onChange={handleChange}>
                                     <option value="">Không chuyên</option>
                                     {WEAPON_FOCUS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                             </div>
                        )}

                        <TextAreaField name="otherEffects" label="Hiệu Ứng Đặc Biệt (Công Pháp)" value={(formData as CongPhapSkill).otherEffects ?? ''} onChange={handleChange} placeholder="Ví dụ: Tăng tốc độ tu luyện ban đêm; Củng cố kinh mạch" rows={2}/>
                    </div>
                )}

                {formData.category === 'Linh Kĩ' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField name="linhKiCategory" label="Phân Loại Linh Kĩ" value={(formData as LinhKiSkill).linhKiCategory} onChange={handleChange}>
                                {(['Tấn công', 'Phòng thủ', 'Hồi phục', 'Thân pháp', 'Khác'] as LinhKiCategory[]).map(t => <option key={t} value={t}>{t}</option>)}
                            </SelectField>
                            <SelectField name="linhKiActivation" label="Loại Kích Hoạt" value={(formData as LinhKiSkill).linhKiActivation} onChange={handleChange}>
                                {(['Chủ động', 'Bị động'] as LinhKiActivation[]).map(t => <option key={t} value={t}>{t}</option>)}
                            </SelectField>
                        </div>
                        {(formData as LinhKiSkill).linhKiActivation === 'Chủ động' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <InputField type="number" step="any" name="baseDamage" label="Sát thương cơ bản" value={(formData as any).baseDamage || ''} onChange={handleChange} placeholder="Để trống nếu không có" />
                                <InputField type="number" step="any" name="baseHealing" label="Hồi phục cơ bản" value={(formData as any).baseHealing || ''} onChange={handleChange} placeholder="Để trống nếu không có" />
                                <InputField type="number" step="0.01" name="damageMultiplier" label="Sát thương theo % ATK" value={(formData as any).damageMultiplier || ''} onChange={handleChange} placeholder="Ví dụ: 0.5 (cho 50%)" />
                                <InputField type="number" step="0.01" name="healingMultiplier" label="Hồi phục theo % ATK" value={(formData as any).healingMultiplier || ''} onChange={handleChange} placeholder="Ví dụ: 0.2 (cho 20%)" />
                            </div>
                        )}
                    </div>
                )}
                
                {formData.category === 'Cấm Thuật' && (
                    <div className="space-y-4 pt-4 border-t border-gray-700/60">
                        <TextAreaField name="sideEffects" label="Tác Dụng Phụ (Cấm Thuật)" value={(formData as CamThuatSkill).sideEffects} onChange={handleChange} placeholder="Ví dụ: Giảm 100 năm tuổi thọ sau khi dùng." rows={2}/>
                    </div>
                )}
                 
                {formData.category === 'Nghề Nghiệp' && (
                     <div className="space-y-4 pt-4 border-t border-gray-700/60">
                        <SelectField name="professionType" label="Loại Nghề" value={(formData as NgheNghiepSkill).professionType} onChange={handleChange}>
                             {(['Luyện Đan Sư', 'Luyện Khí Sư', 'Luyện Phù Sư', 'Trận Pháp Sư', 'Khôi Lỗi Sư', 'Ngự Thú Sư', 'Linh Thảo Sư', 'Thiên Cơ Sư', 'Độc Sư', 'Linh Trù', 'Họa Sư'] as ProfessionType[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectField>
                        <SelectField name="professionGrade" label="Cấp Bậc Nghề" value={(formData as NgheNghiepSkill).professionGrade} onChange={handleChange}>
                             {(['Nhất phẩm', 'Nhị phẩm', 'Tam phẩm', 'Tứ phẩm', 'Ngũ phẩm', 'Lục phẩm', 'Thất phẩm', 'Bát phẩm', 'Cửu phẩm'] as ProfessionGrade[]).map(q => <option key={q} value={q}>{q}</option>)}
                        </SelectField>
                        <TextAreaField name="skillDescription" label="Mô Tả Kỹ Năng Nghề" value={(formData as NgheNghiepSkill).skillDescription} onChange={handleChange} placeholder="Mô tả kỹ năng nghề này có thể làm gì." rows={2}/>
                    </div>
                )}

                {showCombatStats && ((formData as LinhKiSkill).linhKiActivation !== 'Bị động') && (
                    <div className="space-y-4 pt-4 border-t border-gray-700/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField type="number" step="1" name="manaCost" label="Linh lực tiêu hao" value={(formData as any).manaCost || ''} onChange={handleChange} placeholder="Để trống nếu không có" />
                            <InputField type="number" step="1" name="cooldown" label="Hồi chiêu (lượt)" value={(formData as any).cooldown || ''} onChange={handleChange} placeholder="Để trống nếu không có" />
                        </div>
                    </div>
                )}

                <TextAreaField name="otherEffects" label="Hiệu ứng đặc biệt khác" value={(formData as any).otherEffects} onChange={handleChange} placeholder="Ví dụ: Gây hiệu ứng Thiêu Đốt trong 2 lượt." rows={2}/>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-600">
                    <Button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500">Hủy</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-500">Lưu Lại</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SkillEditorModal;