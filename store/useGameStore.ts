

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    PlayerState, GameLogEntry, GameScreenState, CharacterCreationData,
    WorldData, StartingFactors, RealmState, Choice, GameTime, AnyItem,
    AnySkill, Quest, StatusEffect, ParsedStoryUpdate, Wife, Slave, Prisoner,
    WorldEvent, AnyCharacter, Companion, StatsUpdate, TimeUpdate, QuestUpdatePayload, EntityUpdatePayload, SpecialNPCUpdatePayload, CompanionUpdatePayload, WorldEventUpdatePayload, WorldEventDetailPayload, NPC, Beast, Lore, Faction, StartingFactorItem,
    PlayerRelatedState, WorldState, GameSessionState, SaveGame, VectorEntityType, VectorStore, ParsedInitialGameData
} from '../core/types';
import { getStoryUpdate, generateSummary } from '../core/services/geminiService';
import { parseStoryUpdate } from '../core/services/storyUpdateParser';
import { useToastStore } from './useToastStore';
import { parseRealmString, calculateMaxThoNguyen } from '../core/utils/realmUtils';
import { calculateEventStartDate, MINUTES_IN_HOUR, HOURS_IN_DAY, DAYS_IN_MONTH, MONTHS_IN_YEAR, gameTimeToTotalMinutes, formatTimeDifference } from '../core/utils/timeUtils';
import * as saveLoadService from '../core/services/saveLoadService';
import * as RAG from '../core/rag';
import { generateEmbeddings } from '../core/services/embeddingService';
import { useSettingsStore } from './useSettingsStore';
import { createStoryUpdatePrompt, DEFAULT_CULTIVATION_REALMS } from '../core/prompts';

// =================================================================
// HELPER FUNCTIONS
// =================================================================

const safeParseInt = (val: any, defaultValue = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const num = parseInt(val, 10);
        return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
};

const generateNotifications = (update: ParsedStoryUpdate, currencyName: string, oldLocation: string): string[] => {
    const notifications: string[] = [];

    // Stats
    if (update.statsUpdate) {
        const formatChange = (change: string | number | undefined): string => {
            if (typeof change === 'string') {
                if (change.startsWith('+=')) return `+${parseInt(change.substring(2), 10).toLocaleString()}`;
                if (change.startsWith('-=')) return `-${parseInt(change.substring(2), 10).toLocaleString()}`;
            }
            return String(change); // Fallback
        };

        if (update.statsUpdate.kinhNghiem) notifications.push(`Kinh Nghiệm: ${formatChange(update.statsUpdate.kinhNghiem)}`);
        if (update.statsUpdate.currency) notifications.push(`${currencyName}: ${formatChange(update.statsUpdate.currency)}`);
    }

    // Bình Cảnh
    if (update.removeBinhCanhEffect) {
        notifications.push(`[Đột phá] Bạn đã phá vỡ bình cảnh! Nhận +${update.removeBinhCanhEffect.kinhNghiemGain.toLocaleString()} Kinh Nghiệm.`);
    }

    // Items
    update.itemsAdded.forEach(item => {
        notifications.push(`[Nhận] ${item.quantity}x ${item.name}`);
    });
    update.itemsConsumed.forEach(item => {
        notifications.push(`[Dùng] ${item.quantity}x ${item.name}`);
    });

    // Skills
    update.skillsLearned.forEach(skill => {
        notifications.push(`[Học được] Kỹ năng mới: ${skill.name}`);
    });

    // Time
    if (update.timeUpdate && Object.values(update.timeUpdate).some(v => v > 0)) {
        const parts = [];
        if (update.timeUpdate.nam) parts.push(`${update.timeUpdate.nam} năm`);
        if (update.timeUpdate.thang) parts.push(`${update.timeUpdate.thang} tháng`);
        if (update.timeUpdate.ngay) parts.push(`${update.timeUpdate.ngay} ngày`);
        if (update.timeUpdate.gio) parts.push(`${update.timeUpdate.gio} giờ`);
        if (update.timeUpdate.phut) parts.push(`${update.timeUpdate.phut} phút`);
        if (parts.length > 0) {
            notifications.push(`Đã trôi qua ${parts.join(', ')}`);
        }
    }

    // Location
    if (update.locationChange && update.locationChange !== oldLocation) {
        notifications.push(`Đã di chuyển đến: ${update.locationChange}`);
    }

    // Status Effects
    update.statusEffectsApplied.forEach(effect => {
        const durationText = effect.durationMinutes > 0 ? ` (${formatTimeDifference(effect.durationMinutes)})` : ' (Vĩnh viễn)';
        const typeText = effect.type === 'buff' ? 'Tích cực' : effect.type === 'debuff' ? 'Tiêu cực' : 'Trung lập';
        notifications.push(`[Hiệu ứng - ${typeText}] ${effect.name}${durationText}`);
    });
    update.statusEffectsRemoved.forEach(effect => {
        notifications.push(`[Mất] Hiệu ứng: ${effect.name}`);
    });

    // Quests
    update.questsAssigned.forEach(q => notifications.push(`[Nhận] Nhiệm vụ mới: ${q.title}`));
    update.questsUpdated.forEach(qUpd => {
        if (qUpd.completed) {
            notifications.push(`[Cập nhật] Nhiệm vụ "${qUpd.title}": Hoàn thành mục tiêu "${qUpd.objectiveText}".`);
        }
    });
    update.questsCompleted.forEach(q => notifications.push(`[Hoàn thành] Nhiệm vụ: ${q.title}`));
    update.questsFailed.forEach(q => notifications.push(`[Thất bại] Nhiệm vụ: ${q.title}`));

    // World Events
    update.eventsTriggered.forEach(e => notifications.push(`[Sự kiện] Tin tức mới: ${e.title}`));
    update.eventsRevealed.forEach(e => notifications.push(`[Tình báo] Bạn khám phá ra một chi tiết mới về sự kiện "${e.eventTitle}".`));

    // Important entity changes
    if (update.npcsAdded.length > 0) {
        notifications.push(`[Gặp gỡ] Bạn đã gặp gỡ ${update.npcsAdded.length} người mới.`);
    }
    if (update.npcsUpdated.some(n => n.field === 'relationshipToPlayer')) {
        notifications.push(`[Quan hệ] Mối quan hệ với một người nào đó đã thay đổi.`);
    }

    return notifications;
}

// =================================================================
// INITIAL STATE DEFINITIONS
// =================================================================

const initialPlayerRealm: RealmState = {
    majorRealmName: 'Phàm Nhân',
    majorRealmIndex: -1,
    subRealmLevel: 1,
    subRealmName: 'Tầng 1',
    displayName: 'Phàm Nhân Tầng 1',
};

const initialPlayerState: PlayerState = {
    name: 'Đạo Hữu Vô Danh', gender: 'Bí Mật', race: 'Nhân Tộc',
    sinhLuc: 100, maxSinhLuc: 100, linhLuc: 0, maxLinhLuc: 0, sucTanCong: 5,
    realm: initialPlayerRealm, kinhNghiem: 0, maxKinhNghiem: 100,
    hieuUngBinhCanh: false, tuoi: 18, thoNguyen: 102, maxThoNguyen: 120,
    linhCan: 'Phàm Linh Căn', theChat: 'Phàm Thể', tuChat: 'Hạ Đẳng',
    talent: { name: '', description: '' },
    objective: '', biography: '', currency: 0, inventory: [], skills: [],
};

const initialGameTime: GameTime = { year: 500, month: 1, day: 1, hour: 8, minute: 0 };
const SUMMARY_TURN_INTERVAL = 5;

// =================================================================
// DOMAIN-SPECIFIC STORES
// This file is structured with multiple stores to separate concerns,
// enhancing maintainability and readability.
// =================================================================


// -----------------------------------------------------------------
// PLAYER STORE - Manages player character state, inventory, skills, quests, etc.
// -----------------------------------------------------------------
interface PlayerActions {
    initializePlayer: (player: PlayerState, startingFactors: StartingFactors) => void;
    applyStatsUpdate: (stats: StatsUpdate) => void;
    removeBinhCanhEffect: (kinhNghiemGain: number) => void;
    applyInventoryChanges: (itemsAdded: AnyItem[], itemsConsumed: { name: string, quantity: number }[], itemsUpdated: EntityUpdatePayload[]) => void;
    learnSkills: (skills: AnySkill[]) => void;
    applyStatusEffects: (applied: StatusEffect[], removed: { name: string }[]) => void;
    updateQuests: (assigned: Quest[], updated: QuestUpdatePayload[], completed: { title: string }[], failed: { title: string }[]) => void;
    handleNpcRelationChange: (npcName: string, newRelation: string) => void;
    addSpecialNpcs: (npcs: AnyCharacter[]) => void;
    updateSpecialNpcs: (updates: { wives: SpecialNPCUpdatePayload[], slaves: SpecialNPCUpdatePayload[], prisoners: SpecialNPCUpdatePayload[] }, removals: { wives: { name: string }[], slaves: { name: string }[], prisoners: { name: string }[] }) => void;
    updateCompanions: (added: Companion[], updated: CompanionUpdatePayload[], removed: { name: string }[]) => void;
}

const usePlayerStore = create(immer<PlayerRelatedState & PlayerActions>((set, get) => ({
    player: initialPlayerState,
    quests: [], statusEffects: [], wives: [], slaves: [], prisoners: [], companions: [],
    initializePlayer: (player, startingFactors) => {
        set({
            player,
            quests: [],
            statusEffects: [],
            wives: startingFactors.wives,
            slaves: startingFactors.slaves,
            prisoners: startingFactors.prisoners,
            companions: [],
        });
    },
    applyStatsUpdate: (stats) => {
        set(state => {
            const applyChange = (current: number, change: string | number | undefined): number => {
                if (change === undefined) return current;
                if (typeof change === 'number') return change;
                if (typeof change === 'string') {
                    if (change.startsWith('+=')) return current + parseInt(change.substring(2), 10);
                    if (change.startsWith('-=')) return current - parseInt(change.substring(2), 10);
                    if (change.toUpperCase() === 'MAX') return Infinity; // Will be capped later
                }
                return current;
            };
            
            const kinhNghiemGain = (typeof stats.kinhNghiem === 'string' && stats.kinhNghiem.startsWith('+=') ? parseInt(stats.kinhNghiem.substring(2), 10) : (typeof stats.kinhNghiem === 'number' ? stats.kinhNghiem : 0));
            if (!isNaN(kinhNghiemGain)) {
                state.player.kinhNghiem += kinhNghiemGain;
            }
            state.player.currency = applyChange(state.player.currency, stats.currency);
            state.player.sinhLuc = applyChange(state.player.sinhLuc, stats.sinhLuc);
            state.player.linhLuc = applyChange(state.player.linhLuc, stats.linhLuc);
            
            // Cap HP/MP to their max values
            state.player.sinhLuc = Math.min(state.player.sinhLuc, state.player.maxSinhLuc);
            state.player.linhLuc = Math.min(state.player.linhLuc, state.player.maxLinhLuc);
        });
    },
    removeBinhCanhEffect: (kinhNghiemGain) => {
        set(state => {
            state.player.hieuUngBinhCanh = false;
            state.player.kinhNghiem += kinhNghiemGain;
        });
    },
    applyInventoryChanges: (itemsAdded, itemsConsumed, itemsUpdated) => {
        set(state => {
            itemsAdded.forEach(item => {
                const existing = state.player.inventory.find(i => i.name === item.name);
                if (existing) existing.quantity += item.quantity; else state.player.inventory.push(item);
            });
            itemsConsumed.forEach(consumed => {
                const itemIndex = state.player.inventory.findIndex(i => i.name === consumed.name);
                if (itemIndex > -1) {
                    state.player.inventory[itemIndex].quantity -= consumed.quantity;
                    if (state.player.inventory[itemIndex].quantity <= 0) state.player.inventory.splice(itemIndex, 1);
                }
            });
            const updateEntity = <T extends { name: string; [key: string]: any }>(array: T[], payload: EntityUpdatePayload) => {
                const entity = array.find(e => e.name === payload.name);
                if (entity) (entity as any)[payload.field] = payload.newValue;
            };
            itemsUpdated.forEach(payload => updateEntity(state.player.inventory, payload));
        });
    },
    learnSkills: (skills) => {
        set(state => {
            skills.forEach(skill => {
                if (!state.player.skills.some(s => s.name === skill.name)) state.player.skills.push(skill);
            });
        });
    },
    applyStatusEffects: (applied, removed) => {
        set(state => {
            applied.forEach(effect => {
                const existingIndex = state.statusEffects.findIndex(se => se.name === effect.name);
                if (existingIndex > -1) state.statusEffects[existingIndex] = effect; else state.statusEffects.push(effect);
            });
            const effectsToRemove = new Set(removed.map(e => e.name));
            state.statusEffects = state.statusEffects.filter(se => !effectsToRemove.has(se.name));
        });
    },
    updateQuests: (assigned, updated, completed, failed) => {
        set(state => {
            assigned.forEach(q => state.quests.push(q));
            updated.forEach(qUpd => {
                const quest = state.quests.find(q => q.title === qUpd.title);
                if (quest) {
                    const objective = quest.objectives.find(o => o.text === qUpd.objectiveText);
                    if (objective) {
                        if (qUpd.newObjectiveText) objective.text = qUpd.newObjectiveText;
                        objective.completed = qUpd.completed;
                    }
                }
            });
            completed.forEach(qComp => { const q = state.quests.find(q => q.title === qComp.title); if (q) q.isCompleted = true; });
            failed.forEach(qFail => { const q = state.quests.find(q => q.title === qFail.title); if (q) q.isFailed = true; });
        });
    },
    handleNpcRelationChange: (npcName, newRelation) => {
        set(state => {
            // This action now ONLY handles adding the NPC to the player's specific lists.
            // It no longer removes the NPC from the world store; the orchestrator will do that.
            const npcToMove = useWorldStore.getState().startingFactors?.npcs.find(n => n.name === npcName);
            if (!npcToMove) return;

            const updatedNpc = { ...npcToMove, relationshipToPlayer: newRelation };
            if (newRelation === 'Đạo Lữ') {
                if (!state.wives.some(w => w.name === npcName)) {
                    state.wives.push({ ...updatedNpc, willpower: 50, obedience: 20 });
                }
            } else if (newRelation === 'Nô Lệ') {
                 if (!state.slaves.some(s => s.name === npcName)) {
                    state.slaves.push({ ...updatedNpc, willpower: 20, obedience: 50 });
                }
            } else if (newRelation === 'Tù Nhân') {
                 if (!state.prisoners.some(p => p.name === npcName)) {
                    state.prisoners.push({ ...updatedNpc, willpower: 80, obedience: 10, resistance: 50 });
                }
            }
        });
    },
    addSpecialNpcs: (npcs) => {
        set(state => {
            npcs.forEach(npc => {
                 if ('willpower' in npc) { // It's a special NPC type
                     const list = (npc.relationshipToPlayer === 'Đạo Lữ') ? state.wives 
                                : (npc.relationshipToPlayer === 'Nô Lệ') ? state.slaves
                                : state.prisoners;
                     if (!list.some(s => s.name === npc.name)) list.push(npc as any);
                 }
            });
        });
    },
    updateSpecialNpcs: (updates, removals) => {
        set(state => {
            const updateList = <T extends { name: string;[key: string]: any }>(list: T[], payloads: SpecialNPCUpdatePayload[]) => {
                payloads.forEach(p => {
                    const entity = list.find(e => e.name === p.name);
                    if (entity) (entity as any)[p.field] = p.newValue;
                });
            };
            const removeList = <T extends { name: string }>(list: T[], toRemove: { name: string }[]) => {
                 const names = new Set(toRemove.map(item => item.name));
                 return list.filter(item => !names.has(item.name));
            };
            
            updateList(state.wives, updates.wives);
            updateList(state.slaves, updates.slaves);
            updateList(state.prisoners, updates.prisoners);
            
            state.wives = removeList(state.wives, removals.wives);
            state.slaves = removeList(state.slaves, removals.slaves);
            state.prisoners = removeList(state.prisoners, removals.prisoners);
        });
    },
    updateCompanions: (added, updated, removed) => {
        set(state => {
            added.forEach(comp => state.companions.push(comp));
            const namesToRemove = new Set(removed.map(item => item.name));
            state.companions = state.companions.filter(item => !namesToRemove.has(item.name));
            updated.forEach(p => {
                const comp = state.companions.find(c => c.name === p.name);
                if (comp) (comp as any)[p.field] = p.newValue;
            });
        });
    }
})));


// -----------------------------------------------------------------
// WORLD STORE - Manages world state, time, NPCs, locations, etc.
// -----------------------------------------------------------------
interface WorldActions {
    initializeWorld: (worldData: WorldData, startingFactors: StartingFactors) => void;
    advanceTime: (timeUpdate: TimeUpdate) => void;
    setCurrentLocation: (location: string) => void;
    updateEntity: (category: keyof Omit<StartingFactors, 'wives' | 'slaves' | 'prisoners'>, payload: EntityUpdatePayload) => void;
    addEntity: (category: keyof Omit<StartingFactors, 'wives' | 'slaves' | 'prisoners'>, entity: StartingFactorItem) => void;
    removeEntity: (category: keyof Omit<StartingFactors, 'wives' | 'slaves' | 'prisoners'>, name: string) => void;
    addWorldEvent: (event: WorldEvent) => void;
    updateWorldEvent: (payload: WorldEventUpdatePayload) => void;
    addEventDetail: (payload: WorldEventDetailPayload) => void;
    updateRagVectorStore: (updates: { entity: any, type: VectorEntityType }[]) => Promise<void>;
}

const useWorldStore = create(immer<WorldState & WorldActions>((set, get) => ({
    worldData: null, startingFactors: null, currentLocation: 'Nơi Vô Định', gameTime: initialGameTime, worldEvents: [],
    ragVectorStore: { vectors: [], metadata: [] },
    
    initializeWorld: (worldData, startingFactors) => {
        set({
            worldData,
            startingFactors,
            currentLocation: startingFactors.locations[0]?.name || 'Nơi Vô Định',
            gameTime: { ...initialGameTime, ...worldData.startingDate },
            worldEvents: [],
            ragVectorStore: { vectors: [], metadata: [] },
        });
    },
    advanceTime: (timeUpdate) => {
        set(state => {
            state.gameTime.minute += timeUpdate.phut ?? 0;
            if (state.gameTime.minute >= MINUTES_IN_HOUR) {
                state.gameTime.hour += Math.floor(state.gameTime.minute / MINUTES_IN_HOUR);
                state.gameTime.minute %= MINUTES_IN_HOUR;
            }
            state.gameTime.hour += timeUpdate.gio ?? 0;
            if (state.gameTime.hour >= HOURS_IN_DAY) {
                state.gameTime.day += Math.floor(state.gameTime.hour / HOURS_IN_DAY);
                state.gameTime.hour %= HOURS_IN_DAY;
            }
            state.gameTime.day += timeUpdate.ngay ?? 0;
            if (state.gameTime.day > DAYS_IN_MONTH) {
                state.gameTime.month += Math.floor((state.gameTime.day - 1) / DAYS_IN_MONTH);
                state.gameTime.day = (state.gameTime.day - 1) % DAYS_IN_MONTH + 1;
            }
            state.gameTime.month += timeUpdate.thang ?? 0;
            if (state.gameTime.month > MONTHS_IN_YEAR) {
                state.gameTime.year += Math.floor((state.gameTime.month - 1) / MONTHS_IN_YEAR);
                state.gameTime.month = (state.gameTime.month - 1) % MONTHS_IN_YEAR + 1;
            }
            state.gameTime.year += timeUpdate.nam ?? 0;
        });
    },
    setCurrentLocation: (location) => set({ currentLocation: location }),
    updateEntity: (category, payload) => {
        set(state => {
             if (state.startingFactors) {
                const list = state.startingFactors[category] as StartingFactorItem[];
                if (!list) return;

                const entity = list.find(e => ('title' in e ? e.title : ('name' in e ? e.name : '')) === payload.name);
                if (entity) {
                    (entity as any)[payload.field] = payload.newValue;
                }
             }
        });
    },
    addEntity: (category, entity) => {
        set(state => {
            if (state.startingFactors) {
                const list = state.startingFactors[category] as StartingFactorItem[];
                if (!list) return;
                
                const entityName = 'title' in entity ? entity.title : ('name' in entity ? entity.name : '');
                if (entityName && !list.some(e => ('title' in e ? e.title : ('name' in e ? e.name : '')) === entityName)) {
                    list.push(entity as any);
                }
            }
        });
    },
    removeEntity: (category, name) => {
         set(state => {
             if (state.startingFactors) {
                 const list = state.startingFactors[category] as StartingFactorItem[];
                 if (!list) return;
                 state.startingFactors[category] = list.filter(e => ('title' in e ? e.title : ('name' in e ? e.name : '')) !== name) as any;
             }
         });
    },
    addWorldEvent: (event) => {
        set(state => {
            if (!state.worldEvents.some(e => e.title === event.title)) {
                state.worldEvents.push(event);
            }
        });
    },
    updateWorldEvent: (payload) => {
        set(state => {
            const event = state.worldEvents.find(e => e.title === payload.eventTitle);
            if (event) {
                if (payload.newTitle) event.title = payload.newTitle;
                if (payload.newDescription) event.description = payload.newDescription;
                if (payload.newDuration) event.durationDays = safeParseInt(payload.newDuration, event.durationDays);
                if (payload.newStartDate) {
                    event.startDate = calculateEventStartDate(get().gameTime, payload.newStartDate);
                }
                if (payload.newLocationName) event.locationName = payload.newLocationName;
            }
        });
    },
    addEventDetail: (payload) => {
        set(state => {
            const event = state.worldEvents.find(e => e.title === payload.eventTitle);
            if (event) {
                if (!event.revealedDetails) {
                    event.revealedDetails = [];
                }
                event.revealedDetails.push(payload.detail);
            }
        });
    },
    updateRagVectorStore: async (updates) => {
        if (updates.length === 0) return;

        const metadataToEmbed: RAG.VectorMetadata[] = [];
        for (const { entity, type } of updates) {
            let textToEmbed = '';
            // This is a mapping from our entity type to the correct formatter function.
            switch (type) {
                case 'npc': case 'wife': case 'slave': case 'prisoner': textToEmbed = RAG.formatCharacterForEmbedding(entity); break;
                case 'item': textToEmbed = RAG.formatItemForEmbedding(entity); break;
                case 'skill': textToEmbed = RAG.formatSkillForEmbedding(entity); break;
                case 'quest': textToEmbed = RAG.formatQuestForEmbedding(entity); break;
                case 'location': textToEmbed = RAG.formatLocationForEmbedding(entity); break;
                case 'faction': textToEmbed = RAG.formatFactionForEmbedding(entity); break;
                case 'lore': textToEmbed = RAG.formatLoreForEmbedding(entity); break;
                case 'beast': textToEmbed = RAG.formatBeastForEmbedding(entity); break;
            }
            if (textToEmbed) {
                metadataToEmbed.push({ entityId: entity.id, entityType: type, text: textToEmbed });
            }
        }

        if (metadataToEmbed.length === 0) return;
        
        try {
            const newVectors = await generateEmbeddings(metadataToEmbed.map(m => m.text));
            set(state => {
                if (!state.ragVectorStore) {
                    state.ragVectorStore = { vectors: [], metadata: [] };
                }
                metadataToEmbed.forEach((metadata, index) => {
                    const newVector = newVectors[index];
                    if (!newVector) return;

                    const existingIndex = state.ragVectorStore!.metadata.findIndex(m => m.entityId === metadata.entityId);
                    if (existingIndex > -1) {
                        // Update existing entry
                        state.ragVectorStore!.vectors[existingIndex] = newVector;
                        state.ragVectorStore!.metadata[existingIndex] = metadata;
                    } else {
                        // Add new entry
                        state.ragVectorStore!.vectors.push(newVector);
                        state.ragVectorStore!.metadata.push(metadata);
                    }
                });
            });
        } catch (error) {
            console.error("Failed to update RAG vector store:", error);
            useToastStore.getState().addToast("Lỗi cập nhật trí nhớ AI.", "error");
        }
    }
})));


// -----------------------------------------------------------------
// GAME SESSION STORE - Manages session state like logs, loading, choices, etc.
// -----------------------------------------------------------------
interface SessionActions {
    setGameState: (gameState: GameScreenState) => void;
    addLog: (message: string, type: GameLogEntry['type']) => void;
    setIsLoading: (loading: boolean) => void;
    setAwaitingPlayerAction: (awaiting: boolean) => void;
    setChoices: (choices: Choice[]) => void;
    addSummary: (summary: string) => void;
    incrementTurnCounter: (amount?: number) => void;
    setCurrentTurnNotifications: (notifications: string[]) => void;
    resetSession: () => void;
    setSaveOrigin: (from: GameScreenState | null) => void;
    setPlaythroughId: (id: string) => void;
    setHasAutoSave: (has: boolean) => void;
    addDebugRetrievedContextLog: (context?: string) => void;
    addDebugSentPromptLog: (prompt: string) => void;
    addDebugRawResponseLog: (response: string) => void;
}

const useGameSessionStore = create(immer<GameSessionState & SessionActions>((set, get) => ({
    logs: [], isLoading: false, isAwaitingPlayerAction: false, gameState: 'MainMenu',
    currentChoices: [], storySummaries: [], turnCounter: 0, currentTurnNotifications: [],
    saveOrigin: null, playthroughId: '', hasAutoSave: false, 
    debugRetrievedContextLog: [], debugSentPromptsLog: [], debugRawResponsesLog: [],
    
    setGameState: (gameState) => set({ gameState }),
    addLog: (message, type) => {
        set(state => {
            const lastLog = state.logs[state.logs.length - 1];
            if (lastLog?.message === message && lastLog?.type === type) return;
            state.logs.push({ id: Date.now() + Math.random(), message, type });
        });
    },
    setIsLoading: (loading) => set({ isLoading: loading }),
    setAwaitingPlayerAction: (awaiting) => set({ isAwaitingPlayerAction: awaiting }),
    setChoices: (choices) => set({ currentChoices: choices }),
    addSummary: (summary) => set(state => { state.storySummaries.push(summary) }),
    incrementTurnCounter: (amount = 1) => set(state => { state.turnCounter += amount }),
    setCurrentTurnNotifications: (notifications) => set({ currentTurnNotifications: notifications }),
    resetSession: () => set(state => {
        state.logs = [];
        state.currentChoices = [];
        state.storySummaries = [];
        state.turnCounter = 0;
        state.currentTurnNotifications = [];
        state.saveOrigin = null;
        state.playthroughId = '';
        state.debugRetrievedContextLog = [];
        state.debugSentPromptsLog = [];
        state.debugRawResponsesLog = [];
        // Other properties like gameState, isLoading, etc., are intentionally preserved.
    }),
    setSaveOrigin: (from) => set({ saveOrigin: from }),
    setPlaythroughId: (id) => set({ playthroughId: id }),
    setHasAutoSave: (has) => set({ hasAutoSave: has }),
    addDebugRetrievedContextLog: (context) => set(state => {
        if (context) {
            state.debugRetrievedContextLog.unshift(`[${new Date().toLocaleTimeString()}]\n${context}`);
            state.debugRetrievedContextLog.splice(20); // Keep only the last 20 logs
        }
    }),
    addDebugSentPromptLog: (prompt) => set(state => {
        state.debugSentPromptsLog.unshift(`[${new Date().toLocaleTimeString()}]\n${prompt}`);
        state.debugSentPromptsLog.splice(20); // Keep only the last 20 logs
    }),
    addDebugRawResponseLog: (response) => set(state => {
        state.debugRawResponsesLog.unshift(`[${new Date().toLocaleTimeString()}]\n${response}`);
        state.debugRawResponsesLog.splice(20); // Keep only the last 20 logs
    }),
})));


// =================================================================
// MAIN GAME STORE (ORCHESTRATOR)
// This is the primary store for high-level game flow. It composes state and actions
// from the domain-specific stores above.
// =================================================================
type FullGameState = PlayerRelatedState & WorldState & GameSessionState;

/** A helper function to get the full current game state for saving. */
export const getCurrentGameState = (): {
    playerState: PlayerRelatedState;
    worldState: WorldState;
    sessionState: GameSessionState;
} => {
    const { player, quests, statusEffects, wives, slaves, prisoners, companions } = usePlayerStore.getState();
    const { worldData, startingFactors, currentLocation, gameTime, worldEvents, ragVectorStore } = useWorldStore.getState();
    const { logs, isAwaitingPlayerAction, gameState, currentChoices, storySummaries, turnCounter, playthroughId, hasAutoSave, debugRetrievedContextLog, debugRawResponsesLog, debugSentPromptsLog } = useGameSessionStore.getState();

    return {
        playerState: { player, quests, statusEffects, wives, slaves, prisoners, companions },
        worldState: { worldData, startingFactors, currentLocation, gameTime, worldEvents, ragVectorStore },
        // Sanitize session state for saving
        sessionState: { 
            logs, 
            isLoading: false, // Never save in a loading state
            isAwaitingPlayerAction, 
            gameState: 'Playing', // Always load into the 'Playing' screen
            currentChoices, 
            storySummaries, 
            turnCounter, 
            currentTurnNotifications: [], // Clear transient notifications
            saveOrigin: null, // Reset save/load context
            playthroughId,
            hasAutoSave,
            debugRetrievedContextLog,
            debugRawResponsesLog,
            debugSentPromptsLog,
        }
    };
};

// =================================================================
// RAG HELPER FUNCTIONS
// =================================================================

/** Gathers all entities from the game state that can be part of the RAG context. */
const getAllNameableEntities = (state: FullGameState): { entity: any, type: VectorEntityType }[] => {
    const entities: { entity: any, type: VectorEntityType }[] = [];

    // Player-owned entities
    state.player.inventory.forEach(e => entities.push({ entity: e, type: 'item' }));
    state.player.skills.forEach(e => entities.push({ entity: e, type: 'skill' }));
    state.quests.forEach(e => entities.push({ entity: e, type: 'quest' }));
    state.wives.forEach(e => entities.push({ entity: e, type: 'wife' }));
    state.slaves.forEach(e => entities.push({ entity: e, type: 'slave' }));
    state.prisoners.forEach(e => entities.push({ entity: e, type: 'prisoner' }));

    // World entities (from startingFactors)
    if (state.startingFactors) {
        state.startingFactors.npcs.forEach(e => entities.push({ entity: e, type: 'npc' }));
        state.startingFactors.beasts.forEach(e => entities.push({ entity: e, type: 'beast' }));
        state.startingFactors.locations.forEach(e => entities.push({ entity: e, type: 'location' }));
        state.startingFactors.factions.forEach(e => entities.push({ entity: e, type: 'faction' }));
        state.startingFactors.lore.forEach(e => entities.push({ entity: e, type: 'lore' }));
    }
    
    return entities;
};


/**
 * Performs a full scan and vectorization of all existing entities in the game state.
 * This is meant to be called once when a new game starts to populate the initial knowledge base.
 */
const vectorizeInitialKnowledgeBase = async () => {
    const { getState } = useGameStore;
    // We need the full state to pass to getAllNameableEntities
    const allEntities = getAllNameableEntities(getState());

    // Filter out entities that might not have an ID, which is a requirement for RAG.
    const uniqueEntities = Array.from(new Map(allEntities.filter(e => e.entity && e.entity.id).map(e => [e.entity.id, e])).values());

    if (uniqueEntities.length > 0) {
        const message = `AI đang ghi nhớ ${uniqueEntities.length} ngữ cảnh của thế giới...`;
        useToastStore.getState().addToast(message, 'info');
        useGameSessionStore.getState().addLog(message, 'system');
        // This existing function handles formatting, embedding, and storing vectors.
        await useWorldStore.getState().updateRagVectorStore(uniqueEntities);
    }
};

const retrieveContextForAction = async (action: string, gameState: FullGameState): Promise<string | undefined> => {
    const ragStore = gameState.ragVectorStore;
    if (!ragStore || !ragStore.vectors || ragStore.vectors.length === 0) {
        return undefined;
    }
    const topK = useSettingsStore.getState().ragTopK;
    if (topK === 0) return undefined;

    const contextChunks = new Set<string>();

    // 1. Explicit Retrieval: Scan for proper names in the action.
    const allEntities = getAllNameableEntities(gameState);
    const lowerCaseAction = action.toLowerCase();
    allEntities.forEach(({ entity }) => {
        const name = entity.name || entity.title;
        if (name && lowerCaseAction.includes(name.toLowerCase())) {
            const metadata = ragStore.metadata.find(m => m.entityId === entity.id);
            if (metadata) {
                contextChunks.add(metadata.text);
            }
        }
    });

    // 2. Semantic Retrieval: Use embeddings to find similar context.
    try {
        const [queryVector] = await generateEmbeddings([action]);
        if (queryVector) {
            const searchResults = RAG.searchVectors(queryVector, ragStore, topK);
            searchResults.forEach(result => contextChunks.add(result));
        }
    } catch (e) {
        console.error("Semantic retrieval error:", e);
    }

    if (contextChunks.size === 0) {
        return undefined;
    }
    
    return Array.from(contextChunks).join('\n---\n');
};

const handleRagUpdates = async (parsedUpdate: ParsedStoryUpdate) => {
    const { getState } = useGameStore;
    const entitiesToUpdate: { entity: any, type: VectorEntityType }[] = [];

    const findEntity = (name: string, type: 'item' | 'skill' | 'quest' | 'npc' | 'beast' | 'location' | 'faction' | 'lore' | 'wife' | 'slave' | 'prisoner') => {
        const state = getState();
        switch (type) {
            case 'item': return state.player.inventory.find(e => e.name === name);
            case 'skill': return state.player.skills.find(e => e.name === name);
            case 'quest': return state.quests.find(e => e.title === name);
            case 'lore': return state.startingFactors?.lore.find(e => e.title === name);
            case 'wife': return state.wives.find(e => e.name === name);
            case 'slave': return state.slaves.find(e => e.name === name);
            case 'prisoner': return state.prisoners.find(e => e.name === name);
            case 'beast': return state.startingFactors?.beasts.find(e => e.name === name);
            case 'location': return state.startingFactors?.locations.find(e => e.name === name);
            case 'faction': return state.startingFactors?.factions.find(e => e.name === name);
            case 'npc': 
            default: return state.startingFactors?.npcs.find((e: any) => e.name === name);
        }
    };
    
    parsedUpdate.itemsAdded.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.name, 'item'), type: 'item'}));
    parsedUpdate.skillsLearned.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.name, 'skill'), type: 'skill' }));
    parsedUpdate.questsAssigned.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.title, 'quest'), type: 'quest'}));
    parsedUpdate.npcsAdded.forEach(e => {
        const relationship = e.relationshipToPlayer;
        const type: VectorEntityType = relationship === 'Đạo Lữ' ? 'wife' : relationship === 'Nô Lệ' ? 'slave' : relationship === 'Tù Nhân' ? 'prisoner' : 'npc';
        const entity = findEntity(e.name, type);
        if (entity) entitiesToUpdate.push({ entity, type });
    });
    parsedUpdate.beastsAdded.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.name, 'beast'), type: 'beast'}));
    parsedUpdate.locationsAdded.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.name, 'location'), type: 'location'}));
    parsedUpdate.factionsAdded.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.name, 'faction'), type: 'faction'}));
    parsedUpdate.loreAdded.forEach(e => entitiesToUpdate.push({ entity: findEntity(e.title, 'lore'), type: 'lore'}));
    
    const allUpdates = [
        ...parsedUpdate.itemsUpdated.map(p => ({...p, type: 'item' as const})),
        ...parsedUpdate.npcsUpdated.map(p => ({...p, type: 'npc' as const})),
        ...parsedUpdate.wivesUpdated.map(p => ({...p, type: 'wife' as const})),
        ...parsedUpdate.slavesUpdated.map(p => ({...p, type: 'slave' as const})),
        ...parsedUpdate.prisonersUpdated.map(p => ({...p, type: 'prisoner' as const})),
        ...parsedUpdate.locationsUpdated.map(p => ({...p, type: 'location' as const})),
        ...parsedUpdate.factionsUpdated.map(p => ({...p, type: 'faction' as const})),
        ...parsedUpdate.loreUpdated.map(p => ({...p, type: 'lore' as const})),
        ...parsedUpdate.questsUpdated.map(p => ({name: p.title, type: 'quest' as const}))
    ];

    allUpdates.forEach(p => {
        const entity = findEntity(p.name, p.type);
        if (entity) entitiesToUpdate.push({ entity, type: p.type });
    });

    const uniqueEntities = Array.from(new Map(entitiesToUpdate.filter(e => e.entity && e.entity.id).map(e => [e.entity.id, e])).values());

    if (uniqueEntities.length > 0) {
        await useWorldStore.getState().updateRagVectorStore(uniqueEntities);
    }
};


interface GameStoreActions {
    dispatchStoryUpdate: (update: ParsedStoryUpdate) => void;
    handlePlayerChoice: (choice: Choice) => Promise<void>;
    handleProcessDebugTags: (narration: string, tags: string) => Promise<void>;
    startNewGame: (characterData: CharacterCreationData, worldData: WorldData, initialGameData: ParsedInitialGameData, initialPrompt: string) => Promise<void>;
    showCharacterCreation: () => void;
    showSettings: () => void;
    showPromptLibrary: () => void;
    showMainMenu: () => void;
    showLoadMenu: () => void;
    quickSaveGame: () => Promise<void>;
    autoSaveGame: () => Promise<void>;
    loadGame: (saveData: SaveGame) => void;
    continueGame: () => Promise<void>;
    checkForAutoSave: () => Promise<void>;
    setGameState: (gameState: GameScreenState) => void;
}


export const useGameStore = create<FullGameState & GameStoreActions>((set, get) => ({
    // Initial state is combined from all sub-stores
    ...usePlayerStore.getState(),
    ...useWorldStore.getState(),
    ...useGameSessionStore.getState(),

    // ACTIONS
    dispatchStoryUpdate: (update: ParsedStoryUpdate) => {
        const playerActions = usePlayerStore.getState();
        const worldActions = useWorldStore.getState();
        const sessionActions = useGameSessionStore.getState();
        
        // Calculate endTick for new status effects BEFORE applying them
        const { gameTime } = get(); // Get current gameTime from the orchestrator store
        const currentTimeInMinutes = gameTimeToTotalMinutes(gameTime);
        const processedStatusEffects = update.statusEffectsApplied.map(effect => ({
            ...effect,
            endTick: effect.durationMinutes > 0
                ? currentTimeInMinutes + effect.durationMinutes
                : 0, // 0 for permanent
        }));

        if (update.storyText) sessionActions.addLog(update.storyText, 'story');
        sessionActions.setChoices(update.choices);
        sessionActions.setAwaitingPlayerAction(update.choices.length > 0);
        
        if (update.statsUpdate) {
            playerActions.applyStatsUpdate(update.statsUpdate);
            if (update.statsUpdate.turn) sessionActions.incrementTurnCounter(update.statsUpdate.turn);
        }
        if (update.timeUpdate) worldActions.advanceTime(update.timeUpdate);
        if (update.removeBinhCanhEffect) playerActions.removeBinhCanhEffect(update.removeBinhCanhEffect.kinhNghiemGain);
        
        playerActions.applyInventoryChanges(update.itemsAdded, update.itemsConsumed, update.itemsUpdated);
        playerActions.learnSkills(update.skillsLearned);
        playerActions.applyStatusEffects(processedStatusEffects, update.statusEffectsRemoved);
        playerActions.updateQuests(update.questsAssigned, update.questsUpdated, update.questsCompleted, update.questsFailed);
        
        if (update.locationChange) worldActions.setCurrentLocation(update.locationChange);
        if (update.beginCombat) sessionActions.setGameState('InCombat');

        // Handle adding new entities
        update.npcsAdded.forEach(npc => {
            const relationship = npc.relationshipToPlayer;
            if (relationship === 'Đạo Lữ' || relationship === 'Nô Lệ' || relationship === 'Tù Nhân') {
                const specialNpc = {
                    ...npc,
                    willpower: relationship === 'Tù Nhân' ? 80 : 50,
                    obedience: relationship === 'Nô Lệ' ? 50 : 20,
                    ...(relationship === 'Tù Nhân' && { resistance: 50 }),
                };
                playerActions.addSpecialNpcs([specialNpc as any]);
            } else {
                worldActions.addEntity('npcs', npc);
            }
        });
        update.beastsAdded.forEach(beast => worldActions.addEntity('beasts', beast));
        update.locationsAdded.forEach(loc => worldActions.addEntity('locations', loc));
        update.factionsAdded.forEach(faction => worldActions.addEntity('factions', faction));
        update.loreAdded.forEach(lore => worldActions.addEntity('lore', lore));
        
        // Handle removing entities
        update.npcsRemoved.forEach(n => worldActions.removeEntity('npcs', n.name));
        update.beastsRemoved.forEach(b => worldActions.removeEntity('beasts', b.name));

        // Handle updating entities
        update.npcsUpdated.forEach(payload => {
            if (payload.field === 'relationshipToPlayer') {
                // The orchestrator handles both adding to the player and removing from the world.
                playerActions.handleNpcRelationChange(payload.name, payload.newValue);
                worldActions.removeEntity('npcs', payload.name);
            } else {
                worldActions.updateEntity('npcs', payload);
            }
        });

        playerActions.updateSpecialNpcs(
            { wives: update.wivesUpdated, slaves: update.slavesUpdated, prisoners: update.prisonersUpdated },
            { wives: update.wivesRemoved, slaves: update.wivesRemoved, prisoners: update.prisonersRemoved }
        );
        playerActions.updateCompanions(update.companionsAdded, update.companionsUpdated, update.companionsRemoved);

        update.locationsUpdated.forEach(p => worldActions.updateEntity('locations', p));
        update.factionsUpdated.forEach(p => worldActions.updateEntity('factions', p));
        update.loreUpdated.forEach(p => worldActions.updateEntity('lore', p));
        
        // Handle World Events
        update.eventsTriggered.forEach(eventData => {
            // The timeToStart is a string like "3 ngày", which needs to be parsed against current game time
            const startDate = calculateEventStartDate(worldActions.gameTime, (eventData as any).timeToStart);
            const newEvent: WorldEvent = {
                ...eventData,
                startDate,
            };
            worldActions.addWorldEvent(newEvent);
            useToastStore.getState().addToast(`Sự kiện mới: ${newEvent.title}`, 'info');
        });
        
        update.eventsUpdated.forEach(payload => {
            worldActions.updateWorldEvent(payload);
        });

        update.eventsRevealed.forEach(payload => {
            worldActions.addEventDetail(payload);
        });
    },
    handlePlayerChoice: async (choice: Choice) => {
        const sessionActions = useGameSessionStore.getState();
        const { player } = usePlayerStore.getState();
        const { worldData, currentLocation, gameTime } = useWorldStore.getState();
        
        if (!worldData) return;

        sessionActions.setCurrentTurnNotifications([]);
        sessionActions.setAwaitingPlayerAction(false);
        sessionActions.setIsLoading(true);
        sessionActions.setChoices([]);
        sessionActions.addLog(choice.action, 'player_action');
        
        try {
            const fullCurrentState = get();
            const { logs, storySummaries } = useGameSessionStore.getState();
            
            const retrievedContext = await retrieveContextForAction(choice.fullText, fullCurrentState);
            sessionActions.addDebugRetrievedContextLog(retrievedContext);

            const prompt = createStoryUpdatePrompt(player, worldData, gameTime, logs, storySummaries, choice.fullText, retrievedContext);
            sessionActions.addDebugSentPromptLog(prompt);
            
            const responseText = await getStoryUpdate(player, worldData, gameTime, logs, storySummaries, choice.fullText, retrievedContext);
            sessionActions.addDebugRawResponseLog(responseText);

            const parsedUpdate = parseStoryUpdate(responseText);

            const notifications = generateNotifications(parsedUpdate, worldData.currencyName, currentLocation);
            sessionActions.setCurrentTurnNotifications(notifications);

            get().dispatchStoryUpdate(parsedUpdate);
            await handleRagUpdates(parsedUpdate);
            
            // ---> NEW LOGIC FOR EFFECT EXPIRATION <---
            const { gameTime: newGameTime } = useWorldStore.getState();
            const { statusEffects } = usePlayerStore.getState();
            const newCurrentTimeInMinutes = gameTimeToTotalMinutes(newGameTime);

            const activeEffects: StatusEffect[] = [];
            const expiredEffects: StatusEffect[] = [];

            for (const effect of statusEffects) {
                if (effect.endTick > 0 && effect.endTick <= newCurrentTimeInMinutes) {
                    expiredEffects.push(effect);
                } else {
                    activeEffects.push(effect);
                }
            }

            if (expiredEffects.length > 0) {
                usePlayerStore.setState({ statusEffects: activeEffects });
                expiredEffects.forEach(effect => {
                    const message = `[Hiệu ứng] "${effect.name}" đã kết thúc.`;
                    useToastStore.getState().addToast(message, 'info');
                    sessionActions.addLog(message, 'system');
                });
            }
            // ---> END NEW LOGIC <---
            
            await get().autoSaveGame();

            const currentTurnCounter = useGameSessionStore.getState().turnCounter;
            if (currentTurnCounter >= SUMMARY_TURN_INTERVAL) {
                 useGameSessionStore.setState({ turnCounter: 0 }); 
                const logsToSummarize = useGameSessionStore.getState().logs
                    .filter(l => l.type === 'story' || l.type === 'event' || l.type === 'player_action')
                    .slice(- (SUMMARY_TURN_INTERVAL * 2)) 
                    .map(l => l.type === 'player_action' ? `[Hành động] ${l.message}` : l.message)
                    .join('\n');
                if (logsToSummarize.length > 50) {
                    const summary = await generateSummary(logsToSummarize);
                    if (summary && summary !== "Tóm tắt thất bại.") {
                        sessionActions.addSummary(summary);
                        sessionActions.addLog(`[Ký Ức] ${summary}`, 'system');
                    }
                }
            }

        } catch (error) {
            console.error("Failed to handle player choice:", error);
            useToastStore.getState().addToast("Thiên cơ hỗn loạn, không thể diễn giải hành động của bạn.", "error");
        } finally {
            sessionActions.setIsLoading(false);
        }
    },
    handleProcessDebugTags: async (narration: string, tags: string) => {
        const sessionActions = useGameSessionStore.getState();
        sessionActions.setIsLoading(true);

        try {
            // 1. Add narration to the log if provided
            if (narration.trim()) {
                sessionActions.addLog(narration.trim(), 'story');
            }

            // 2. Parse and dispatch the tags using existing game logic
            const processedTags = tags.split('\n').map(t => t.trim()).filter(t => t).join('\n');
            const parsedUpdate = parseStoryUpdate(processedTags);

            get().dispatchStoryUpdate(parsedUpdate);
            
            // 3. Update RAG with any new/updated entities from the tags
            await handleRagUpdates(parsedUpdate);

            useToastStore.getState().addToast("Debug tags đã được xử lý.", "success");

        } catch (error) {
            console.error("Failed to process debug tags:", error);
            useToastStore.getState().addToast("Xử lý debug tags thất bại, vui lòng kiểm tra cú pháp.", "error");
        } finally {
            sessionActions.setIsLoading(false);
        }
    },
    startNewGame: async (characterData, worldData, initialGameData, initialPrompt) => {
        const sessionActions = useGameSessionStore.getState();
        sessionActions.setIsLoading(true);
        sessionActions.resetSession();
        sessionActions.setPlaythroughId(crypto.randomUUID());
        sessionActions.addDebugSentPromptLog(initialPrompt);
        
        const realmNames = worldData.cultivationSystem ?? DEFAULT_CULTIVATION_REALMS;
        
        // Prioritize user's input for starting realm over AI's output to fix the bug.
        const userDefinedRealm = worldData.startingRealm?.trim();
        const aiGeneratedRealm = initialGameData.initialPlayerState.realm as unknown as string;
        const initialRealmString = userDefinedRealm || aiGeneratedRealm || 'Phàm Nhân Nhất Trọng';

        let realm = parseRealmString(initialRealmString, realmNames) || initialPlayerRealm;
        let maxThoNguyen = calculateMaxThoNguyen(realm.majorRealmIndex);

        if (initialGameData.initialPlayerState.maxThoNguyen && initialGameData.initialPlayerState.maxThoNguyen > maxThoNguyen) {
            maxThoNguyen = initialGameData.initialPlayerState.maxThoNguyen;
        }

        let tuoi = maxThoNguyen - (initialGameData.initialPlayerState.thoNguyen || maxThoNguyen - 18);
        tuoi = Math.max(tuoi, 1);

        const { theChat: charCreationTheChat, ...restOfCharacterData } = characterData;
        
        const player: PlayerState = {
            ...initialPlayerState,
            ...initialGameData.initialPlayerState,
            ...restOfCharacterData,
            realm,
            tuoi,
            maxThoNguyen,
            theChat: charCreationTheChat?.name || initialGameData.initialPlayerState.theChat || 'Phàm Thể',
            inventory: [],
            skills: initialGameData.skillsLearned,
        };
        
        const startingFactors: StartingFactors = {
            items: initialGameData.itemsAdded,
            skills: initialGameData.skillsLearned,
            npcs: initialGameData.npcsAdded.filter(n => !['Đạo Lữ', 'Nô Lệ', 'Tù Nhân'].includes(n.relationshipToPlayer)) as NPC[],
            beasts: initialGameData.beastsAdded,
            locations: initialGameData.locationsAdded,
            factions: initialGameData.factionsAdded,
            lore: initialGameData.loreAdded,
            wives: initialGameData.npcsAdded.filter(n => n.relationshipToPlayer === 'Đạo Lữ') as Wife[],
            slaves: initialGameData.npcsAdded.filter(n => n.relationshipToPlayer === 'Nô Lệ') as Slave[],
            prisoners: initialGameData.npcsAdded.filter(n => n.relationshipToPlayer === 'Tù Nhân') as Prisoner[],
        };
        
        useWorldStore.getState().initializeWorld(worldData, startingFactors);
        usePlayerStore.getState().initializePlayer(player, startingFactors);
        
        sessionActions.setGameState('Playing');
        get().dispatchStoryUpdate(initialGameData);

        try {
            await vectorizeInitialKnowledgeBase();

            const { ragVectorStore } = useWorldStore.getState();
            if (ragVectorStore && ragVectorStore.metadata.length > 0) {
                const initialRagContent = ragVectorStore.metadata.map(m => m.text).join('\n---\n');
                sessionActions.addDebugRetrievedContextLog(`[KHỞI TẠO] Toàn bộ tri thức ban đầu của AI:\n${initialRagContent}`);
            }
        } catch (error) {
            console.error("Failed to start game:", error);
            useToastStore.getState().addToast("Không thể bắt đầu câu chuyện. Lỗi khởi tạo trí nhớ AI.", "error");
        } finally {
            sessionActions.setIsLoading(false);
        }
    },
    showCharacterCreation: () => useGameSessionStore.getState().setGameState('CreatingCharacter'),
    showSettings: () => useGameSessionStore.getState().setGameState('Settings'),
    showPromptLibrary: () => useGameSessionStore.getState().setGameState('PromptLibrary'),
    showMainMenu: () => {
        // We just need to change the game state. The session is reset when a new game
        // is started via startNewGame, or when a game is loaded. This avoids potential
        // complex state interactions when simply exiting to the menu.
        useGameSessionStore.getState().setGameState('MainMenu');
    },
    showLoadMenu: () => {
        const sessionStore = useGameSessionStore.getState();
        sessionStore.setSaveOrigin(sessionStore.gameState);
        sessionStore.setGameState('SaveLoadMenu');
    },
    quickSaveGame: async () => {
        const { addToast } = useToastStore.getState();
        const { playthroughId } = useGameSessionStore.getState();
        if (!playthroughId) {
            addToast("Không thể lưu: không có định danh cuộc chơi.", "error");
            return;
        }

        try {
            const { playerState, worldState, sessionState } = getCurrentGameState();
            const newSave: SaveGame = {
                id: playthroughId,
                timestamp: Date.now(),
                characterName: playerState.player.name,
                realmDisplayName: playerState.player.realm.displayName,
                playerState,
                worldState,
                sessionState,
            };
            await saveLoadService.saveGameToSlot(newSave);
            addToast(`Đã lưu tiến trình.`, "success");
        } catch(error) {
            console.error("Failed to quick save game:", error);
            addToast("Lưu game thất bại!", "error");
        }
    },
    autoSaveGame: async () => {
        const { playthroughId } = useGameSessionStore.getState();
        if (!playthroughId) return; // Don't save if game hasn't started

        try {
            const { playerState, worldState, sessionState } = getCurrentGameState();
            const newSave: SaveGame = {
                id: playthroughId, // This will be overwritten by saveAutoSave, but good to have
                timestamp: Date.now(),
                characterName: playerState.player.name,
                realmDisplayName: playerState.player.realm.displayName,
                playerState,
                worldState,
                sessionState,
            };
            await saveLoadService.saveAutoSave(newSave);
            useGameSessionStore.getState().setHasAutoSave(true);
        } catch(error) {
            console.error("Failed to auto save game:", error);
            // Don't show toast for auto-save errors to avoid annoying user
        }
    },
    loadGame: (saveData: SaveGame) => {
        // Gracefully handle saves from before the debug log arrays were added
        const playerState = saveData.playerState;
        const worldState = saveData.worldState;
        const sessionState = saveData.sessionState;

        sessionState.debugRetrievedContextLog = sessionState.debugRetrievedContextLog || [];
        sessionState.debugSentPromptsLog = sessionState.debugSentPromptsLog || [];
        sessionState.debugRawResponsesLog = sessionState.debugRawResponsesLog || [];

        usePlayerStore.setState(playerState);
        useWorldStore.setState(worldState);
        useGameSessionStore.setState(sessionState);

        // Ensure we are in the playing screen after load
        useGameSessionStore.getState().setGameState('Playing');
        useToastStore.getState().addToast(`Đã tải thành công hành trình của ${saveData.characterName}`, 'success');
    },
    continueGame: async () => {
        const { addToast } = useToastStore.getState();
        const sessionActions = useGameSessionStore.getState();
        sessionActions.setIsLoading(true);
        try {
            const saveData = await saveLoadService.loadAutoSave();
            if (saveData) {
                get().loadGame(saveData);
            } else {
                addToast("Không tìm thấy tệp lưu tự động.", "error");
            }
        } catch (error) {
            console.error("Failed to continue game:", error);
            addToast("Tải game tự động thất bại.", "error");
        } finally {
            sessionActions.setIsLoading(false);
        }
    },
    checkForAutoSave: async () => {
        try {
            const hasSave = await saveLoadService.checkAutoSave();
            useGameSessionStore.getState().setHasAutoSave(hasSave);
        } catch (error) {
            console.error("Error checking for autosave:", error);
            useGameSessionStore.getState().setHasAutoSave(false);
        }
    },
    setGameState: (gameState) => useGameSessionStore.getState().setGameState(gameState),
}));

// =================================================================
// STATE SYNCHRONIZATION
// =================================================================
// Subscribe to domain stores to update the main orchestrator store's state slice.
// This ensures components subscribed to useGameStore re-render when underlying data changes.
// CRITICAL: Only copy state properties, not actions, to prevent polluting the main store.

usePlayerStore.subscribe(
  (newState) => {
    const stateSlice: PlayerRelatedState = {
        player: newState.player,
        quests: newState.quests,
        statusEffects: newState.statusEffects,
        wives: newState.wives,
        slaves: newState.slaves,
        prisoners: newState.prisoners,
        companions: newState.companions,
    };
    useGameStore.setState(stateSlice);
  }
);

useGameSessionStore.subscribe(
  (newState) => {
    const stateSlice: GameSessionState = {
        logs: newState.logs,
        isLoading: newState.isLoading,
        isAwaitingPlayerAction: newState.isAwaitingPlayerAction,
        gameState: newState.gameState,
        currentChoices: newState.currentChoices,
        storySummaries: newState.storySummaries,
        turnCounter: newState.turnCounter,
        currentTurnNotifications: newState.currentTurnNotifications,
        saveOrigin: newState.saveOrigin,
        playthroughId: newState.playthroughId,
        hasAutoSave: newState.hasAutoSave,
        debugRetrievedContextLog: newState.debugRetrievedContextLog,
        debugSentPromptsLog: newState.debugSentPromptsLog,
        debugRawResponsesLog: newState.debugRawResponsesLog,
    };
    useGameStore.setState(stateSlice);
  }
);

useWorldStore.subscribe(
    (newState) => {
        const stateSlice: WorldState = {
            worldData: newState.worldData,
            startingFactors: newState.startingFactors,
            currentLocation: newState.currentLocation,
            gameTime: newState.gameTime,
            worldEvents: newState.worldEvents,
            ragVectorStore: newState.ragVectorStore
        };
        useGameStore.setState(stateSlice);
    }
);