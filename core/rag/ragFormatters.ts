import { 
    AnyItem, 
    AnyCharacter, 
    Quest, 
    AnySkill, 
    Location, 
    Faction, 
    Lore, 
    Beast, 
    RealmState, 
    EquipmentItem, 
    PotionItem, 
    LinhKiSkill 
} from "../types";

const getCharacterType = (character: AnyCharacter): string => {
    if ('resistance' in character) return 'Tù nhân';
    if ('obedience' in character && character.relationshipToPlayer === 'Đạo Lữ') return 'Vợ';
    if ('obedience' in character && character.relationshipToPlayer === 'Nô Lệ') return 'Nô lệ';
    return 'NPC';
};

const getRealmDisplayName = (realm: RealmState | string): string => {
    if (typeof realm === 'string') return realm;
    return realm?.displayName ?? 'Không rõ';
}

export function formatCharacterForEmbedding(character: AnyCharacter): string {
    const charType = getCharacterType(character);
    const realmDisplay = getRealmDisplayName(character.realm);

    // Bắt đầu bằng thông tin cơ bản
    let summary = `"${character.name}" (ID: ${character.id}) là một ${charType} ${character.race}, tu vi hiện tại là ${realmDisplay}.`;

    // Thêm thông tin về mối quan hệ và cảm xúc
    summary += ` Đối với người chơi, họ là một ${character.relationshipToPlayer} với mức độ thiện cảm là ${character.affinity}.`;

    // Thêm thuộc tính tu luyện
    summary += ` Họ sở hữu linh căn "${character.spiritualRoot}", thể chất "${character.specialPhysique}", và tư chất tu luyện được đánh giá là "${character.tuChat}".`;
    
    // Thêm tuổi thọ nếu có
    if (character.maxThoNguyen > 0) {
        summary += ` Tuổi thọ của họ là ${character.thoNguyen}/${character.maxThoNguyen}.`;
    }

    // Thêm các trạng thái đặc biệt cho vợ/nô lệ/tù nhân
    if ('willpower' in character && 'obedience' in character) {
        if ('resistance' in character) { // Prisoner
            summary += ` Là một tù nhân, trạng thái của họ cho thấy ý chí ở mức ${character.willpower}, sự phản kháng là ${character.resistance}, và độ phục tùng là ${character.obedience}.`;
        } else { // Wife/Slave
            summary += ` Trạng thái hiện tại của họ cho thấy ý chí ở mức ${character.willpower} và sự phục tùng là ${character.obedience}.`;
        }
    }

    // Kết thúc bằng mô tả chung
    summary += ` Sơ lược: ${character.details}`;
    
    return summary;
}

export function formatItemForEmbedding(item: AnyItem): string {
    // Bắt đầu bằng thông tin cơ bản
    let summary = `"${item.name}" (ID: ${item.id}) là một vật phẩm thuộc loại "${item.category}", có độ hiếm "${item.rarity}" và cấp bậc "${item.itemRealm}".`;
    summary += ` Mô tả: ${item.description}.`;

    // Thêm chi tiết dựa trên loại vật phẩm
    if (item.category === 'Equipment') {
        const eq = item as EquipmentItem;
        summary += ` Là một trang bị loại "${eq.equipmentType}", nó cung cấp các chỉ số cộng thêm: ${eq.statBonusesJSON} và có hiệu ứng đặc biệt: ${eq.uniqueEffectsList}.`;
    } else if (item.category === 'Potion') {
        const potion = item as PotionItem;
        summary += ` Là một loại đan dược, nó có các hiệu ứng sau: ${potion.effectsList}.`;
    }

    return summary;
}

export function formatBeastForEmbedding(beast: Beast): string {
    let summary = `"${beast.name}" (ID: ${beast.id}) là một yêu thú thuộc loài "${beast.species}", có sức mạnh tương đương cảnh giới "${beast.realm}".`;
    summary += ` Thái độ của nó đối với người chơi là ${beast.isHostile ? 'thù địch' : 'trung lập/chưa xác định'}.`;
    summary += ` Mô tả: ${beast.description}.`;
    return summary;
}

export function formatSkillForEmbedding(skill: AnySkill): string {
    let summary = `Đây là kỹ năng "${skill.name}" (ID: ${skill.id}), thuộc loại "${skill.category}".`;
    summary += ` Công dụng chính: ${skill.description}.`;

    const addCombatDetails = (s: LinhKiSkill) => {
        if (s.linhKiActivation === 'Bị động') return;
        const parts = [];
        if (s.manaCost) parts.push(`tiêu hao ${s.manaCost} linh lực`);
        if (s.cooldown) parts.push(`hồi chiêu ${s.cooldown} lượt`);
        if (s.baseDamage) parts.push(`sát thương cơ bản ${s.baseDamage}`);
        if (s.damageMultiplier) parts.push(`sát thương theo ${s.damageMultiplier * 100}% công lực`);
        if (s.baseHealing) parts.push(`hồi phục ${s.baseHealing} sinh lực`);
        if (parts.length > 0) {
            summary += ` Các thuộc tính chiến đấu bao gồm: ${parts.join(', ')}.`;
        }
    };
    
    if (skill.category === 'Linh Kĩ') {
        addCombatDetails(skill as LinhKiSkill);
    }
    
    if (skill.otherEffects && skill.otherEffects.toLowerCase() !== 'không có hiệu ứng đặc biệt.') {
        summary += ` Hiệu ứng đặc biệt khác: ${skill.otherEffects}.`;
    }
    
    return summary;
}

export function formatLocationForEmbedding(location: Location): string {
    let summary = `"${location.name}" (ID: ${location.id}) là một địa điểm thuộc loại "${location.locationType}".`;
    summary += ` Đây ${location.isSafeZone ? 'là' : 'không phải là'} một khu vực an toàn.`;
    summary += ` Mô tả chi tiết: ${location.description}.`;
    return summary;
}

export function formatFactionForEmbedding(faction: Faction): string {
    let summary = `"${faction.name}" (ID: ${faction.id}) là một phe phái có thiên hướng "${faction.alignment}".`;
    summary += ` Danh vọng hiện tại của người chơi với phe này là ${faction.playerReputation}.`;
    summary += ` Giới thiệu về phe phái: ${faction.description}.`;
    return summary;
}

export function formatLoreForEmbedding(lore: Lore): string {
    return `Đây là một tri thức thế giới về chủ đề "${lore.title}" (ID: ${lore.id}). Nội dung: ${lore.content}.`;
}

export function formatQuestForEmbedding(quest: Quest): string {
    const activeObjectives = quest.objectives.filter(o => !o.completed).map(o => o.text).join('; ');
    if (!activeObjectives) return ''; // Don't embed completed quests
    
    let summary = `Nhiệm vụ hiện tại: "${quest.title}" (ID: ${quest.id}).`;
    summary += ` Tóm tắt nhiệm vụ: ${quest.description}.`;
    summary += ` Mục tiêu còn lại cần hoàn thành: ${activeObjectives}.`;
    return summary;
}

export function formatEventForEmbedding(summary: string): string {
    // Thêm một tiền tố để AI hiểu rõ đây là một sự kiện đã xảy ra
    return `Ký ức về một sự kiện quan trọng: ${summary}`;
}
