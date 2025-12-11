"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RoleBadge, CustomTagBadge } from "@/components/ui/RoleBadge";
import { ROLES, getRoleInfo, parseCustomTags } from "@/lib/roles";
import type { MemberProfile } from "@/lib/actions/members";

interface MembersClientProps {
  members: MemberProfile[];
  stats: {
    total: number;
    byRole: Record<string, number>;
  };
  currentUserId: string | null; // Now provided by server
}

// Online status storage key
const ONLINE_USERS_KEY = "forum_online_users";
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const OFFLINE_THRESHOLD = 60000; // 1 minute

export default function MembersClient({
  members,
  stats,
  currentUserId,
}: MembersClientProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Update online status in localStorage
  const updateOnlineStatus = useCallback((userId: string) => {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(ONLINE_USERS_KEY);
      const onlineData: Record<string, number> = stored
        ? JSON.parse(stored)
        : {};

      // Update current user's timestamp
      onlineData[userId] = now;

      // Clean up stale entries
      Object.keys(onlineData).forEach((uid) => {
        if (now - onlineData[uid] > OFFLINE_THRESHOLD) {
          delete onlineData[uid];
        }
      });

      localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineData));

      // Update state
      setOnlineUsers(new Set(Object.keys(onlineData)));
    } catch (e) {
      console.error("Error updating online status:", e);
    }
  }, []);

  // Remove user from online list
  const setOffline = useCallback((userId: string) => {
    try {
      const stored = localStorage.getItem(ONLINE_USERS_KEY);
      const onlineData: Record<string, number> = stored
        ? JSON.parse(stored)
        : {};
      delete onlineData[userId];
      localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineData));
    } catch (e) {
      console.error("Error setting offline:", e);
    }
  }, []);

  // Load online users from localStorage
  const loadOnlineUsers = useCallback(() => {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(ONLINE_USERS_KEY);
      const onlineData: Record<string, number> = stored
        ? JSON.parse(stored)
        : {};

      // Filter out stale entries
      const activeUsers = Object.keys(onlineData).filter(
        (uid) => now - onlineData[uid] <= OFFLINE_THRESHOLD
      );

      setOnlineUsers(new Set(activeUsers));
    } catch (e) {
      console.error("Error loading online users:", e);
    }
  }, []);

  // Initialize online tracking
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;
    let storageListener: (e: StorageEvent) => void;
    let handleBeforeUnload: (() => void) | undefined;

    // Load initial online users
    loadOnlineUsers();

    // Only start tracking if user is logged in
    if (currentUserId) {
      // Set initial online status
      updateOnlineStatus(currentUserId);

      // Heartbeat to keep online
      heartbeatInterval = setInterval(() => {
        updateOnlineStatus(currentUserId);
      }, HEARTBEAT_INTERVAL);

      // Handle tab close/navigate away
      handleBeforeUnload = () => {
        setOffline(currentUserId);
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Listen for storage changes from other tabs
      storageListener = (e: StorageEvent) => {
        if (e.key === ONLINE_USERS_KEY) {
          loadOnlineUsers();
        }
      };
      window.addEventListener("storage", storageListener);
    }

    // Refresh online users periodically
    const refreshInterval = setInterval(loadOnlineUsers, 10000);

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (refreshInterval) clearInterval(refreshInterval);
      if (handleBeforeUnload) {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
      if (storageListener) {
        window.removeEventListener("storage", storageListener);
      }
      if (currentUserId) setOffline(currentUserId);
    };
  }, [updateOnlineStatus, setOffline, loadOnlineUsers, currentUserId]);

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesRole =
      !selectedRole || (member.role || "pham_nhan") === selectedRole;
    const matchesSearch =
      !searchQuery ||
      member.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getAvatarSrc = (member: MemberProfile) => {
    if (member.avatarUrl) {
      if (member.avatarType === "custom") {
        return member.avatarUrl;
      }
      return `/avatars/${member.avatarUrl}`;
    }
    return "/avatars/default.jpg";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-background pt-8 pb-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center py-8 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold font-mono flex items-center justify-center">
            <span className="title-icon-box">
              <span className="title-icon-inner text-primary text-glow-primary animate-glow-pulse">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </span>
            <span className="text-foreground">Thành </span>
            <span className="text-secondary text-glow-secondary">Viên</span>
          </h1>
          <p className="text-foreground/60 font-mono max-w-2xl mx-auto">
            Những thành viên tuyệt vời của cộng đồng Xóm Nhà Lá
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-accent">
              <span className="w-2 h-2 bg-primary rounded-full animate-glow-pulse"></span>
              <span>{stats.total} THÀNH VIÊN</span>
            </span>
            <span className="text-foreground/30">|</span>
            <span className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-glow-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <span>{onlineUsers.size} ĐANG ONLINE</span>
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.values(ROLES).map((role, index) => {
            const count = stats.byRole[role.id] || 0;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(isSelected ? null : role.id)}
                className={`
                  group relative p-4 rounded-xl border transition-all duration-300 transform animate-fade-in-up btn-press
                  ${
                    isSelected
                      ? `${role.bgColor} ${role.borderColor} scale-105 shadow-lg`
                      : "bg-surface/40 border-border hover:border-primary/30 hover:scale-105"
                  }
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${role.bgColor} blur-xl -z-10`}
                ></div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {role.icon}
                  </span>
                  <span
                    className={`text-2xl font-bold font-mono ${role.color} ${role.textGlow}`}
                  >
                    {count}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      isSelected ? role.color : "text-foreground/60"
                    }`}
                  >
                    {role.name}
                  </span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-fade-in-scale">
                    <span className="text-xs text-background">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface/40 backdrop-blur-md border border-border rounded-xl p-4 animate-fade-in">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành viên..."
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,159,0.2)] transition-all duration-300"
            />
          </div>

          {/* Filter info */}
          <div className="flex items-center gap-3 text-sm font-mono">
            {selectedRole && (
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 border border-danger/30 rounded-lg text-danger hover:bg-danger/20 hover:scale-105 transition-all duration-300 btn-press"
              >
                <span>Xóa bộ lọc</span>
                <span>×</span>
              </button>
            )}
            <span className="text-foreground/50">
              Hiển thị {filteredMembers.length} / {members.length}
            </span>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => {
            const roleInfo = getRoleInfo(member.role);
            const tags = parseCustomTags(member.customTags);
            const isOnline = onlineUsers.has(member.userId);

            return (
              <Link
                key={member.$id}
                href={`/profile/${member.userId}`}
                className="group relative bg-surface/40 backdrop-blur-md border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,255,159,0.15)] hover:-translate-y-2 card-hover animate-fade-in-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Role glow background */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${roleInfo.bgColor} blur-2xl -z-10`}
                ></div>

                {/* Header */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`relative shrink-0`}>
                    <div
                      className={`w-16 h-16 rounded-full overflow-hidden border-2 ${roleInfo.borderColor} transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20`}
                    >
                      <Image
                        src={getAvatarSrc(member)}
                        alt={member.displayName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Role icon badge */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${roleInfo.bgColor} ${roleInfo.borderColor} border-2 flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-300`}
                    >
                      {roleInfo.icon}
                    </div>
                    {/* Online status indicator */}
                    <div
                      className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface transition-all duration-300 ${
                        isOnline
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-glow-pulse"
                          : "bg-gray-500"
                      }`}
                      title={isOnline ? "Đang trực tuyến" : "Ngoại tuyến"}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-mono font-bold text-lg truncate transition-all duration-300 ${roleInfo.color} ${roleInfo.textGlow} group-hover:text-primary`}
                      >
                        {member.displayName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <RoleBadge role={member.role} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {tags.slice(0, 3).map((tag) => (
                      <CustomTagBadge key={tag.id} tag={tag} size="sm" />
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs font-mono text-foreground/40 px-2 py-0.5">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Bio preview */}
                {member.bio && (
                  <p className="mt-3 text-sm font-mono text-foreground/50 line-clamp-2">
                    {member.bio}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                  {member.location ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-foreground/40 group-hover:text-foreground/60 transition-colors duration-300">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      {member.location}
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-xs font-mono text-foreground/30">
                    {formatDate(member.$createdAt)}
                  </span>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-16 bg-surface/30 rounded-xl border border-border">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-foreground/60 font-mono">
              Không tìm thấy thành viên nào
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRole(null);
              }}
              className="mt-4 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary font-mono text-sm hover:bg-primary/20 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Role Legend */}
        <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6">
          <h3 className="font-mono font-bold text-foreground mb-4 flex items-center gap-2">
            <span>📜</span>
            Hệ Thống Cấp Bậc & Đặc Quyền
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.values(ROLES).map((role) => {
              // Đặc quyền theo từng cấp bậc
              const privileges: Record<string, string[]> = {
                no_le: ["👁️ Xem bài viết công khai", "🚫 Không sửa được hồ sơ"],
                pham_nhan: ["👁️ Xem bài viết", "❤️ Like bài"],
                chi_cuong_gia: [
                  "👁️ Xem bài viết",
                  "❤️ Like bài",
                  "💬 Góp ý / Bình luận",
                ],
                thanh_nhan: [
                  "👁️ Xem tất cả",
                  "💬 Góp ý",
                  "✍️ Tạo bài viết",
                  "📌 Ghim bài",
                  "🔧 Quản lý cơ bản",
                ],
                chi_ton: [
                  "👑 Toàn quyền Admin",
                  "⚙️ Quản lý thành viên",
                  "🔒 Xem nội dung VIP",
                  "✨ Tạo nội dung đặc quyền",
                ],
              };
              const rolePrivileges = privileges[role.id] || [];

              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-lg border ${role.bgColor} ${role.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{role.icon}</span>
                    <span
                      className={`font-mono font-bold ${role.color} ${role.textGlow}`}
                    >
                      {role.name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {rolePrivileges.map((priv, idx) => (
                      <p
                        key={idx}
                        className="text-xs font-mono text-foreground/60"
                      >
                        {priv}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
