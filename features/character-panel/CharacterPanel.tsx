import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import SectionHeader from '../../components/ui/SectionHeader';
import { Trait } from '../../core/types';

// Helper component for displaying a row of information
const InfoRow: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass = 'text-gray-200' }) => (
    <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-400">{label}:</span>
        <span className={`ml-2 text-right ${valueClass}`}>{value}</span>
    </div>
);

// Helper component for displaying a progress bar
const ProgressBar: React.FC<{ label:string, value: number; max: number; colorClass: string }> = ({ label, value, max, colorClass }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-gray-400">{label}</span>
                <span className="text-sm text-gray-300">{value.toLocaleString()} / {max.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5 border border-black/20">
                <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// Helper component for displaying Trait/Talent cards
const TraitCard: React.FC<{ trait: Trait, title: string, colorClass: string }> = ({ trait, title, colorClass }) => (
     <div className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
        <h4 className={`font-bold text-lg ${colorClass.replace('border-', 'text-')}`}>{title}: {trait.name}</h4>
        <p className="text-sm text-gray-300 mt-1 italic">{trait.description}</p>
    </div>
);


const CharacterPanel: React.FC = () => {
    const player = useGameStore((state) => state.player);

    return (
        <div className="h-full overflow-y-auto space-y-6 pr-2">
            
            {/* Section: Basic Information */}
            <section>
                <SectionHeader title="Thông Tin Cơ Bản" />
                <div className="p-4 bg-gray-900/40 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoRow label="Tên" value={player.name} valueClass="text-yellow-300 font-bold" />
                    <InfoRow label="Giới Tính" value={player.gender} />
                    <InfoRow label="Chủng Tộc" value={player.race} />
                    <InfoRow label="Tuổi" value={player.tuoi} />
                    <InfoRow label="Sức Tấn Công" value={player.sucTanCong} valueClass="text-red-400" />
                </div>
            </section>

             {/* Section: Stats */}
            <section>
                <SectionHeader title="Trạng Thái" />
                 <div className="p-4 bg-gray-900/40 rounded-lg space-y-4">
                    <ProgressBar label="Sinh Lực" value={player.sinhLuc} max={player.maxSinhLuc} colorClass="bg-red-500" />
                    <ProgressBar label="Linh Lực" value={player.linhLuc} max={player.maxLinhLuc} colorClass="bg-blue-500" />
                </div>
            </section>

            {/* Section: Cultivation Path */}
            <section>
                <SectionHeader title="Con Đường Tu Luyện" />
                <div className="p-4 bg-gray-900/40 rounded-lg space-y-4">
                    <InfoRow label="Cảnh Giới Hiện Tại" value={player.realm.displayName} valueClass="text-cyan-300 font-bold text-lg" />
                    <ProgressBar label="Kinh Nghiệm" value={player.kinhNghiem} max={player.maxKinhNghiem} colorClass="bg-purple-500" />
                    <ProgressBar label="Thọ Nguyên" value={player.thoNguyen} max={player.maxThoNguyen} colorClass="bg-green-500" />

                    <div className="pt-4 border-t border-gray-700/60 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InfoRow label="Linh Căn" value={player.linhCan} valueClass="text-blue-400 font-semibold" />
                             <InfoRow label="Thể Chất Đặc Biệt" value={player.theChat} valueClass="text-teal-400 font-semibold" />
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-lg text-center border border-gray-700 shadow-inner">
                             <InfoRow label="Đánh giá Tư Chất" value={player.tuChat} valueClass="text-purple-300 font-bold text-lg" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Section: Assets */}
            <section>
                <SectionHeader title="Tài Sản" />
                 <div className="p-4 bg-gray-900/40 rounded-lg">
                    <InfoRow label="Linh Thạch" value={player.currency.toLocaleString()} valueClass="text-yellow-400 font-bold" />
                </div>
            </section>

            {/* Section: Mentality & Destiny */}
            <section>
                <SectionHeader title="Nội Tâm & Vận Mệnh" />
                <div className="p-4 bg-gray-900/40 rounded-lg space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-400 mb-1">Mục Tiêu:</h4>
                        <p className="text-lg text-gray-200 italic">"{player.objective}"</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-400 mb-1">Tiểu Sử:</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{player.biography || "(Không có gì đặc biệt)"}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-700/60">
                        {player.talent && player.talent.name !== 'Không có' && (
                            <TraitCard trait={player.talent} title="Thiên Phú" colorClass="border-purple-500" />
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default CharacterPanel;