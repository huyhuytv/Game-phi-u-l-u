import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import InputField from '../../../../components/ui/InputField';
import SelectField from '../../../../components/ui/SelectField';
import TextAreaField from '../../../../components/ui/TextAreaField';
import CheckboxField from '../../../../components/ui/CheckboxField';
import { AnyItem, NPC, Beast, Lore, Location, Faction, StartingFactorCategory, StartingFactorItem, ItemRarity, ItemCategory, EquipmentType, PotionType, LocationType, FactionAlignment, MaterialType, CongPhapType, ProfessionType, EquipmentSlot } from '../../../../core/types';
import { useFactorCommons } from '../useFactorCommons';
import { useCharacterCreationStore } from '../../characterCreationStore';

interface FactorEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Exclude<StartingFactorCategory, 'skills' | 'wives' | 'slaves' | 'prisoners'>;
    item: StartingFactorItem | null;
    onSave: (item: StartingFactorItem) => void;
}

const EQUIPMENT_SLOT_OPTIONS: EquipmentSlot[] = ['Vũ Khí Chính', 'Vũ Khí Phụ/Khiên', 'Giáp Đầu', 'Giáp Thân', 'Giáp Tay', 'Giáp Chân', 'Trang Sức'];


const FactorEditorModal: React.FC<FactorEditorModalProps> = ({ isOpen, onClose, category, item, onSave }) => {
    const { allRealms, allRaces } = useFactorCommons();
    const { startingFactors } = useCharacterCreationStore();

    const getInitialFormData = () => {
        if (item) return item;
        
        const base = { id: crypto.randomUUID() };
        switch (category) {
            case 'items': return { 
                ...base, name: '', description: '', quantity: 1, category: 'Miscellaneous', rarity: 'Phổ Thông', itemRealm: 'Phàm Nhân', 
                // Equipment
                equipmentType: 'Vũ Khí', statBonusesJSON: '{}', uniqueEffectsList: 'Không có gì đặc biệt', value: 0, slot: 'Vũ Khí Chính',
                // Potion
                potionType: 'Hồi Phục', effectsList: '',
                // Material
                materialType: 'Khác',
                // CongPhap
                congPhapType: 'Khí Tu', expBonusPercentage: 0,
                // LinhKi
                skillToLearnJSON: '{}',
                // ProfessionSkillBook
                professionToLearn: 'Luyện Đan Sư',
                // ProfessionTool
                professionRequired: 'Luyện Đan Sư',
            } as AnyItem;
            case 'npcs': return { ...base, name: '', gender: 'Không rõ', race: 'Nhân Tộc', personality: '', affinity: 0, details: '', realm: 'Người Thường', spiritualRoot: 'Không có', specialPhysique: 'Không có', thoNguyen: 0, maxThoNguyen: 0, relationshipToPlayer: 'Người xa lạ', factionId: '' } as NPC;
            case 'beasts': return { ...base, name: '', species: '', description: '', realm: 'Không có', isHostile: true } as Beast;
            case 'lore': return { ...base, title: '', content: '' } as Lore;
            case 'locations': return { ...base, name: '', description: '', locationType: 'Mặc định', isSafeZone: false, regionId: 'Vùng đất vô danh', mapX: 500, mapY: 500 } as Location;
            case 'factions': return { ...base, name: '', description: '', alignment: 'Trung Lập', playerReputation: 0 } as Faction;
            default: return { ...base, name: '', description: '' } as any;
        }
    };

    const [formData, setFormData] = useState<StartingFactorItem>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
        }
    }, [isOpen, item, category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : (type === 'number' && value !== '') ? Number(value) : value;
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderEditorBody = () => {
        switch (category) {
            case 'items':
                const i = formData as AnyItem;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InputField name="name" label="Tên Vật Phẩm" value={i.name} onChange={handleChange} />
                        <InputField type="number" label="Số Lượng" name="quantity" value={i.quantity} onChange={handleChange} />
                        <SelectField label="Độ Hiếm" name="rarity" value={i.rarity} onChange={handleChange}>
                            {(['Phổ Thông', 'Hiếm', 'Quý Báu', 'Cực Phẩm', 'Thần Thoại', 'Chí Tôn'] as ItemRarity[]).map(r => <option key={r} value={r}>{r}</option>)}
                        </SelectField>
                        <SelectField label="Cảnh Giới Vật Phẩm" name="itemRealm" value={i.itemRealm} onChange={handleChange}>
                            {allRealms.map(r => <option key={r} value={r}>{r}</option>)}
                        </SelectField>
                        <SelectField label="Loại" name="category" value={i.category} onChange={handleChange}>
                            {(['Equipment', 'Potion', 'Material', 'QuestItem', 'Miscellaneous', 'CongPhap', 'LinhKi', 'ProfessionSkillBook', 'ProfessionTool'] as ItemCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                        </SelectField>
                        <div className="lg:col-span-3"> <TextAreaField label="Mô Tả" name="description" value={i.description} onChange={handleChange} rows={2} /> </div>
                        {i.category === 'Equipment' && (
                             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Loại Trang Bị" name="equipmentType" value={(i as any).equipmentType} onChange={handleChange}>
                                    {(['Vũ Khí', 'Giáp Đầu', 'Giáp Thân', 'Giáp Tay', 'Giáp Chân', 'Trang Sức', 'Pháp Bảo', 'Thú Cưng'] as EquipmentType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                                <InputField type="number" label="Giá trị" name="value" value={(i as any).value || ''} onChange={handleChange} />
                                <SelectField label="Vị trí trang bị" name="slot" value={(i as any).slot} onChange={handleChange}>
                                    {EQUIPMENT_SLOT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                                <div className="md:col-span-2 lg:col-span-3"> <TextAreaField label="Chỉ Số Cộng Thêm (JSON)" name="statBonusesJSON" value={(i as any).statBonusesJSON} onChange={handleChange} rows={2} /> </div>
                                <div className="md:col-span-2 lg:col-span-3"> <TextAreaField label="Hiệu Ứng Đặc Biệt (;)" name="uniqueEffectsList" value={(i as any).uniqueEffectsList} onChange={handleChange} rows={2} /> </div>
                            </div>
                        )}
                        {i.category === 'Potion' && (
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Loại Đan Dược" name="potionType" value={(i as any).potionType} onChange={handleChange}>
                                    {(['Hồi Phục', 'Tăng Cường', 'Giải Độc', 'Đặc Biệt'] as PotionType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                                 <div className="md:col-span-2"> <TextAreaField label="Danh Sách Hiệu Ứng (;)" name="effectsList" value={(i as any).effectsList} onChange={handleChange} rows={2} /> </div>
                            </div>
                        )}
                         {i.category === 'Material' && (
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Loại Nguyên Liệu" name="materialType" value={(i as any).materialType} onChange={handleChange}>
                                    {(['Linh Thảo', 'Khoáng Thạch', 'Yêu Đan', 'Da/Xương Yêu Thú', 'Linh Hồn', 'Vật Liệu Chế Tạo Chung', 'Khác'] as MaterialType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                            </div>
                        )}
                        {i.category === 'CongPhap' && (
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Loại Công Pháp" name="congPhapType" value={(i as any).congPhapType} onChange={handleChange}>
                                    {(['Khí Tu', 'Thể Tu', 'Võ Ý', 'Hồn Tu', 'Thôn Phệ', 'Song Tu', 'Cổ Tu', 'Âm Tu'] as CongPhapType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                                <InputField type="number" label="Tăng % Kinh nghiệm" name="expBonusPercentage" value={(i as any).expBonusPercentage || ''} onChange={handleChange} />
                            </div>
                        )}
                        {i.category === 'LinhKi' && (
                            <div className="lg:col-span-3 grid grid-cols-1 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <TextAreaField label="Skill JSON để học" name="skillToLearnJSON" value={(i as any).skillToLearnJSON} onChange={handleChange} rows={4} />
                            </div>
                        )}
                        {i.category === 'ProfessionSkillBook' && (
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Nghề để học" name="professionToLearn" value={(i as any).professionToLearn} onChange={handleChange}>
                                    {(['Luyện Đan Sư', 'Luyện Khí Sư', 'Luyện Phù Sư', 'Trận Pháp Sư', 'Khôi Lỗi Sư', 'Ngự Thú Sư', 'Linh Thảo Sư', 'Thiên Cơ Sư', 'Độc Sư', 'Linh Trù', 'Họa Sư'] as ProfessionType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                            </div>
                        )}
                        {i.category === 'ProfessionTool' && (
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4 mt-2">
                                <SelectField label="Yêu cầu nghề" name="professionRequired" value={(i as any).professionRequired} onChange={handleChange}>
                                    {(['Luyện Đan Sư', 'Luyện Khí Sư', 'Luyện Phù Sư', 'Trận Pháp Sư', 'Khôi Lỗi Sư', 'Ngự Thú Sư', 'Linh Thảo Sư', 'Thiên Cơ Sư', 'Độc Sư', 'Linh Trù', 'Họa Sư'] as ProfessionType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                            </div>
                        )}
                    </div>
                );
            case 'npcs':
                const n = formData as NPC;
                const realmDisplayValue = typeof n.realm === 'string' ? n.realm : n.realm?.displayName ?? 'Không rõ';

                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InputField name="name" label="Tên NPC" value={n.name} onChange={handleChange} />
                         <SelectField name="gender" label="Giới Tính" value={n.gender} onChange={handleChange}>
                            <option>Không rõ</option><option>Nam</option><option>Nữ</option><option>Khác</option>
                        </SelectField>
                        <SelectField name="race" label="Chủng Tộc" value={n.race} onChange={handleChange}>
                            {allRaces.map(r => <option key={r} value={r}>{r}</option>)}
                        </SelectField>
                        <InputField name="realmString" label="Cảnh Giới (ví dụ: Luyện Khí Tầng 5)" defaultValue={realmDisplayValue} onChange={e => {
                            const value = e.target.value;
                            setFormData(prev => ({ ...prev, realm: value }))
                        }} placeholder="Người Thường / Cảnh giới + Tầng" />
                        <InputField name="personality" label="Tính Cách" value={n.personality} onChange={handleChange} />
                        <InputField name="spiritualRoot" label="Linh Căn" value={n.spiritualRoot} onChange={handleChange} />
                        <InputField name="specialPhysique" label="Thể Chất Đặc Biệt" value={n.specialPhysique} onChange={handleChange} />
                        <InputField name="relationshipToPlayer" label="Quan Hệ" value={n.relationshipToPlayer} onChange={handleChange} />
                        <InputField type="number" label="Độ Hảo Cảm" name="affinity" value={n.affinity} onChange={handleChange} />
                        <InputField type="number" label="Thọ Nguyên" name="thoNguyen" value={n.thoNguyen} onChange={handleChange} />
                        <InputField type="number" label="Thọ Nguyên Tối Đa" name="maxThoNguyen" value={n.maxThoNguyen} onChange={handleChange} />
                        <SelectField name="factionId" label="Thuộc Phe Phái" value={n.factionId || ''} onChange={handleChange}>
                            <option value="">Không có</option>
                            {startingFactors.factions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </SelectField>
                         <div className="lg:col-span-3"> <TextAreaField label="Chi Tiết/Tiểu Sử" name="details" value={n.details} onChange={handleChange} rows={2} /></div>
                    </div>
                );
            case 'beasts':
                const b = formData as Beast;
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField name="name" label="Tên Yêu Thú" value={b.name} onChange={handleChange} />
                        <InputField name="species" label="Loài" value={b.species} onChange={handleChange} />
                        <InputField name="realm" label="Cảnh Giới" value={b.realm} onChange={handleChange} />
                        <CheckboxField name="isHostile" label="Thù Địch?" checked={b.isHostile} onChange={handleChange} />
                        <div className="md:col-span-2"> <TextAreaField name="description" label="Mô Tả" value={b.description} onChange={handleChange} rows={2} /> </div>
                    </div>
                );
            case 'locations':
                 const l = formData as Location;
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InputField name="name" label="Tên Địa Điểm" value={l.name} onChange={handleChange} />
                        <SelectField name="locationType" label="Loại Địa Điểm" value={l.locationType} onChange={handleChange}>
                            {(['Làng mạc', 'Thị trấn', 'Thành thị', 'Thủ đô', 'Tông môn/Gia tộc', 'Rừng rậm', 'Núi non', 'Hang động', 'Hầm ngục/Bí cảnh', 'Tàn tích', 'Sông/Hồ', 'Địa danh Đặc biệt (Độc lập)', 'Mặc định'] as LocationType[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectField>
                        <InputField name="regionId" label="Tên Vùng" value={l.regionId} onChange={handleChange} />
                        <InputField type="number" label="Tọa Độ X" name="mapX" value={l.mapX} onChange={handleChange} />
                        <InputField type="number" label="Tọa Độ Y" name="mapY" value={l.mapY} onChange={handleChange} />
                        <CheckboxField name="isSafeZone" label="Vùng An Toàn?" checked={l.isSafeZone} onChange={handleChange} />
                        <div className="lg:col-span-3"> <TextAreaField name="description" label="Mô Tả" value={l.description} onChange={handleChange} rows={2} /></div>
                    </div>
                );
            case 'factions':
                const f = formData as Faction;
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField name="name" label="Tên Phe Phái" value={f.name} onChange={handleChange} />
                         <SelectField name="alignment" label="Thiên Hướng" value={f.alignment} onChange={handleChange}>
                            {(['Chính Nghĩa', 'Trung Lập', 'Tà Ác', 'Hỗn Loạn'] as FactionAlignment[]).map(a => <option key={a} value={a}>{a}</option>)}
                        </SelectField>
                        <InputField type="number" label="Danh Vọng Khởi Đầu" name="playerReputation" value={f.playerReputation} onChange={handleChange} />
                        <div className="md:col-span-2"> <TextAreaField name="description" label="Mô Tả" value={f.description} onChange={handleChange} rows={2} /></div>
                    </div>
                );
            case 'lore':
                const lr = formData as Lore;
                return (
                    <div className="space-y-4">
                        <InputField name="title" label="Tiêu Đề Tri Thức" value={lr.title} onChange={handleChange} />
                        <TextAreaField name="content" label="Nội Dung Tri Thức" value={lr.content} onChange={handleChange} rows={4}/>
                    </div>
                );
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${item ? 'Chỉnh sửa' : 'Thêm mới'} Yếu Tố`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {renderEditorBody()}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-600">
                    <Button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500">Hủy</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-500">Lưu Lại</Button>
                </div>
            </form>
        </Modal>
    );
};

export default FactorEditorModal;