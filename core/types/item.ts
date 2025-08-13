import type { CongPhapType, ProfessionType } from "./skill";

// =================================================================
// ITEMS (Vật Phẩm)
// =================================================================

export type ItemCategory = 'Equipment' | 'Potion' | 'Material' | 'QuestItem' | 'Miscellaneous' | 'CongPhap' | 'LinhKi' | 'ProfessionSkillBook' | 'ProfessionTool';
export type ItemRarity = 'Phổ Thông' | 'Hiếm' | 'Quý Báu' | 'Cực Phẩm' | 'Thần Thoại' | 'Chí Tôn';
export type EquipmentType = 'Vũ Khí' | 'Giáp Đầu' | 'Giáp Thân' | 'Giáp Tay' | 'Giáp Chân' | 'Trang Sức' | 'Pháp Bảo' | 'Thú Cưng';
export type EquipmentSlot = 'Vũ Khí Chính' | 'Vũ Khí Phụ/Khiên' | 'Giáp Đầu' | 'Giáp Thân' | 'Giáp Tay' | 'Giáp Chân' | 'Trang Sức';
export type PotionType = 'Hồi Phục' | 'Tăng Cường' | 'Giải Độc' | 'Đặc Biệt';
export type MaterialType = 'Linh Thảo' | 'Khoáng Thạch' | 'Yêu Đan' | 'Da/Xương Yêu Thú' | 'Linh Hồn' | 'Vật Liệu Chế Tạo Chung' | 'Khác';


interface BaseItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ItemCategory;
  rarity: ItemRarity;
  itemRealm: string; // Cảnh giới của vật phẩm, ví dụ: "Trúc Cơ". BẮT BUỘC
}

export interface EquipmentItem extends BaseItem {
  category: 'Equipment';
  equipmentType: EquipmentType; // BẮT BUỘC
  statBonusesJSON: string; // '{"sucTanCong": 15, "maxSinhLuc": 100}'. BẮT BUỘC
  uniqueEffectsList: string; // "hút máu 5%;tăng 10% chí mạng". BẮT BUỘC
  value?: number;
  slot?: EquipmentSlot;
}

export interface PotionItem extends BaseItem {
  category: 'Potion';
  potionType: PotionType; // BẮT BUỘC
  effectsList: string; // "Hồi 50 HP;Tăng 10 công trong 3 lượt". BẮT BUỘC
}

export interface MaterialItem extends BaseItem { 
  category: 'Material'; 
  materialType: MaterialType; // BẮT BUỘC
}

export interface QuestItem extends BaseItem { category: 'QuestItem'; }
export interface MiscellaneousItem extends BaseItem { category: 'Miscellaneous'; }

// Các loại item mới, dùng để học kỹ năng/công pháp
export interface CongPhapItem extends BaseItem { 
    category: 'CongPhap'; 
    congPhapType: CongPhapType;
    expBonusPercentage?: number;
}
export interface LinhKiItem extends BaseItem { 
    category: 'LinhKi'; 
    skillToLearnJSON: string; // BẮT BUỘC
}
export interface ProfessionSkillBookItem extends BaseItem { 
    category: 'ProfessionSkillBook';
    professionToLearn: ProfessionType; // BẮT BUỘC
}
export interface ProfessionToolItem extends BaseItem { 
    category: 'ProfessionTool'; 
    professionRequired: ProfessionType; // BẮT BUỘC
}

export type AnyItem = EquipmentItem | PotionItem | MaterialItem | QuestItem | MiscellaneousItem | CongPhapItem | LinhKiItem | ProfessionSkillBookItem | ProfessionToolItem;