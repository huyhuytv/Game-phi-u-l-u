// =================================================================
// COMMON & CORE TYPES
// =================================================================

/** Trạng thái chung của game (Màn hình nào đang hiển thị) */
export type GameScreenState = 'MainMenu' | 'CreatingCharacter' | 'Playing' | 'InCombat' | 'Settings' | 'PromptLibrary' | 'SaveLoadMenu';

/** Đại diện cho một đặc điểm (Thiên Phú, Đặc Điểm Khởi Đầu, v.v.) */
export interface Trait {
  name: string;
  description: string;
}
export type Talent = Trait;

/** Cấu trúc chi tiết cho cảnh giới của một thực thể */
export interface RealmState {
  majorRealmName: string; // Tên đại cảnh giới, ví dụ: "Luyện Khí"
  majorRealmIndex: number; // Chỉ số của đại cảnh giới trong hệ thống (bắt đầu từ 0)
  subRealmLevel: number; // Cấp độ của tiểu cảnh giới (1-10)
  subRealmName: string; // Tên tiểu cảnh giới, ví dụ: "Nhất Trọng" hoặc "Đỉnh Phong"
  displayName: string; // Tên hiển thị đầy đủ, ví dụ: "Luyện Khí Nhất Trọng"
}

/** Cấu trúc cho thời gian trong game */
export interface GameTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

/** Cấu trúc cho việc mô phỏng văn phong của AI */
export interface AIStyle {
    type: 'default' | 'paste' | 'upload';
    content: string;
    fileName?: string;
}

export type Difficulty = 'Dễ' | 'Thường' | 'Khó' | 'Ác Mộng';
export type ViolenceLevel = 'Ẩn Dụ' | 'Thực Tế' | 'Tàn Bạo';

export enum Realm {
  PHàM_NHÂN = 'Phàm Nhân',
  LUYệN_KHÍ = 'Luyện Khí',
  TRÚC_Cơ = 'Trúc Cơ',
  KIM_ĐAN = 'Kim Đan',
  NGUYÊN_ANH = 'Nguyên Anh',
}