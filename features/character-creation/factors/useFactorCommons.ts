import { useMemo } from 'react';
import { useCharacterCreationStore } from '../characterCreationStore';

export const useFactorCommons = () => {
    const { worldData } = useCharacterCreationStore();

    const allRealms = useMemo(() => {
        const realms = new Set<string>();
        if (worldData.cultivationSystem) {
            worldData.cultivationSystem.forEach(r => realms.add(r));
        }
        
        // Add some fallback/common realms
        const baseRealms = ['Phàm Nhân', 'Người Thường', 'Chưa xác định'];
        baseRealms.forEach(r => realms.add(r));
        return Array.from(realms);
    }, [worldData.cultivationSystem]);

    const allRaces = useMemo(() => {
        // Since there is no per-race system anymore, we can use a static list or derive from NPCs if needed.
        // A static list is simpler and more reliable for now.
        const races = new Set<string>(['Nhân Tộc', 'Yêu Tộc', 'Ma Tộc', 'Linh Tộc', 'Cổ Tộc']);
        return Array.from(races);
    }, []);
    
    return { allRealms, allRaces };
};