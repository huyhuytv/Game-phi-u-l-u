
import type { AnyItem } from "./item";
import type { AnySkill } from "./skill";
import type { StatusEffect, Quest, WorldEvent, Choice } from "./mechanics";
import type { AnyCharacter, NPC, Beast, Location, Faction, Lore, Companion } from "./entities";
import { PlayerState } from "./entities";

// =================================================================
// PAYLOADS FOR STATE UPDATES FROM AI
// =================================================================

export interface ParsedStoryUpdate {
    storyText: string;
    choices: Choice[];
    statsUpdate?: StatsUpdate;
    timeUpdate?: TimeUpdate;
    itemsAdded: AnyItem[];
    itemsConsumed: { name: string; quantity: number }[];
    itemsUpdated: EntityUpdatePayload[];
    skillsLearned: AnySkill[];
    statusEffectsApplied: StatusEffect[];
    statusEffectsRemoved: { name: string }[];
    questsAssigned: Quest[];
    questsUpdated: QuestUpdatePayload[];
    questsCompleted: { title: string }[];
    questsFailed: { title: string }[];
    locationChange?: string;
    beginCombat?: { opponentIds: string };
    removeBinhCanhEffect?: { kinhNghiemGain: number };
    
    // Entity additions
    npcsAdded: AnyCharacter[];
    beastsAdded: Beast[];
    locationsAdded: Location[];
    factionsAdded: Faction[];
    loreAdded: Lore[];
    companionsAdded: Companion[];
    
    // Entity updates
    npcsUpdated: EntityUpdatePayload[];
    wivesUpdated: SpecialNPCUpdatePayload[];
    slavesUpdated: SpecialNPCUpdatePayload[];
    prisonersUpdated: SpecialNPCUpdatePayload[];
    companionsUpdated: CompanionUpdatePayload[];
    locationsUpdated: EntityUpdatePayload[];
    factionsUpdated: EntityUpdatePayload[];
    loreUpdated: EntityUpdatePayload[];

    // Entity removals
    npcsRemoved: { name: string }[];
    wivesRemoved: { name: string }[];
    slavesRemoved: { name: string }[];
    prisonersRemoved: { name: string }[];
    beastsRemoved: { name: string }[];
    companionsRemoved: { name: string }[];

    // World event updates
    eventsTriggered: WorldEvent[];
    eventsUpdated: WorldEventUpdatePayload[];
    eventsRevealed: WorldEventDetailPayload[];
}

export interface ParsedInitialGameData extends ParsedStoryUpdate {
    initialPlayerState: Partial<PlayerState>;
}


export interface StatsUpdate {
    sinhLuc?: string | number;
    linhLuc?: string | number;
    kinhNghiem?: string | number;
    currency?: string | number;
    turn?: number;
}

export interface TimeUpdate {
    nam?: number;
    thang?: number;
    ngay?: number;
    gio?: number;
    phut?: number;
}

export interface QuestUpdatePayload {
    title: string;
    objectiveText: string;
    newObjectiveText?: string;
    completed: boolean;
}

export interface EntityUpdatePayload {
    name: string;
    field: string;
    newValue: string;
    change?: string; // For things like reputation: "+=10"
}

export interface SpecialNPCUpdatePayload {
    name: string;
    field: 'willpower' | 'obedience' | 'resistance';
    newValue: number;
}

export interface CompanionUpdatePayload {
    name: string;
    field: 'hp' | 'mana' | 'atk';
    newValue: number;
}

export interface WorldEventUpdatePayload {
    eventTitle: string;
    newTitle?: string;
    newDescription?: string;
    newStartDate?: string;
    newDuration?: string;
    newLocationName?: string;
    createLocationIfNeeded?: boolean;
}

export interface WorldEventDetailPayload {
    eventTitle: string;
    detail: string;
}
