import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import Accordion from '../components/ui/Accordion';
import Button from '../components/ui/Button';
import { WorldData, CharacterCreationData, StartingFactors, Talent, PlayerState, GameLogEntry, GameTime } from '../core/types';
import { 
    createWorldGenerationPrompt, 
    INITIAL_TALENTS_PROMPT,
    createFactorSuggestionsPrompt,
    defaultCultivationSystemDetails,
    createStoryUpdatePrompt,
    createSummaryPrompt,
    MASTER_GAME_PROMPT
} from '../core/prompts';
import { useToastStore } from '../store/useToastStore';

// Mock data to generate sample prompts that require arguments
const MOCK_TALENT: Talent = { name: "Thiên Linh Căn", description: "Tốc độ hấp thụ linh khí cực nhanh." };

const MOCK_WORLD_DATA: WorldData = {
    storyName: 'Phàm Nhân Bất Tử',
    genre: 'Tu Tiên (Mặc định)',
    theme: 'Từ một người bình thường từng bước leo lên đỉnh cao tiên giới.',
    context: 'Một thế giới tu tiên rộng lớn, nơi các thế lực tranh đấu không ngừng.',
    aiStyle: { type: 'default', content: '' },
    isCultivationEnabled: true,
    cultivationSystemType: 'default',
    currencyName: 'Linh Thạch',
    startingCurrency: 10,
    startingDate: { day: 1, month: 1, year: 1000 },
    cultivationSystem: ['Luyện Khí', 'Trúc Cơ', 'Kim Đan'],
    startingRealm: 'Luyện Khí Tầng 1',
    difficulty: 'Thường',
    violenceLevel: 'Thực Tế',
    isAdultContentEnabled: false,
    adultContentDescriptionStyle: 'Hoa Mỹ',
};

const MOCK_GAME_TIME: GameTime = { year: 1000, month: 1, day: 1, hour: 14, minute: 30 }; // Afternoon

const MOCK_STARTING_FACTORS: StartingFactors = {
    skills: [
        { id: '1', category: 'Công Pháp Tu Luyện', name: 'Trường Xuân Công', description: 'Công pháp dưỡng sinh, giúp kéo dài tuổi thọ.', congPhapType: 'Khí Tu', congPhapGrade: 'Phàm Phẩm', otherEffects: 'Làm chậm tốc độ lão hóa.' }
    ],
    items: [
        { id: '1', name: 'Bình Nhỏ Màu Xanh', description: 'Một chiếc bình thần bí có khả năng thúc đẩy thực vật sinh trưởng.', quantity: 1, category: 'Miscellaneous', rarity: 'Chí Tôn', itemRealm: 'Không xác định' }
    ],
    npcs: [], beasts: [], lore: [], locations: [], factions: [],
    wives: [], slaves: [], prisoners: [],
};

const MOCK_PLAYER_STATE: PlayerState = {
    name: 'Hàn Lập',
    gender: 'Nam',
    race: 'Nhân Tộc',
    sinhLuc: 100,
    maxSinhLuc: 100,
    linhLuc: 50,
    maxLinhLuc: 50,
    sucTanCong: 10,
    realm: { majorRealmName: 'Luyện Khí', majorRealmIndex: 0, subRealmLevel: 7, subRealmName: 'Tầng 7', displayName: 'Luyện Khí Tầng 7' },
    kinhNghiem: 1200,
    maxKinhNghiem: 2000,
    hieuUngBinhCanh: false,
    tuoi: 20,
    thoNguyen: 180,
    maxThoNguyen: 200,
    linhCan: 'Tứ Hành Tạp Linh Căn',
    theChat: 'Phàm Thể',
    tuChat: 'Trung Đẳng',
    talent: MOCK_TALENT,
    objective: 'Vấn Đạo Trường Sinh',
    biography: 'Xuất thân từ một sơn thôn nghèo.',
    currency: 50,
    inventory: MOCK_STARTING_FACTORS.items,
    skills: MOCK_STARTING_FACTORS.skills,
};


const MOCK_CHARACTER_DATA: CharacterCreationData = {
    name: MOCK_PLAYER_STATE.name,
    gender: MOCK_PLAYER_STATE.gender,
    race: MOCK_PLAYER_STATE.race,
    personality: 'Thận trọng, tâm tư kín đáo, gặp lợi ích không bỏ qua.',
    biography: MOCK_PLAYER_STATE.biography,
    objective: MOCK_PLAYER_STATE.objective,
    talent: MOCK_PLAYER_STATE.talent,
    linhCan: MOCK_PLAYER_STATE.linhCan,
    theChat: { name: MOCK_PLAYER_STATE.theChat, description: "Một thể chất bình thường." },
    thoNguyen: MOCK_PLAYER_STATE.thoNguyen,
    maxThoNguyen: MOCK_PLAYER_STATE.maxThoNguyen,
};


const MOCK_HISTORY: GameLogEntry[] = [
    {id: 1, type: 'story', message: 'Bạn phát hiện một hang động bí ẩn sau một thác nước.'},
    {id: 2, type: 'player_action', message: 'Tiến vào trong hang động'},
    {id: 3, type: 'story', message: 'Bên trong hang động tối tăm và ẩm ướt, bạn nghe thấy tiếng gầm gừ nhẹ. Một con yêu lang với đôi mắt đỏ ngầu đang nhìn bạn chằm chằm.'}
];

const MOCK_SUMMARY_EVENTS = `[Hành động] Tiến vào trong hang động
[Diễn biến] Bên trong hang động tối tăm và ẩm ướt, bạn nghe thấy tiếng gầm gừ nhẹ. Một con yêu lang với đôi mắt đỏ ngầu đang nhìn bạn chằm chằm.
[Hành động] Rút kiếm ra, cẩn thận đối mặt với con yêu lang.
[Diễn biến] Bạn vung kiếm, chém một nhát vào con yêu lang, nó né được và cào vào tay bạn. Bạn mất 10 máu.
[Hành động] Sử dụng Hỏa Cầu Thuật.
[Diễn biến] Quả cầu lửa bay trúng con yêu lang, nó kêu lên thảm thiết rồi gục xuống. Bạn nhận được 50 kinh nghiệm và một cái Yêu Đan.`;


// Component to handle copy-to-clipboard functionality
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    const addToast = useToastStore(state => state.addToast);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            addToast("Đã sao chép lời nhắc vào clipboard!", "success");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            addToast("Sao chép thất bại. Vui lòng thử lại hoặc sao chép thủ công.", "error");
        });
    };

    return <button onClick={handleCopy} className="absolute top-4 right-4 text-xs bg-blue-600 text-white font-semibold rounded-md px-3 py-1.5 hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400">Sao chép</button>;
};

const PROMPTS_TO_DISPLAY = [
    {
        title: "Lời Nhắc Khởi Tạo Game (Master Prompt)",
        content: MASTER_GAME_PROMPT,
    },
    {
        title: "Lời Nhắc Chính Tạo Thế Giới (Bằng AI)",
        content: createWorldGenerationPrompt("Một thế giới tu tiên rộng lớn, ma đạo trỗi dậy", MOCK_WORLD_DATA, MOCK_CHARACTER_DATA)
    },
    {
        title: "Lời Nhắc Xử Lý Hành Động (Vai Trò GM)",
        content: createStoryUpdatePrompt(MOCK_PLAYER_STATE, MOCK_WORLD_DATA, MOCK_GAME_TIME, MOCK_HISTORY, [], "Rút kiếm ra, cẩn thận đối mặt với con yêu lang.", undefined, 'action')
    },
    {
        title: "Lời Nhắc Tóm Tắt Ký Ức",
        content: createSummaryPrompt(MOCK_SUMMARY_EVENTS)
    },
    {
        title: "Lời Nhắc Tạo Thiên Phú Ban Đầu",
        content: INITIAL_TALENTS_PROMPT
    },
    {
        title: "Lời Nhắc Gợi Ý Yếu Tố Khởi Đầu (Ví dụ: NPC)",
        content: createFactorSuggestionsPrompt("NPC", "Huyền Huyễn", "Thế giới chìm trong chiến tranh giữa các vị thần")
    },
    {
        title: "Dữ liệu Hệ Thống Tu Luyện Mặc Định",
        content: defaultCultivationSystemDetails
    },
];


const PromptLibraryScreen: React.FC = () => {
    const showSettings = useGameStore((state) => state.showSettings);

    return (
        <div className="animate-fade-in p-4 max-w-5xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 tracking-widest" style={{ fontFamily: 'serif' }}>
                    Thư Viện Lời Nhắc
                </h1>
                <p className="text-yellow-100/80 mt-2">Nơi lưu trữ những "câu thần chú" tạo nên thế giới của bạn.</p>
            </header>

            <div className="space-y-4">
                {PROMPTS_TO_DISPLAY.map(({ title, content }) => (
                    <Accordion key={title} title={title} count={1}>
                        <div className="relative">
                            <CopyButton textToCopy={content} />
                            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-words">
                                <code>{content}</code>
                            </pre>
                        </div>
                    </Accordion>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Button onClick={showSettings} className="bg-cyan-600 hover:bg-cyan-500">
                    Quay Về Thiết Lập
                </Button>
            </div>
        </div>
    );
};

export default PromptLibraryScreen;