import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    CharacterCreationData,
    WorldData,
    StartingFactors,
    Talent,
    AIStyle,
    AnySkill,
    ParsedInitialGameData,
    AdultContentDescriptionStyle,
    Trait,
} from '../../core/types';
import { generateWorldFromPrompt, generateInitialGame } from '../../core/services/geminiService';
import { DEFAULT_CULTIVATION_REALMS } from '../../core/prompts';
import { parseWorldGenerationOutput, ParsedWorldData } from '../../core/services/worldParserService';
import { parseInitialGameResponse } from '../../core/services/storyUpdateParser';
import { useGameStore } from '../../store/useGameStore';
import { useToastStore } from '../../store/useToastStore';


export type StartingBonusType = 'talent' | 'specialPhysique';

const initialStartingFactors: StartingFactors = { skills: [], items: [], npcs: [], beasts: [], lore: [], locations: [], factions: [], wives: [], slaves: [], prisoners: [] };

const initialWorldData: WorldData = { 
    storyName: '', 
    genre: 'Tu Tiên (Mặc định)', 
    theme: '', 
    context: '', 
    aiStyle: { type: 'default', content: '' },
    isCultivationEnabled: true,
    cultivationSystemType: 'default',
    currencyName: 'Linh Thạch',
    startingCurrency: 10,
    startingDate: { day: 1, month: 1, year: 500 },
    startingRealm: '',
    cultivationSystem: [],
    difficulty: 'Thường',
    violenceLevel: 'Thực Tế',
    isAdultContentEnabled: false,
    adultContentDescriptionStyle: 'Hoa Mỹ',
    adultContentExample: '',
};

const initialCharacterData: CharacterCreationData = {
    name: '',
    gender: 'Bí Mật',
    race: 'Nhân Tộc',
    personality: '',
    biography: '',
    objective: '',
    linhCan: '',
    talent: { name: '', description: '' },
    theChat: { name: '', description: '' },
    thoNguyen: 0,
    maxThoNguyen: 0,
};

type CreationStatus = 'idle' | 'generatingWorld' | 'startingGame';


interface CharacterCreationState {
    characterData: CharacterCreationData;
    worldData: WorldData;
    startingFactors: StartingFactors;
    startingBonusType: StartingBonusType;
    status: CreationStatus;
}

interface CharacterCreationActions {
    // Basic setters
    updateCharacterData: (data: Partial<CharacterCreationData>) => void;
    updateWorldData: (data: Partial<WorldData>) => void;
    updateStartingFactors: (data: Partial<StartingFactors>) => void;
    updateSingleFactorCategory: (category: keyof StartingFactors, data: any[]) => void;
    setStartingBonusType: (bonusType: StartingBonusType) => void;
    
    // Complex logic
    importFullData: (data: any) => void;
    handleFullDataUpdate: (parsedData: ParsedWorldData) => void;
    generateWorld: (storyIdea: string) => Promise<void>;
    startGame: () => Promise<void>;
    
    // Reset to initial state
    reset: () => void;
}

export const useCharacterCreationStore = create(
    immer<CharacterCreationState & CharacterCreationActions>((set, get) => ({
        // STATE
        characterData: initialCharacterData,
        worldData: initialWorldData,
        startingFactors: initialStartingFactors,
        startingBonusType: 'talent',
        status: 'idle',

        // ACTIONS
        updateCharacterData: (data) => {
            set(state => {
                Object.assign(state.characterData, data);
                 if (data.talent && data.talent.name?.trim()) {
                    // If a talent is selected, clear the special physique
                    state.characterData.theChat = { name: '', description: '' };
                    state.startingBonusType = 'talent';
                } else if (data.theChat && data.theChat.name?.trim()) {
                    // If a special physique is selected, clear the talent
                    state.characterData.talent = { name: '', description: '' };
                    state.startingBonusType = 'specialPhysique';
                }
            });
        },
        updateWorldData: (data) => {
            set(state => {
                Object.assign(state.worldData, data);
            });
        },
        updateStartingFactors: (data) => {
            set(state => {
                Object.assign(state.startingFactors, data);
            });
        },
        updateSingleFactorCategory: (category, data) => {
            set(state => {
                state.startingFactors[category] = data as any;
            });
        },
        setStartingBonusType: (bonusType) => {
            set(state => {
                state.startingBonusType = bonusType;
                // When switching bonus types, clear the values for other types.
                if (bonusType === 'talent') {
                    state.characterData.theChat = { name: '', description: '' };
                } else { // specialPhysique
                    state.characterData.talent = { name: '', description: '' };
                }
            });
        },
        importFullData: (data) => {
            set(state => {
                // Reset to a clean slate before importing
                state.characterData = { ...initialCharacterData };
                state.worldData = { ...initialWorldData };
                state.startingFactors = { ...initialStartingFactors };
                
                // --- Import World Data ---
                const world = data.worldData || {};
                state.worldData.storyName = world.storyName || data.saveGameName || '';
                state.worldData.genre = world.genre || data.genre || 'Tu Tiên (Mặc định)';
                state.worldData.theme = world.theme || '';
                state.worldData.context = world.context || data.settingDescription || '';
                state.worldData.currencyName = world.currencyName || data.currencyName || 'Linh Thạch';
                state.worldData.startingCurrency = world.startingCurrency ?? data.startingCurrency ?? 10;
                state.worldData.isCultivationEnabled = world.isCultivationEnabled ?? data.isCultivationEnabled ?? true;
                
                const importedCSArray = world.cultivationSystem;

                if (importedCSArray && Array.isArray(importedCSArray) && importedCSArray.length > 0) {
                    state.worldData.cultivationSystem = importedCSArray;
                    state.worldData.cultivationSystemType = 'user_defined';
                } else { // 'default', 'custom', 'ai_creative' or undefined will all fall here
                    state.worldData.cultivationSystem = [];
                    state.worldData.cultivationSystemType = 'default';
                }

                state.worldData.startingRealm = world.startingRealm || data.canhGioiKhoiDau || '';
                if (world.startingDate) state.worldData.startingDate = world.startingDate;
                if (world.aiStyle) state.worldData.aiStyle = world.aiStyle;
                
                state.worldData.difficulty = world.difficulty || data.difficulty || 'Thường';
                state.worldData.violenceLevel = world.violenceLevel || data.violenceLevel || 'Thực Tế';
                state.worldData.isAdultContentEnabled = world.isAdultContentEnabled ?? false;
                state.worldData.adultContentDescriptionStyle = world.adultContentDescriptionStyle || 'Hoa Mỹ';
                state.worldData.adultContentExample = world.adultContentExample || '';

                // --- Import Character Data ---
                const char = data.characterData || {};
                state.characterData.name = char.name || data.playerName || '';
                state.characterData.gender = char.gender || data.playerGender || 'Bí Mật';
                state.characterData.race = char.race || data.playerRace || 'Nhân Tộc';
                state.characterData.personality = char.personality || data.playerPersonality || '';
                state.characterData.biography = char.biography || data.playerBackstory || '';
                state.characterData.objective = char.objective || data.playerGoal || '';

                // --- Import Starting Bonus ---
                // Linh Can is always separate
                state.characterData.linhCan = char.linhCan || data.playerSpiritualRoot || '';

                // Handle the choice between The Chat and Talent
                const importedTheChatSource = char.theChat || data.playerSpecialPhysique;
                if (importedTheChatSource && (importedTheChatSource.name || typeof importedTheChatSource === 'string')) {
                    if (typeof importedTheChatSource === 'string') {
                        state.characterData.theChat = { name: importedTheChatSource, description: '(Đã nhập)' };
                    } else { // It's a Trait object
                        state.characterData.theChat = { name: importedTheChatSource.name || '', description: importedTheChatSource.description || '' };
                    }
                    state.characterData.talent = { name: '', description: '' };
                    state.startingBonusType = 'specialPhysique';
                } else {
                    state.characterData.theChat = { name: '', description: '' };
                    const talent = data.selectedTalent || char.talent;
                    state.characterData.talent = (talent && talent.name) ? talent : { name: '', description: '' };
                    state.startingBonusType = 'talent';
                }

                // --- Import Starting Factors ---
                const factors = data.startingFactors || {};
                state.startingFactors.skills = factors.skills || data.startingSkills || [];
                state.startingFactors.items = factors.items || data.startingItems || [];
                state.startingFactors.npcs = factors.npcs || data.startingNPCs || [];
                state.startingFactors.beasts = factors.beasts || data.startingYeuThu || [];
                state.startingFactors.lore = factors.lore || data.startingLore || [];
                state.startingFactors.locations = factors.locations || data.startingLocations || [];
                state.startingFactors.factions = factors.factions || data.startingFactions || [];

                useToastStore.getState().addToast("Dữ liệu đã được nhập thành công!", "success");
            });
        },
        handleFullDataUpdate: (parsedData) => {
            const preUpdateWorldData = get().worldData;
            const originalBonusType = get().startingBonusType;

            set(state => {
                const { characterData: newCharData, worldData: newWorldData, startingFactors: newFactors } = parsedData;
                
                const { talent, theChat, ...restOfCharData } = newCharData;

                Object.assign(state.characterData, restOfCharData);
                
                if (newCharData.objective !== undefined) {
                    state.characterData.objective = newCharData.objective;
                }
                
                if (originalBonusType === 'talent' && talent?.name) {
                    // User wanted a talent, and the AI provided one. This is the happy path.
                    state.characterData.talent = talent;
                    state.characterData.theChat = { name: '', description: '' };
                    state.startingBonusType = 'talent';
                } else if (theChat?.name) {
                    // Either user wanted a physique, or the AI failed to provide a talent.
                    // Prioritize the physique in this case.
                    state.characterData.theChat = theChat;
                    state.characterData.talent = { name: '', description: '' };
                    state.startingBonusType = 'specialPhysique';
                } else if (talent?.name) {
                    // Fallback: no physique was generated, but a talent was.
                    state.characterData.talent = talent;
                    state.characterData.theChat = { name: '', description: '' };
                    state.startingBonusType = 'talent';
                }
                
                Object.assign(state.worldData, newWorldData);

                if (preUpdateWorldData.isCultivationEnabled && preUpdateWorldData.cultivationSystemType === 'default') {
                    state.worldData.cultivationSystem = DEFAULT_CULTIVATION_REALMS;
                }

                if (!state.worldData.storyName && newWorldData.theme) {
                    state.worldData.storyName = newWorldData.theme;
                }
                
                state.startingFactors = newFactors;
            });
            useToastStore.getState().addToast("AI đã sáng tạo xong thế giới! Hãy xem lại các tab để tinh chỉnh.", "success");
        },
        generateWorld: async (storyIdea: string) => {
            set({ status: 'generatingWorld' });
            useToastStore.getState().addToast("AI đang vận dụng thiên cơ, xin chờ một lát...", "info");
            
            try {
                const { characterData, worldData } = get();

                const fullCharacterData: Partial<CharacterCreationData> = {
                    ...characterData,
                    talent: characterData.talent.name ? characterData.talent : undefined,
                    theChat: characterData.theChat.name ? characterData.theChat : undefined,
                };
                
                const generatedText = await generateWorldFromPrompt(storyIdea, worldData, fullCharacterData);
                const parsedData = parseWorldGenerationOutput(generatedText);
                
                get().handleFullDataUpdate(parsedData);

            } catch (error) {
                console.error("Failed to generate world:", error);
                useToastStore.getState().addToast("Sáng tạo thế giới thất bại. Có lỗi xảy ra với Thiên Cơ Các.", "error");
            } finally {
                set({ status: 'idle' });
            }
        },
        startGame: async () => {
            const { characterData, worldData, startingFactors } = get();

            const isDestinySelected = characterData.talent?.name?.trim() || characterData.theChat?.name?.trim();

            if (!characterData.name?.trim() || !worldData.storyName.trim() || !characterData.linhCan?.trim() || !isDestinySelected) {
                useToastStore.getState().addToast("Vui lòng nhập các thông tin bắt buộc: Tên, Tên truyện, Linh Căn và chọn Vận Mệnh (Thiên Phú/Thể Chất).", "error");
                return;
            }

            set({ status: 'startingGame' });
            
            const finalCharacterData: CharacterCreationData = {
                ...characterData,
                talent: characterData.talent?.name?.trim() ? characterData.talent : { name: 'Không có', description: '' },
            };

            try {
                const { responseText, prompt } = await generateInitialGame(finalCharacterData, worldData, startingFactors);
                const parsedData: ParsedInitialGameData = parseInitialGameResponse(responseText);

                await useGameStore.getState().startNewGame(finalCharacterData, worldData, parsedData, prompt);
                get().reset(); // Reset creation store on successful game start

            } catch (error) {
                console.error("Failed to start game:", error);
                useToastStore.getState().addToast("Không thể bắt đầu câu chuyện. Vui lòng thử lại.", "error");
                set({ status: 'idle' });
            }
        },
        reset: () => {
            set({
                characterData: initialCharacterData,
                worldData: initialWorldData,
                startingFactors: initialStartingFactors,
                status: 'idle',
                startingBonusType: 'talent',
            });
        }
    }))
);