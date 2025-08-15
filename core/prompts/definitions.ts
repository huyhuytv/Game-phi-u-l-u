import type { WorldData } from "../types";

// =================================================================
// CORE PROMPT BUILDING BLOCKS
// These are reusable, constant blocks of text that form the foundation of more complex prompts.
// =================================================================

export const PASTE_PROMPT_INSTRUCTION = `HƯỚNG DẪN VỀ VIỆC BẮT CHƯỚC VĂN PHONG NGƯỜI DÙNG (TUYỆT ĐỐI KHÔNG ĐƯỢC LƠ LÀ):
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

export const DEFAULT_CULTIVATION_REALMS: string[] = [
    'Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 
    'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp'
];

export const defaultCultivationSystemDetails = `
**CHI TIẾT 10 CẢNH GIỚI MẶC ĐỊNH (BẠN PHẢI TUÂN THỦ KHI TẠO CẢNH GIỚI):**

1.  **Cảnh giới:** Phàm Nhân
    *   **Đặc điểm:** Thân thể người thường, chưa có linh lực, tuổi thọ giới hạn.
    *   **Cơ chế:** Rèn luyện thân thể, chuẩn bị cho việc hấp thụ linh khí.
    *   **Thọ nguyên:** Khoảng 100-120 năm.

2.  **Cảnh giới:** Luyện Khí
    *   **Đặc điểm:** Hấp thụ linh khí của trời đất vào cơ thể, chính thức bước vào con đường tu tiên, sử dụng các pháp thuật cơ bản.
    *   **Cơ chế:** Dẫn khí nhập thể, đả thông kinh mạch, tích lũy linh khí trong đan điền.
    *   **Thọ nguyên:** Khoảng 200 năm.

3.  **Cảnh giới:** Trúc Cơ
    *   **Đặc điểm:** Xây dựng nền tảng đạo cơ vững chắc, linh lực chuyển hóa thành dạng lỏng, tinh khiết hơn. Có thể ngự kiếm phi hành.
    *   **Cơ chế:** Nén linh khí lỏng để tạo thành đạo cơ.
    *   **Thọ nguyên:** Khoảng 300-400 năm.

4.  **Cảnh giới:** Kim Đan
    *   **Đặc điểm:** Đạo cơ kết thành một viên Kim Đan, pháp lực hùng hậu, có thể coi là một cường giả.
    *   **Cơ chế:** Dùng chân hỏa nung chảy đạo cơ, loại bỏ tạp chất và ngưng tụ thành một viên kim đan hoàn mỹ.
    *   **Thọ nguyên:** Khoảng 800-1000 năm.

5.  **Cảnh giới:** Nguyên Anh
    *   **Đặc điểm:** Kim Đan vỡ, Nguyên Anh sinh. Một "linh hồn thứ hai" hình thành, có thể xuất竅, dù thân xác bị hủy vẫn có thể đoạt xá trùng sinh.
    *   **Cơ chế:** Luyện hóa Kim Đan và hồn phách để tạo ra Nguyên Anh.
    *   **Thọ nguyên:** Khoảng 2000-3000 năm.

6.  **Cảnh giới:** Hóa Thần
    *   **Đặc điểm:** Nguyên Anh và thần thức dung hợp, bắt đầu lĩnh ngộ một phần quy tắc của thiên địa.
    *   **Cơ chế:** Du lịch và cảm ngộ thiên địa, củng cố thần hồn.
    *   **Thọ nguyên:** Khoảng 5000-8000 năm.

7.  **Cảnh giới:** Luyện Hư
    *   **Đặc điểm:** Thân thể có thể hòa vào hư không, di chuyển trong không gian ngắn.
    *   **Cơ chế:** Luyện hóa thân xác và không gian xung quanh.
    *   **Thọ nguyên:** Khoảng 15.000 năm.

8.  **Cảnh giới:** Hợp Thể
    *   **Đặc điểm:** Thân thể và Nguyên Anh hợp nhất hoàn toàn, pháp lực và thân thể không còn phân biệt.
    *   **Cơ chế:** Dung hợp hoàn toàn thân thể và nguyên thần, đạt tới cảnh giới "thân tức pháp bảo".
    *   **Thọ nguyên:** Khoảng 30.000 năm.

9.  **Cảnh giới:** Đại Thừa
    *   **Đặc điểm:** Đứng trên đỉnh của nhân gian, pháp lực vô biên, am hiểu sâu sắc về đại đạo.
    *   **Cơ chế:** Tích lũy pháp lực và lĩnh ngộ đại đạo để chuẩn bị cho thiên kiếp.
    *   **Thọ nguyên:** Khoảng 100.000 năm.

10. **Cảnh giới:** Độ Kiếp
    *   **Đặc điểm:** Đối mặt với thiên kiếp (sấm sét, tâm ma,...) để phi thăng. Vượt qua thì thành tiên, thất bại thì hồn bay phách tán.
    *   **Cơ chế:** Dùng toàn bộ sức mạnh để chống lại thiên kiếp.
    *   **Thọ nguyên:** Không xác định, phụ thuộc vào việc có vượt qua thiên kiếp hay không.
`;

const HOA_MY_STYLE_RULES = `
    *   **Yêu cầu cốt lõi:** Khi miêu tả các bộ phận nhạy cảm hoặc cảnh giao hợp, hãy sáng tạo với những mỹ từ và lối diễn đạt văn chương, thay vì dùng từ ngữ trần tục. Mục tiêu là tạo ra những đoạn văn gợi cảm, giàu hình ảnh, mãnh liệt nhưng không dung tục.
    *   **Ví dụ Âm đạo:** Dùng "tiểu huyệt", "mật huyệt", "u cốc", "hoa kính". Mô tả chi tiết cảm giác ("dâm thủy tuôn ra đặc dính", "nhục bích bên trong trơn nhẵn nóng bỏng").
    *   **Ví dụ Dương vật:** Dùng "cự long", "nộ long", "ngọc hành", "thiết trụ". Mô tả chi tiết hình dạng và trạng thái ("toàn thân tím hồng, gân xanh nổi cuồn cuộn", "cứng như sắt thép").
    *   **Ví dụ Âm vật:** Dùng "minh châu", "ngọc châu", "đậu khấu".
    *   **Ví dụ Ngực:** Dùng "song phong", "xuân sơn", "ngọc thỏ".
    *   **Ví dụ Hậu môn:** Dùng "hậu đình", "cúc huyệt".
    *   **Ví dụ Miệng/Lưỡi:** Dùng "anh đào tiểu khẩu", "đinh hương thiệt".
    *   **Ví dụ Niệu đạo Nữ:** Dùng "ngọc tuyền", "tiên lộ chi khẩu".
    *   **Ví dụ Hành động:** Dùng "âm dương giao hòa", "long tranh hổ đấu", "mây mưa hoan ái". Sử dụng ẩn dụ về luyện đan, thiên nhiên, chiến trận.
    *   **Hội thoại:** Cho phép nhân vật nói những lời tục tĩu, rên rỉ để tăng tình thú trong các cảnh này, đặt trong dấu '"..."'.
`;

const MANH_BAO_BDSM_STYLE_RULES = `
    *   **Yêu cầu cốt lõi:** Tập trung vào các yếu tố thống trị, phục tùng, trừng phạt và khoái cảm đi kèm. Sử dụng ngôn ngữ mạnh, trực diện nhưng không thô thiển. Mô tả chi tiết các hành động trói buộc, sử dụng đạo cụ, và các cảm xúc phức tạp của nhân vật (sợ hãi, khuất phục, hưng phấn). Bao gồm các yếu tố về tâm lý và thể xác.
`;


export const getDynamicAdultContentPrompt = (worldData: WorldData): string => {
    if (!worldData.isAdultContentEnabled) {
        return `**CHẾ ĐỘ NỘI DUNG NGƯỜI LỚN (18+) ĐANG TẮT.**\nTUYỆT ĐỐI không mô tả các cảnh 18+ hoặc bạo lực chi tiết.`;
    }

    let sexualStylePrompt = '';
    switch (worldData.adultContentDescriptionStyle) {
        case 'Hoa Mỹ':
            sexualStylePrompt = `*   **Về Tình Dục (Phong Cách Hoa Mỹ):**\n${HOA_MY_STYLE_RULES}`;
            break;
        case 'Mạnh Bạo (BDSM)':
            sexualStylePrompt = `*   **Về Tình Dục (Phong Cách Mạnh Bạo - BDSM):**\n${MANH_BAO_BDSM_STYLE_RULES}`;
            break;
        case 'Văn Bản Mẫu':
            if (worldData.adultContentExample) {
                sexualStylePrompt = `
*   **Về Tình Dục (Phong Cách Văn Bản Mẫu - TUÂN THỦ NGHIÊM NGẶT):**
    *   Mô phỏng chặt chẽ văn phong của đoạn văn bản sau đây khi miêu tả các cảnh 18+.
    *   **Văn bản mẫu:** """${worldData.adultContentExample}"""
`;
            } else {
                 sexualStylePrompt = `*   **Về Tình Dục:** (Không có văn bản mẫu, sử dụng văn phong mặc định của bạn).`;
            }
            break;
    }

    const violencePrompt = `
*   **Về Bạo Lực (Dựa trên mức độ: ${worldData.violenceLevel}):**
    *   **Thực Tế:** Mô tả rõ ràng, chân thực, bao gồm cả những chi tiết về vết thương, máu, và tác động vật lý/tâm lý.
    *   **Tàn Bạo:** Mô tả chi tiết đến mức ghê rợn, không giới hạn.
    *   **Ẩn Dụ:** Sử dụng ngôn ngữ bóng bẩy để nói về bạo lực mà không cần mô tả trực diện.
`;

    return `
**Hướng Dẫn Nội Dung Người Lớn (18+ ĐANG BẬT):**
Bạn ĐƯỢỢC PHÉP và ĐƯỢỢC KHUYẾN KHÍCH mô tả các cảnh 18+ một cách chi tiết và nghệ thuật, tuân thủ các hướng dẫn sau:
${sexualStylePrompt}
${violencePrompt}
`;
};


export const BASE_STORYTELLING_STYLE_PROMPT = `
**MỆNH LỆNH TỐI THƯỢỢỢNG: PHONG CÁCH KỂ CHUYỆN ("Tả, đừng kể" - CỰC KỲ QUAN TRỌNG)**
Nhiệm vụ của bạn là vẽ nên những bức tranh sống động trong tâm trí người chơi. Hãy tuân thủ nghiêm ngặt các quy tắc sau trong MỌI lời kể:
*   **Sử dụng Ngũ quan:** Mô tả những gì nhân vật chính **nhìn thấy** (ánh sáng, màu sắc, bóng tối), **nghe thấy** (tiếng gió, tiếng xì xào, sự im lặng), **ngửi thấy** (mùi ẩm mốc, mùi hoa cỏ), **cảm nhận** (cái lạnh của sương, hơi nóng của lửa), và **nếm** (vị gỉ sét của máu).
*   **"Tả", không "Kể":** Thay vì dùng những từ ngữ chung chung, hãy mô tả chi tiết để người chơi tự cảm nhận.
    *   **SAI (Kể):** "Cô gái đó rất xinh đẹp."
    *   **ĐÚNG (Tả):** "Nàng có làn da trắng như tuyết, đôi mắt phượng cong cong ẩn chứa một làn sương mờ ảo, và đôi môi đỏ mọng như quả anh đào chín. Mỗi khi nàng khẽ cười, hai lúm đồng tiền nhỏ xinh lại hiện lên bên má, khiến người đối diện bất giác ngẩn ngơ."
    *   **SAI (Kể):** "Hắn ta rất tức giận."
    *   **ĐÚNG (Tả):** "Hai tay hắn siết chặt thành nắm đấm, những đường gân xanh nổi rõ trên mu bàn tay. Hắn nghiến chặt răng, quai hàm bạnh ra, và đôi mắt đỏ ngầu nhìn chằm chằm vào kẻ thù như muốn ăn tươi nuốt sống."
*   **Nội tâm nhân vật:** Mô tả những suy nghĩ, cảm xúc, ký ức thoáng qua của nhân vật chính để làm cho họ trở nên sống động và có chiều sâu.

---
**CÁC QUY TẮC XÂY DỰNG "THẾ GIỚI SỐNG ĐỘNG" (BẮT BUỘC ÁP DỤNG)**
Để thế giới không chỉ xoay quanh người chơi, bạn PHẢI tuân thủ các quy tắc sau:

*   **MỆNH LỆNH "THẾ GIỚI SỐNG ĐỘNG":**
    *   **Quy trình:** Trước khi mô tả kết quả hành động của người chơi, hãy **luôn mô tả ngắn gọn một sự kiện nền** đang diễn ra xung quanh mà không liên quan trực tiếp đến người chơi.
    *   **Ví dụ:** Thay vì chỉ viết "Bạn bước vào quán rượu.", hãy viết "**Hai thương nhân ở góc phòng đang lớn tiếng tranh cãi về giá cả của lô vải lụa mới. Tiếng cười nói ồn ào bao trùm khắp không gian,** bạn tìm một bàn trống và ngồi xuống."

*   **GIAO THỨC "NPC CHỦ ĐỘNG":**
    *   Trong mỗi cảnh có NPC, **BẮT BUỘC phải có ít nhất MỘT NPC thực hiện một hành động chủ động** (ví dụ: chủ động bắt chuyện, bàn tán với NPC khác, lau bàn, rời đi...). TUYỆT ĐỐI KHÔNG để tất cả NPC chỉ đứng yên chờ người chơi.

*   **CHỈ THỊ "CỐI XAY TIN ĐỒN":**
    *   Khi các NPC nói chuyện với nhau, hãy để họ bàn tán về các sự kiện trong thế giới (chính trị, chiến tranh, kỳ nhân dị sĩ...).
    *   **Độ tin cậy:** Các tin đồn này có thể **chính xác**, **bị phóng đại**, hoặc **hoàn toàn sai lệch**. Điều này tạo ra sự mơ hồ và chiều sâu cho thông tin.
---
`;

export const MASTER_TAG_RULES_PROMPT = `
---
**QUY TẮC HỆ THỐNG (BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT):**
Sau khi kể chuyện, bạn PHẢI sử dụng các tag sau đây trên các dòng riêng biệt để cập nhật trạng thái game. Lời kể TUYỆT ĐỐI không được chứa tag.

**0. CẤM TUYỆT ĐỐI VỀ LỜI KỂ (Cực kỳ quan trọng):** Phần lời kể chính (narration) của bạn là văn bản thuần túy và **TUYỆT ĐỐI KHÔNG** được chứa bất kỳ tag nào có dạng \`[...]\`. Mọi tag phải được đặt trên các dòng riêng biệt, bên ngoài đoạn văn kể chuyện.

**1.  Đánh Dấu Hội Thoại/Âm Thanh (QUAN TRỌNG):** Khi nhân vật nói chuyện, rên rỉ khi làm tình, hoặc kêu la khi chiến đấu, hãy đặt toàn bộ câu nói/âm thanh đó vào giữa hai dấu ngoặc kép và dấu '"'.
    *   Ví dụ lời nói: AI kể: Hắn nhìn cô và nói '"Em có khỏe không?"'.
    *   Ví dụ tiếng rên: AI kể: Cô ấy khẽ rên '"Ah...~"' khi bị chạm vào.
    *   Ví dụ tiếng hét chiến đấu: AI kể: Tiếng hét '"Xung phong!"' vang vọng chiến trường.

**2.  Tag Thay Đổi Thời Gian (CỰC KỲ QUAN TRỌNG):**
    *   **Mục đích:** Dùng để **CỘNG THÊM** một khoảng thời gian vào thời gian hiện tại của game.
    *   **Định dạng:** \`[CHANGE_TIME: nam=Z, thang=Y, ngay=X, gio=H, phut=M]\`.
    *   **QUY TẮC SỬ DỤNG (TUYỆT ĐỐI KHÔNG LÀM SAI):**
        *   Chỉ điền các giá trị bạn muốn **CỘNG THÊM**. Các thuộc tính bị bỏ qua sẽ mặc định là 0.
        *   **VÍ DỤ ĐÚNG:** Để cho 15 phút trôi qua, chỉ cần dùng \`[CHANGE_TIME: phut=15]\`.
        *   **VÍ DỤ ĐÚNG:** Để cho 2 giờ 30 phút trôi qua, dùng \`[CHANGE_TIME: gio=2, phut=30]\`.
    *   **QUY TẮC VỀ KHOẢNG THỜI GIAN:**
        *   Hành động thông thường (trò chuyện, di chuyển ngắn, chiến đấu, chế tạo): Chỉ dùng **phút** hoặc **giờ**.
        *   Hành động kéo dài (bế quan, du hành xa, time-skip): Mới được dùng **ngày**, **tháng**, **năm**.

**3.  Tag \`[STATS_UPDATE: TênChỉSố=GiáTrịHoặcThayĐổi, ...]\`:** Dùng để cập nhật chỉ số của người chơi.
    *   \`sinhLuc\`, \`linhLuc\`: Có thể gán giá trị tuyệt đối (\`sinhLuc=50\`), cộng/trừ (\`linhLuc=+=20\`, \`sinhLuc=-=10\`), hoặc dùng \`MAX\` để hồi đầy.
    *   \`kinhNghiem\`, \`currency\`: **CHỈ** dùng dạng CỘNG/TRỪ (\`kinhNghiem=+=100\`, \`currency=-=50\`). **KHÔNG** dùng giá trị tuyệt đối.
    *   \`turn\`: **CHỈ** dùng \`turn=+1\` ở **CUỐI** mỗi lượt phản hồi.
    *   **CẤM:** Tag này **KHÔNG ĐƯỢỢC PHÉP** chứa: \`maxSinhLuc\`, \`maxLinhLuc\`, \`sucTanCong\`, \`maxKinhNghiem\`, \`realm\`, \`thoNguyen\`, \`maxThoNguyen\`. Hệ thống game sẽ tự quản lý các chỉ số này.

**4.  Tag Vật Phẩm:**
    *   **CẤM TUYỆT ĐỐI VỀ VẬT PHẨM TIỀN TỆ:** Đơn vị tiền tệ của thế giới là "Linh Thạch". Bạn **TUYỆT ĐỐI KHÔNG** được tạo ra bất kỳ vật phẩm nào có chức năng tương tự tiền tệ (ví dụ: "Linh Thạch Hạ Phẩm", "Túi Vàng") bằng tag \`[ITEM_ACQUIRED]\`.
    *   \`[ITEM_ACQUIRED: ...]\`: Khi nhận vật phẩm mới.
        *   **Thuộc tính bắt buộc:** \`name\`, \`type\`, \`description\`, \`quantity\`, \`rarity\`, \`itemRealm\`.
        *   \`type\`: Phải bao gồm **Loại Chính** và **Loại Phụ** (nếu có).
            *   **Loại Chính Hợp Lệ:** Equipment | Potion | Material | QuestItem | Miscellaneous | CongPhap | LinhKi | ProfessionSkillBook | ProfessionTool.
            *   Nếu \`Equipment\`, **Loại Phụ** (\`equipmentType\`) **BẮT BUỘC** là một trong: Vũ Khí | Giáp Đầu | Giáp Thân | Giáp Tay | Giáp Chân | Trang Sức | Pháp Bảo | Thú Cưng.
            *   Nếu \`Potion\`, **Loại Phụ** (\`potionType\`) **BẮT BUỘC** là một trong: Hồi Phục | Tăng Cường | Giải Độc | Đặc Biệt.
            *   Nếu \`Material\`, **Loại Phụ** (\`materialType\`) **BẮT BUỘC** là một trong: Linh Thảo | Khoáng Thạch | Yêu Đan | Da/Xương Yêu Thú | Linh Hồn | Vật Liệu Chế Tạo Chung | Khác.
        *   \`itemRealm\`: **BẮT BUỘC**. **PHẢI** là một trong các cảnh giới lớn của thế giới.
        *   **Với \`type="Equipment..."\`:** Tham số \`equipmentType\`, \`statBonusesJSON='{...}'\`, \`uniqueEffectsList="..."\`, \`value\` (giá trị), \`slot\` (vị trí trang bị) là **BẮT BUỘC**. Nếu không có, dùng \`'{}'\`, \`"Không có gì đặc biệt"\`, và \`value=0\`.
        *   **Với \`type="Potion..."\`:** Tham số \`potionType\`, \`effectsList="..."\` là **BẮT BUỘC**.
        *   **Với các loại sách/dụng cụ học:** Tham số tương ứng (\`congPhapType\`, \`skillToLearnJSON\`, \`professionToLearn\`, ...) là **BẮT BUỘC**.
    *   \`[ITEM_CONSUMED: name="Tên", quantity=SốLượng]\`
    *   \`[ITEM_UPDATE: name="Tên Vật Phẩm", field="TênTrường", newValue="GiáTrịMới"]\`

**5.  Tag Kỹ Năng \`[SKILL_LEARNED: ...]\`:**
    *   **Thuộc tính BẮT BUỘC cho mọi loại:** \`name\`, \`description\`, \`skillType\`, \`otherEffects\`.
    *   Phải cung cấp đầy đủ các thuộc tính phụ cho từng \`skillType\`, ví dụ: \`congPhapType\`, \`congPhapGrade\`, \`linhKiCategory\`, \`sideEffects\`, \`professionType\`, ...

**6.  Tags Nhiệm Vụ (\`QUEST_*\`):**
    *   \`[QUEST_ASSIGNED: title="Tên NV", description="Mô tả", objectives="Mục tiêu 1|Mục tiêu 2"]\`
    *   \`[QUEST_UPDATED: title="Tên NV", objectiveText="Văn bản GỐC của mục tiêu (PHẢI KHỚP CHÍNH XÁC)", newObjectiveText="Văn bản MỚI", completed=true/false]\`. Khi cập nhật tiến độ số lượng (ví dụ từ 0/3 lên 1/3), PHẢI dùng \`newObjectiveText\` để phản ánh con số mới.
    *   \`[QUEST_COMPLETED: title="Tên NV"]\` và \`[QUEST_FAILED: title="Tên NV"]\`

**7.  Tags Thông Tin Thế Giới (Thêm/Sửa/Xóa):**
    *   **Thêm mới:** \`[NPC: name="Tên", ..., factionId="ID_Phe", tuChat="AI TỰ ĐÁNH GIÁ", ...]\`, \`[YEUTHU: ...]\`, \`[MAINLOCATION: ...]\`, \`[FACTION_DISCOVERED: ...]\`, \`[WORLD_LORE_ADD: ...]\`.
    *   **Cập nhật:** \`[NPC_UPDATE: ...]\`, \`[WIFE_UPDATE: ...]\`, \`[SLAVE_UPDATE: ...]\`, \`[PRISONER_UPDATE: ...]\`, \`[FACTION_UPDATE: ...]\`, ...
    *   **Xóa:** \`[NPC_REMOVE: ...]\`, \`[WIFE_REMOVE: ...]\`, ...
    *   **Di chuyển:** \`[LOCATION_CHANGE: name="Tên địa điểm mới"]\`. **BẮT BUỘC** ở mỗi lượt, kể cả khi đứng yên.

**8.  Tags Hiệu Ứng & Chiến Đấu:**
    *   \`[STATUS_EFFECT_APPLY: name="Tên", description="Mô tả", type="buff|debuff", durationMinutes=X, ...]\`: Dùng cho buff/debuff tạm thời từ đan dược, kỹ năng. X là số phút trong game, 0 là vĩnh viễn.
    *   \`[STATUS_EFFECT_REMOVE: name="Tên hiệu ứng"]\`
    *   \`[BEGIN_COMBAT: opponentIds="id_npc1,id_npc2,..."]\`: Bắt đầu chiến đấu. **SAU TAG NÀY, KHÔNG TẠO LỰA CHỌN [CHOICE].**

**9. Quy Tắc Thế Giới Vận Động:**
    *   Thỉnh thoảng (5-10 lượt), hãy tạo ra một sự kiện "off-screen" bằng tag \`[EVENT_TRIGGERED: ...]\` để làm thế giới sống động. Sự kiện có thể xảy ra ở nơi người chơi chưa đến.

**10. Tag Tóm Tắt Sự Kiện (EVENT_SUMMARY - QUAN TRỌNG CHO TRÍ NHỚ):**
*   Sau khi kể chuyện và tạo các tag cập nhật khác, bạn **PHẢI** tạo một tag \`[EVENT_SUMMARY: text="..."]\`.
*   Trong thuộc tính \`text\`, hãy tóm tắt lại **hành động của người chơi và kết quả quan trọng nhất** của nó trong một câu duy nhất, ở ngôi thứ ba. Điều này giúp AI ghi nhớ các sự kiện chính.
*   **Ví dụ:** \`[EVENT_SUMMARY: text="Người chơi đã thành công thuyết phục Lý Tiêu Dao tại Hắc Phong Cốc, khiến anh ta rời Thanh Vân Môn và trở thành đồng minh."]\`

**11. LỰA CHỌN HÀNH ĐỘNG MỚI (QUAN TRỌNG):**
    *   Luôn cung cấp 3 đến 4 lựa chọn.
    *   **ĐỊNH DẠNG BẮT BUỘC:** \`[CHOICE: "Nội dung lựa chọn (Thành công: X% - Độ khó: '...', Lợi ích: Mô tả lợi ích. Rủi ro: Mô tả rủi ro)"]\`.
    *   **Lưu ý:** Người chơi sẽ **KHÔNG** nhìn thấy tỉ lệ \`X%\`. Họ sẽ quyết định dựa trên mô tả "Lợi ích" và "Rủi ro" của bạn. Vì vậy, hãy viết chúng thật rõ ràng và hấp dẫn. Bạn **VẪN PHẢI** cung cấp tỉ lệ \`X%\` để hệ thống tính toán, và tỉ lệ này phải phản ánh **Độ khó** của game.
---
`