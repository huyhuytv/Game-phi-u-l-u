import type { RealmState, Trait } from "./common";
import type { AnyItem } from "./item";
import type { AnySkill } from "./skill";

// =================================================================
// ENTITY TYPES (Player, NPC, Beast, etc.)
// =================================================================

/** Trạng thái đầy đủ của người chơi */
export interface PlayerState {
  // Thông tin cơ bản
  name: string;
  gender: string;
  race: string;
  
  // Chỉ số chiến đấu & sinh tồn
  sinhLuc: number;
  maxSinhLuc: number;
  linhLuc: number;
  maxLinhLuc: number;
  sucTanCong: number;

  // Thuộc tính tu luyện
  realm: RealmState; // Cảnh giới hiện tại
  kinhNghiem: number; // Điểm tu vi/kinh nghiệm
  maxKinhNghiem: number; // Kinh nghiệm cần để đột phá
  hieuUngBinhCanh: boolean; // Trạng thái bị kẹt ở bình cảnh
  tuoi: number; // Tuổi hiện tại
  thoNguyen: number; // Số năm tuổi thọ còn lại
  maxThoNguyen: number; // Tuổi thọ tối đa
  linhCan: string; // Ví dụ: "Ngũ Hành Tạp Linh Căn"
  theChat: string; // Ví dụ: "Phàm Thể" hoặc "Thái Âm Thần Thể"
  tuChat: string; // Ví dụ: "Hạ Đẳng", "Thượng Đẳng"

  // Đặc điểm và mục tiêu
  talent: Trait;
  objective: string;
  biography: string;
  
  // Tài sản và Kỹ năng
  currency: number; // Số tiền đang có
  inventory: AnyItem[]; // Túi đồ
  skills: AnySkill[]; // Các kỹ năng đã học
}

export interface NPC {
  id: string;
  name: string;
  gender: string;
  race: string;
  personality: string;
  affinity: number;
  details: string; // Vai trò, tiểu sử
  realm: RealmState | string; // Cảnh giới (có thể là object hoặc string cho người thường)
  tuChat: string;
  spiritualRoot: string;
  specialPhysique: string;
  talent?: string;
  thoNguyen: number;
  maxThoNguyen: number;
  relationshipToPlayer: string;
  factionId?: string;
}

export interface Wife extends NPC {
    willpower: number; // Ý chí
    obedience: number; // Độ phục tùng
}

export interface Slave extends NPC {
    willpower: number; // Ý chí
    obedience: number; // Độ phục tùng
}

export interface Prisoner extends NPC {
    willpower: number; // Ý chí
    obedience: number; // Độ phục tùng
    resistance: number; // Độ kháng cự
}

export interface Beast {
  id: string;
  name: string;
  species: string;
  description: string;
  realm: string;
  isHostile: boolean;
}

export interface Companion {
    id: string;
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    atk: number;
    realm: string;
}

export interface Lore {
  id: string;
  title: string;
  content: string;
}

export type LocationType = 'Làng mạc' | 'Thị trấn' | 'Thành thị' | 'Thủ đô' | 'Tông môn/Gia tộc' | 'Rừng rậm' | 'Núi non' | 'Hang động' | 'Hầm ngục/Bí cảnh' | 'Tàn tích' | 'Sông/Hồ' | 'Địa danh Đặc biệt (Độc lập)' | 'Mặc định';
export interface Location {
  id: string;
  name: string;
  description: string;
  locationType: LocationType;
  isSafeZone: boolean;
  regionId: string;
  mapX: number;
  mapY: number;
}

export type FactionAlignment = 'Chính Nghĩa' | 'Trung Lập' | 'Tà Ác' | 'Hỗn Loạn';
export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: FactionAlignment;
  playerReputation: number;
}

export type AnyCharacter = NPC | Wife | Slave | Prisoner;