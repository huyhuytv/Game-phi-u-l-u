import type { GameScreenState, GameTime } from "./common";
import type { PlayerState, Companion, Wife, Slave, Prisoner } from "./entities";
import type { GameLogEntry, Choice, Quest, StatusEffect, WorldEvent } from "./mechanics";
import type { WorldData, StartingFactors } from "./creation";
import type { VectorStore } from "./rag";

// =================================================================
// STATE MANAGEMENT & SAVE GAME STRUCTURES
// =================================================================
export interface PlayerRelatedState {
    player: PlayerState;
    quests: Quest[];
    statusEffects: StatusEffect[];
    wives: Wife[];
    slaves: Slave[];
    prisoners: Prisoner[];
    companions: Companion[];
}

export interface WorldState {
    worldData: WorldData | null;
    startingFactors: StartingFactors | null;
    currentLocation: string;
    gameTime: GameTime;
    worldEvents: WorldEvent[];
    ragVectorStore?: VectorStore;
}

export interface GameSessionState {
    logs: GameLogEntry[];
    isLoading: boolean;
    isAwaitingPlayerAction: boolean;
    gameState: GameScreenState;
    currentChoices: Choice[];
    storySummaries: string[];
    turnCounter: number;
    currentTurnNotifications: string[];
    saveOrigin: GameScreenState | null;
    playthroughId: string;
    hasAutoSave: boolean;
    debugRetrievedContextLog: string[];
    debugSentPromptsLog: string[];
    debugRawResponsesLog: string[];
}

export interface SaveGame {
    id: string;
    timestamp: number;
    characterName: string;
    realmDisplayName: string;
    playerState: PlayerRelatedState;
    worldState: WorldState;
    sessionState: GameSessionState;
}