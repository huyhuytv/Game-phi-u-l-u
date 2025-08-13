import type { AIStyle, Difficulty, ViolenceLevel, Trait } from "./common";
import type { NPC, Wife, Slave, Prisoner, Beast, Lore, Location, Faction } from "./entities";
import type { AnyItem } from "./item";
import type { AnySkill } from "./skill";

// =================================================================
// CREATION-TIME & WORLD STRUCTURE TYPES
// =================================================================

export type AdultContentDescriptionStyle = 'Hoa Mỹ' | 'Mạnh Bạo (BDSM)' | 'Văn Bản Mẫu';

/** Dữ liệu của thế giới được tạo ra */
export interface WorldData {
  storyName: string;
  genre: string;
  theme: string;
  context: string;
  aiStyle: AIStyle;

  isCultivationEnabled: boolean;
  cultivationSystemType: 'default' | 'user_defined';
  
  // Kinh tế & Thời gian
  currencyName: string;
  startingCurrency: number;
  startingDate: {
    day: number;
    month: number;
    year: number;
  };
  startingRealm?: string;
  
  // Hệ thống cốt lõi
  cultivationSystem: string[]; // Hệ thống tu luyện

  // New fields from user request
  difficulty: Difficulty;
  violenceLevel: ViolenceLevel;
  isAdultContentEnabled: boolean;
  adultContentDescriptionStyle: AdultContentDescriptionStyle;
  adultContentExample?: string;
}

/** Dữ liệu đầu vào để tạo nhân vật mới */
export interface CharacterCreationData {
  name: string;
  gender: string;
  race: string;
  personality: string;
  biography: string;
  objective: string;
  talent: Trait;
  linhCan?: string;
  theChat?: Trait;
  thoNguyen?: number;
  maxThoNguyen?: number;
}

/** Cấu trúc tổng hợp chứa tất cả các yếu tố khởi đầu của thế giới */
export interface StartingFactors {
  skills: AnySkill[];
  items: AnyItem[];
  npcs: NPC[];
  beasts: Beast[];
  lore: Lore[];
  locations: Location[];
  factions: Faction[];
  wives: Wife[];
  slaves: Slave[];
  prisoners: Prisoner[];
}

export type StartingFactorItem = AnyItem | AnySkill | NPC | Beast | Lore | Location | Faction;
export type StartingFactorCategory = keyof StartingFactors;