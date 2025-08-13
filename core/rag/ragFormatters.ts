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
    let details = `Nhân vật (${charType}): ${character.name} (ID: ${character.id}). Giới tính: ${character.gender}. Chủng tộc: ${character.race}. Cảnh giới: ${getRealmDisplayName(character.realm)}. Mối quan hệ với người chơi: ${character.relationshipToPlayer}. Thiện cảm: ${character.affinity}. Linh căn: ${character.spiritualRoot}. Thể chất: ${character.specialPhysique}. Tư chất: ${character.tuChat}.`;
    
    // Add stats if available
    // Note: Assuming character objects don't have HP/MP directly, these would come from a combat state if needed.
    // Let's add tho nguyen as it's part of the base NPC type.
    if (character.thoNguyen > 0) {
        details += ` Thọ nguyên ${character.thoNguyen}/${character.maxThoNguyen}.`;
    }

    if ('willpower' in character && 'obedience' in character) {
        if ('resistance' in character) { // Prisoner
            details += ` Trạng thái tù nhân: Ý chí ${character.willpower}, Phản kháng ${character.resistance}, Phục tùng ${character.obedience}.`;
        } else { // Wife/Slave
            details += ` Trạng thái bạn đồng hành: Ý chí ${character.willpower}, Phục tùng ${character.obedience}.`;
        }
    }

    details += ` Mô tả: ${character.details}.`;
    return details;
}

export function formatItemForEmbedding(item: AnyItem): string {
    let details = `Vật phẩm: ${item.name} (ID: ${item.id}). Loại: ${item.category}. Độ hiếm: ${item.rarity}. Mô tả: ${item.description}.`;

    if (item.category === 'Equipment') {
        const eq = item as EquipmentItem;
        details += ` Chỉ số cộng thêm: ${eq.statBonusesJSON}. Hiệu ứng đặc biệt: ${eq.uniqueEffectsList}. Loại trang bị: ${eq.equipmentType}.`;
    } else if (item.category === 'Potion') {
        const potion = item as PotionItem;
        details += ` Hiệu ứng: ${potion.effectsList}.`;
    }
    return details;
}

export function formatBeastForEmbedding(beast: Beast): string {
    return `Yêu thú: ${beast.name} (ID: ${beast.id}). Loài: ${beast.species}. Cảnh giới: ${beast.realm}. Thái độ: ${beast.isHostile ? 'Thù địch' : 'Trung lập'}. Mô tả: ${beast.description}.`;
}

export function formatSkillForEmbedding(skill: AnySkill): string {
    let details = `Kỹ năng: ${skill.name} (ID: ${skill.id}). Loại: ${skill.category}. Mô tả: ${skill.description}. Hiệu ứng: ${skill.otherEffects}.`;
    
    if ('manaCost' in skill && (skill as LinhKiSkill).linhKiActivation !== 'Bị động') {
        const combatSkill = skill as LinhKiSkill;
        const parts = [];
        if (combatSkill.manaCost) parts.push(`Tiêu hao ${combatSkill.manaCost} MP`);
        if (combatSkill.cooldown) parts.push(`Hồi ${combatSkill.cooldown} lượt`);
        if (combatSkill.baseDamage) parts.push(`Sát thương cơ bản ${combatSkill.baseDamage}`);
        if (combatSkill.damageMultiplier) parts.push(`Sát thương theo ${combatSkill.damageMultiplier * 100}% ATK`);
        if (combatSkill.baseHealing) parts.push(`Hồi ${combatSkill.baseHealing} HP`);
        if (parts.length > 0) {
            details += ` Thuộc tính: ${parts.join('; ')}.`;
        }
    }
    return details;
}

export function formatLocationForEmbedding(location: Location): string {
    return `Địa điểm: ${location.name} (ID: ${location.id}). Loại: ${location.locationType}. Khu vực an toàn: ${location.isSafeZone ? 'Có' : 'Không'}. Mô tả: ${location.description}.`;
}

export function formatFactionForEmbedding(faction: Faction): string {
    return `Phe phái: ${faction.name} (ID: ${faction.id}). phe: ${faction.alignment}. Uy tín với người chơi: ${faction.playerReputation}. Mô tả: ${faction.description}.`;
}

export function formatLoreForEmbedding(lore: Lore): string {
    return `Tri thức thế giới: ${lore.title} (ID: ${lore.id}). Nội dung: ${lore.content}.`;
}

export function formatQuestForEmbedding(quest: Quest): string {
    const activeObjectives = quest.objectives.filter(o => !o.completed).map(o => o.text).join('; ');
    if (!activeObjectives) return ''; // Don't embed completed quests
    return `Nhiệm vụ đang làm: ${quest.title} (ID: ${quest.id}). Mô tả: ${quest.description}. Mục tiêu còn lại: ${activeObjectives}`;
}
