"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/client";
import { getProfileByUserId } from "@/lib/actions/profile";
import {
  getAllProfiles,
  updateUserRole,
  updateUserTags,
  type UserWithProfile,
} from "@/lib/actions/admin";
import { RoleBadge, CustomTagBadge } from "@/components/ui/RoleBadge";
import {
  ROLES,
  PRESET_TAGS,
  getRoleInfo,
  parseCustomTags,
  isSuperAdmin,
  isAdmin,
  type RoleType,
} from "@/lib/roles";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    $id: string;
    name: string;
    email: string;
  } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(
    null
  );
  const [editMode, setEditMode] = useState<"role" | "tags" | null>(null);
  const [saving, setSaving] = useState(false);

  // Check auth and load data
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      // Get current user's profile to check role
      const profile = await getProfileByUserId(user.$id);
      if (!profile || !isAdmin(profile.role)) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setCurrentUserRole(profile.role);

      // Load all users
      const allProfiles = await getAllProfiles();
      setUsers(allProfiles);
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  const handleRoleChange = async (profileId: string, newRole: RoleType) => {
    if (!currentUser) return;

    setSaving(true);
    const result = await updateUserRole(profileId, newRole, currentUser.$id);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.$id === profileId ? { ...u, role: newRole } : u))
      );
      setSelectedUser(null);
      setEditMode(null);
    } else {
      alert(result.error || "Lỗi khi cập nhật role");
    }
    setSaving(false);
  };

  const handleTagsChange = async (profileId: string, tags: string[]) => {
    if (!currentUser) return;

    setSaving(true);
    const result = await updateUserTags(profileId, tags, currentUser.$id);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.$id === profileId ? { ...u, customTags: JSON.stringify(tags) } : u
        )
      );
      setSelectedUser(null);
      setEditMode(null);
    } else {
      alert(result.error || "Lỗi khi cập nhật tags");
    }
    setSaving(false);
  };

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl) {
      return `/avatars/${avatarUrl}`;
    }
    return "/avatars/default.jpg";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-foreground/60">
            Đang tải trang quản trị...
          </p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold font-mono text-danger mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-foreground/60 font-mono mb-6">
            Bạn cần có cấp bậc &quot;Thành Nhân&quot; trở lên để truy cập trang
            này.
          </p>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/50 rounded-lg text-primary font-mono hover:bg-primary/30 transition-colors"
          >
            Quay lại diễn đàn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-mono text-amber-400 flex items-center gap-3">
              <span className="animate-float">🔥</span> Quản Trị Viên
            </h1>
            <p className="text-foreground/60 font-mono text-sm mt-1">
              Quản lý cấp bậc và biệt danh cho thành viên
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/posts"
              className="px-4 py-2 bg-danger/10 border border-danger/50 rounded-lg font-mono text-sm text-danger hover:bg-danger/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all duration-300 btn-press"
            >
              📝 Quản lý bài viết
            </Link>
            <Link
              href="/admin/resources"
              className="px-4 py-2 bg-accent/10 border border-accent/50 rounded-lg font-mono text-sm text-accent hover:bg-accent/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,217,255,0.2)] transition-all duration-300 btn-press"
            >
              📁 Quản lý tài nguyên
            </Link>
            <Link
              href="/forum"
              className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 hover:scale-105 transition-all duration-300 btn-press"
            >
              ← Quay lại diễn đàn
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.values(ROLES).map((role, index) => {
            const count = users.filter(
              (u) => (u.role || "pham_nhan") === role.id
            ).length;
            return (
              <div
                key={role.id}
                className={`p-4 rounded-lg border hover:scale-105 hover:shadow-lg transition-all duration-300 animate-fade-in-up ${role.bgColor} ${role.borderColor}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`font-mono font-bold ${role.color}`}>
                    {count}
                  </span>
                </div>
                <p className={`text-xs font-mono ${role.color} opacity-80`}>
                  {role.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div
          className="bg-surface/60 backdrop-blur-md border border-border rounded-xl overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="p-4 border-b border-border bg-background/30">
            <h2 className="font-mono font-bold text-foreground flex items-center gap-2">
              <span>👥</span>
              Danh sách thành viên ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr className="text-left font-mono text-sm text-foreground/60">
                  <th className="px-4 py-3">Thành viên</th>
                  <th className="px-4 py-3">Cấp bậc</th>
                  <th className="px-4 py-3">Biệt danh</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const tags = parseCustomTags(user.customTags);

                  return (
                    <tr
                      key={user.$id}
                      className="hover:bg-background/30 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/${user.userId}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                            <Image
                              src={getAvatarSrc(user.avatarUrl)}
                              alt={user.displayName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p
                              className={`font-mono font-bold ${roleInfo.color} hover:underline`}
                            >
                              {user.displayName}
                            </p>
                            <p className="text-xs font-mono text-foreground/40">
                              ID: {user.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} size="sm" />
                      </td>

                      {/* Tags */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tags.length > 0 ? (
                            tags.map((tag) => (
                              <CustomTagBadge
                                key={tag.id}
                                tag={tag}
                                size="sm"
                              />
                            ))
                          ) : (
                            <span className="text-xs font-mono text-foreground/30">
                              Không có
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin(currentUserRole) && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditMode("role");
                              }}
                              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono hover:bg-amber-500/20 transition-colors"
                            >
                              Đổi cấp
                            </button>
                          )}
                          {isAdmin(currentUserRole) && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditMode("tags");
                              }}
                              className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 text-xs font-mono hover:bg-purple-500/20 transition-colors"
                            >
                              Gán tag
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {selectedUser && editMode && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6 space-y-4">
              {editMode === "role" ? (
                <RoleEditModal
                  user={selectedUser}
                  onSave={handleRoleChange}
                  onClose={() => {
                    setSelectedUser(null);
                    setEditMode(null);
                  }}
                  saving={saving}
                />
              ) : (
                <TagsEditModal
                  user={selectedUser}
                  onSave={handleTagsChange}
                  onClose={() => {
                    setSelectedUser(null);
                    setEditMode(null);
                  }}
                  saving={saving}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Role Edit Modal Component
function RoleEditModal({
  user,
  onSave,
  onClose,
  saving,
}: {
  user: UserWithProfile;
  onSave: (profileId: string, newRole: RoleType) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<RoleType>(
    (user.role as RoleType) || "pham_nhan"
  );

  return (
    <>
      <h3 className="text-xl font-bold font-mono text-amber-400 flex items-center gap-2">
        👑 Thay đổi cấp bậc
      </h3>
      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
          <span className="text-xl">{getRoleInfo(user.role).icon}</span>
        </div>
        <div>
          <p className="font-mono font-bold text-foreground">
            {user.displayName}
          </p>
          <p className="text-xs font-mono text-foreground/50">
            Hiện tại: {getRoleInfo(user.role).name}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.values(ROLES).map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all ${
              selectedRole === role.id
                ? `${role.bgColor} ${role.borderColor}`
                : "bg-background/30 border-border hover:border-foreground/30"
            }`}
          >
            <span className="text-2xl">{role.icon}</span>
            <div className="text-left">
              <p className={`font-mono font-bold ${role.color}`}>{role.name}</p>
              <p className="text-xs font-mono text-foreground/50">
                {role.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg font-mono text-sm text-foreground/70 hover:bg-surface transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => onSave(user.$id, selectedRole)}
          disabled={saving || selectedRole === user.role}
          className="flex-1 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg font-mono text-sm text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </>
  );
}

// Tags Edit Modal Component
function TagsEditModal({
  user,
  onSave,
  onClose,
  saving,
}: {
  user: UserWithProfile;
  onSave: (profileId: string, tags: string[]) => void;
  onClose: () => void;
  saving: boolean;
}) {
  // Parse existing tags - keep original names for custom tags
  const existingTags = parseCustomTags(user.customTags);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingTags.map((t) => t.name) // Use name instead of id for custom tags
  );
  const [customTagInput, setCustomTagInput] = useState("");

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTagInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  return (
    <>
      <h3 className="text-xl font-bold font-mono text-purple-400 flex items-center gap-2">
        🏷️ Gán biệt danh
      </h3>
      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
        <RoleBadge role={user.role} size="sm" />
        <p className="font-mono font-bold text-foreground">
          {user.displayName}
        </p>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-foreground/50 uppercase">
          Nhập biệt danh tùy chỉnh
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="VD: Ám Dạ Đế, Thần Rừng..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={addCustomTag}
            disabled={!customTagInput.trim()}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg font-mono text-sm text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-foreground/50 uppercase">
            Biệt danh đã chọn ({selectedTags.length})
          </p>
          <div className="flex flex-wrap gap-2 p-3 bg-background/30 rounded-lg border border-border/50">
            {selectedTags.map((tagName) => {
              // Check if it's a preset tag
              const presetTag = PRESET_TAGS.find(
                (t) =>
                  t.name.toLowerCase() === tagName.toLowerCase() ||
                  t.id === tagName.toLowerCase()
              );
              const displayTag = presetTag || {
                id: tagName.toLowerCase().replace(/\s+/g, "_"),
                name: tagName,
                icon: "✦",
                color: "text-violet-400",
                bgColor: "bg-violet-500/20",
                borderColor: "border-violet-500/50",
              };

              return (
                <span
                  key={tagName}
                  className={`px-3 py-1.5 rounded-full border font-mono text-sm flex items-center gap-1.5 ${displayTag.bgColor} ${displayTag.borderColor} ${displayTag.color}`}
                >
                  {displayTag.icon && <span>{displayTag.icon}</span>}
                  <span>{displayTag.name}</span>
                  <button
                    onClick={() => removeTag(tagName)}
                    className="ml-1 hover:text-danger transition-colors"
                    title="Xóa tag"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Tags */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-foreground/50 uppercase">
          Hoặc chọn từ danh sách có sẵn
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTags.some(
              (t) =>
                t.toLowerCase() === tag.name.toLowerCase() ||
                t.toLowerCase() === tag.id
            );
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1.5 rounded-full border font-mono text-sm flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? `${tag.bgColor} ${tag.borderColor} ${tag.color}`
                    : "bg-background/30 border-border text-foreground/50 hover:border-foreground/30"
                }`}
              >
                {tag.icon && <span>{tag.icon}</span>}
                <span>{tag.name}</span>
                {isSelected && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg font-mono text-sm text-foreground/70 hover:bg-surface transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => onSave(user.$id, selectedTags)}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg font-mono text-sm text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </>
  );
}
