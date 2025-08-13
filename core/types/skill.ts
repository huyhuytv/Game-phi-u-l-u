// =================================================================
// SKILLS (Kỹ Năng)
// =================================================================

export const SKILL_TYPE = {
  CongPhap: 'Công Pháp Tu Luyện',
  LinhKi: 'Linh Kĩ',
  ThanThong: 'Thần Thông',
  CamThuat: 'Cấm Thuật',
  NgheNghiep: 'Nghề Nghiệp',
  Khac: 'Khác',
} as const;
export type SkillType = typeof SKILL_TYPE[keyof typeof SKILL_TYPE];

export type CongPhapType = 'Khí Tu' | 'Thể Tu' | 'Võ Ý' | 'Hồn Tu' | 'Thôn Phệ' | 'Song Tu' | 'Cổ Tu' | 'Âm Tu';
export type CongPhapGrade = 'Phàm Phẩm' | 'Hoàng Phẩm' | 'Huyền Phẩm' | 'Địa Phẩm' | 'Thiên Phẩm' | 'Tiên Phẩm' | 'Chưa xác định';
export type WeaponFocus = 'Quyền' | 'Kiếm' | 'Đao' | 'Thương' | 'Côn' | 'Cung' | 'Trượng' | 'Phủ' | 'Chỉ' | 'Trảo' | 'Chưởng';

export type LinhKiCategory = 'Tấn công' | 'Phòng thủ' | 'Hồi phục' | 'Thân pháp' | 'Khác';
export type LinhKiActivation = 'Chủ động' | 'Bị động';

export type ProfessionType = 'Luyện Đan Sư' | 'Luyện Khí Sư' | 'Luyện Phù Sư' | 'Trận Pháp Sư' | 'Khôi Lỗi Sư' | 'Ngự Thú Sư' | 'Linh Thảo Sư' | 'Thiên Cơ Sư' | 'Độc Sư' | 'Linh Trù' | 'Họa Sư';
export type ProfessionGrade = 'Nhất phẩm' | 'Nhị phẩm' | 'Tam phẩm' | 'Tứ phẩm' | 'Ngũ phẩm' | 'Lục phẩm' | 'Thất phẩm' | 'Bát phẩm' | 'Cửu phẩm';

interface BaseSkill {
  id: string;
  name: string;
  description: string;
  category: SkillType;
  otherEffects: string; // Hiệu ứng đặc biệt, mô tả bằng chữ. BẮT BUỘC
}

export interface CongPhapSkill extends BaseSkill {
  category: 'Công Pháp Tu Luyện';
  congPhapType: CongPhapType;
  congPhapGrade: CongPhapGrade;
  weaponFocus?: WeaponFocus;
}

export interface LinhKiSkill extends BaseSkill {
  category: 'Linh Kĩ';
  linhKiCategory: LinhKiCategory;
  linhKiActivation: LinhKiActivation;
  manaCost?: number;
  cooldown?: number; // số lượt
  baseDamage?: number;
  damageMultiplier?: number; // vd: 0.5 cho 50%
  baseHealing?: number;
  healingMultiplier?: number; // vd: 0.2 cho 20%
}

export interface ThanThongSkill extends BaseSkill {
    category: 'Thần Thông';
    manaCost?: number;
    cooldown?: number;
}

export interface CamThuatSkill extends BaseSkill {
    category: 'Cấm Thuật';
    sideEffects: string; // Tác dụng phụ BẮT BUỘC
    manaCost?: number;
    cooldown?: number;
}

export interface NgheNghiepSkill extends BaseSkill {
    category: 'Nghề Nghiệp';
    professionType: ProfessionType;
    professionGrade: ProfessionGrade;
    skillDescription: string;
}

export interface OtherSkill extends BaseSkill {
    category: 'Khác';
}

export type AnySkill = CongPhapSkill | LinhKiSkill | ThanThongSkill | CamThuatSkill | NgheNghiepSkill | OtherSkill;
