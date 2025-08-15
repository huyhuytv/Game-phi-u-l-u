import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    WorldData, StartingFactors, TimeUpdate, EntityUpdatePayload, StartingFactorItem,
    WorldEvent, WorldEventUpdatePayload, WorldEventDetailPayload,
    WorldState, GameTime,
} from '../core/types';
import { calculateEventStartDate, MINUTES_IN_HOUR, HOURS_IN_DAY, DAYS_IN_MONTH, MONTHS_IN_YEAR } from '../core/utils/timeUtils';
import * as RAG from '../core/rag';
import { useToastStore } from './useToastStore';

const initialGameTime: GameTime = { year: 500, month: 1, day: 1, hour: 8, minute: 0 };

const safeParseInt = (val: any, defaultValue = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const num = parseInt(val, 10);
        return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
};


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
    batchUpdateRagVectors: (updates: { metadata: RAG.VectorMetadata, vector: number[] }[]) => void;
    removeRagVectorsByIds: (ids: string[]) => void;
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
    batchUpdateRagVectors: (updates) => {
        set(state => {
            if (!state.ragVectorStore) {
                state.ragVectorStore = { vectors: [], metadata: [] };
            }
            updates.forEach(({ metadata, vector }) => {
                if (!vector) return;
                const existingIndex = state.ragVectorStore!.metadata.findIndex(m => m.entityId === metadata.entityId);
                if (existingIndex > -1) {
                    // Overwrite existing entry
                    state.ragVectorStore!.vectors[existingIndex] = vector;
                    state.ragVectorStore!.metadata[existingIndex] = metadata;
                } else {
                    // Add new entry
                    state.ragVectorStore!.vectors.push(vector);
                    state.ragVectorStore!.metadata.push(metadata);
                }
            });
        });
    },
    removeRagVectorsByIds: (idsToRemove) => {
        set(state => {
            if (!state.ragVectorStore) return;
            const idsSet = new Set(idsToRemove);
            
            const newVectors = [];
            const newMetadata = [];

            for (let i = 0; i < state.ragVectorStore.metadata.length; i++) {
                if (!idsSet.has(state.ragVectorStore.metadata[i].entityId)) {
                    newVectors.push(state.ragVectorStore.vectors[i]);
                    newMetadata.push(state.ragVectorStore.metadata[i]);
                }
            }
            state.ragVectorStore.vectors = newVectors;
            state.ragVectorStore.metadata = newMetadata;
        });
    }
})));