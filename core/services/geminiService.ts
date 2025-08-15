import { GoogleGenAI, Type } from "@google/genai";
import { 
    CharacterCreationData, PlayerState, GameLogEntry, Talent, WorldData, StartingFactors, AnySkill, 
    AnyItem, AnyCharacter, Beast, Lore, Location, Faction, RealmState, CongPhapSkill, LinhKiSkill, 
    CamThuatSkill, NgheNghiepSkill, ThanThongSkill, EquipmentItem, PotionItem, MaterialItem, 
    CongPhapItem, LinhKiItem, ProfessionSkillBookItem, ProfessionToolItem, Trait, GameTime
} from "../types";
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
    createWorldGenerationPrompt, 
    baseTalentSchema,
    INITIAL_TALENTS_PROMPT,
    createFactorSuggestionsPrompt,
    createStoryUpdatePrompt,
    createSummaryPrompt,
    getDynamicAdultContentPrompt,
    DEFAULT_CULTIVATION_REALMS,
    MASTER_GAME_PROMPT,
} from "../prompts";

// Assuming API_KEY is set in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a graceful error to the user.
  // For this context, we'll log an error.
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getModelForApi = (): string => {
    // This function reads the user's model selection from the settings and handles migration from older placeholder values.
    const selectedModel = useSettingsStore.getState().model;

    // Handle migration from old placeholder value that might be in user's localStorage
    if ((selectedModel as any) === 'gemini-pro-placeholder') {
        return 'gemini-2.5-flash';
    }
    
    return selectedModel;
};

// =================================================================
// DATA-TO-TAG FORMATTERS
// These functions convert structured game data objects into the detailed
// string tag format that the AI expects. This is crucial for preserving
// user input and teaching the AI the desired output structure.
// =================================================================

const formatAttributes = (attrs: Record<string, any>): string => {
    return Object.entries(attrs)
        .map(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            
            let finalValue = value;
            if (key.toLowerCase().includes('json')) {
                finalValue = `'${String(value)}'`;
                return `${key}=${finalValue}`;
            }

            if (typeof value === 'string') {
                finalValue = `"${value.replace(/"/g, "'")}"`;
            }
            
            return `${key}=${finalValue}`;
        })
        .filter(Boolean)
        .join(' ');
};

const formatSkillToTag = (skill: AnySkill): string => {
    const attrs: Record<string, any> = {
        name: skill.name,
        description: skill.description,
        skillType: skill.category,
        otherEffects: skill.otherEffects,
    };

    switch (skill.category) {
        case 'Công Pháp Tu Luyện': {
            const cp = skill as CongPhapSkill;
            Object.assign(attrs, { congPhapType: cp.congPhapType, congPhapGrade: cp.congPhapGrade, weaponFocus: cp.weaponFocus });
            break;
        }
        case 'Linh Kĩ': {
            const lk = skill as LinhKiSkill;
            Object.assign(attrs, { linhKiCategory: lk.linhKiCategory, linhKiActivation: lk.linhKiActivation, manaCost: lk.manaCost, cooldown: lk.cooldown, baseDamage: lk.baseDamage, damageMultiplier: lk.damageMultiplier, baseHealing: lk.baseHealing, healingMultiplier: lk.healingMultiplier });
            break;
        }
        case 'Thần Thông': {
             const tt = skill as ThanThongSkill;
             Object.assign(attrs, { manaCost: tt.manaCost, cooldown: tt.cooldown });
             break;
        }
        case 'Cấm Thuật': {
            const ct = skill as CamThuatSkill;
            Object.assign(attrs, { sideEffects: ct.sideEffects, manaCost: ct.manaCost, cooldown: ct.cooldown });
            break;
        }
        case 'Nghề Nghiệp': {
            const nn = skill as NgheNghiepSkill;
             Object.assign(attrs, { professionType: nn.professionType, professionGrade: nn.professionGrade, skillDescription: nn.skillDescription });
            break;
        }
    }
    return `[SKILL_LEARNED: ${formatAttributes(attrs)}]`;
};

const formatItemToTag = (item: AnyItem): string => {
    const attrs: Record<string, any> = {
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rarity: item.rarity,
        itemRealm: item.itemRealm,
    };
    
    let typeString = item.category;

    switch (item.category) {
        case 'Equipment': {
            const eq = item as EquipmentItem;
            typeString += ` ${eq.equipmentType}`;
            Object.assign(attrs, { equipmentType: eq.equipmentType, statBonusesJSON: eq.statBonusesJSON, uniqueEffectsList: eq.uniqueEffectsList, value: eq.value, slot: eq.slot });
            break;
        }
        case 'Potion': {
            const po = item as PotionItem;
            typeString += ` ${po.potionType}`;
            Object.assign(attrs, { potionType: po.potionType, effectsList: po.effectsList });
            break;
        }
        case 'Material': {
            const ma = item as MaterialItem;
            typeString += ` ${ma.materialType}`;
            Object.assign(attrs, { materialType: ma.materialType });
            break;
        }
        case 'CongPhap': {
            const cp = item as CongPhapItem;
            Object.assign(attrs, { congPhapType: cp.congPhapType, expBonusPercentage: cp.expBonusPercentage });
            break;
        }
        case 'LinhKi': {
            const lk = item as LinhKiItem;
            Object.assign(attrs, { skillToLearnJSON: lk.skillToLearnJSON });
            break;
        }
        case 'ProfessionSkillBook': {
            const psb = item as ProfessionSkillBookItem;
            Object.assign(attrs, { professionToLearn: psb.professionToLearn });
            break;
        }
        case 'ProfessionTool': {
            const pt = item as ProfessionToolItem;
            Object.assign(attrs, { professionRequired: pt.professionRequired });
            break;
        }
    }
    
    attrs.type = typeString;
    return `[ITEM_ACQUIRED: ${formatAttributes(attrs)}]`;
};

const formatNpcToTag = (npc: AnyCharacter): string => {
    const attrs: Record<string, any> = {
        name: npc.name,
        gender: npc.gender,
        race: npc.race,
        personality: npc.personality,
        affinity: npc.affinity,
        details: npc.details,
        realm: typeof npc.realm === 'string' ? npc.realm : (npc.realm as RealmState)?.displayName,
        tuChat: npc.tuChat,
        spiritualRoot: npc.spiritualRoot,
        specialPhysique: npc.specialPhysique,
        relationshipToPlayer: npc.relationshipToPlayer,
        factionId: npc.factionId,
        statsJSON: `'${JSON.stringify({ thoNguyen: npc.thoNguyen, maxThoNguyen: npc.maxThoNguyen })}'`
    };
    return `[NPC: ${formatAttributes(attrs)}]`;
};

const formatBeastToTag = (beast: Beast): string => {
    const attrs: Record<string, any> = {
        name: beast.name,
        species: beast.species,
        description: beast.description,
        isHostile: beast.isHostile,
        realm: beast.realm,
    };
    return `[YEUTHU: ${formatAttributes(attrs)}]`;
};

const formatLoreToTag = (lore: Lore): string => {
    const attrs: Record<string, any> = { title: lore.title, content: lore.content };
    return `[WORLD_LORE_ADD: ${formatAttributes(attrs)}]`;
};

const formatLocationToTag = (location: Location): string => {
    const attrs: Record<string, any> = {
        name: location.name,
        description: location.description,
        locationType: location.locationType,
        isSafeZone: location.isSafeZone,
        regionId: location.regionId,
        mapX: location.mapX,
        mapY: location.mapY,
    };
    return `[MAINLOCATION: ${formatAttributes(attrs)}]`;
};

const formatFactionToTag = (faction: Faction): string => {
    const attrs: Record<string, any> = {
        name: faction.name,
        description: faction.description,
        alignment: faction.alignment,
        playerReputation: faction.playerReputation,
    };
    return `[FACTION_DISCOVERED: ${formatAttributes(attrs)}]`;
};

// =================================================================
// API CALLS
// =================================================================

export const generateInitialGame = async (
    characterData: CharacterCreationData,
    worldData: WorldData,
    startingFactors: StartingFactors
): Promise<{ responseText: string; prompt: string; }> => {
    let prompt = "Lỗi: Không thể tạo lời nhắc khởi tạo thế giới.";
    try {
        const metadataPrompt = MASTER_GAME_PROMPT;

        const allStartingNpcs = [...startingFactors.npcs, ...startingFactors.wives, ...startingFactors.slaves, ...startingFactors.prisoners];

        const startingFactorsInput = [
            ...startingFactors.skills.map(formatSkillToTag),
            ...startingFactors.items.map(formatItemToTag),
            ...allStartingNpcs.map(formatNpcToTag),
            ...startingFactors.beasts.map(formatBeastToTag),
            ...startingFactors.lore.map(formatLoreToTag),
            ...startingFactors.locations.map(formatLocationToTag),
            ...startingFactors.factions.map(formatFactionToTag),
        ].join('\n');

        let thoNguyenInput = '';
        if (characterData.maxThoNguyen && characterData.maxThoNguyen > 0) {
            thoNguyenInput += `\n- Thọ Nguyên Tối Đa Mong Muốn: ${characterData.maxThoNguyen}`;
        }
        if (characterData.thoNguyen && characterData.thoNguyen > 0) {
            thoNguyenInput += `\n- Thọ Nguyên Còn Lại Mong Muốn: ${characterData.thoNguyen}`;
        }
        
        const destinyPart = characterData.theChat?.name?.trim()
            ? `  - Thể Chất Đặc Biệt: ${characterData.theChat.name} - ${characterData.theChat.description}`
            : `  - Thiên Phú: ${characterData.talent.name} - ${characterData.talent.description}`;

        const characterInput = `
Nhân vật:
- Tên: ${characterData.name}
- Giới tính: ${characterData.gender}
- Chủng Tộc: ${characterData.race}
- Tính cách: ${characterData.personality}
- Tiểu sử: ${characterData.biography}
- Mục tiêu: ${characterData.objective}
- Năng Lực Bẩm Sinh:
  - Linh Căn: ${characterData.linhCan || "AI sẽ quyết định"}
- Vận Mệnh Khởi Đầu (Một trong hai):
${destinyPart}${thoNguyenInput}

**Yếu Tố Khởi Đầu Do Người Chơi Cung Cấp (Dạng Tag):**
${startingFactorsInput || "Không có."}
        `;
        
        const difficultyInput = `Hiện tại người chơi đã chọn độ khó: **${worldData.difficulty}**. Hãy điều chỉnh tỉ lệ thành công, lợi ích và rủi ro trong các lựa chọn [CHOICE: "..."] của bạn cho phù hợp với hướng dẫn độ khó này.`;

        let aiStyleInput = 'Mặc định của GM';
        if (worldData.aiStyle.content) {
            const styleType = worldData.aiStyle.type;
            const styleContent = worldData.aiStyle.content;
            let prefix = '';
            let contentBlock = `\n"""\n${styleContent}\n"""`;

            if (styleType === 'default') {
                prefix = 'Hãy tuân thủ các quy tắc văn phong bổ sung sau:';
            } else if (styleType === 'upload') {
                prefix = 'Mô phỏng theo văn bản đã được tải lên:';
            } else if (styleType === 'paste') {
                prefix = `HƯỚNG DẪN VỀ VIỆC BẮT CHƯỚC VĂN PHONG NGƯỜI DÙNG (TUYỆT ĐỐI KHÔNG ĐƯỢC LƠ LÀ):
Nhiệm vụ của bạn là tái hiện một cách trung thực nhất văn phong đặc trưng của người dùng dựa theo đoạn văn mẫu được cung cấp. Đây là yếu tố ưu tiên hàng đầu để tạo ra cảm giác chân thực, gần gũi và đúng "chất" cá nhân của họ.


---

1. CỐT LÕI CẦN NẮM:
Bạn phải coi văn mẫu như kim chỉ nam – không chỉ sao chép từ ngữ, mà còn phải hiểu và áp dụng đúng nhịp điệu, lựa chọn từ, thái độ, cảm xúc và mạch suy nghĩ.


---

2. CỤ THỂ CẦN BẮT CHƯỚC:

Từ ngữ & cách nói: Phải chọn từ vựng sát nghĩa, đúng văn hóa giao tiếp và đúng "giọng điệu" của người viết (ví dụ: có thể dùng từ đời thường, cảm xúc mạnh, hoặc câu chửi nếu văn mẫu có).

Cách hành văn: Nếu văn mẫu ngắn gọn, xúc tích – đừng viết dài dòng. Nếu văn mẫu lối nói vòng vo, hài hước, hoặc giàu cảm xúc – phải giữ y nguyên không khí ấy.

Nhịp điệu & tiết tấu: Giữ đúng nhịp của câu – nhanh hay chậm, dồn dập hay ngắt nghỉ, sử dụng dấu chấm, dấu phẩy, hoặc thậm chí từ viết tắt hay biểu cảm đặc trưng đều phải mô phỏng lại.

Thái độ người viết: Là nghiêm túc? Mỉa mai? Hài hước? Buồn bã? Phẫn nộ? Tất cả phải được phản ánh lại một cách tự nhiên trong lời kể.



---

3. TUYỆT ĐỐI KHÔNG:

Không pha giọng cá nhân của AI hoặc dùng văn mẫu sách vở.

Không làm mềm hóa, giảm nhẹ, hoặc "dịch lại" cho dễ hiểu – phải giữ nguyên tinh thần gốc.

Không chỉnh sửa văn phong để “hay hơn” – mục tiêu là đúng phong cách, không phải “cải tiến”.



---

4. MỤC TIÊU SAU CÙNG:
Lời kể phải khiến người đọc tin rằng đây là do chính người dùng viết ra, không phải do máy móc sinh ra. Mọi khác biệt dù nhỏ cũng sẽ làm mất chất riêng – vì thế phải tuân thủ tuyệt đối yêu cầu này.
`;
                contentBlock = `\n\nVăn bản mẫu:\n"""\n${styleContent}\n"""`;
            } else {
                prefix = 'Mô phỏng theo văn bản sau:'; // Fallback
            }
            aiStyleInput = `${prefix}${contentBlock}`;
        }
        
        const contentModeSettings = getDynamicAdultContentPrompt(worldData);

        // --- DYNAMIC PROMPT BLOCK GENERATION ---

        const startingRealm = worldData.startingRealm?.trim() || "Phàm Nhân Nhất Trọng";
        const startingCurrency = worldData.startingCurrency || 10;
        let worldSystemDetails = '';
        let playerStatsInitRule = '';
        let cultivationSystemConfirmationRule = '';
        
        if (worldData.isCultivationEnabled) {
             let cultivationSystemString: string;
            if (worldData.cultivationSystemType === 'user_defined' && worldData.cultivationSystem.length > 0) {
                cultivationSystemString = worldData.cultivationSystem.join(' - ');
            } else { // 'default' or any other value will fallback to default
                cultivationSystemString = DEFAULT_CULTIVATION_REALMS.join(' - ');
            }

            worldSystemDetails = `
- Hệ Thống Tu Luyện/Sức Mạnh Đặc Thù: BẬT
- Thế giới:
  - Chủ đề: ${worldData.theme || 'Không có'}
  - Bối cảnh: ${worldData.context || 'Không có'}
  - Văn phong: ${aiStyleInput}
  - Độ khó: ${worldData.difficulty}
  - Tiền tệ: ${worldData.currencyName}
  - Hệ Thống Cảnh Giới (áp dụng cho mọi chủng tộc): "${cultivationSystemString}" (Ví dụ: "Phàm Nhân - Luyện Khí - Trúc Cơ - Kim Đan - Nguyên Anh - Hóa Thần - Luyện Hư - Hợp Thể - Đại Thừa - Độ Kiếp")
  - Cảnh Giới Khởi Đầu (do người chơi hoặc AI thiết lập): "${startingRealm}" (LƯU Ý: PHẢI LÀ MỘT CẢNH GIỚI HỢP LỆ TỪ HỆ THỐNG CẢNH GIỚI VÀ Nhất Trọng/Nhị Trọng/Tam Trọng/Tứ Trọng/Ngũ Trọng/Lục Trọng/Thất Trọng/Bát Trọng/Cửu Trọng/Đỉnh Phong)
            `.trim();

            const hasThoNguyenInput = characterData.thoNguyen && characterData.thoNguyen > 0;
            const hasMaxThoNguyenInput = characterData.maxThoNguyen && characterData.maxThoNguyen > 0;
    
            const thoNguyenRule = (hasThoNguyenInput || hasMaxThoNguyenInput)
                ? `*   **ƯU TIÊN TUYỆT ĐỐI VỀ THỌ NGUYÊN:** Người chơi đã cung cấp thông tin về Thọ Nguyên. Bạn PHẢI sử dụng các giá trị này. \`thoNguyen\` PHẢI LÀ ${hasThoNguyenInput ? characterData.thoNguyen : 'giá trị hợp lý dựa trên maxThoNguyen'}, và \`maxThoNguyen\` PHẢI LÀ ${hasMaxThoNguyenInput ? characterData.maxThoNguyen : 'giá trị hợp lý dựa trên cảnh giới'}.`
                : `*   \`thoNguyen\` (thọ nguyên còn lại) và \`maxThoNguyen\` (thọ nguyên tối đa) nên có giá trị khởi đầu hợp lý (ví dụ, tu sĩ cấp thấp có thể sống 120-150 năm).`;
            
            const linhCanRule = characterData.linhCan?.trim()
                ? `*   **ƯU TIÊN TUYỆT ĐỐI VỀ LINH CĂN:** Người chơi đã cung cấp Linh Căn là "${characterData.linhCan}". Bạn PHẢI sử dụng chính xác giá trị này trong thuộc tính \`spiritualRoot\`.`
                : `*   **Linh Căn (\`spiritualRoot\`):** Nếu người chơi không cung cấp, hãy tự quyết định một Linh Căn hợp lý cho nhân vật (ví dụ: "Ngũ Hành Tạp Linh Căn", "Thiên Linh Căn", ...).`;

            const theChatRule = characterData.theChat?.name?.trim()
                ? `*   **ƯU TIÊN TUYỆT ĐỐI VỀ THỂ CHẤT:** Người chơi đã cung cấp Thể Chất Đặc Biệt là "${characterData.theChat.name}". Bạn PHẢI sử dụng chính xác giá trị này trong thuộc tính \`specialPhysique\`.`
                : `*   **Thể Chất Đặc Biệt (\`specialPhysique\`):** Nếu người chơi không cung cấp, hãy tự quyết định một Thể Chất hợp lý (thường là "Phàm Thể" hoặc "Bình Thường Phàm Thể" cho khởi đầu bình thường).`;
            
            const talentNameForPrompt = characterData.talent?.name?.trim() ? characterData.talent.name : "Không có";
            const tuChatRule = `*   **Tư Chất (\`tuChat\`):** Dựa trên **Linh Căn (\`spiritualRoot\`)**, **Thiên Phú ("${talentNameForPrompt}")** và **Thể Chất Đặc Biệt (\`specialPhysique\`)** đã quyết định, hãy tổng hợp và đánh giá một Tư Chất hợp lý (ví dụ: "Hạ Đẳng", "Thượng Đẳng", "Tiên Phẩm",...). Đây là thuộc tính do AI toàn quyền quyết định, không phải người chơi nhập.`;

            playerStatsInitRule = `
**Khởi tạo Chỉ số Nhân Vật:** Dựa vào thông tin trên, hãy quyết định các chỉ số ban đầu cho nhân vật. Trả về dưới dạng tag \`[PLAYER_STATS_INIT: sinhLuc=X,linhLuc=Y,thoNguyen=A,maxThoNguyen=B,kinhNghiem=0,realm="${startingRealm}",currency=${startingCurrency},turn=1,hieuUngBinhCanh=false,spiritualRoot="Phàm Căn",specialPhysique="Phàm Thể",tuChat="Hạ Đẳng"]\`.
    **QUAN TRỌNG:**
    *   \`realm\` PHẢI LÀ "${startingRealm}". ĐÂY LÀ GIÁ TRỊ CHÍNH XÁC, KHÔNG ĐƯỢC THAY ĐỔI HAY RÚT GỌN (ví dụ: không dùng "Phàm" thay vì "${startingRealm}").
    *   Lượt chơi (turn) phải bắt đầu từ 1.
    ${thoNguyenRule}
    ${linhCanRule}
    ${theChatRule}
    ${tuChatRule}
    *   **AI KHÔNG cần cung cấp \`maxSinhLuc\`, \`maxLinhLuc\`, \`maxKinhNghiem\`, \`sucTanCong\`. Hệ thống game sẽ tự động tính toán các chỉ số này dựa trên \`realm\` bạn cung cấp.**
    *   \`sinhLuc\` và \`linhLuc\` nên được đặt bằng giá trị tối đa tương ứng với cảnh giới/cấp độ khởi đầu, hoặc một giá trị hợp lý nếu bạn muốn nhân vật khởi đầu không đầy. Nếu muốn hồi đầy, dùng \`sinhLuc=MAX\` và \`linhLuc=MAX\`.
    *   \`kinhNghiem\` thường là 0. \`currency\` là số tiền ban đầu. Giá trị đã được người chơi thiết lập là **${startingCurrency}**. AI phải sử dụng chính xác con số này.
    *   Ví dụ (nếu có tu luyện): \`[PLAYER_STATS_INIT: sinhLuc=MAX,linhLuc=MAX,thoNguyen=120,maxThoNguyen=120,kinhNghiem=0,realm="${startingRealm}",currency=${startingCurrency},turn=1,hieuUngBinhCanh=false,spiritualRoot="Ngũ Hành Tạp Linh Căn",specialPhysique="Bình Thường Phàm Thể",tuChat="Hạ Đẳng"]\`.
    *   Ví dụ (nếu KHÔNG có tu luyện): \`[PLAYER_STATS_INIT: sinhLuc=MAX,thoNguyen=80,maxThoNguyen=80,kinhNghiem=0,realm="Người Thường",currency=${startingCurrency},turn=1]\`.
            `.trim();

            cultivationSystemConfirmationRule = `
**Xác nhận Hệ thống Cảnh giới:** Hệ thống cảnh giới cho TOÀN BỘ THẾ GIỚI (áp dụng cho mọi chủng tộc) đã được định nghĩa là: "${cultivationSystemString}". Bạn PHẢI sử dụng hệ thống này cho tất cả các nhân vật và thực thể trong game. TUYỆT ĐỐI KHÔNG được tạo ra hệ thống cảnh giới riêng cho từng chủng tộc.
            `.trim();
        } else {
            worldSystemDetails = `
- Hệ Thống Tu Luyện/Sức Mạnh Đặc Thù: TẮT
- Thế giới:
  - Chủ đề: ${worldData.theme || 'Không có'}
  - Bối cảnh: ${worldData.context || 'Không có'}
  - Văn phong: ${aiStyleInput}
  - Độ khó: ${worldData.difficulty}
  - Tiền tệ: ${worldData.currencyName}
            `.trim();
            
            const hasThoNguyenInput = characterData.thoNguyen && characterData.thoNguyen > 0;
            const hasMaxThoNguyenInput = characterData.maxThoNguyen && characterData.maxThoNguyen > 0;
    
            const thoNguyenRule = (hasThoNguyenInput || hasMaxThoNguyenInput)
                ? `*   **ƯU TIÊN TUYỆT ĐỐI VỀ THỌ NGUYÊN:** Người chơi đã cung cấp thông tin về Thọ Nguyên. Bạn PHẢI sử dụng các giá trị này. \`thoNguyen\` PHẢI LÀ ${hasThoNguyenInput ? characterData.thoNguyen : 'giá trị hợp lý dựa trên maxThoNguyen'}, và \`maxThoNguyen\` PHẢI LÀ ${hasMaxThoNguyenInput ? characterData.maxThoNguyen : 'giá trị hợp lý'}.`
                : `*   \`thoNguyen\` (thọ nguyên còn lại) và \`maxThoNguyen\` (thọ nguyên tối đa) nên có giá trị khởi đầu hợp lý cho người thường (ví dụ, 80-100 năm).`;

            playerStatsInitRule = `
**Khởi tạo Chỉ số Nhân Vật:** Dựa vào thông tin trên, hãy quyết định các chỉ số ban đầu cho nhân vật. Trả về dưới dạng tag \`[PLAYER_STATS_INIT: sinhLuc=X,thoNguyen=A,maxThoNguyen=B,kinhNghiem=0,realm="Người Thường",currency=${startingCurrency},turn=1]\`.
    **QUAN TRỌNG:**
    *   Lượt chơi (turn) phải bắt đầu từ 1.
    ${thoNguyenRule}
    *   \`sinhLuc\` nên được đặt bằng giá trị tối đa tương ứng với người thường. Nếu muốn hồi đầy, dùng \`sinhLuc=MAX\`.
    *   \`currency\` là số tiền ban đầu. Giá trị đã được người chơi thiết lập là **${startingCurrency}**. AI phải sử dụng chính xác con số này.
    *   Ví dụ: \`[PLAYER_STATS_INIT: sinhLuc=MAX,thoNguyen=80,maxThoNguyen=80,kinhNghiem=0,realm="Người Thường",currency=${startingCurrency},turn=1]\`.
            `.trim();
            
            cultivationSystemConfirmationRule = ''; // No confirmation needed if disabled
        }

        const startingDate = worldData.startingDate;
        const startingDateString = `Ngày ${startingDate.day}, Tháng ${startingDate.month}, Năm ${startingDate.year}`;

        prompt = metadataPrompt;
        // Character & Difficulty
        prompt = prompt.replace('**INPUT_CHARACTER_DATA_HERE**', characterInput);
        prompt = prompt.replace('**INPUT_DIFFICULTY_HERE**', difficultyInput);
        
        // World Info (Dynamic Blocks)
        prompt = prompt.replace('**INPUT_GENRE_HERE**', worldData.genre || 'Tu Tiên (Mặc định)');
        prompt = prompt.replace('**INPUT_STORY_NAME_HERE**', worldData.storyName || 'vô danh');
        prompt = prompt.replace('**INPUT_STARTING_DATE_HERE**', startingDateString);
        prompt = prompt.replace('**INPUT_WORLD_SYSTEM_DETAILS_HERE**', worldSystemDetails);
        prompt = prompt.replace('**INPUT_PLAYER_STATS_INIT_RULE_HERE**', playerStatsInitRule);
        prompt = prompt.replace('**INPUT_CULTIVATION_SYSTEM_CONFIRMATION_RULE_HERE**', cultivationSystemConfirmationRule);

        // Settings
        prompt = prompt.replace('**INPUT_CONTENT_MODE_SETTINGS_HERE**', contentModeSettings);

        const response = await ai.models.generateContent({
            model: getModelForApi(),
            contents: prompt,
            config: {
                temperature: 1.1,
                topP: 0.95,
            }
        });

        return { responseText: response.text, prompt };
    } catch (error) {
        console.error("Error generating initial game:", error);
        return {
            responseText: `Thế giới sáng tạo thất bại. [CHOICE: "Thử lại (Thành công: 10% - Độ khó: Ác Mộng, Lợi ích: Game hoạt động. Rủi ro: Mất hết dữ liệu)"]`,
            prompt,
        };
    }
};


export const generateSummary = async (events: string): Promise<string> => {
    try {
        const prompt = createSummaryPrompt(events);
        const response = await ai.models.generateContent({
            model: getModelForApi(),
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Tóm tắt thất bại.";
    }
};


export const generateWorldFromPrompt = async (
    storyIdea: string, 
    worldData: WorldData,
    characterData: Partial<CharacterCreationData>
): Promise<string> => {
    const masterPrompt = createWorldGenerationPrompt(storyIdea, worldData, characterData);
    
    // The master prompt for generation doesn't need a separate system instruction
    // as it's all-encompassing.
    try {
        const response = await ai.models.generateContent({
            model: getModelForApi(),
            contents: masterPrompt,
            config: {
                temperature: 1,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating world from prompt:", error);
        return `[GENERATED_PLAYER_NAME: name="Lỗi Hệ Thống"]\n[GENERATED_WORLD_THEME: text="Không thể kết nối đến Thiên Cơ, vui lòng thử lại."]\n[GENERATED_WORLD_SETTING_DESCRIPTION: text="Có vẻ như có một sự cố trong việc tạo ra thế giới này. Xin hãy thử lại sau."]`;
    }
};

export const getStoryUpdate = async (
    playerState: PlayerState,
    worldData: WorldData,
    gameTime: GameTime,
    history: GameLogEntry[],
    storySummaries: string[],
    playerAction: string,
    retrievedContext: string | undefined,
    mode: 'action' | 'story'
): Promise<string> => {
    try {
        const prompt = createStoryUpdatePrompt(playerState, worldData, gameTime, history, storySummaries, playerAction, retrievedContext, mode);
        const response = await ai.models.generateContent({
            model: getModelForApi(),
            contents: prompt,
            config: {
                temperature: 1,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting story update:", error);
        return `Hệ thống bỗng nhiên hỗn loạn, thế giới ngừng vận chuyển. \n[CHOICE: "Thử khởi động lại thế giới (Thành công: 10% - Độ khó: Ác Mộng, Lợi ích: Game hoạt động. Rủi ro: Mất hết dữ liệu)"]`;
    }
}

export const generateInitialTalents = async (): Promise<Talent[]> => {
  try {
    const response = await ai.models.generateContent({
      model: getModelForApi(),
      contents: INITIAL_TALENTS_PROMPT,
      config: {
        responseMimeType: "application/json",
        responseSchema: baseTalentSchema,
      }
    });
    
    const jsonString = response.text.trim();
    const talents = JSON.parse(jsonString);
    return talents;

  } catch (error) {
    console.error("Error generating initial talents:", error);
    // Return fallback talents in case of an error
    return [
      { name: "Kiên Nhẫn Thạch", description: "Tăng nhẹ hiệu quả khi bế quan tu luyện lâu dài." },
      { name: "Linh Tê Nhất Chỉ", description: "Thỉnh thoảng có thể tìm thấy linh thảo cấp thấp." },
      { name: "Hòa Quang Đồng Trần", description: "Khó bị các tu sĩ khác chú ý tới, giảm khả năng gặp nguy hiểm." },
    ];
  }
};

export const generateFactorSuggestions = async (
    categoryLabel: string,
    worldGenre: string,
    worldTheme: string
): Promise<Talent[]> => {
    try {
        const prompt = createFactorSuggestionsPrompt(categoryLabel, worldGenre, worldTheme);
        
        const response = await ai.models.generateContent({
            model: getModelForApi(),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: baseTalentSchema, // Re-use the existing schema for {name, description} array
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error generating suggestions for ${categoryLabel}:`, error);
        return [
            { name: "Gợi Ý Thất Bại", description: "Không thể kết nối đến thiên cơ, vui lòng thử lại." }
        ];
    }
};