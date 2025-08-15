import { 
    AnyItem, AnySkill, Choice, CongPhapItem, CongPhapSkill, EquipmentItem, LinhKiItem, LinhKiSkill, MaterialItem, 
    NgheNghiepSkill, OtherSkill, ParsedStoryUpdate, PotionItem, ProfessionSkillBookItem, ProfessionToolItem, 
    SkillType, StatusEffect, Quest, QuestObjective, QuestUpdatePayload, NPC, Beast, Location, 
    Faction, Lore, EntityUpdatePayload, Companion, WorldEvent, WorldEventUpdatePayload, WorldEventDetailPayload, SpecialNPCUpdatePayload, CompanionUpdatePayload, CamThuatSkill, ThanThongSkill,
    ParsedInitialGameData, PlayerState, Wife, Slave, Prisoner, AnyCharacter
} from "../types";

// =================================================================
// REGEX CONSTANTS
// =================================================================

// Matches any [TAG_NAME: attributes]
const GENERIC_TAG_REGEX = /\[([A-Z_]+):\s*([^\]]+?)\]/g;
// Specifically matches [CHOICE: "full choice text"]
const CHOICE_REGEX = /\[CHOICE:\s*"([^"]+)"\]/g;
// Specifically matches PLAYER_STATS_INIT
const PLAYER_STATS_INIT_REGEX = /\[PLAYER_STATS_INIT:\s*([^\]]+?)\]/;


// Regex for parsing the details inside a choice string
const ACTION_REGEX = /^(.*?)\s*\(/;
const SUCCESS_RATE_REGEX = /Thành công:\s*(\d+)%/;
const DIFFICULTY_REGEX = /Độ khó:\s*'([^']*)'/;
const BENEFIT_REGEX = /Lợi ích:\s*([^.]*?)\.?\s*Rủi ro:/;
const RISK_REGEX = /Rủi ro:\s*([^)]+)\)/;

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Parses a string of attributes (e.g., 'name="John" age="30"') into an object.
 * Handles single quotes, double quotes, and unquoted values.
 */
const parseAttributes = (attrString: string): Record<string, string> => {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)=("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        // match[3] for double-quoted, match[4] for single-quoted, match[5] for unquoted
        attributes[match[1]] = match[3] ?? match[4] ?? match[5];
    }
    return attributes;
};


/** Safely parses a string to an integer, returning a default value if invalid. */
const safeParseInt = (str: string | undefined, defaultValue = 0): number => {
    if (str === undefined) return defaultValue;
    const num = parseInt(str, 10);
    return isNaN(num) ? defaultValue : num;
};

/** Safely parses a string to a float, returning a default value if invalid. */
const safeParseFloat = (str: string | undefined, defaultValue = 0): number => {
    if (str === undefined) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
};

// =================================================================
// TAG-SPECIFIC PARSERS
// =================================================================

/**
 * Parses the full text of a choice into a structured Choice object.
 * @param fullText The string content of the choice.
 * @returns A structured Choice object.
 */
const parseChoice = (fullText: string): Choice => {
    const actionMatch = fullText.match(ACTION_REGEX);
    const successRateMatch = fullText.match(SUCCESS_RATE_REGEX);
    const difficultyMatch = fullText.match(DIFFICULTY_REGEX);
    const benefitMatch = fullText.match(BENEFIT_REGEX);
    const riskMatch = fullText.match(RISK_REGEX);

    return {
        id: crypto.randomUUID(),
        fullText: fullText,
        action: actionMatch ? actionMatch[1].trim() : "Hành động không xác định",
        successRate: successRateMatch ? parseInt(successRateMatch[1], 10) : null,
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : null,
        benefit: benefitMatch ? benefitMatch[1].trim() : null,
        risk: riskMatch ? riskMatch[1].trim() : null,
    };
};

/**
 * Parses attributes for an ITEM_ACQUIRED tag into the correct AnyItem subtype.
 */
const parseItemAcquired = (attributes: Record<string, string>): AnyItem => {
    const baseItem = {
        id: crypto.randomUUID(),
        name: attributes.name ?? 'Vật Phẩm Vô Danh',
        description: attributes.description ?? '',
        quantity: safeParseInt(attributes.quantity, 1),
        // The `type` attribute contains both main and sub-category, e.g., "Equipment Vũ Khí". We only need the main one here.
        category: attributes.type?.split(' ')[0] as any,
        rarity: attributes.rarity as any,
        itemRealm: attributes.itemRealm ?? 'Phàm Nhân',
    };

    switch (baseItem.category) {
        case 'Equipment':
            return { ...baseItem, category: 'Equipment', equipmentType: attributes.equipmentType as any, statBonusesJSON: attributes.statBonusesJSON ?? '{}', uniqueEffectsList: attributes.uniqueEffectsList ?? 'Không có gì đặc biệt', value: safeParseInt(attributes.value, 0), slot: attributes.slot as any } as EquipmentItem;
        case 'Potion':
            return { ...baseItem, category: 'Potion', potionType: attributes.potionType as any, effectsList: attributes.effectsList ?? 'Không có gì đặc biệt' } as PotionItem;
        case 'Material':
            return { ...baseItem, category: 'Material', materialType: attributes.materialType as any ?? 'Khác' } as MaterialItem;
        case 'CongPhap':
            return { ...baseItem, category: 'CongPhap', congPhapType: attributes.congPhapType as any, expBonusPercentage: safeParseInt(attributes.expBonusPercentage) } as CongPhapItem;
        case 'LinhKi':
            return { ...baseItem, category: 'LinhKi', skillToLearnJSON: attributes.skillToLearnJSON ?? '{}' } as LinhKiItem;
        case 'ProfessionSkillBook':
            return { ...baseItem, category: 'ProfessionSkillBook', professionToLearn: attributes.professionToLearn as any } as ProfessionSkillBookItem;
        case 'ProfessionTool':
            return { ...baseItem, category: 'ProfessionTool', professionRequired: attributes.professionRequired as any } as ProfessionToolItem;
        default: // Covers QuestItem, Miscellaneous
            return baseItem as AnyItem;
    }
};

/**
 * Parses attributes for a SKILL_LEARNED tag into the correct AnySkill subtype.
 */
const parseSkillLearned = (attributes: Record<string, string>): AnySkill => {
    const baseSkill = {
        id: crypto.randomUUID(),
        name: attributes.name ?? 'Kỹ Năng Vô Danh',
        description: attributes.description ?? 'Không có mô tả.',
        category: attributes.skillType as SkillType,
        otherEffects: attributes.otherEffects ?? 'Không có hiệu ứng đặc biệt.',
    };

    switch (baseSkill.category) {
        case 'Công Pháp Tu Luyện':
            return { ...baseSkill, category: 'Công Pháp Tu Luyện', congPhapType: attributes.congPhapType as any, congPhapGrade: attributes.congPhapGrade as any, weaponFocus: attributes.weaponFocus as any } as CongPhapSkill;
        case 'Linh Kĩ':
            return { ...baseSkill, category: 'Linh Kĩ', linhKiCategory: attributes.linhKiCategory as any, linhKiActivation: attributes.linhKiActivation as any, manaCost: safeParseInt(attributes.manaCost, undefined), cooldown: safeParseInt(attributes.cooldown, undefined), baseDamage: safeParseInt(attributes.baseDamage, undefined), damageMultiplier: safeParseFloat(attributes.damageMultiplier, undefined), baseHealing: safeParseInt(attributes.baseHealing, undefined), healingMultiplier: safeParseFloat(attributes.healingMultiplier, undefined) } as LinhKiSkill;
        case 'Thần Thông':
            return { ...baseSkill, category: 'Thần Thông', manaCost: safeParseInt(attributes.manaCost, undefined), cooldown: safeParseInt(attributes.cooldown, undefined) } as ThanThongSkill;
        case 'Cấm Thuật':
            return { ...baseSkill, category: 'Cấm Thuật', sideEffects: attributes.sideEffects ?? 'Không rõ.', manaCost: safeParseInt(attributes.manaCost, undefined), cooldown: safeParseInt(attributes.cooldown, undefined) } as CamThuatSkill;
        case 'Nghề Nghiệp':
            return { ...baseSkill, category: 'Nghề Nghiệp', professionType: attributes.professionType as any, professionGrade: attributes.professionGrade as any, skillDescription: attributes.skillDescription ?? '' } as NgheNghiepSkill;
        default:
             return { ...baseSkill, category: 'Khác' } as OtherSkill;
    }
};

const parseNpc = (attributes: Record<string, string>): AnyCharacter => {
    let stats = { thoNguyen: 0, maxThoNguyen: 0 };
    try {
        const parsedStats = JSON.parse(attributes.statsJSON ?? '{}');
        stats.thoNguyen = safeParseInt(parsedStats.thoNguyen, 0);
        stats.maxThoNguyen = safeParseInt(parsedStats.maxThoNguyen, 0);
    } catch (e) {
        // Ignore parsing errors, use defaults
    }

    const baseNpc: NPC = {
        id: crypto.randomUUID(),
        name: attributes.name ?? 'Người Vô Danh',
        gender: attributes.gender ?? 'Không rõ',
        race: attributes.race ?? 'Nhân Tộc',
        personality: attributes.personality ?? 'Bí ẩn',
        affinity: safeParseInt(attributes.affinity, 0),
        details: attributes.details ?? 'Không có thông tin.',
        realm: attributes.realm ?? 'Người Thường',
        tuChat: attributes.tuChat ?? 'Không có',
        spiritualRoot: attributes.spiritualRoot ?? 'Không có',
        specialPhysique: attributes.specialPhysique ?? 'Không có',
        thoNguyen: stats.thoNguyen,
        maxThoNguyen: stats.maxThoNguyen,
        relationshipToPlayer: attributes.relationshipToPlayer ?? 'Người xa lạ',
        factionId: attributes.factionId,
    };

    // This function now returns AnyCharacter, but doesn't add special properties yet.
    // The store logic will augment it based on relationshipToPlayer.
    return baseNpc;
};

const parseBeast = (attributes: Record<string, string>): Beast => ({
    id: crypto.randomUUID(),
    name: attributes.name ?? 'Yêu Thú Vô Danh',
    species: attributes.species ?? 'Không rõ',
    description: attributes.description ?? 'Không có thông tin.',
    realm: attributes.realm ?? 'Không có',
    isHostile: attributes.isHostile === 'true',
});

const parseLocation = (attributes: Record<string, string>): Location => ({
    id: crypto.randomUUID(),
    name: attributes.name ?? 'Nơi Vô Danh',
    description: attributes.description ?? 'Không có thông tin.',
    locationType: (attributes.locationType as any) ?? 'Mặc định',
    isSafeZone: attributes.isSafeZone === 'true',
    regionId: attributes.regionId ?? 'Vùng đất vô danh',
    mapX: safeParseInt(attributes.mapX, 500),
    mapY: safeParseInt(attributes.mapY, 500),
});

const parseFaction = (attributes: Record<string, string>): Faction => ({
    id: crypto.randomUUID(),
    name: attributes.name ?? 'Phe Phái Vô Danh',
    description: attributes.description ?? 'Không có thông tin.',
    alignment: (attributes.alignment as any) ?? 'Trung Lập',
    playerReputation: safeParseInt(attributes.playerReputation, 0),
});

const parseLore = (attributes: Record<string, string>): Lore => ({
    id: crypto.randomUUID(),
    title: attributes.title ?? 'Tri Thức Vô Đề',
    content: attributes.content ?? 'Nội dung bị thất lạc.',
});


const parseQuestAssigned = (attributes: Record<string, string>): Quest => ({
    id: crypto.randomUUID(),
    title: attributes.title ?? 'Nhiệm vụ không tên',
    description: attributes.description ?? '',
    objectives: (attributes.objectives ?? '').split('|').filter(t => t).map(text => ({ text: text.trim(), completed: false } as QuestObjective)),
    isCompleted: false,
    isFailed: false,
});

const parseQuestUpdated = (attributes: Record<string, string>): QuestUpdatePayload => ({
    title: attributes.title,
    objectiveText: attributes.objectiveText,
    newObjectiveText: attributes.newObjectiveText,
    completed: attributes.completed === 'true',
});

const parseStatusEffectApply = (attributes: Record<string, string>): StatusEffect => ({
    id: crypto.randomUUID(),
    name: attributes.name,
    description: attributes.description,
    type: attributes.type as any,
    durationMinutes: safeParseInt(attributes.durationMinutes),
    endTick: 0, // Will be calculated later in the store
    statModifiers: attributes.statModifiers ?? '{}',
    specialEffects: attributes.specialEffects ?? '',
});

const parseEntityUpdatePayload = (attributes: Record<string, string>): EntityUpdatePayload | null => {
    const { name, field, newValue, change } = attributes;
    if (!name || !field) return null;
    return { name, field, newValue: newValue ?? '', change };
};

const parseSpecialNpcUpdate = (attributes: Record<string, string>): SpecialNPCUpdatePayload | null => {
    const payload = parseEntityUpdatePayload(attributes);
    if (!payload || !['willpower', 'obedience', 'resistance'].includes(payload.field)) {
        return null;
    }
    return {
        name: payload.name,
        field: payload.field as 'willpower' | 'obedience' | 'resistance',
        newValue: safeParseInt(payload.newValue),
    };
};

const parseCompanionStatsUpdate = (attributes: Record<string, string>): CompanionUpdatePayload | null => {
     const payload = parseEntityUpdatePayload(attributes);
     if (!payload || !['hp', 'mana', 'atk'].includes(payload.field)) return null;
     return {
        name: payload.name,
        field: payload.field as 'hp' | 'mana' | 'atk',
        newValue: safeParseInt(payload.newValue)
     };
};

const parseCompanionJoin = (attributes: Record<string, string>): Companion => ({
    id: crypto.randomUUID(),
    name: attributes.name ?? 'Đồng hành vô danh',
    description: attributes.description ?? '',
    hp: safeParseInt(attributes.hp),
    maxHp: safeParseInt(attributes.maxHp),
    mana: safeParseInt(attributes.mana),
    maxMana: safeParseInt(attributes.maxMana),
    atk: safeParseInt(attributes.atk),
    realm: attributes.realm ?? 'Không rõ',
});

const parseEventTriggered = (attributes: Record<string, string>): WorldEvent => ({
    id: crypto.randomUUID(),
    title: attributes.title ?? 'Sự kiện vô danh',
    description: attributes.description ?? '',
    type: attributes.type as any ?? 'Khác',
    // These will be calculated in the store based on gameTime and timeToStart string
    startDate: { year: 0, month: 0, day: 0, hour: 0, minute: 0 }, 
    durationDays: safeParseInt(attributes.duration),
    locationName: attributes.locationName ?? '',
    revealedDetails: [],
    // We pass timeToStart to the store for calculation
    timeToStart: attributes.timeToStart,
} as any);


// =================================================================
// MAIN PARSERS
// =================================================================

const baseParse = (text: string): { narration: string, tags: {name: string, attrs: Record<string, string>}[] } => {
    let narration = text;
    const allTags = [...text.matchAll(GENERIC_TAG_REGEX)];
    const parsedTags = allTags.map(match => {
        narration = narration.replace(match[0], '');
        return { name: match[1], attrs: parseAttributes(match[2]) };
    });

    // Also strip choices from narration
    narration = narration.replace(CHOICE_REGEX, '');

    return { narration: narration.trim(), tags: parsedTags };
}

export const parseInitialGameResponse = (responseText: string): ParsedInitialGameData => {
    const baseResult = parseStoryUpdate(responseText);
    const playerStatsInitMatch = responseText.match(PLAYER_STATS_INIT_REGEX);
    let initialPlayerState: Partial<PlayerState> = {};
    
    if (playerStatsInitMatch && playerStatsInitMatch[1]) {
        const attributes = parseAttributes(playerStatsInitMatch[1]);
        initialPlayerState = {
            sinhLuc: attributes.sinhLuc?.toUpperCase() === 'MAX' ? Infinity : safeParseInt(attributes.sinhLuc),
            linhLuc: attributes.linhLuc?.toUpperCase() === 'MAX' ? Infinity : safeParseInt(attributes.linhLuc),
            thoNguyen: safeParseInt(attributes.thoNguyen),
            maxThoNguyen: safeParseInt(attributes.maxThoNguyen),
            kinhNghiem: safeParseInt(attributes.kinhNghiem),
            realm: attributes.realm as any, // Will be parsed into RealmState later
            currency: safeParseInt(attributes.currency),
            hieuUngBinhCanh: attributes.hieuUngBinhCanh === 'true',
            linhCan: attributes.spiritualRoot,
            theChat: attributes.specialPhysique,
        };
    }

    return { ...baseResult, initialPlayerState };
};

/**
 * Parses the full response text from the AI into a structured ParsedStoryUpdate object.
 * This object acts as a command to update the game state.
 * @param responseText The raw text response from the AI.
 * @returns A structured object with all game state changes.
 */
export const parseStoryUpdate = (responseText: string): ParsedStoryUpdate => {
    const result: ParsedStoryUpdate = {
        storyText: '',
        choices: [],
        statsUpdate: {},
        timeUpdate: {},
        itemsAdded: [],
        itemsConsumed: [],
        itemsUpdated: [],
        skillsLearned: [],
        statusEffectsApplied: [],
        statusEffectsRemoved: [],
        questsAssigned: [],
        questsUpdated: [],
        questsCompleted: [],
        questsFailed: [],
    
    // Entity additions
    npcsAdded: [],
    beastsAdded: [],
    locationsAdded: [],
    factionsAdded: [],
    loreAdded: [],
    companionsAdded: [],
    
    // Entity updates
    npcsUpdated: [],
    wivesUpdated: [],
    slavesUpdated: [],
    prisonersUpdated: [],
    companionsUpdated: [],
    locationsUpdated: [],
    factionsUpdated: [],
    loreUpdated: [],

    // Entity removals
    npcsRemoved: [],
    wivesRemoved: [],
    slavesRemoved: [],
    prisonersRemoved: [],
    beastsRemoved: [],
    companionsRemoved: [],

    // World event updates
    eventsTriggered: [],
    eventsUpdated: [],
    eventsRevealed: [],
    };

    // 1. Extract choices first, then remove them from the text to avoid parsing their contents as other tags.
    const choiceMatches = [...responseText.matchAll(CHOICE_REGEX)];
    choiceMatches.forEach(match => {
        result.choices.push(parseChoice(match[1]));
    });
    let textWithoutChoices = responseText.replace(CHOICE_REGEX, '');

    // 2. Parse all other tags from the remaining text.
    const tagMatches = [...textWithoutChoices.matchAll(GENERIC_TAG_REGEX)];
    
    tagMatches.forEach(match => {
        const tagName = match[1];
        const attrString = match[2];
        const attributes = parseAttributes(attrString);

        // A big switch to handle all possible tags from the AI.
        switch (tagName) {
            case 'STATS_UPDATE':
                result.statsUpdate = {
                    sinhLuc: attributes.sinhLuc,
                    linhLuc: attributes.linhLuc,
                    kinhNghiem: attributes.kinhNghiem,
                    currency: attributes.currency,
                    turn: attributes.turn ? safeParseInt(attributes.turn.replace('+', '')) : undefined,
                };
                break;
            case 'CHANGE_TIME':
                result.timeUpdate = { nam: safeParseInt(attributes.nam), thang: safeParseInt(attributes.thang), ngay: safeParseInt(attributes.ngay), gio: safeParseInt(attributes.gio), phut: safeParseInt(attributes.phut) };
                break;
            case 'ITEM_ACQUIRED': result.itemsAdded.push(parseItemAcquired(attributes)); break;
            case 'ITEM_CONSUMED': result.itemsConsumed.push({ name: attributes.name, quantity: safeParseInt(attributes.quantity, 1) }); break;
            case 'SKILL_LEARNED': result.skillsLearned.push(parseSkillLearned(attributes)); break;
            case 'STATUS_EFFECT_APPLY': result.statusEffectsApplied.push(parseStatusEffectApply(attributes)); break;
            case 'STATUS_EFFECT_REMOVE': result.statusEffectsRemoved.push({ name: attributes.name }); break;
            case 'QUEST_ASSIGNED': result.questsAssigned.push(parseQuestAssigned(attributes)); break;
            case 'QUEST_UPDATED': result.questsUpdated.push(parseQuestUpdated(attributes)); break;
            case 'QUEST_COMPLETED': result.questsCompleted.push({ title: attributes.title }); break;
            case 'QUEST_FAILED': result.questsFailed.push({ title: attributes.title }); break;
            case 'LOCATION_CHANGE': result.locationChange = attributes.name; break;
            case 'BEGIN_COMBAT': result.beginCombat = { opponentIds: attributes.opponentIds }; break;
            case 'REMOVE_BINH_CANH_EFFECT': result.removeBinhCanhEffect = { kinhNghiemGain: safeParseInt(attributes.kinhNghiemGain, 1) }; break;

            // --- World Entity Additions ---
            case 'NPC': result.npcsAdded.push(parseNpc(attributes)); break;
            case 'YEUTHU': result.beastsAdded.push(parseBeast(attributes)); break;
            case 'MAINLOCATION': result.locationsAdded.push(parseLocation(attributes)); break;
            case 'FACTION_DISCOVERED': result.factionsAdded.push(parseFaction(attributes)); break;
            case 'WORLD_LORE_ADD': result.loreAdded.push(parseLore(attributes)); break;
            case 'COMPANION_JOIN': result.companionsAdded.push(parseCompanionJoin(attributes)); break;

            // --- World Entity Updates ---
            case 'ITEM_UPDATE': { const p = parseEntityUpdatePayload(attributes); if (p) result.itemsUpdated.push(p); break; }
            case 'NPC_UPDATE': { const p = parseEntityUpdatePayload(attributes); if (p) result.npcsUpdated.push(p); break; }
            case 'WIFE_UPDATE': { const p = parseSpecialNpcUpdate(attributes); if (p) result.wivesUpdated.push(p); break; }
            case 'SLAVE_UPDATE': { const p = parseSpecialNpcUpdate(attributes); if (p) result.slavesUpdated.push(p); break; }
            case 'PRISONER_UPDATE': { const p = parseSpecialNpcUpdate(attributes); if (p) result.prisonersUpdated.push(p); break; }
            case 'COMPANION_STATS_UPDATE': { const p = parseCompanionStatsUpdate(attributes); if (p) result.companionsUpdated.push(p); break; }
            case 'LOCATION_UPDATE': { const p = parseEntityUpdatePayload(attributes); if (p) result.locationsUpdated.push(p); break; }
            case 'FACTION_UPDATE': { const p = parseEntityUpdatePayload(attributes); if (p) result.factionsUpdated.push(p); break; }
            case 'WORLD_LORE_UPDATE': { const p = parseEntityUpdatePayload(attributes); if (p) result.loreUpdated.push(p); break; }
            
            // --- World Entity Removals ---
            case 'NPC_REMOVE': result.npcsRemoved.push({ name: attributes.name }); break;
            case 'WIFE_REMOVE': result.wivesRemoved.push({ name: attributes.name }); break;
            case 'SLAVE_REMOVE': result.slavesRemoved.push({ name: attributes.name }); break;
            case 'PRISONER_REMOVE': result.prisonersRemoved.push({ name: attributes.name }); break;
            case 'YEUTHU_REMOVE': result.beastsRemoved.push({ name: attributes.name }); break;
            case 'COMPANION_LEAVE': result.companionsRemoved.push({ name: attributes.name }); break;

            // --- World Events ---
            case 'EVENT_TRIGGERED': result.eventsTriggered.push(parseEventTriggered(attributes)); break;
            case 'EVENT_UPDATE': {
                const { eventTitle, newTitle, newDescription, newStartDate, newDuration, newLocationName, createLocationIfNeeded } = attributes;
                if (eventTitle) result.eventsUpdated.push({ eventTitle, newTitle, newDescription, newStartDate, newDuration, newLocationName, createLocationIfNeeded: createLocationIfNeeded === 'true' });
                break;
            }
            case 'EVENT_DETAIL_REVEALED': {
                 const { eventTitle, detail } = attributes;
                 if (eventTitle && detail) result.eventsRevealed.push({ eventTitle, detail });
                 break;
            }
            case 'EVENT_SUMMARY':
                result.eventSummary = attributes.text;
                break;
        }
    });

    // 3. The story text is whatever is left after removing all tags.
    result.storyText = textWithoutChoices.replace(GENERIC_TAG_REGEX, '').trim();

    return result;
};