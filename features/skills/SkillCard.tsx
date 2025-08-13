import React from 'react';
import { AnySkill, CongPhapSkill, LinhKiSkill, CamThuatSkill, NgheNghiepSkill } from '../../core/types';

const DetailLine: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <p className="text-sm">
            <span className="font-semibold text-gray-400">{label}: </span>
            <span className="text-gray-200">{value}</span>
        </p>
    );
};

const SkillCard: React.FC<{ skill: AnySkill }> = ({ skill }) => {
    const getBorderColor = (category: AnySkill['category']) => {
        switch (category) {
            case 'Công Pháp Tu Luyện': return 'border-yellow-500';
            case 'Linh Kĩ': return 'border-cyan-500';
            case 'Thần Thông': return 'border-purple-500';
            case 'Cấm Thuật': return 'border-red-500';
            case 'Nghề Nghiệp': return 'border-green-500';
            default: return 'border-gray-500';
        }
    };
    
    const borderColor = getBorderColor(skill.category);

    return (
        <div className={`p-3 bg-gray-900/50 rounded-lg border-l-4 ${borderColor} shadow-sm`}>
            <h4 className={`font-bold text-lg ${borderColor.replace('border-','text-')}`}>{skill.name}</h4>
            <p className="text-sm text-gray-300 mt-1 mb-2 italic">{skill.description}</p>

            <div className="space-y-1">
                {skill.category === 'Công Pháp Tu Luyện' && (
                    <>
                        <DetailLine label="Loại" value={(skill as CongPhapSkill).congPhapType} />
                        <DetailLine label="Phẩm cấp" value={(skill as CongPhapSkill).congPhapGrade} />
                    </>
                )}
                {skill.category === 'Linh Kĩ' && (
                    <>
                        <DetailLine label="Phân loại" value={(skill as LinhKiSkill).linhKiCategory} />
                        <DetailLine label="Kích hoạt" value={(skill as LinhKiSkill).linhKiActivation} />
                        <DetailLine label="Tiêu hao" value={(skill as LinhKiSkill).manaCost} />
                        <DetailLine label="Hồi chiêu" value={(skill as LinhKiSkill).cooldown ? `${(skill as LinhKiSkill).cooldown} lượt` : undefined} />
                    </>
                )}
                {skill.category === 'Cấm Thuật' && (
                    <DetailLine label="Tác dụng phụ" value={(skill as CamThuatSkill).sideEffects} />
                )}
                 {skill.category === 'Nghề Nghiệp' && (
                    <>
                        <DetailLine label="Loại nghề" value={(skill as NgheNghiepSkill).professionType} />
                        <DetailLine label="Cấp bậc" value={(skill as NgheNghiepSkill).professionGrade} />
                    </>
                )}
                 {skill.otherEffects && skill.otherEffects !== 'Không có hiệu ứng đặc biệt.' && (
                     <p className="text-sm text-teal-300 mt-2">
                        <span className="font-semibold">Hiệu ứng: </span>
                        {skill.otherEffects}
                    </p>
                 )}
            </div>
        </div>
    );
};

export default SkillCard;
