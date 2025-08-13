import { RealmState } from "../types";

const SUB_REALM_NAMES = ["Nhất Trọng", "Nhị Trọng", "Tam Trọng", "Tứ Trọng", "Ngũ Trọng", "Lục Trọng", "Thất Trọng", "Bát Trọng", "Cửu Trọng"];

/**
 * Trả về tên của tiểu cảnh giới dựa trên cấp độ (1-10).
 * @param level Cấp độ từ 1 đến 10.
 * @returns Tên của tiểu cảnh giới (Nhất Trọng...Cửu Trọng, Đỉnh Phong).
 */
export const getSubRealmName = (level: number): string => {
  if (level >= 1 && level <= 9) {
    return SUB_REALM_NAMES[level - 1];
  }
  if (level === 10) {
    return 'Đỉnh Phong';
  }
  return 'Không xác định';
};

/**
 * Phân tích chuỗi cảnh giới (ví dụ: "Luyện Khí Thất Trọng") thành đối tượng RealmState.
 * @param realmString Chuỗi cần phân tích.
 * @param realmNames Danh sách tên các đại cảnh giới trong hệ thống.
 * @returns Đối tượng RealmState hoặc null nếu thất bại.
 */
export const parseRealmString = (realmString: string, realmNames: string[] | null): RealmState | null => {
  if (!realmString || !realmNames) {
    return null;
  }
  
  const trimmedString = realmString.trim();

  // Tìm đại cảnh giới phù hợp nhất trong hệ thống (bằng cách thử các tên dài nhất trước)
  const majorRealm = [...realmNames].sort((a, b) => b.length - a.length).find(r => trimmedString.startsWith(r));

  if (!majorRealm) {
    // Xử lý trường hợp đặc biệt như "Phàm Nhân" không có trong hệ thống
    if (trimmedString.startsWith('Phàm Nhân')) {
        // Phàm nhân mặc định là Nhất Trọng
        const subRealmLevel = 1;
        return {
            majorRealmName: 'Phàm Nhân',
            majorRealmIndex: -1,
            subRealmLevel: subRealmLevel,
            subRealmName: getSubRealmName(subRealmLevel),
            displayName: `Phàm Nhân ${getSubRealmName(subRealmLevel)}`,
        };
    }
    return null;
  }

  const majorRealmIndex = realmNames.indexOf(majorRealm);
  const subRealmPart = trimmedString.substring(majorRealm.length).trim();
  let subRealmLevel = 0;

  if (subRealmPart.toLowerCase().includes('đỉnh phong')) {
    subRealmLevel = 10;
  } else {
    const subRealmNameIndex = SUB_REALM_NAMES.findIndex(name => subRealmPart.includes(name));
    if (subRealmNameIndex !== -1) {
        subRealmLevel = subRealmNameIndex + 1;
    } else {
        // Fallback to parsing numbers if names fail
        const match = subRealmPart.match(/\d+/);
        if (match) {
            subRealmLevel = parseInt(match[0], 10);
        } else {
            // Nếu không có tiểu cảnh giới, mặc định là Nhất Trọng
            subRealmLevel = 1;
        }
    }
  }

  if (subRealmLevel === 0 || subRealmLevel > 10) return null; // Parsing failed or invalid level

  const subRealmName = getSubRealmName(subRealmLevel);

  return {
    majorRealmName: majorRealm,
    majorRealmIndex: majorRealmIndex,
    subRealmLevel: subRealmLevel,
    subRealmName: subRealmName,
    displayName: `${majorRealm} ${subRealmName}`,
  };
};


/**
 * Tính toán tuổi thọ tối đa dựa trên chỉ số của đại cảnh giới.
 * Công thức: Thọ nguyên gốc 120, mỗi cảnh giới cộng dồn thêm 100 * (1.8 ^ (chỉ số cảnh giới))
 * @param majorRealmIndex Chỉ số của đại cảnh giới hiện tại (0-based).
 * @returns Tuổi thọ tối đa.
 */
export const calculateMaxThoNguyen = (majorRealmIndex: number): number => {
    let maxThoNguyen = 120; // Thọ nguyên Phàm Nhân
    if (majorRealmIndex < 0) { // Nếu vẫn là Phàm Nhân
        return maxThoNguyen;
    }

    // Tính toán cộng dồn cho các cảnh giới đã đạt
    for (let i = 0; i <= majorRealmIndex; i++) {
        const lifeBonus = 100 * Math.pow(1.8, i);
        maxThoNguyen += lifeBonus;
    }

    return Math.floor(maxThoNguyen);
};


/**
 * Tính toán lượng tu vi cần thiết để đột phá tiểu cảnh giới tiếp theo.
 * @param currentRealm Cảnh giới hiện tại.
 * @returns Số điểm tu vi cần thiết.
 */
export const getBreakthroughThreshold = (currentRealm: RealmState): number => {
    // Tránh threshold bằng 0 hoặc quá thấp ở cấp độ đầu
    const majorMultiplier = Math.max(currentRealm.majorRealmIndex, 0) * 200 + 100;
    const subMultiplier = Math.pow(currentRealm.subRealmLevel, 1.5);
    return Math.floor(majorMultiplier * subMultiplier);
};
