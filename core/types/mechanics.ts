import type { GameTime } from "./common";

// =================================================================
// GAME MECHANICS TYPES (Logs, Quests, Events, etc.)
// =================================================================

/** Một dòng sự kiện trong nhật ký game */
export interface GameLogEntry {
  id: number;
  message: string;
  type: 'system' | 'event' | 'story' | 'combat' | 'choice' | 'player_action' | 'summary';
}

/** Cấu trúc cho một lựa chọn hành động của người chơi */
export interface Choice {
  id: string;
  fullText: string; // Nguyên văn lựa chọn
  action: string; // Hành động chính
  successRate: number | null; // Tỷ lệ thành công, có thể null
  difficulty: string | null; // Độ khó
  benefit: string | null; // Lợi ích
  risk: string | null; // Rủi ro
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff' | 'neutral';
  durationMinutes: number; // Duration in game minutes. 0 for permanent.
  endTick: number; // The game time tick (total minutes) when the effect expires. 0 for permanent.
  statModifiers: string; // JSON string e.g. '{"sucTanCong": 20, "maxSinhLuc": "10%"}'
  specialEffects: string; // Semicolon-separated string
}

export interface QuestObjective {
  text: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  isCompleted: boolean;
  isFailed: boolean;
}

export interface WorldEvent {
    id: string;
    title: string;
    description: string;
    type: 'Chiến Tranh' | 'Thiên Tai' | 'Cơ Duyên' | 'Đại Hội' | 'Khác';
    startDate: GameTime;
    durationDays: number;
    locationName: string;
    revealedDetails?: string[];
}

export type WorldEventType = WorldEvent['type'];