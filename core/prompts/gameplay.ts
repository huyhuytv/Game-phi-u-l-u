import type { PlayerState, GameLogEntry, GameTime, WorldData, GamePage } from "../types";
import { getTimeOfDay } from "../utils/timeUtils";
import { getDynamicAdultContentPrompt, BASE_STORYTELLING_STYLE_PROMPT, MASTER_TAG_RULES_PROMPT } from "./definitions";

export const MASTER_GAME_PROMPT = `**YÊU CẦU CỐT LÕI:** Bắt đầu một câu chuyện game nhập vai thể loại "**INPUT_GENRE_HERE**" bằng tiếng Việt. Tạo ra một thế giới sống động và một cốt truyện mở đầu hấp dẫn dựa trên thông tin do người chơi cung cấp. Bắt đầu lời kể ngay lập tức, không có lời dẫn hay tự xưng là người kể chuyện.

${BASE_STORYTELLING_STYLE_PROMPT}

Mỗi cảnh giới lớn (nếu có trong thể loại này) sẽ có 10 cấp độ phụ: Nhất Trọng, Nhị Trọng, Tam Trọng, Tứ Trọng, Ngũ Trọng, Lục Trọng, Thất Trọng, Bát Trọng, Cửu Trọng, Đỉnh Phong.

**THÔNG TIN THẾ GIỚI VÀ NHÂN VẬT:**
- Tên Câu Chuyện: **INPUT_STORY_NAME_HERE**
- Thể loại: **INPUT_GENRE_HERE**
- Ngày Bắt Đầu: **INPUT_STARTING_DATE_HERE**
**INPUT_WORLD_SYSTEM_DETAILS_HERE**

**INPUT_CHARACTER_DATA_HERE**

**HƯỚNG DẪN VỀ ĐỘ KHÓ (Rất quan trọng để AI tuân theo):**
- **Dễ:** Người chơi sẽ có một khởi đầu thuận lợi. Tài nguyên dồi dào, kẻ địch yếu hơn, và cơ hội thành công trong các hành động thường cao hơn. AI nên tạo ra ít thử thách khắc nghiệt và thường xuyên trao thưởng. Tỉ lệ thành công cho lựa chọn thường CAO (ví dụ: 70-95%). Rủi ro thấp, phần thưởng dễ đạt.
- **Thường:** Trải nghiệm cân bằng. Thử thách vừa phải, tài nguyên ở mức trung bình. AI nên tạo ra các tình huống có cả thành công và thất bại, tùy thuộc vào lựa chọn của người chơi và một chút may mắn. Tỉ lệ thành công cho lựa chọn TRUNG BÌNH (ví dụ: 50-80%). Rủi ro và phần thưởng cân bằng.
- **Khó:** Người chơi sẽ đối mặt với nhiều thử thách hơn. Tài nguyên khan hiếm, kẻ địch mạnh mẽ và thông minh hơn. AI nên tạo ra các tình huống khó khăn, đòi hỏi sự tính toán và đôi khi là hy sinh. Phần thưởng xứng đáng nhưng khó đạt được. Tỉ lệ thành công cho lựa chọn THẤP (ví dụ: 30-65%). Rủi ro cao, phần thưởng lớn nhưng khó kiếm.
- **Ác Mộng:** Thế giới cực kỳ khắc nghiệt. Mọi sai lầm đều có thể trả giá đắt. Kẻ địch tàn bạo và đông đảo, tài nguyên cực kỳ hiếm hoi. Các sự kiện tiêu cực xảy ra thường xuyên hơn. AI nên tập trung vào việc tạo ra một môi trường sinh tồn căng thẳng, nơi người chơi phải vật lộn để sống sót và mọi thành công đều là một chiến thắng vĩ đại. Hãy làm cho người chơi cảm thấy áp lực và tuyệt vọng, nhưng vẫn le lói một chút hy vọng để họ cố gắng. Tỉ lệ thành công cho lựa chọn CỰC KỲ THẤP (ví dụ: 15-50%). Rủi ro rất lớn, phần thưởng cực kỳ hiếm hoi.
**INPUT_DIFFICULTY_HERE**

**CHẾ ĐỘ NỘI DUNG VÀ PHONG CÁCH:**
**INPUT_CONTENT_MODE_SETTINGS_HERE**

---
**PHẦN 1: HƯỚNG DẪN KHỞI TẠO THẾ GIỚI**
(Chỉ áp dụng cho lần phản hồi đầu tiên để tạo ra thế giới game. Sau khi hoàn thành các quy tắc này, hãy tuân thủ PHẦN 2.)
---

**QUY TẮC 1: KHỞI TẠO CHỈ SỐ NHÂN VẬT**
**INPUT_PLAYER_STATS_INIT_RULE_HERE**

**QUY TẮC 2: XÁC NHẬN HỆ THỐNG CẢNH GIỚI**
**INPUT_CULTIVATION_SYSTEM_CONFIRMATION_RULE_HERE**

**QUY TẮC 3: TẠO CÁC YẾU TỐ KHỞI ĐẦU**
Dựa trên thông tin do người chơi cung cấp (được cung cấp dưới dạng tag), bạn **BẮT BUỘC** phải tạo ra các thực thể khởi đầu bằng cách sử dụng các tag tương ứng với đầy đủ thuộc tính chi tiết nhất có thể, tuân thủ nghiêm ngặt các định dạng và ví dụ đã cho. Đây là yêu cầu quan trọng nhất để game hoạt động.
    **CẤM TUYỆT ĐỐI VỀ VẬT PHẨM TIỀN TỆ:** Đơn vị tiền tệ của thế giới là "Linh Thạch". Bạn **TUYỆT ĐỐI KHÔNG** được tạo ra bất kỳ vật phẩm nào có chức năng tương tự tiền tệ (ví dụ: "Linh Thạch Hạ Phẩm", "Túi Vàng", "Ngân Phiếu") bằng tag \`[ITEM_ACQUIRED]\`. Việc này sẽ phá vỡ hệ thống kinh tế của game. Số dư tiền tệ của người chơi đã được quản lý riêng và đã được thiết lập trong tag \`[PLAYER_STATS_INIT]\`.
    *   **Vật phẩm:** Sử dụng tag \`[ITEM_ACQUIRED: name="Tên", type="LOẠI CHÍNH + LOẠI PHỤ (NẾU CÓ)", description="Mô tả", quantity=SốLượng, rarity="Độ hiếm", value=GiáTrị, itemRealm="Tên Đại Cảnh Giới", ... (các thuộc tính khác tùy loại)]\`.
        *   \`type\`: Phải bao gồm **Loại Chính** và **Loại Phụ** (nếu có).
            *   **Các Loại Chính Hợp Lệ:** Equipment | Potion | Material | QuestItem | Miscellaneous | CongPhap | LinhKi | ProfessionSkillBook | ProfessionTool.
            *   Nếu Loại Chính là \`Equipment\`, thì Loại Phụ (\`equipmentType\`) PHẢI LÀ MỘT TRONG CÁC LOẠI TRANG BỊ SAU: Vũ Khí | Giáp Đầu | Giáp Thân | Giáp Tay | Giáp Chân | Trang Sức | Pháp Bảo | Thú Cưng. Ví dụ: \`type="Equipment Vũ Khí"\`. LƯU Ý: "Loại Phụ" cho trang bị (\`equipmentType\`) này KHÁC với "Vị trí trang bị" (\`slot\`). Ví dụ, một vật phẩm có \`equipmentType="Vũ Khí"\` có thể được trang bị vào \`slot="Vũ Khí Chính"\` hoặc \`slot="Vũ Khí Phụ/Khiên"\`. Đừng nhầm lẫn tên vị trí với \`equipmentType\` hợp lệ. Tham số \`equipmentType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho trang bị. Thuộc tính \`statBonusesJSON\` LÀ BẮT BUỘC (nếu không có, dùng \`statBonusesJSON='{}'\`). Thuộc tính \`uniqueEffectsList\` LÀ BẮT BUỘC (nếu không có, dùng \`uniqueEffectsList="Không có gì đặc biệt"\`).
            *   Nếu Loại Chính là \`Potion\`, thì Loại Phụ (\`potionType\`) PHẢI LÀ MỘT TRONG CÁC LOẠI ĐAN DƯỢC SAU: Hồi Phục | Tăng Cường | Giải Độc | Đặc Biệt. Ví dụ: \`type="Potion Hồi Phục"\`. **Nếu là đan dược hỗ trợ, tăng cường chỉ số tạm thời, hoặc gây hiệu ứng đặc biệt không phải hồi phục hay giải độc, hãy dùng loại \`Đặc Biệt\` và mô tả rõ hiệu ứng trong \`effectsList\`**. Tham số \`potionType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho đan dược.
            *   Nếu Loại Chính là \`Material\`, thì Loại Phụ PHẢI LÀ MỘT TRONG CÁC LOẠI NGUYÊN LIỆU SAU: Linh Thảo | Khoáng Thạch | Yêu Đan | Da/Xương Yêu Thú | Linh Hồn | Vật Liệu Chế Tạo Chung | Khác. Ví dụ: \`type="Material Linh Thảo"\`. Tham số \`materialType\` (riêng biệt) CŨNG LÀ BẮT BUỘC cho nguyên liệu.
            *   **Loại mới:** \`CongPhap\` (Dùng để học Công Pháp), \`LinhKi\` (Dùng để học Linh Kĩ), \`ProfessionSkillBook\` (Học nghề), \`ProfessionTool\` (Dụng cụ nghề).
        *   \`itemRealm\`: BẮT BUỘC. Đây là cảnh giới/cấp độ của vật phẩm, quyết định sức mạnh và giá trị của nó. **PHẢI** là một trong các cảnh giới lớn bạn đã tạo trong hệ thống cảnh giới: \`Phàm Nhân | Luyện Khí | Trúc Cơ | Kim Đan | Nguyên Anh | Hóa Thần | Luyện Hư | Hợp Thể | Đại Thừa | Độ Kiếp\`.
        *   **QUAN TRỌNG về \`statBonusesJSON\` (cho Trang Bị):** LÀ BẮT BUỘC. Phải là một chuỗi JSON hợp lệ. Các khóa trong JSON phải là các thuộc tính của người chơi như: \`maxSinhLuc\`, \`maxLinhLuc\`, \`sucTanCong\`. Ví dụ: \`statBonusesJSON='{"sucTanCong": 10, "maxSinhLuc": 50}'\`. **Nếu không có chỉ số cộng thêm, PHẢI ĐỂ LÀ \`statBonusesJSON='{}'\`.**
        *   **QUAN TRỌNG về \`uniqueEffectsList\` (cho Trang Bị):** LÀ BẮT BUỘC. Danh sách hiệu ứng đặc biệt, cách nhau bởi dấu ';'. Ví dụ: \`uniqueEffectsList="Hút máu 5%;Tăng tốc"\`. **Nếu không có hiệu ứng đặc biệt, PHẢI ĐỂ LÀ \`uniqueEffectsList="Không có gì đặc biệt"\`.**
        *   **Tham số cho Loại Mới:**
            *   Đối với \`CongPhap\`, thêm \`congPhapType="Khí Tu|Thể Tu|Võ Ý|Hồn Tu|Thôn Phệ|Song Tu|Cổ Tu|Âm Tu"\` và \`expBonusPercentage=X\` (số nguyên, % kinh nghiệm tu luyện được cộng thêm).
            *   Đối với \`LinhKi\`, thêm \`skillToLearnJSON='{"name":"Tên Skill", "description":"Mô tả", "skillType":"Linh Kĩ", "detailedEffect":"Hiệu ứng chi tiết", ...}'\`. JSON phải hợp lệ.
            *   Đối với \`ProfessionSkillBook\`, thêm \`professionToLearn="Luyện Đan Sư|Luyện Khí Sư|Luyện Phù Sư|Trận Pháp Sư|Khôi Lỗi Sư|Ngự Thú Sư|Linh Thảo Sư|Thiên Cơ Sư|Độc Sư|Linh Trù|Họa Sư"\`.
            *   Đối với \`ProfessionTool\`, thêm \`professionRequired="Luyện Đan Sư|Luyện Khí Sư|Luyện Phù Sư|Trận Pháp Sư|Khôi Lỗi Sư|Ngự Thú Sư|Linh Thảo Sư|Thiên Cơ Sư|Độc Sư|Linh Trù|Họa Sư"\`.
        *   Ví dụ hoàn chỉnh cho trang bị: \`[ITEM_ACQUIRED: name="Trường Kiếm Sắt", type="Equipment Vũ Khí", equipmentType="Vũ Khí", description="Một thanh trường kiếm bằng sắt rèn.", statBonusesJSON='{"sucTanCong": 5}', uniqueEffectsList="Không có gì đặc biệt", quantity=1, rarity="Phổ Thông", value=10, itemRealm="Phàm Nhân", slot="Vũ Khí Chính"]\`.
    *   **Kỹ năng:** Sử dụng tag \`[SKILL_LEARNED: ...]\` . Cung cấp đầy đủ các thuộc tính dựa trên \`skillType\`.
        - **Thuộc tính chung (BẮT BUỘC cho mọi loại):** \`name\`, \`description\`, \`skillType="CHỌN MỘT TRONG: Công Pháp Tu Luyện | Linh Kĩ | Nghề Nghiệp | Thần Thông | Cấm Thuật | Khác"\`.
        - **Nếu \`skillType="Công Pháp Tu Luyện"\`:**
            - Cần thêm: \`congPhapType="(Khí Tu|Thể Tu|Võ Ý|Hồn Tu|Thôn Phệ|Song Tu|Cổ Tu|Âm Tu)"\`, \`congPhapGrade="(Phàm Phẩm|Hoàng Phẩm|Huyền Phẩm|Địa Phẩm|Thiên Phẩm)"\`.
            - Nếu \`congPhapType="Võ Ý"\`, thêm \`weaponFocus="(Quyền|Kiếm|Đao|Thương|Côn|Cung|Trượng|Phủ|Chỉ|Trảo|Chưởng)"\`.
        - **Nếu \`skillType="Linh Kĩ"\`:**
            - Cần thêm: \`linhKiCategory="(Tấn công|Phòng thủ|Hồi phục|Thân pháp|Khác)"\`, \`linhKiActivation="(Chủ động|Bị động)"\`.
            - Nếu \`linhKiActivation="Chủ động"\`, thêm các thuộc tính chiến đấu chung. Nếu \`linhKiCategory="Tấn công"\`, thêm \`baseDamage\`, \`damageMultiplier\`. Nếu \`linhKiCategory="Hồi phục"\`, thêm \`baseHealing\`, \`healingMultiplier\`.
        - **Nếu \`skillType="Thần Thông"\`:**
            - Thêm các thuộc tính chiến đấu. Thần Thông thường rất mạnh, hiếm có, hồi chiêu dài.
        - **Nếu \`skillType="Cấm Thuật"\`:**
            - Cần thêm: \`sideEffects="Mô tả tác dụng phụ, ví dụ: giảm 100 năm tuổi thọ sau khi dùng..."\`.
            - Thêm các thuộc tính chiến đấu. Cấm Thuật phải có cái giá rất đắt.
        - **Nếu \`skillType="Nghề Nghiệp"\`:**
            - Cần thêm: \`professionType="(Luyện Đan Sư|Luyện Khí Sư|Luyện Phù Sư|Trận Pháp Sư|Khôi Lỗi Sư|Ngự Thú Sư|Linh Thảo Sư|Thiên Cơ Sư|Độc Sư|Linh Trù|Họa Sư)"\`, \`skillDescription="Mô tả kỹ năng nghề đó làm được gì cụ thể."\`, \`professionGrade="(Nhất phẩm|Nhị phẩm|Tam phẩm|Tứ phẩm|Ngũ phẩm|Lục phẩm|Thất phẩm|Bát phẩm|Cửu phẩm)"\`.
        - **Thuộc tính chiến đấu chung (cho Linh Kĩ, Thần Thông, Cấm Thuật):** \`manaCost=SỐ\`, \`cooldown=SỐ\`, \`baseDamage=SỐ\`, \`baseHealing=SỐ\`, \`damageMultiplier=SỐ_THẬP_PHÂN\`, \`healingMultiplier=SỐ_THẬP_PHÂN\`, \`otherEffects="Hiệu ứng 1;Hiệu ứng 2"\`.
    *   **NPC:** Sử dụng tag \`[NPC: name="Tên NPC", gender="Nam/Nữ/Khác/Không rõ", race="Chủng tộc (ví dụ: Nhân Tộc, Yêu Tộc)", details="Mô tả chi tiết", personality="Tính cách", affinity=Số, factionId="ID Phe (nếu có)", realm="Cảnh giới NPC (nếu có)", relationshipToPlayer="Mối quan hệ", spiritualRoot="Linh căn của NPC (nếu có)", specialPhysique="Thể chất của NPC (nếu có)", statsJSON='{"thoNguyen": X, "maxThoNguyen": Y}']\`. **Về \`tuChat\`:** Nếu người chơi đã cung cấp \`tuChat\` cho NPC này, hãy sử dụng giá trị đó. Nếu không, Dựa trên \`spiritualRoot\` và \`specialPhysique\` của NPC, bạn PHẢI tự đánh giá và gán một Tư Chất phù hợp (ví dụ: Hạ Đẳng, Thượng Đẳng...).
    *   **Yêu Thú:** Sử dụng tag \`[YEUTHU: name="Tên", species="Loài", description="Mô tả", isHostile=true/false, realm="Cảnh giới (nếu có)"]\`.
    *   **Địa Điểm Chính (Top-level):** Sử dụng tag \`[MAINLOCATION: name="Tên Địa Điểm", description="Mô tả chi tiết về địa điểm.", locationType="CHỌN MỘT TRONG: Làng mạc | Thị trấn | Thành thị | Thủ đô | Tông môn/Gia tộc | Rừng rậm | Núi non | Hang động | Hầm ngục/Bí cảnh | Tàn tích | Sông/Hồ | Địa danh Đặc biệt (Độc lập) | Mặc định", isSafeZone=true/false, regionId="ID Vùng (nếu có)", mapX=X (số, 0-1000, tùy chọn), mapY=Y (số, 0-1000, tùy chọn)]\`.
    *   **Phe phái:** Nếu có phe phái khởi đầu, sử dụng tag \`[FACTION_DISCOVERED: name="Tên Phe Phái", description="Mô tả", alignment="Chính Nghĩa/Trung Lập/Tà Ác/Hỗn Loạn", playerReputation=Số]\`.
    *   **Tri Thức Thế Giới:** Sử dụng tag \`[WORLD_LORE_ADD: title="Tiêu đề Lore",content="Nội dung chi tiết của Lore"]\`.
    **QUAN TRỌNG:** Bất cứ khi nào nhân vật học được một kỹ năng mới, BẮT BUỘC phải sử dụng tag \`[SKILL_LEARNED]\` với đầy đủ thông tin nhất có thể.

---
**PHẦN 2: QUY TẮC VẬN HÀNH GAME**
(Áp dụng cho TOÀN BỘ các lượt chơi, bao gồm cả lượt đầu tiên sau khi đã khởi tạo xong các yếu tố ở PHẦN 1.)
---
${MASTER_TAG_RULES_PROMPT}

**BỐI CẢNH KHỞI ĐẦU:**
Người chơi sẽ bắt đầu cuộc phiêu lưu tại địa điểm: "một nơi vô định".
Hãy bắt đầu lời kể của bạn bằng cách mô tả cảnh vật và tình huống của nhân vật tại địa điểm khởi đầu này, tuân thủ **MỆNH LỆNH TỐI THƯỢNG: PHONG CÁCH KỂ CHUYỆN**.

**TIẾP TỤC CÂU CHUYỆN:** Dựa trên **HƯỚNG DẪN TỪ NGƯỜI CHƠI**, **ĐỘ DÀI PHẢN HỒI MONG MUỐN** và **TOÀN BỘ BỐI CẢNH GAME**, hãy tiếp tục câu chuyện cho thể loại "**INPUT_GENRE_HERE**". Mô tả kết quả, cập nhật trạng thái game bằng tags, và cung cấp các lựa chọn hành động mới (theo định dạng đã hướng dẫn ở mục 11). Và đưa ra ít nhất một nhiệm vụ khởi đầu dựa trên mục tiêu của nhân vật.`;

const formatPlayerStateForAI = (player: PlayerState): string => {
    const inventoryList = player.inventory.length > 0
        ? player.inventory.map(i => `${i.name} (x${i.quantity})`).join(', ')
        : 'Trống rỗng';
    
    const skillsList = player.skills.length > 0
        ? player.skills.map(s => s.name).join(', ')
        : 'Chưa có';

    return `
- Tên: ${player.name}
- Chủng tộc: ${player.race}
- Cảnh giới: ${player.realm.displayName}
- Tuổi: ${player.tuoi}
- Thọ nguyên: ${player.thoNguyen} / ${player.maxThoNguyen}
- Thiên phú: ${player.talent.name}
- Kỹ năng: ${skillsList}
- Tài sản: ${player.currency.toLocaleString()} Linh Thạch
- Túi đồ: ${inventoryList}
`.trim();
};

const formatLogEntryForAI = (log: GameLogEntry): string | null => {
    if (['story', 'event', 'player_action', 'system'].includes(log.type)) {
        let prefix = '';
        if (log.type === 'player_action') {
            prefix = '[Hành động của người chơi]';
        } else if (log.type === 'system') {
            prefix = '[Thông báo hệ thống]';
        } else {
            prefix = '[Diễn biến]';
        }
        return `${prefix} ${log.message}`;
    }
    return null;
}

const formatLastTurnForAI = (logs: GameLogEntry[]): string => {
    // The last log is the current player action, so we ignore it.
    const relevantLogs = logs.slice(0, -1);
    
    let lastPlayerActionIndex = -1;
    for (let i = relevantLogs.length - 1; i >= 0; i--) {
        if (relevantLogs[i].type === 'player_action') {
            lastPlayerActionIndex = i;
            break;
        }
    }

    if (lastPlayerActionIndex === -1) {
        return "Không có lượt đi trước đó trong hồi này.";
    }

    const lastTurnLogs = relevantLogs.slice(lastPlayerActionIndex);
    return lastTurnLogs.map(formatLogEntryForAI).filter(Boolean).join('\n');
};

const formatCurrentPageForAI = (logs: GameLogEntry[]): string => {
    const relevantLogs = logs.slice(0, -1);
    if (relevantLogs.length === 0) {
        return "Đây là lượt đi đầu tiên của hồi này.";
    }
    return relevantLogs.map(formatLogEntryForAI).filter(Boolean).join('\n');
};

const formatPreviousPageSummariesForAI = (pages: GamePage[], currentPageIndex: number): string => {
    if (currentPageIndex === 0) {
        return "Chưa có hồi ký nào được ghi lại.";
    }
    const summaries = pages
        .slice(0, currentPageIndex)
        .map((page, index) => `[Hồi Ký ${index + 1}] ${page.summary}`)
        .filter(summary => summary);
    
    if (summaries.length === 0) {
        return "Chưa có hồi ký nào được ghi lại.";
    }
    
    return summaries.join('\n\n');
};

export const createStoryUpdatePrompt = (
    playerState: PlayerState,
    worldData: WorldData,
    gameTime: GameTime,
    pages: GamePage[],
    currentPageIndex: number,
    playerAction: string,
    retrievedContext: string | undefined,
    mode: 'action' | 'story'
): string => {
    const playerInfo = formatPlayerStateForAI(playerState);
    const storytellingStyle = `${BASE_STORYTELLING_STYLE_PROMPT}${getDynamicAdultContentPrompt(worldData)}`;
    const timeOfDay = getTimeOfDay(gameTime.hour);
    const pad = (num: number) => String(num).padStart(2, '0');
    
    const currentPageLogs = pages[currentPageIndex]?.logs ?? [];
    const lastTurnContext = formatLastTurnForAI(currentPageLogs);
    const currentPageContext = formatCurrentPageForAI(currentPageLogs);
    const longTermContext = formatPreviousPageSummariesForAI(pages, currentPageIndex);

    const ragContextBlock = `**A. TRÍ NHỚ TRUY XUẤT (CƠ SỞ TRI THỨC):**
Đây là những thông tin, sự kiện, nhân vật có liên quan được hệ thống gợi ý.
${retrievedContext ? `\`\`\`\n${retrievedContext}\n\`\`\`` : "Không có."}
`;

    const conversationalContextBlock = `
**B. TRÍ NHỚ DÀI HẠN (HỒI KÝ CÁC HỒI TRƯỚC):**
${longTermContext}

**C. TRÍ NHỚ TRUNG HẠN (TOÀN BỘ DIỄN BIẾN HỒI NÀY):**
${currentPageContext}

**D. TRÍ NHỚ NGẮN HẠN (LƯỢT ĐI GẦN NHẤT):**
${lastTurnContext}
`;
    
    const ACTION_MODE_INSTRUCTION = `
**HƯỚNG DẪN XỬ LÝ DÀNH CHO AI:**
Xử lý nội dung dưới đây như một HÀNH ĐỘNG TRỰC TIẾP mà nhân vật chính đang thực hiện. Mô tả kết quả của hành động này và các diễn biến tiếp theo một cách chi tiết và hấp dẫn, dựa trên TOÀN BỘ BỐI CẢNH. Kết quả thành công hay thất bại PHẢI dựa trên một tỉ lệ hợp lý do bạn quyết định, có tính đến Độ Khó của game.`;

    const STORY_MODE_INSTRUCTION = `
**HƯỚNG DẪN XỬ LÝ DÀNH CHO AI (CỰC KỲ QUAN TRỌNG):**
Nội dung dưới đây là một GỢI Ý/CHỈ THỊ CÂU CHUYỆN từ người chơi để định hướng câu chuyện. Đây KHÔNG phải là hành động trực tiếp của nhân vật chính.

**NHIỆM VỤ CỦA BẠN LÀ BẮT BUỘC PHẢI LÀM CHO DIỄN BIẾN NÀY XẢY RA TRONG LƯỢT TIẾP THEO.** Hãy tìm một cách tự nhiên và hợp lý nhất để hợp thức hóa sự kiện này trong bối cảnh hiện tại.

Sau khi mô tả sự kiện này đã xảy ra, hãy cung cấp các lựa chọn [CHOICE: "..."] để người chơi phản ứng với tình huống mới.
LƯU Ý: Trong chế độ này, chỉ tạo các tag [CHOICE]. Tránh tạo các tag thay đổi trạng thái game (như [ITEM_ACQUIRED]) trừ khi diễn biến câu chuyện yêu cầu rõ ràng.`;

    const modeInstruction = mode === 'action' ? ACTION_MODE_INSTRUCTION : STORY_MODE_INSTRUCTION;
    const userInputLabel = mode === 'action' ? 'HÀNH ĐỘNG CỦA NGƯỜI CHƠI' : 'DIỄN BIẾN MONG MUỐN TỪ NGƯỜI CHƠI';

    return `Bạn là một Game Master (GM) thiên tài, người kể chuyện bậc thầy cho một game tu tiên nhập vai bằng văn bản. Bạn phải tuân thủ nghiêm ngặt mọi quy tắc được giao.
---
**PHẦN 1: BỐI CẢNH (CONTEXT)**
Đây là thông tin nền để bạn hiểu câu chuyện.

${ragContextBlock}

${conversationalContextBlock}

**E. BỐI CẢNH CỐT LÕI (TRẠNG THÁI HIỆN TẠI CỦA NGƯỜI CHƠI):**
*   **Thời điểm:** ${timeOfDay} (Khoảng ${pad(gameTime.hour)}:${pad(gameTime.minute)}, ngày ${gameTime.day}/${gameTime.month}/${gameTime.year})
*   **Thông Tin Nhân Vật:**
${playerInfo}
*   **Chủ Đề Thế Giới:** ${worldData.theme}

---
**PHẦN 2: HƯỚNG DẪN HÀNH ĐỘNG**

${modeInstruction}
*   **${userInputLabel}:** "${playerAction}"

---
**PHẦN 3: QUY TẮC VÀ HƯỚNG DẪN CHI TIẾT**
Đây là các quy tắc bạn phải tuân theo để tạo ra phản hồi hợp lệ.

**A. QUY TẮC VỀ LỜI KỂ & SỰ SỐNG ĐỘNG (ƯU TIÊN CAO NHẤT)**
${storytellingStyle}

**B. HƯỚNG DẪN VỀ ĐỘ KHÓ (Rất quan trọng):**
Độ khó hiện tại của game là **${worldData.difficulty}**. Hãy điều chỉnh tỉ lệ thành công, lợi ích và rủi ro trong các lựa chọn [CHOICE: "..."] của bạn cho phù hợp:
- **Dễ:** Tỉ lệ thành công CAO (70-95%). Rủi ro thấp.
- **Thường:** Tỉ lệ thành công TRUNG BÌNH (50-80%). Cân bằng.
- **Khó:** Tỉ lệ thành công THẤP (30-65%). Rủi ro cao.
- **Ác Mộng:** Tỉ lệ thành công CỰC KỲ THẤP (15-50%). Rủi ro rất lớn.

**C. QUY TẮC SỬ DỤNG TAG (CỰC KỲ QUAN TRỌNG):**
${MASTER_TAG_RULES_PROMPT}

**QUY TRÌNH LÀM VIỆC CỦA BẠN:**
1.  **Kể Chuyện:** Dựa trên TOÀN BỘ bối cảnh trên (bao gồm cả Bối Cảnh Truy Xuất), viết một đoạn văn kể lại kết quả hành động của người chơi theo **MỆNH LỆNH TỐI THƯỢỢỢNG** và các quy tắc **THẾ GIỚI SỐNG ĐỘNG**.
2.  **Dùng Tags:** Sử dụng các tag trên để phản ánh MỌI thay đổi trong game một cách chính xác.
3.  **Tạo Lựa Chọn Mới:** Cung cấp 3-4 lựa chọn hành động MỚI theo đúng định dạng.
4.  **Tăng Lượt Chơi:** Kết thúc phản hồi bằng tag \`[STATS_UPDATE: turn=+1]\`. **KHÔNG BAO GIỜ quên tag này.**

BÂY GIỜ, HÃY TIẾP TỤC CÂU CHUYỆN. Bắt đầu ngay bằng lời kể, không có lời chào hay giới thiệu.
`;
};

const formatPlayerStateForSummary = (player: PlayerState): string => {
    return `
- Cảnh giới: ${player.realm.displayName}
- Sinh Lực: ${player.sinhLuc}/${player.maxSinhLuc}
- Linh Lực: ${player.linhLuc}/${player.maxLinhLuc}
- Tuổi/Thọ: ${player.tuoi}/${player.maxThoNguyen}
- Kỹ năng nổi bật: ${player.skills.slice(0, 3).map(s => s.name).join(', ')}
- Vật phẩm quan trọng: ${player.inventory.filter(i => i.rarity === 'Cực Phẩm' || i.rarity === 'Thần Thoại' || i.rarity === 'Chí Tôn').map(i => i.name).join(', ')}
    `.trim();
};

export const createSummaryPrompt = (logText: string): string => {
    return `
Bạn là một AI chuyên tóm tắt. Dưới đây là một loạt các hành động và diễn biến trong một game nhập vai. Hãy viết một đoạn tóm tắt ngắn gọn (2-3 câu) kể lại sự kiện chính đã xảy ra.

Nhật ký:
---
${logText}
---

Tóm tắt lại các sự kiện chính.
`;
};

export const createChapterSummaryPrompt = (
    worldData: WorldData,
    playerStateStart: PlayerState,
    playerStateEnd: PlayerState,
    logs: GameLogEntry[]
): string => {

    const fullLogText = logs.map(log => {
        if (log.type === 'player_action') return `[Người Chơi] ${log.message}`;
        if (log.type === 'story' || log.type === 'event') return `[Diễn Biến] ${log.message}`;
        return null;
    }).filter(Boolean).join('\n');

    return `
Bạn là một nhà văn, một người kể chuyện bậc thầy, chuyên viết lại những "Hồi Ký" đầy hấp dẫn cho một game nhập vai thể loại Tu Tiên. Nhiệm vụ của bạn là đọc toàn bộ dữ liệu của một "hồi truyện" và biến nó thành một chương truyện ngắn súc tích, giàu cảm xúc nhưng vẫn đầy đủ thông tin.

Dưới đây là toàn bộ thông tin về hồi truyện vừa kết thúc:
---
**BỐI CẢNH THẾ GIỚI:**
*   **Chủ đề:** ${worldData.theme}
*   **Bối cảnh:** ${worldData.context}

---
**TRẠNG THÁI NHÂN VẬT (ĐẦU HỒI):**
${formatPlayerStateForSummary(playerStateStart)}

---
**TOÀN BỘ NHẬT KÝ CỦA HỒI:**
${fullLogText}

---
**TRẠNG THÁI NHÂN VẬT (CUỐI HỒI):**
${formatPlayerStateForSummary(playerStateEnd)}

---
**NHIỆM VỤ:**
Hãy viết một "Hồi Ký" (khoảng 400-600 chữ) kể lại những diễn biến trong nhật ký trên. Văn phong phải giống như một chương trong tiểu thuyết tiên hiệp, kết nối các sự kiện một cách logic và có hồn.

**Bản Hồi Ký phải đạt được các yêu cầu sau:**
1.  **Xác định Chủ Đề & Bước Ngoặt:** Tìm và làm nổi bật chủ đề hoặc sự kiện mang tính bước ngoặt của cả hồi truyện (ví dụ: "Hồi ký về lần đột phá sinh tử", "Hồi ký về mối kỳ ngộ tại Vạn Thú Sơn").
2.  **Nhấn mạnh Sự Trưởng Thành:** So sánh trạng thái đầu và cuối hồi để khắc họa rõ nét sự thay đổi và trưởng thành của nhân vật (đột phá cảnh giới, tâm cảnh thay đổi, nhận được chí bảo...).
3.  **Tường thuật Hành Trình:** Biến những dòng log khô khan thành một câu chuyện có diễn biến. Mô tả những quyết định quan trọng của nhân vật, những cuộc gặp gỡ định mệnh, và kết quả của chúng.
4.  **Lồng ghép Thông Tin Cốt Lõi:** Trong khi kể chuyện, hãy khéo léo đưa vào các thông tin quan trọng giúp người chơi nắm bắt tình hình, bao gồm:
    *   Tên các NPC hoặc địa điểm mới quan trọng đã khám phá.
    *   Vật phẩm, công pháp hoặc kỹ năng đặc biệt có ý nghĩa lớn đã thu được.
    *   Sự thay đổi về trạng thái nhiệm vụ (bắt đầu, hoàn thành, cập nhật mục tiêu).
    *   Sự thay đổi trong mối quan hệ với NPC hoặc các phe phái.

**ĐẦU RA:**
Chỉ trả về đoạn văn "Hồi Ký". Không thêm bất kỳ lời dẫn, giải thích hay định dạng nào khác.
`;
};