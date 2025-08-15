import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { StartingFactorItem, StartingFactorCategory, NPC, RealmState } from '../../../core/types';

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-yellow-300 uppercase tracking-wider mb-2 pb-1 border-b-2 border-yellow-500/30">{title}</h4>
        <div className="space-y-2">{children}</div>
    </div>
);

const DetailRow: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-gray-400">{label}:</span>
        {children || <span className="text-gray-100 font-semibold text-right ml-2 truncate">{value ?? 'Không rõ'}</span>}
    </div>
);


const NpcDetailView: React.FC<{ npc: NPC }> = ({ npc }) => {
    const realmDisplay = typeof npc.realm === 'string' ? npc.realm : (npc.realm as RealmState)?.displayName;

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-600 flex-shrink-0">
                    <span className="text-gray-500 text-4xl font-serif">?</span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-cyan-300">{npc.name}</h3>
                    <p className="text-lg text-gray-400">{realmDisplay}</p>
                    <p className="text-sm text-gray-400">{npc.race} - {npc.gender}</p>
                </div>
            </header>
             <div>
                <p className="text-gray-300 italic text-center bg-gray-900/50 p-3 rounded-md border border-gray-700">{npc.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailSection title="Thông Tin Tu Luyện">
                    <DetailRow label="Cảnh giới" value={realmDisplay} />
                    <DetailRow label="Tư Chất" value={npc.tuChat} />
                    <DetailRow label="Linh Căn" value={npc.spiritualRoot} />
                     <DetailRow label="Thể Chất" value={npc.specialPhysique} />
                </DetailSection>
                 
                <DetailSection title="Chỉ Số & Trạng Thái">
                    <DetailRow label="Thọ Nguyên" value={`${npc.thoNguyen} / ${npc.maxThoNguyen}`} />
                    <DetailRow label="Thiện cảm" value={npc.affinity} />
                    <DetailRow label="Tính cách" value={npc.personality} />
                    <DetailRow label="Quan hệ" value={npc.relationshipToPlayer} />
                </DetailSection>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
                <DetailSection title="Quản Lý Avatar Đại Diện">
                    <div className="flex gap-4">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-sm">Tải Lên File</Button>
                        <Button className="flex-1 bg-gray-600 hover:bg-gray-500 text-sm">Nhập URL</Button>
                        <Button className="flex-1 bg-red-700 hover:bg-red-600 text-sm">Xóa Ảnh</Button>
                    </div>
                     <p className="text-xs text-gray-500 mt-2 text-center">Tính năng đang được phát triển.</p>
                </DetailSection>
            </div>
        </div>
    );
};


interface EntityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: StartingFactorItem;
    category: StartingFactorCategory;
}

const CATEGORY_LABELS: Record<string, string> = {
    npcs: 'Nhân Vật',
    factions: 'Phe Phái',
    beasts: 'Yêu Thú',
    locations: 'Địa Điểm',
    lore: 'Tri Thức',
};


const EntityDetailModal: React.FC<EntityDetailModalProps> = ({ isOpen, onClose, item, category }) => {
    if (!isOpen || !item) return null;

    const title = `Chi Tiết ${CATEGORY_LABELS[category] || 'Mục'}`;

    const renderContent = () => {
        switch (category) {
            case 'npcs':
                return <NpcDetailView npc={item as NPC} />;
            default:
                // A generic fallback for other types
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-yellow-300">{'name' in item ? item.name : ('title' in item ? item.title : 'Chi tiết')}</h3>
                        <div className="mt-4 space-y-2">
                             {Object.entries(item).map(([key, value]) => {
                                 if (key === 'id' || typeof value === 'object') return null;
                                return <DetailRow key={key} label={key} value={String(value)} />;
                            })}
                        </div>
                    </div>
                );
        }
    };
    

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div>
                {renderContent()}
                <div className="mt-8 flex justify-end">
                    <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-500">Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

export default EntityDetailModal;