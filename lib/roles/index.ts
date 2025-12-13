// ============ ROLE SYSTEM ============
// Hệ thống phân quyền 5 cấp độ cho Forum

// Các cấp bậc từ thấp đến cao
export const ROLE_LEVELS = {
  no_le: 1,
  pham_nhan: 2,
  chi_cuong_gia: 3,
  thanh_nhan: 4,
  chi_ton: 5,
} as const;

export type RoleType = keyof typeof ROLE_LEVELS;

// Thông tin chi tiết cho mỗi cấp bậc
export interface RoleInfo {
  id: RoleType;
  level: number;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textGlow: string;
  description: string;
}

export const ROLES: Record<RoleType, RoleInfo> = {
  no_le: {
    id: "no_le",
    level: 1,
    name: "Khách",
    icon: "👤",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
    textGlow: "",
    description: "Chỉ có thể đọc bài viết",
  },
  pham_nhan: {
    id: "pham_nhan",
    level: 2,
    name: "Phàm Nhân",
    icon: "🌱",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/50",
    textGlow: "drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]",
    description: "Có thể bình luận và like bài viết",
  },
  chi_cuong_gia: {
    id: "chi_cuong_gia",
    level: 3,
    name: "Chí Cường Giả",
    icon: "⚔️",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    textGlow: "drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]",
    description: "Có thể tạo bài viết mới",
  },
  thanh_nhan: {
    id: "thanh_nhan",
    level: 4,
    name: "Thành Nhân",
    icon: "👑",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    textGlow: "drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]",
    description: "Có thể ghim bài viết, quản lý cơ bản",
  },
  chi_ton: {
    id: "chi_ton",
    level: 5,
    name: "Chí Tôn Nhân Tộc",
    icon: "🔥",
    color: "text-amber-400",
    bgColor: "bg-gradient-to-r from-amber-500/30 to-orange-500/30",
    borderColor: "border-amber-500/70",
    textGlow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse",
    description: "Quyền hạn tối cao - Admin",
  },
};

// ============ PERMISSIONS ============
// Quyền hạn cho từng cấp bậc

export interface RolePermissions {
  canRead: boolean;
  canLike: boolean;
  canComment: boolean;
  canCreatePost: boolean;
  canEditOwnPost: boolean;
  canDeleteOwnPost: boolean;
  canDeleteOwnComment: boolean;
  canPinPost: boolean;
  canEditAnyPost: boolean;
  canDeleteAnyPost: boolean;
  canDeleteAnyComment: boolean;
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canAssignTags: boolean;
  canUseAI?: boolean;
}

// Quyền hạn mặc định cho từng cấp bậc
export const ROLE_PERMISSIONS: Record<RoleType, RolePermissions> = {
  no_le: {
    canRead: true,
    canLike: false,
    canComment: false,
    canCreatePost: false,
    canEditOwnPost: false,
    canDeleteOwnPost: false,
    canDeleteOwnComment: false,
    canPinPost: false,
    canEditAnyPost: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: false,
    canManageUsers: false,
    canAssignRoles: false,
    canAssignTags: false,
    canUseAI: false,
  },
  pham_nhan: {
    canRead: true,
    canLike: true,
    canComment: true,
    canCreatePost: false,
    canEditOwnPost: false,
    canDeleteOwnPost: false,
    canDeleteOwnComment: true,
    canPinPost: false,
    canEditAnyPost: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: false,
    canManageUsers: false,
    canAssignRoles: false,
    canAssignTags: false,
    canUseAI: false,
  },
  chi_cuong_gia: {
    canRead: true,
    canLike: true,
    canComment: true,
    canCreatePost: true,
    canEditOwnPost: true,
    canDeleteOwnPost: true,
    canDeleteOwnComment: true,
    canPinPost: false,
    canEditAnyPost: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: false,
    canManageUsers: false,
    canAssignRoles: false,
    canAssignTags: false,
    canUseAI: true,
  },
  thanh_nhan: {
    canRead: true,
    canLike: true,
    canComment: true,
    canCreatePost: true,
    canEditOwnPost: true,
    canDeleteOwnPost: true,
    canDeleteOwnComment: true,
    canPinPost: true,
    canEditAnyPost: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: true,
    canManageUsers: false,
    canAssignRoles: false,
    canAssignTags: false,
    canUseAI: true,
  },
  chi_ton: {
    canRead: true,
    canLike: true,
    canComment: true,
    canCreatePost: true,
    canEditOwnPost: true,
    canDeleteOwnPost: true,
    canDeleteOwnComment: true,
    canPinPost: true,
    canEditAnyPost: true,
    canDeleteAnyPost: true,
    canDeleteAnyComment: true,
    canManageUsers: true,
    canAssignRoles: true,
    canAssignTags: true,
    canUseAI: true,
  },
};

// ============ CUSTOM TAGS ============
// Các tag biệt danh có thể gán cho user

export interface CustomTag {
  id: string;
  name: string;
  icon?: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Một số tag mẫu - bạn có thể thêm/bớt
export const PRESET_TAGS: CustomTag[] = [
  {
    id: "founder",
    name: "Founder",
    icon: "⭐",
    color: "text-yellow-300",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  {
    id: "developer",
    name: "Developer",
    icon: "💻",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
  },
  {
    id: "moderator",
    name: "Moderator",
    icon: "🛡️",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
  },
  {
    id: "contributor",
    name: "Contributor",
    icon: "🎯",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
  },
  {
    id: "vip",
    name: "VIP",
    icon: "💎",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
  },
  {
    id: "helper",
    name: "Helper",
    icon: "🤝",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
  },
  {
    id: "og",
    name: "OG Member",
    icon: "🏆",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
  },
  {
    id: "verified",
    name: "Verified",
    icon: "✓",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
  },
];

// ============ HELPER FUNCTIONS ============

/**
 * Lấy thông tin role từ role ID
 */
export function getRoleInfo(roleId: string | null | undefined): RoleInfo {
  const role = roleId as RoleType;
  return ROLES[role] || ROLES.pham_nhan;
}

/**
 * Lấy quyền hạn từ role ID, kết hợp với custom permissions
 */
export function getPermissions(
  roleId: string | null | undefined,
  customPermissions?: string | null
): RolePermissions {
  const role = roleId as RoleType;
  const basePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.pham_nhan;

  // Merge với custom permissions nếu có
  if (customPermissions) {
    try {
      const custom = JSON.parse(customPermissions) as Partial<RolePermissions>;
      return { ...basePermissions, ...custom };
    } catch {
      return basePermissions;
    }
  }

  return basePermissions;
}

/**
 * Parse custom tags từ string (hỗ trợ nhiều format)
 * Format 1: JSON array - ["tag1", "tag2"]
 * Format 2: Comma-separated - "Tag1, Tag2, Tag3"
 * Format 3: Single tag - "Ám Dạ Đế"
 */
export function parseCustomTags(
  tagsString: string | null | undefined
): CustomTag[] {
  if (!tagsString || tagsString.trim() === "") return [];

  let tagNames: string[] = [];

  // Thử parse như JSON array trước
  try {
    const parsed = JSON.parse(tagsString);
    if (Array.isArray(parsed)) {
      tagNames = parsed.map((t) => String(t).trim()).filter(Boolean);
    } else {
      // Nếu parse được nhưng không phải array, dùng như string
      tagNames = [String(parsed).trim()];
    }
  } catch {
    // Không phải JSON, xử lý như text thường
    // Kiểm tra nếu có dấu phẩy thì split
    if (tagsString.includes(",")) {
      tagNames = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      // Single tag
      tagNames = [tagsString.trim()];
    }
  }

  return tagNames.map((name) => {
    // Tìm trong preset tags (by id hoặc name)
    const preset = PRESET_TAGS.find(
      (t) =>
        t.id === name.toLowerCase() ||
        t.name.toLowerCase() === name.toLowerCase()
    );
    if (preset) return preset;

    // Nếu không tìm thấy trong preset, tạo tag custom với màu đẹp
    // Hash name để tạo màu consistent
    const colors = [
      {
        color: "text-rose-400",
        bgColor: "bg-rose-500/20",
        borderColor: "border-rose-500/50",
      },
      {
        color: "text-sky-400",
        bgColor: "bg-sky-500/20",
        borderColor: "border-sky-500/50",
      },
      {
        color: "text-violet-400",
        bgColor: "bg-violet-500/20",
        borderColor: "border-violet-500/50",
      },
      {
        color: "text-teal-400",
        bgColor: "bg-teal-500/20",
        borderColor: "border-teal-500/50",
      },
      {
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/50",
      },
      {
        color: "text-fuchsia-400",
        bgColor: "bg-fuchsia-500/20",
        borderColor: "border-fuchsia-500/50",
      },
      {
        color: "text-lime-400",
        bgColor: "bg-lime-500/20",
        borderColor: "border-lime-500/50",
      },
      {
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/20",
        borderColor: "border-indigo-500/50",
      },
    ];

    // Simple hash function for consistent color
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorSet = colors[hash % colors.length];

    return {
      id: name.toLowerCase().replace(/\s+/g, "_"),
      name: name,
      icon: "✦",
      ...colorSet,
    };
  });
}

/**
 * Kiểm tra xem user có quyền nhất định không
 */
export function hasPermission(
  roleId: string | null | undefined,
  permission: keyof RolePermissions,
  customPermissions?: string | null
): boolean {
  const permissions = getPermissions(roleId, customPermissions);
  return permissions[permission];
}

/**
 * Kiểm tra xem roleA có cấp cao hơn hoặc bằng roleB không
 */
export function isRoleHigherOrEqual(
  roleA: string | null | undefined,
  roleB: string | null | undefined
): boolean {
  const levelA = ROLE_LEVELS[roleA as RoleType] || 2;
  const levelB = ROLE_LEVELS[roleB as RoleType] || 2;
  return levelA >= levelB;
}

/**
 * Kiểm tra xem user có phải admin không (chi_ton hoặc thanh_nhan)
 */
export function isAdmin(roleId: string | null | undefined): boolean {
  const level = ROLE_LEVELS[roleId as RoleType] || 2;
  return level >= 4;
}

/**
 * Kiểm tra xem user có phải super admin không (chi_ton)
 */
export function isSuperAdmin(roleId: string | null | undefined): boolean {
  return roleId === "chi_ton";
}

/**
 * Kiểm tra xem user có quyền xem resource không
 *
 * Logic phân quyền:
 * - chi_ton (admin) LUÔN có quyền xem TẤT CẢ
 * - Nếu allowedRoles null/undefined/empty → CHỈ chi_ton xem được
 * - Nếu allowedRoles = ["thanh_nhan"] → thanh_nhan + chi_ton xem được
 * - User không đăng nhập → không xem được nội dung giới hạn
 *
 * @param userRole - Role hiện tại của user
 * @param allowedRolesJson - JSON array hoặc comma-separated string
 * @returns true nếu được phép xem
 */
export function canViewResource(
  userRole: string | null | undefined,
  allowedRolesJson: string | null | undefined
): boolean {
  // chi_ton (admin) LUÔN có quyền xem tất cả
  if (userRole === "chi_ton") {
    return true;
  }

  // User chưa đăng nhập → không xem được nội dung giới hạn
  if (!userRole) {
    return false;
  }

  // Parse allowedRoles
  let allowedRoles: string[] = [];

  if (allowedRolesJson !== null && allowedRolesJson !== undefined) {
    try {
      if (allowedRolesJson.startsWith("[")) {
        allowedRoles = JSON.parse(allowedRolesJson) as string[];
      } else if (allowedRolesJson.trim() !== "") {
        allowedRoles = allowedRolesJson
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch (err) {
      console.error("Failed to parse allowedRoles:", allowedRolesJson, err);
      return false; // Lỗi parse → khóa (admin đã được xử lý ở trên)
    }
  }

  // Không chọn role nào → chỉ admin xem được (admin đã return true ở trên)
  if (allowedRoles.length === 0) {
    return false;
  }

  // EXACT MATCH: User role phải nằm trong danh sách allowedRoles
  return allowedRoles.includes(userRole);
}

/**
 * Parse allowedRoles JSON thành array RoleInfo để hiển thị
 */
export function parseAllowedRoles(
  allowedRolesJson: string | null | undefined
): RoleInfo[] {
  if (!allowedRolesJson) return [];

  try {
    let roles: string[];
    if (allowedRolesJson.startsWith("[")) {
      roles = JSON.parse(allowedRolesJson) as string[];
    } else {
      roles = allowedRolesJson
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return roles.map((r) => getRoleInfo(r));
  } catch {
    return [];
  }
}
