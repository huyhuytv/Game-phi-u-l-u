import {
    AnyItem, AnySkill, Beast, CharacterCreationData, Faction, Location, Lore, NPC, PotionItem, StartingFactors, WorldData, EquipmentItem, LinhKiSkill, ThanThongSkill, CamThuatSkill, NgheNghiepSkill, OtherSkill, SkillType, RealmState, CongPhapSkill, Talent, MaterialItem, CongPhapItem, LinhKiItem, ProfessionSkillBookItem, ProfessionToolItem, Trait
} from "../types";
import { parseRealmString } from "../utils/realmUtils";

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Parses a string of attributes (e.g., 'name="John" age="30"') into an object.
 * @param attrString The string containing attributes.
 * @returns An object of key-value pairs.
 */
const parseAttributes = (attrString: string): Record<string, string> => {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)=("([^"]*)"|'([^']*)'|(\S+))/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        // match[2] is the full quoted string, match[3] or match[4] is the content
        attributes[match[1]] = match[3] ?? match[4] ?? match[5];
    }
    return attributes;
};

/** Converts a string to a number, returning a default value if invalid. */
const safeParseInt = (str: string | undefined, defaultValue = 0): number => {
    if (str === undefined) return defaultValue;
    const num = parseInt(str, 10);
    return isNaN(num) ? defaultValue : num;
};

/** Converts a string to a float, returning a default value if invalid. */
const safeParseFloat = (str: string | undefined, defaultValue = 0): number => {
    if (str === undefined) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
}

// =================================================================
// TAG-SPECIFIC PARSERS
// =================================================================

const parseSkills = (tags: RegExpMatchArray[]): AnySkill[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        const baseSkill = {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Kỹ Năng Vô Danh',
            description: attributes.description ?? 'Không có mô tả.',
            category: attributes.skillType as SkillType,
            otherEffects: attributes.otherEffects ?? 'Không có hiệu ứng đặc biệt.',
        };

        switch (baseSkill.category) {
            case 'Công Pháp Tu Luyện':
                return {
                    ...baseSkill,
                    category: 'Công Pháp Tu Luyện',
                    congPhapType: attributes.congPhapType as any,
                    congPhapGrade: attributes.congPhapGrade as any,
                    weaponFocus: attributes.weaponFocus as any,
                } as CongPhapSkill;
            case 'Linh Kĩ':
                return {
                    ...baseSkill,
                    category: 'Linh Kĩ',
                    linhKiCategory: attributes.linhKiCategory as any,
                    linhKiActivation: attributes.linhKiActivation as any,
                    manaCost: safeParseInt(attributes.manaCost, undefined),
                    cooldown: safeParseInt(attributes.cooldown, undefined),
                    baseDamage: safeParseInt(attributes.baseDamage, undefined),
                    damageMultiplier: safeParseFloat(attributes.damageMultiplier, undefined),
                    baseHealing: safeParseInt(attributes.baseHealing, undefined),
                    healingMultiplier: safeParseFloat(attributes.healingMultiplier, undefined),
                } as LinhKiSkill;
            case 'Thần Thông':
                return {
                    ...baseSkill,
                    category: 'Thần Thông',
                    manaCost: safeParseInt(attributes.manaCost, undefined),
                    cooldown: safeParseInt(attributes.cooldown, undefined),
                } as ThanThongSkill;
            case 'Cấm Thuật':
                return {
                    ...baseSkill,
                    category: 'Cấm Thuật',
                    sideEffects: attributes.sideEffects ?? 'Không rõ tác dụng phụ.',
                    manaCost: safeParseInt(attributes.manaCost, undefined),
                    cooldown: safeParseInt(attributes.cooldown, undefined),
                } as CamThuatSkill;
             case 'Nghề Nghiệp':
                return {
                    ...baseSkill,
                    category: 'Nghề Nghiệp',
                    professionType: attributes.professionType as any,
                    professionGrade: attributes.professionGrade as any,
                    skillDescription: attributes.skillDescription ?? '',
                } as NgheNghiepSkill;
            default:
                return { ...baseSkill, category: 'Khác' } as OtherSkill;
        }
    }).filter(Boolean) as AnySkill[];
};

const parseItems = (tags: RegExpMatchArray[]): AnyItem[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        const baseItem = {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Vật Phẩm Vô Danh',
            description: attributes.description ?? '',
            quantity: safeParseInt(attributes.quantity, 1),
            category: attributes.category as any,
            rarity: attributes.rarity as any,
            itemRealm: attributes.itemRealm ?? 'Phàm Nhân',
        };

        switch (baseItem.category) {
            case 'Equipment':
                return {
                    ...baseItem,
                    category: 'Equipment',
                    equipmentType: attributes.equipmentType as any,
                    statBonusesJSON: attributes.statBonusesJSON ?? '{}',
                    uniqueEffectsList: attributes.uniqueEffectsList ?? 'Không có',
                } as EquipmentItem;
            case 'Potion':
                return {
                    ...baseItem,
                    category: 'Potion',
                    potionType: attributes.potionType as any,
                    effectsList: attributes.effectsList ?? 'Không rõ hiệu ứng',
                } as PotionItem;
            case 'Material':
                 return {
                    ...baseItem,
                    category: 'Material',
                    materialType: attributes.materialType as any ?? 'Khác',
                } as MaterialItem;
             case 'CongPhap':
                 return {
                    ...baseItem,
                    category: 'CongPhap',
                    congPhapType: attributes.congPhapType as any,
                    expBonusPercentage: safeParseInt(attributes.expBonusPercentage),
                } as CongPhapItem;
            case 'LinhKi':
                 return {
                    ...baseItem,
                    category: 'LinhKi',
                    skillToLearnJSON: attributes.skillToLearnJSON ?? '{}',
                } as LinhKiItem;
            case 'ProfessionSkillBook':
                return {
                    ...baseItem,
                    category: 'ProfessionSkillBook',
                    professionToLearn: attributes.professionToLearn as any,
                } as ProfessionSkillBookItem;
            case 'ProfessionTool':
                return {
                    ...baseItem,
                    category: 'ProfessionTool',
                    professionRequired: attributes.professionRequired as any,
                } as ProfessionToolItem;
            default:
                // For QuestItem, Miscellaneous
                return baseItem as AnyItem;
        }
    });
};

const parseNpcs = (tags: RegExpMatchArray[], cultivationSystem: string[] | null): NPC[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        const race = attributes.race ?? 'Nhân Tộc';
        
        const rawRealmString = attributes.realm ?? 'Phàm Nhân Nhất Trọng';
        let parsedRealm: RealmState | string = rawRealmString;

        // Try to parse if it's a cultivation realm
        if (cultivationSystem) {
             const result = parseRealmString(rawRealmString, cultivationSystem);
             if (result) {
                 parsedRealm = result;
             }
        }

        return {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Người Vô Danh',
            gender: attributes.gender ?? 'Không rõ',
            race: race,
            personality: attributes.personality ?? 'Bí ẩn',
            affinity: safeParseInt(attributes.initialAffinity, 0),
            details: attributes.details ?? 'Không có thông tin.',
            realm: parsedRealm, // Assign the parsed object or the original string
            tuChat: attributes.tuChat ?? 'Không có',
            spiritualRoot: attributes.spiritualRoot ?? 'Không có',
            specialPhysique: attributes.specialPhysique ?? 'Không có',
            talent: attributes.talent ?? 'Không có',
            thoNguyen: safeParseInt(attributes.thoNguyen, 0),
            maxThoNguyen: safeParseInt(attributes.maxThoNguyen, 0),
            relationshipToPlayer: attributes.relationshipToPlayer ?? 'Người xa lạ',
        };
    });
};


const parseBeasts = (tags: RegExpMatchArray[]): Beast[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        return {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Yêu Thú Vô Danh',
            species: attributes.species ?? 'Không rõ',
            description: attributes.description ?? 'Không có thông tin.',
            realm: attributes.realm ?? 'Không có',
            isHostile: attributes.isHostile === 'true',
        };
    });
};

const parseLore = (tags: RegExpMatchArray[]): Lore[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        return {
            id: crypto.randomUUID(),
            title: attributes.title ?? 'Tri Thức Vô Đề',
            content: attributes.content ?? 'Nội dung bị thất lạc.',
        };
    });
};

const parseLocations = (tags: RegExpMatchArray[]): Location[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        return {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Nơi Vô Danh',
            description: attributes.description ?? 'Không có thông tin.',
            locationType: (attributes.locationType as any) ?? 'Mặc định',
            isSafeZone: attributes.isSafeZone === 'true',
            regionId: attributes.regionId ?? 'Vùng đất vô danh',
            mapX: safeParseInt(attributes.mapX, 500),
            mapY: safeParseInt(attributes.mapY, 500),
        };
    });
};

const parseFactions = (tags: RegExpMatchArray[]): Faction[] => {
    return tags.map(tagMatch => {
        const attributes = parseAttributes(tagMatch[2]);
        return {
            id: crypto.randomUUID(),
            name: attributes.name ?? 'Phe Phái Vô Danh',
            description: attributes.description ?? 'Không có thông tin.',
            alignment: (attributes.alignment as any) ?? 'Trung Lập',
            playerReputation: safeParseInt(attributes.initialPlayerReputation ?? attributes.playerReputation, 0),
        };
    });
};

// =================================================================
// MAIN PARSER
// =================================================================

export type ParsedWorldData = {
    characterData: Partial<CharacterCreationData>;
    worldData: Partial<WorldData>;
    startingFactors: StartingFactors;
};

export const parseWorldGenerationOutput = (text: string): ParsedWorldData => {
    const tagRegex = /\[GENERATED_(\w+):\s*([^\]]+?)\]/g;
    const allTags = [...text.matchAll(tagRegex)];

    const groupedTags: Record<string, RegExpMatchArray[]> = {};
    for (const tag of allTags) {
        const key = tag[1]; // e.g., "PLAYER_NAME", "SKILL"
        if (!groupedTags[key]) {
            groupedTags[key] = [];
        }
        groupedTags[key].push(tag);
    }
    
    // --- Parse Cultivation System FIRST ---
    let cultivationSystem: string[] | null = null;
    
    const cultivationSystemTag = groupedTags.CULTIVATION_SYSTEM?.[0];
    if (cultivationSystemTag) {
        const attributes = parseAttributes(cultivationSystemTag[2]);
        if (attributes.system) {
            cultivationSystem = attributes.system.split(' - ').map(r => r.trim());
        }
    }

    // --- Parse Player and World Data ---
    const characterData: Partial<CharacterCreationData> = {};
    const worldData: Partial<WorldData> = {};

    const getAttr = (key: string, attrName: string) => parseAttributes(groupedTags[key]?.[0]?.[2] ?? '')[attrName];
    
    characterData.name = getAttr('PLAYER_NAME', 'name');
    characterData.gender = getAttr('PLAYER_GENDER', 'gender');
    characterData.race = getAttr('PLAYER_RACE', 'text');
    characterData.personality = getAttr('PLAYER_PERSONALITY', 'text');
    characterData.biography = getAttr('PLAYER_BACKSTORY', 'text');
    characterData.objective = getAttr('PLAYER_GOAL', 'text');

    const talentName = getAttr('PLAYER_TALENT', 'name');
    const talentDescription = getAttr('PLAYER_TALENT', 'description');
    if (talentName) {
        characterData.talent = { name: talentName, description: talentDescription || '(AI tạo)' };
    }

    characterData.linhCan = getAttr('PLAYER_SPIRITUAL_ROOT', 'text');
    const theChatText = getAttr('PLAYER_SPECIAL_PHYSIQUE', 'text');
    if (theChatText) {
        characterData.theChat = { name: theChatText, description: '(AI tạo)' };
    }
    characterData.thoNguyen = safeParseInt(getAttr('PLAYER_THO_NGUYEN', 'value'), undefined);
    characterData.maxThoNguyen = safeParseInt(getAttr('PLAYER_MAX_THO_NGUYEN', 'value'), undefined);
    
    worldData.theme = getAttr('WORLD_THEME', 'text');
    worldData.context = getAttr('WORLD_SETTING_DESCRIPTION', 'text');
    worldData.currencyName = getAttr('CURRENCY_NAME', 'name');
    worldData.startingCurrency = safeParseInt(getAttr('STARTING_CURRENCY', 'value'));
    worldData.startingDate = {
        day: safeParseInt(getAttr('STARTING_DATE', 'day'), 1),
        month: safeParseInt(getAttr('STARTING_DATE', 'month'), 1),
        year: safeParseInt(getAttr('STARTING_DATE', 'year'), 1000)
    };
    worldData.startingRealm = getAttr('CANH_GIOI_KHOI_DAU', 'text');
    
    // Assign parsed cultivation system
    if (cultivationSystem) {
        worldData.cultivationSystem = cultivationSystem;
    }
    
    // --- Parse Starting Factors ---
    const startingFactors: StartingFactors = {
        skills: parseSkills(groupedTags.SKILL ?? []),
        items: parseItems(groupedTags.ITEM ?? []),
        npcs: parseNpcs(groupedTags.NPC ?? [], cultivationSystem),
        beasts: parseBeasts(groupedTags.YEUTHU ?? []),
        lore: parseLore(groupedTags.LORE ?? []),
        locations: parseLocations(groupedTags.LOCATION ?? []),
        factions: parseFactions(groupedTags.FACTION ?? []),
        // Initialize empty arrays for new types
        wives: [],
        slaves: [],
        prisoners: [],
    };

    return { characterData, worldData, startingFactors } as ParsedWorldData;
};