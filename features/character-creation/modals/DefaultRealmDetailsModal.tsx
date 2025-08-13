import React, { useMemo } from 'react';
import Modal from '../../../components/ui/Modal';
import { defaultCultivationSystemDetails } from '../../../core/prompts';

interface RealmDetail {
    key: string;
    value: string;
}

interface ParsedRealm {
    name: string;
    details: RealmDetail[];
}

const parseRealms = (text: string): ParsedRealm[] => {
    try {
        // Corrected split string to match prompts.ts
        const contentParts = text.split('**CHI TIẾT 10 CẢNH GIỚI MẶC ĐỊNH (BẠN PHẢI TUÂN THỦ KHI TẠO CẢNH GIỚI):**');
        
        if (contentParts.length < 2 || !contentParts[1]) {
            console.error("Could not find content after header in realm details string.");
            return [];
        }
        
        const content = contentParts[1].trim();
        const realmBlocks = content.split(/\n\s*\d+\.\s+/).filter(block => block.trim() !== '');

        return realmBlocks.map((block, index) => {
            const lines = block.trim().split('\n');
            const titleLine = lines[0];
            const nameParts = titleLine?.split('**Cảnh giới:**');

            if (!nameParts || nameParts.length < 2) {
                // If the name can't be parsed, skip this block
                return null;
            }
            const name = nameParts[1].trim();

            const details = lines.slice(1).map(line => {
                const cleanedLine = line.replace(/^\s*\*\s*/, '').trim();
                const parts = cleanedLine.split(':');
                const key = parts[0]?.replace(/\*\*/g, '').trim();
                const value = parts.slice(1).join(':').trim();

                if (!key || !value) return null;
                return { key, value };
            }).filter((detail): detail is RealmDetail => detail !== null);

            return { name: `${index + 1}. ${name}`, details };
        }).filter((realm): realm is ParsedRealm => realm !== null);
    } catch (e) {
        console.error("Failed to parse realm details", e);
        return [];
    }
};


const DefaultRealmDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const realms = useMemo(() => parseRealms(defaultCultivationSystemDetails), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Hệ Thống Tu Luyện Mặc Định">
            <div className="space-y-6">
                {realms.map((realm) => (
                    <div key={realm.name} className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/80 animate-fade-in">
                        <h3 className="text-xl font-bold text-yellow-300 mb-3">{realm.name}</h3>
                        <div className="space-y-2 pl-4 border-l-2 border-yellow-500/30">
                            {realm.details.map((detail) => (
                                <div key={detail.key}>
                                    <span className="font-semibold text-gray-400">{detail.key}: </span>
                                    <span className="text-gray-200">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                 {realms.length === 0 && (
                    <p className="text-center text-gray-400">Không thể tải chi tiết hệ thống cảnh giới.</p>
                )}
            </div>
        </Modal>
    );
};

export default DefaultRealmDetailsModal;
