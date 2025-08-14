import type { CharacterCreationData, WorldData } from "../types";
import { Type } from "@google/genai";
import { DEFAULT_CULTIVATION_REALMS, defaultCultivationSystemDetails, PASTE_PROMPT_INSTRUCTION } from "./definitions";

export const createWorldGenerationPrompt = (
    storyIdea: string, 
    worldData: WorldData, 
    characterData: Partial<CharacterCreationData>
): string => {
    // --- 1. Master Instruction Block ---
    const masterInstruction = `
**QUY TẮC TỐI THƯỢNG: BẠN LÀ NGƯỜI CỘNG TÁC THÔNG MINH**
Nhiệm vụ hàng đầu của bạn là TÔN TRỌNG và XÂY DỰNG dựa trên dữ liệu do người chơi cung cấp.
*   **Nếu một thông tin đã được cung cấp:** Bạn **TUYỆT ĐỐI PHẢI** sử dụng chính xác thông tin đó.
*   **Nếu một thông tin bị bỏ trống:** Bạn hãy **SÁNG TẠO** để lấp đầy khoảng trống đó, dựa trên "Ý Tưởng Cốt Truyện" chung, "Thể Loại", và các thông tin khác đã có.
*   **Mục tiêu:** Tạo ra một thế giới khởi đầu vừa mang đậm dấu ấn của người chơi, vừa được bạn làm phong phú thêm một cách hợp lý.`;

    // --- 2. Dynamic Character Data Block ---
    const characterFields: { key: keyof CharacterCreationData, tag: string, label: string, isTagValueText: boolean }[] = [
        { key: 'name', tag: 'PLAYER_NAME', label: 'Tên Nhân Vật', isTagValueText: false },
        { key: 'gender', tag: 'PLAYER_GENDER', label: 'Giới Tính', isTagValueText: false },
        { key: 'race', tag: 'PLAYER_RACE', label: 'Chủng Tộc', isTagValueText: true },
        { key: 'personality', tag: 'PLAYER_PERSONALITY', label: 'Tính Cách', isTagValueText: true },
        { key: 'biography', tag: 'PLAYER_BACKSTORY', label: 'Tiểu Sử', isTagValueText: true },
        { key: 'objective', tag: 'PLAYER_GOAL', label: 'Mục Tiêu', isTagValueText: true },
        { key: 'linhCan', tag: 'PLAYER_SPIRITUAL_ROOT', label: 'Linh Căn', isTagValueText: true },
    ];

    let characterDataInstruction = characterFields.map(field => {
        const value = characterData[field.key] as string;
        
        if (value && value.trim() && (field.key !== 'gender' || value !== 'Bí Mật')) {
            return `- **${field.label}:** "${value}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
        } else {
            const exampleAttr = field.isTagValueText ? 'text="..."' : `${field.key.toLowerCase()}="..."`;
            return `- **${field.label}:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** và trả về bằng tag [GENERATED_${field.tag}: ${exampleAttr}]).`;
        }
    }).join('\n');
    
    // Special handling for Talent/TheChat
    if (characterData.talent?.name) {
        characterDataInstruction += `\n- **Thiên Phú:** "${characterData.talent.name} - ${characterData.talent.description}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
    } else if (characterData.theChat?.name) {
        characterDataInstruction += `\n- **Thể Chất Đặc Biệt:** "${characterData.theChat.name} - ${characterData.theChat.description}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
    } else {
        characterDataInstruction += `\n- **Thiên Phú/Thể Chất:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** một Thiên Phú và trả về bằng tag [GENERATED_PLAYER_TALENT: name="..." description="..."]).`;
    }
    
    // Thọ Nguyên
    if (characterData.maxThoNguyen && characterData.maxThoNguyen > 0) {
        characterDataInstruction += `\n- **Thọ Nguyên Tối Đa:** ${characterData.maxThoNguyen} (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
    }
    if (characterData.thoNguyen && characterData.thoNguyen > 0) {
        characterDataInstruction += `\n- **Thọ Nguyên Còn Lại:** ${characterData.thoNguyen} (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
    }

    // --- 3. Dynamic World Data Block ---
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
            prefix = PASTE_PROMPT_INSTRUCTION;
            contentBlock = `\n\nVăn bản mẫu:\n"""\n${styleContent}\n"""`;
        } else {
            prefix = 'Mô phỏng theo văn bản sau:'; // Fallback
        }
        aiStyleInput = `${prefix}${contentBlock}`;
    }

    let worldDataInstruction = '';
     if (worldData.storyName?.trim()) {
        worldDataInstruction += `- **Tên Câu Chuyện:** "${worldData.storyName}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).\n`;
    } else {
        worldDataInstruction += `- **Tên Câu Chuyện:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** và trả về bằng tag [GENERATED_STORY_NAME: text="..."]).\n`;
    }
    if (worldData.theme?.trim()) {
        worldDataInstruction += `- **Chủ Đề Thế Giới:** "${worldData.theme}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).\n`;
    } else {
        worldDataInstruction += `- **Chủ Đề Thế Giới:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** và trả về bằng tag [GENERATED_WORLD_THEME: text="..."]).\n`;
    }
    if (worldData.context?.trim()) {
        worldDataInstruction += `- **Bối Cảnh Chi Tiết:** "${worldData.context}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).\n`;
    } else {
        worldDataInstruction += `- **Bối Cảnh Chi Tiết:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** và trả về bằng tag [GENERATED_WORLD_SETTING_DESCRIPTION: text="..."]).\n`;
    }
     worldDataInstruction += `- **Văn phong AI mong muốn:** ${aiStyleInput}\n`;
     const currencyInstruction = `- **Tên Tiền Tệ:** "${worldData.currencyName}" (Giá trị hiện tại). Dựa trên thể loại "${worldData.genre}", hãy quyết định một tên tiền tệ phù hợp. Nếu giá trị hiện tại không phù hợp (ví dụ: "Linh Thạch" cho thể loại "Đô Thị"), hãy tạo một cái tên mới. Nếu phù hợp, hãy giữ nguyên. **BẮT BUỘC** trả về kết quả cuối cùng bằng tag [GENERATED_CURRENCY_NAME: name="..."]`;
     worldDataInstruction += currencyInstruction + '\n';
     worldDataInstruction += `- **Số Tiền Khởi Đầu:** ${worldData.startingCurrency} (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).\n`;
     worldDataInstruction += `- **Ngày Bắt Đầu:** Ngày ${worldData.startingDate.day}, Tháng ${worldData.startingDate.month}, Năm ${worldData.startingDate.year} (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).\n`;
     if (worldData.startingRealm?.trim()) {
        worldDataInstruction += `- **Cảnh Giới Khởi Đầu:** "${worldData.startingRealm}" (Người chơi đã cung cấp, **PHẢI SỬ DỤNG**).`;
     } else {
        worldDataInstruction += `- **Cảnh Giới Khởi Đầu:** (Người chơi bỏ trống, **HÃY SÁNG TẠO** một cảnh giới hợp lý và trả về bằng tag [GENERATED_CANH_GIOI_KHOI_DAU: text="..."]).`;
     }


    // --- 4. Dynamic Cultivation System Block ---
    let cultivationSystemInstruction = '';
    if (worldData.isCultivationEnabled) {
        if (worldData.cultivationSystemType === 'default') {
            cultivationSystemInstruction = `
**Hệ Thống Sức Mạnh/Cảnh Giới:** Người chơi đã chọn "Hệ Thống Mặc Định (Tu Tiên)". Bạn **PHẢI** sử dụng hệ thống này. **TUYỆT ĐỐI KHÔNG** được thay đổi. Hãy đọc kỹ và áp dụng chi tiết của hệ thống này cho toàn bộ thế giới, và xác nhận nó bằng tag sau:
[GENERATED_CULTIVATION_SYSTEM: system="${DEFAULT_CULTIVATION_REALMS.join(' - ')}"]
---
${defaultCultivationSystemDetails}
---
`;
        } else if (worldData.cultivationSystemType === 'user_defined' && worldData.cultivationSystem.length > 0) {
            const userSystem = worldData.cultivationSystem.join(' - ');
            cultivationSystemInstruction = `
**Hệ Thống Sức Mạnh/Cảnh Giới:** Người chơi đã cung cấp một hệ thống tùy chỉnh. Bạn **PHẢI** sử dụng hệ thống này làm nền tảng: "${userSystem}".
Xác nhận hệ thống này bằng tag sau:
[GENERATED_CULTIVATION_SYSTEM: system="${userSystem}"]
`;
        } else { // 'user_defined' but empty -> AI creates
            cultivationSystemInstruction = `
**Hệ Thống Sức Mạnh/Cảnh Giới:** Người chơi yêu cầu bạn, AI, tự sáng tạo một hệ thống sức mạnh/cấp bậc hoàn toàn mới.
*   **Yêu cầu:** Dựa trên Thể loại ("${worldData.genre}") và Bối cảnh thế giới, hãy tạo ra một hệ thống sức mạnh độc đáo có khoảng 10 cấp độ chính.
*   **Đầu ra:** Trả về hệ thống này dưới dạng tag **BẮT BUỘC** sau: \`[GENERATED_CULTIVATION_SYSTEM: system="Tên Cấp 1 - Tên Cấp 2 - ... - Tên Cấp 10"]\`.
*   **Ví dụ (cho Kiếm Hiệp):** \`[GENERATED_CULTIVATION_SYSTEM: system="Sơ Nhập Môn - Luyện Khí Nhập Thể - Khí Vận Chu Thiên - Nội Kình Sơ Thành - Nội Kình Đại Thành - Xuất Thần Nhập Hóa - Khí Tùy Tâm Sinh - Vô Kiếm Thắng Hữu Kiếm - Thiên Nhân Hợp Nhất - Võ Lâm Thần Thoại"]\`
`;
        }
    } else {
        cultivationSystemInstruction = `**Hệ Thống Sức Mạnh/Cảnh Giới:** Đã **TẮT**. Thế giới này không có hệ thống tu luyện hay cấp bậc sức mạnh đặc biệt.`;
    }
    
    const originalDetailedTagInstructions = `
    *   **Tạo ra 9 đến 10 Kỹ Năng Khởi Đầu phù hợp. HƯỚN DẪN CHI TIẾT CHO TAG \`[GENERATED_SKILL: ...]\`:**
        - **Thuộc tính chung (BẮT BUỘC cho mọi loại):** \`name\`, \`description\`, \`skillType="CHỌN MỘT TRONG: Công Pháp Tu Luyện | Linh Kĩ | Nghề Nghiệp | Thần Thông | Cấm Thuật | Khác"\`, \`otherEffects="Hiệu ứng đặc biệt của kĩ năng, bắt buộc phải có"\`.
        - **Thuộc tính cho Công Pháp Tu Luyện (\`skillType="Công Pháp Tu Luyện"\`):**
            - \`congPhapType="CHỌN MỘT TRONG: Khí Tu | Thể Tu | Võ Ý | Hồn Tu | Thôn Phệ | Song Tu | Cổ Tu | Âm Tu"\`
            - \`congPhapGrade="CHỌN MỘT TRONG: Phàm Phẩm | Hoàng Phẩm | Huyền Phẩm | Địa Phẩm | Thiên Phẩm"\`
            - Nếu \`congPhapType="Võ Ý"\`, thêm \`weaponFocus="CHỌN MỘT TRONG: Quyền | Kiếm | Đao | Thương | Côn | Cung | Trượng | Phủ | Chỉ | Trảo | Chưởng"\`.
        - **Thuộc tính cho Linh Kĩ (\`skillType="Linh Kĩ"\`):**
            - \`linhKiCategory="CHỌN MỘT TRONG: Tấn công | Phòng thủ | Hồi phục | Thân pháp | Khác"\`
            - \`linhKiActivation="CHỌN MỘT TRONG: Chủ động | Bị động"\`
            - Nếu \`linhKiActivation="Chủ động"\`, thêm các thuộc tính chiến đấu chung. Nếu \`linhKiCategory="Tấn công"\`, thêm \`baseDamage\`, \`damageMultiplier\`. Nếu \`linhKiCategory="Hồi phục"\`, thêm \`baseHealing\`, \`healingMultiplier\`.
            - Nếu \`linhKiActivation="Bị động"\`, chỉ cần có \`otherEffects\`.
        - **Thuộc tính cho Thần Thông (\`skillType="Thần Thông"\`):** (Chỉ dùng thuộc tính chiến đấu chung).
        - **Thuộc tính cho Cấm Thuật (\`skillType="Cấm Thuật"\`):**
            - \`sideEffects="Mô tả tác dụng phụ, ví dụ: giảm tuổi thọ, mất tu vi..."\`
        - **Thuộc tính cho Nghề Nghiệp (\`skillType="Nghề Nghiệp"\`):** (Bắt buộc phải chọn 1 trong những nghề nghiệp vừa dược đề ra, phải dựa vào tính chất nghề nghiệp để đưa ra các kĩ năng phù hợp)
            - \`professionType="CHỌN MỘT TRONG: Luyện Đan Sư | Luyện Khí Sư | Luyện Phù Sư | Trận Pháp Sư | Khôi Lỗi Sư | Ngự Thú Sư | Linh Thảo Sư | Thiên Cơ Sư | Độc Sư | Linh Trù | Họa Sư"\`
            - \`skillDescription="Mô tả kỹ năng nghề đó làm được gì cụ thể."\`
            - \`professionGrade="CHỌN MỘT TRONG: Nhất phẩm | Nhị phẩm | Tam phẩm | Tứ phẩm | Ngũ phẩm | Lục phẩm | Thất phẩm | Bát phẩm | Cửu phẩm"\`
        - **THUỘC TÍNH CHIẾN ĐẤU CHUNG (Dùng cho Linh Kĩ (Chủ động), Thần Thông, Cấm Thuật):**
            - \`manaCost=SỐ\`, \`cooldown=SỐ LƯỢT\`, \`otherEffects="Hiệu ứng 1;Hiệu ứng 2"\`.
            - **CHỈ DÙNG CHO CÁC KỸ NĂNG GÂY SÁT THƯƠNG/HỒI PHỤC (ví dụ Linh Kĩ Tấn Công/Hồi Phục):**
                - \`baseDamage=SỐ\` (sát thương cơ bản), \`damageMultiplier=SỐ THẬP PHÂN\` (hệ số % ATK, vd: 0.5 cho 50%).
                - \`baseHealing=SỐ\` (hồi phục cơ bản), \`healingMultiplier=SỐ THẬP PHÂN\` (hệ số % ATK, vd: 0.2 cho 20%).
        
        **CHÚ Ý:** Hạn chế tạo ra thần thông hoặc cấm thuật vì đây là những kĩ năng có sát thương cao và hiệu ứng mạnh nhưng bù lại là tiêu hao và hồi chiêu dài, khi tạo cấm thuật thì tác dụng phụ phải cao vì đây là kĩ năng rất rất mạnh có thể thay đổi quy luật trời đất.
        **VÍ DỤ:**
        [GENERATED_SKILL: name="Hỏa Cầu Thuật", description="Tạo ra một quả cầu lửa nhỏ.", skillType="Linh Kĩ", linhKiCategory="Tấn công", linhKiActivation="Chủ động", manaCost=10, cooldown=1, baseDamage=20, otherEffects="Gây hiệu ứng Bỏng trong 2 lượt"]
        [GENERATED_SKILL: name="Thiên Lý Nhãn", description="Tăng cường thị lực, nhìn xa vạn dặm.", skillType="Thần Thông", manaCost=50, cooldown=10, otherEffects="Phát hiện kẻ địch ẩn thân trong phạm vi 1km"]
        [GENERATED_SKILL: name="Huyết Tế Đại Pháp", description="Hi sinh máu tươi để nhận sức mạnh.", skillType="Cấm Thuật", sideEffects="Mất 20% sinh lực tối đa vĩnh viễn sau mỗi lần sử dụng.", manaCost=0, cooldown=100, otherEffects="Tăng 100% Sức Tấn Công trong 5 lượt"]
        [GENERATED_SKILL: name="Kim Cang Quyết", description="Một công pháp luyện thể sơ cấp.", skillType="Công Pháp Tu Luyện", congPhapType="Thể Tu", congPhapGrade="Hoàng Phẩm"]

    *   Tạo ra 9 đến 10 Vật Phẩm Khởi Đầu thú vị, phù hợp với bối cảnh. **LƯU Ý: KHÔNG tạo ra vật phẩm tiền tệ (như Linh Thạch, Vàng) ở đây.**
        **HƯỚN DẪN CHI TIẾT CHO TAG \`[GENERATED_ITEM: ...]\`:**
        - **QUAN TRỌNG VỀ KINH TẾ:** Giá trị của vật phẩm trong game được TÍNH TOÁN DỰA TRÊN các thuộc tính của nó. Vì vậy, việc cung cấp đầy đủ và chính xác các thông tin sau là CỰC KỲ QUAN TRỌNG.
        - **CHI TIẾT THUỘC TÍNH:**
            - \`category\`: BẮT BUỘC. Phải là một trong: \`Equipment | Potion | Material | QuestItem | Miscellaneous | CongPhap | LinhKi | ProfessionSkillBook | ProfessionTool\`.
            - \`rarity\`: BẮT BUỘC. Phải là một trong: \`Phổ Thông | Hiếm | Quý Báu | Cực Phẩm | Thần Thoại | Chí Tôn\`.
            - **\`itemRealm\`: BẮT BUỘC. Đây là cảnh giới/cấp độ của vật phẩm, quyết định sức mạnh và giá trị cơ bản của nó. **PHẢI** là một trong các cảnh giới lớn trong hệ thống tu luyện chung của thế giới mà bạn đã tạo.**
        - **THUỘC TÍNH BỔ SUNG TÙY THEO \`category\`:**
            - Nếu \`category="Equipment"\`:
                - \`equipmentType\`: BẮT BUỘC. Phải là một trong: \`Vũ Khí | Giáp Đầu | Giáp Thân | Giáp Tay | Giáp Chân | Trang Sức | Pháp Bảo | Thú Cưng\`.
                - \`slot\`: TÙY CHỌN. Vị trí trang bị, ví dụ: "Vũ Khí Chính", "Giáp Thân".
                - \`statBonusesJSON\`: BẮT BUỘC. Một chuỗi JSON hợp lệ chứa các chỉ số cộng thêm. Các khóa hợp lệ là: \`sucTanCong, maxSinhLuc, maxLinhLuc\`. Nếu không có, dùng \`statBonusesJSON='{}'\`. Ví dụ: \`statBonusesJSON='{"sucTanCong": 15, "maxSinhLuc": 100}'\`.
                - \`uniqueEffectsList\`: BẮT BUỘC. Danh sách hiệu ứng đặc biệt, cách nhau bởi dấu ';'. Nếu không có, dùng \`uniqueEffectsList="Không có gì đặc biệt"\`. Cố gắng sử dụng các từ khóa sau để hệ thống tính giá trị chính xác hơn: \`hút máu, chí mạng, sát thương chí mạng, xuyên giáp, bỏ qua phòng thủ, phản sát thương, phản đòn, tăng tốc, né tránh, chính xác, kháng tất cả, giảm hồi chiêu, gây choáng, gây tê liệt, gây câm lặng, gây mù, gây độc, gây bỏng, hồi phục sinh lực, hồi phục linh lực, tăng kinh nghiệm, tăng vàng, miễn nhiễm, giảm tiêu hao linh lực, hấp thụ sát thương\`. Ví dụ: \`uniqueEffectsList="hút máu 5%;tăng 10% chí mạng"\`.
            - Nếu \`category="Potion"\`:
                - \`potionType\`: BẮT BUỘC. Phải là một trong: \`Hồi Phục | Tăng Cường | Giải Độc | Đặc Biệt\`.
                - \`effectsList\`: BẮT BUỘC. Danh sách hiệu ứng, cách nhau bởi ';'. Ví dụ: "Hồi 50 HP;Tăng 10 công trong 3 lượt".
            - (Các loại khác giữ nguyên hướng dẫn cũ)
        - **VÍ DỤ (Trang bị):** \`[GENERATED_ITEM: name="Hỏa Vân Kiếm", description="Thanh kiếm được rèn trong địa hỏa, ẩn chứa sức mạnh của lửa.", quantity=1, category="Equipment", rarity="Quý Báu", itemRealm="Trúc Cơ", equipmentType="Vũ Khí", statBonusesJSON='{"sucTanCong": 50}', uniqueEffectsList="Sát thương gây hiệu ứng bỏng 10 dmg/s trong 3 giây"]\`
        - **VÍ DỤ (Đan dược):** \`[GENERATED_ITEM: name="Hồi Nguyên Đan", description="Đan dược giúp phục hồi linh lực nhanh chóng.", quantity=5, category="Potion", rarity="Hiếm", itemRealm="Luyện Khí", potionType="Hồi Phục", effectsList="Hồi phục 200 linh lực"]\`

    *   Tạo ra 9 đến 10 NPC Khởi Đầu quan trọng hoặc thú vị.
        **LƯU Ý QUAN TRỌNG VỀ VẬN MỆNH NPC:** Mỗi NPC chỉ được có **MỘT** trong hai: **Thiên Phú** (\`talent\`) hoặc **Thể Chất Đặc Biệt** (\`specialPhysique\`). Hãy đa dạng hóa lựa chọn này giữa các NPC (ví dụ: NPC này có Thiên Phú, NPC kia có Thể Chất).
        [GENERATED_NPC: name="Tên NPC (BẮT BUỘC)", gender="Nam/Nữ/Khác/Không rõ (BẮT BUỘC)", race="Chủng tộc (BẮT BUỘC, ví dụ: Nhân Tộc, Yêu Tộc, Ma Tộc)", personality="Tính cách nổi bật (BẮT BUỘC)", initialAffinity=0 (SỐ NGUYÊN từ -100 đến 100), details="Vai trò, tiểu sử ngắn hoặc mối liên hệ với người chơi (BẮT BUỘC), phù hợp với thể loại '${worldData.genre}'", realm="Cảnh giới NPC. BẮT BUỘC. PHẢI là một cấp độ hợp lệ từ Hệ Thống Cảnh Giới đã tạo. Đối với người không tu luyện, BẮT BUỘC dùng 'Phàm Nhân Nhất Trọng'. TUYỆT ĐỐI KHÔNG dùng 'Người Thường'. Hãy tạo sự đa dạng, ví dụ: 'Phàm Nhân Nhất Trọng', 'Luyện Khí Tam Trọng', 'Kim Đan Kỳ'.", tuChat="CHỌN MỘT TRONG: Phế Phẩm | Hạ Đẳng | Trung Đẳng | Thượng Đẳng | Cực Phẩm | Tiên Phẩm | Thần Phẩm" (BẮT BUỘC nếu có tu luyện. Tư chất quyết định tốc độ tu luyện của NPC)" spiritualRoot="Linh căn của NPC (BẮT BUỘC, nếu không có thì ghi là 'Không có')", talent="Thiên phú của NPC (CHỈ ĐIỀN NẾU KHÔNG CÓ Thể Chất, nếu không có ghi 'Không có')", specialPhysique="Thể chất của NPC (CHỈ ĐIỀN NẾU KHÔNG CÓ Thiên Phú, nếu không có ghi 'Không có')", thoNguyen=X, maxThoNguyen=Y (BẮT BUỘC. Áp dụng **HƯỚN DẪN VỀ THỌ NGUYÊN** đã cung cấp để tính toán.), relationshipToPlayer="Mối quan hệ (ví dụ: 'Mẹ Con', 'Sư phụ', 'Bằng hữu', 'Chủ nhân - nô lệ', 'Vợ chồng', 'Đạo lữ', 'Đối thủ', 'Bạn thời thơ ấu', 'Người bảo hộ', 'Chủ nợ'...)" (BẮT BUỘC nhưng khi npc và người chơi không có quan hệ gì thì để là 'Người xa lạ')].
        **LOGIC KIỂM TRA (CỰC KỲ QUAN TRỌNG):** Vai trò của NPC (trong thuộc tính 'details') phải tương xứng với cảnh giới ('realm'). Ví dụ: một Trưởng môn phái tu tiên không thể ở cảnh giới Phàm Nhân. Một người bán hàng rong không nên có cảnh giới Kim Đan.
    *   Tạo ra 9 đến 10 Yêu Thú Khởi Đầu (quái vật, thú dữ) phù hợp với bối cảnh.
        [GENERATED_YEUTHU: name="Tên Yêu Thú (BẮT BUỘC)", species="Loài (ví dụ: Hỏa Lang, Băng Giao Long)", description="Mô tả về ngoại hình, tập tính (BẮT BUỘC)", realm="Cảnh giới Yêu Thú (BẮT BUỘC nếu có tu luyện)", isHostile=true (true/false)]
    *   Tạo ra 9 đến 10 Tri Thức Thế Giới Khởi Đầu để làm phong phú bối cảnh.
        [GENERATED_LORE: title="Tiêu đề Tri Thức (BẮT BUỘC)", content="Nội dung chi tiết của tri thức (BẮT BUỘC), phù hợp với thể loại '${worldData.genre}'"]
    *   Tạo ra 9 đến 10 Địa Điểm Khởi Đầu **chính** phù hợp. **Địa điểm đầu tiên trong danh sách sẽ được coi là vị trí khởi đầu của người chơi.** Hãy đảm bảo địa điểm này có tên phù hợp (ví dụ: 'Làng Tân Thủ', 'Căn nhà gỗ', 'Điểm Xuất Phát').
        **Định dạng:** [GENERATED_LOCATION: name="Tên (BẮT BUỘC)", description="Mô tả (BẮT BUỘC)", locationType="CHỌN MỘT TRONG: Làng mạc | Thị trấn | Thành thị | Thủ đô | Tông môn/Gia tộc | Rừng rậm | Núi non | Hang động | Hầm ngục/Bí cảnh | Tàn tích | Sông/Hồ | Địa danh Đặc biệt (Độc lập) | Mặc định" (BẮT BUỘC), isSafeZone=false (true/false), regionId="Tên Vùng", mapX=100 (BẮT BUỘC, 0-1000), mapY=100 (BẮT BUỘC, 0-1000)]
        **LƯU Ý QUAN TRỌNG:** Tất cả các địa điểm được tạo ở đây phải là các địa điểm chính, độc lập (ví dụ: làng, thành phố, hang động, rừng). **KHÔNG** tạo ra các địa điểm phụ nằm bên trong một địa điểm khác (ví dụ: một "Quán trọ" bên trong "Thành phố A"). Các địa điểm phụ sẽ được tạo ra sau trong game.
        **Ví dụ:** [GENERATED_LOCATION: name="Làng Cổ Thụ", description="Một ngôi làng yên bình nằm sâu trong rừng.", locationType="Làng mạc", isSafeZone=true, mapX=250, mapY=300]
    *   Tạo ra 9 đến 10 Phe Phái Khởi Đầu (nếu có, và nếu phù hợp với ý tưởng).
        [GENERATED_FACTION: name="Tên Phe Phái (BẮT BUỘC)", description="Mô tả phe phái (BẮT BUỘC)", alignment="CHỌN MỘT TRONG: Chính Nghĩa | Trung Lập | Tà Ác | Hỗn Loạn" (BẮT BUỘC), initialPlayerReputation=0 (SỐ NGUYÊN)]
`;

    const worldSettingsInstruction = `
---
**Cài đặt Game (Dùng để định hướng sáng tạo):**
- Độ khó: ${worldData.difficulty}
- Mức độ Bạo lực: ${worldData.violenceLevel}
- Nội dung người lớn: ${worldData.isAdultContentEnabled ? 'BẬT' : 'TẮT'}
- Phong cách miêu tả 18+: ${worldData.isAdultContentEnabled ? worldData.adultContentDescriptionStyle : 'Không áp dụng'}
(Hãy tạo ra các NPC, địa điểm, vật phẩm và sự kiện khởi đầu phù hợp với không khí được thiết lập bởi các cài đặt này. Ví dụ: độ khó 'Ác Mộng' nên có các NPC nguy hiểm hơn, vật phẩm hiếm hơn, và bối cảnh tăm tối hơn.)
---
`;

    // --- 5. Assemble the final prompt ---
    return `Bạn là một chuyên gia sáng tạo thế giới cho game nhập vai thể loại "${worldData.genre}" bằng tiếng Việt.
${masterInstruction}

**THÔNG TIN NỀN TẢNG TỪ NGƯỜI CHƠI:**
---
**Ý Tưởng Cốt Truyện:** "${storyIdea || '(Không có)'}"
---
**Thiết Lập Thế Giới:**
${worldDataInstruction}
---
**Thông Tin Nhân Vật:**
${characterDataInstruction}
---
${worldSettingsInstruction}
**HƯỚNG DẪN CHI TIẾT:**
${cultivationSystemInstruction}

**HƯỚN DẪN VỀ THỌ NGUYÊN (TUỔI THỌ):**
Tuổi thọ tối đa (\`maxThoNguyen\`) tăng mạnh theo từng đại cảnh giới. Đây là quy tắc BẮT BUỘC bạn phải tuân theo khi tạo người chơi và NPC.
*   **Công thức tính (Nếu có hệ thống cảnh giới):**
    1.  **Thọ nguyên gốc (Phàm Nhân/Cấp 0):** 120 năm.
    2.  **Thọ nguyên cộng thêm mỗi đại cảnh giới:** \`Thọ nguyên cộng thêm = 100 * (1.8 ^ (Thứ tự đại cảnh giới - 1))\`.
        *   Cảnh giới 1 (ví dụ: Luyện Khí): \`maxThoNguyen\` = 120 + 100 * (1.8^0) = 220 năm.
        *   Cảnh giới 2 (ví dụ: Trúc Cơ): \`maxThoNguyen\` = 220 + 100 * (1.8^1) = 220 + 180 = 400 năm.
        *   ... và cứ thế tiếp tục.
*   **Cách áp dụng:**
    *   Nếu người chơi **KHÔNG** cung cấp \`maxThoNguyen\` và \`thoNguyen\`, bạn **PHẢI** tính toán chúng.
    *   **\`maxThoNguyen\`:** PHẢI được tính theo công thức trên dựa vào cảnh giới của nhân vật.
    *   **\`thoNguyen\` (số năm còn lại):** PHẢI nhỏ hơn \`maxThoNguyen\`. Ước tính một độ tuổi hợp lý cho nhân vật (ví dụ: 18-25 cho người mới), sau đó tính: \`thoNguyen = maxThoNguyen - tuổi\`.

**YÊU CẦU ĐẦU RA (OUTPUT):**
Bây giờ, hãy hoàn thành nhiệm vụ của bạn. Tạo ra tất cả các yếu tố còn thiếu và trả về chúng bằng các tag được liệt kê dưới đây. Mỗi tag trên một dòng riêng. **KHÔNG** thêm bất kỳ lời dẫn, giải thích, hay văn bản nào khác ngoài các tag được yêu cầu.

---
**DANH SÁCH TAG CẦN TRẢ VỀ (CHỈ TRẢ VỀ TAG CHO CÁC MỤC CÒN TRỐNG):**
${(characterFields.map(field => {
        // We already handled the special case for 'objective' inside the map.
        const value = characterData[field.key] as string;
        if (!value || !value.trim() || (field.key === 'gender' && value === 'Bí Mật')) {
             const exampleAttr = field.isTagValueText ? 'text="..."' : `${field.key.toLowerCase()}="..."`;
            return `[GENERATED_${field.tag}: ${exampleAttr}]`;
        }
        // If data is provided, don't ask the AI to generate a tag for it, it should use the value internally.
        return '';
    }).filter(Boolean).join('\n'))}
${(!characterData.talent?.name && !characterData.theChat?.name) ? '[GENERATED_PLAYER_TALENT: name="..." description="..."]' : ''}
${(!characterData.maxThoNguyen || characterData.maxThoNguyen <= 0) ? '[GENERATED_PLAYER_MAX_THO_NGUYEN: value=...]' : ''}
${(!characterData.thoNguyen || characterData.thoNguyen <= 0) ? '[GENERATED_PLAYER_THO_NGUYEN: value=...]' : ''}
${(!worldData.storyName || !worldData.storyName.trim()) ? '[GENERATED_STORY_NAME: text="..."]' : ''}
${(!worldData.theme || !worldData.theme.trim()) ? '[GENERATED_WORLD_THEME: text="..."]' : ''}
${(!worldData.context || !worldData.context.trim()) ? '[GENERATED_WORLD_SETTING_DESCRIPTION: text="..."]' : ''}
${(!worldData.startingRealm || !worldData.startingRealm.trim()) ? '[GENERATED_CANH_GIOI_KHOI_DAU: text="..."]' : ''}

**CÁC TAG LUÔN PHẢI TRẢ VỀ (ĐỂ XÁC NHẬN):**
[GENERATED_CURRENCY_NAME: name="${worldData.currencyName}"]
[GENERATED_STARTING_CURRENCY: value=${worldData.startingCurrency}]
[GENERATED_STARTING_DATE: day=${worldData.startingDate.day}, month=${worldData.startingDate.month}, year=${worldData.startingDate.year}]
[GENERATED_GENRE: text="${worldData.genre}"]
[GENERATED_IS_CULTIVATION_ENABLED: value=${worldData.isCultivationEnabled}]
---
**Tạo ra 5 đến 7 Yếu Tố Khởi Đầu đa dạng và phù hợp với thế giới:**
(Bao gồm Kỹ Năng, Vật Phẩm, NPC, Yêu Thú, Tri Thức, Địa Điểm, Phe Phái. Phải tuân thủ định dạng chi tiết bên dưới)
${originalDetailedTagInstructions}
`;
};

export const baseTalentSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
        },
        required: ['name', 'description'],
    },
};

export const INITIAL_TALENTS_PROMPT = `
Bạn là AI tạo ra các yếu tố cho game tu tiên. 
Hãy tạo ra 3 "Thiên Phú Bẩm Sinh" (Talent) độc đáo và thú vị cho người chơi lựa chọn khi bắt đầu.
Mỗi thiên phú cần có Tên (name) và Mô tả ngắn gọn (description) về tác dụng của nó.
Tên nên nghe có vẻ huyền bí, tu tiên. Mô tả nên rõ ràng về lợi ích mà nó mang lại.
Không tạo các thiên phú quá bá đạo, chỉ nên mang lại lợi thế nhỏ ở giai đoạn đầu.

Ví dụ:
- Name: "Luyện Đan Kỳ Tài", Description: "Tăng tỷ lệ thành công khi luyện đan dược cấp thấp."
- Name: "Thân Pháp Phiêu Dật", Description: "Giảm nhẹ khả năng bị kẻ địch đánh trúng trong chiến đấu."
- Name: "Khí Vận Hung Tàn", Description: "Gây thêm một chút sát thương khi tấn công kẻ địch đang bị thương."

Hãy sáng tạo ra 3 thiên phú mới theo cấu trúc trên.
`;

export const createFactorSuggestionsPrompt = (
    categoryLabel: string,
    worldGenre: string,
    worldTheme: string
): string => {
    return `
Bạn là AI chuyên sáng tạo các yếu tố cho game nhập vai. 
Dựa vào các thông tin về thế giới game dưới đây, hãy tạo ra 3 gợi ý độc đáo cho danh mục "${categoryLabel}".

**Thông tin thế giới:**
- **Thể loại:** ${worldGenre}
- **Chủ đề/Bối cảnh:** ${worldTheme}

**Yêu cầu:**
- Mỗi gợi ý phải bao gồm một "Tên" (name) và một "Mô tả" (description) ngắn gọn.
- Các gợi ý phải phù hợp với thể loại và chủ đề của thế giới. Ví dụ, nếu thế giới là "Ma đạo trỗi dậy", các gợi ý NPC có thể là "Lão ma đầu ẩn thế" hoặc "Thiếu hiệp chính đạo cuối cùng".
- "Tên" phải độc đáo và gợi hình.
- "Mô tả" phải khơi gợi sự tò mò và tiềm năng cho cốt truyện.
`;
};