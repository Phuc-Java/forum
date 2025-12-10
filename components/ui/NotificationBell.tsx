"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";

interface NotificationBellProps {
  userId: string;
}

// Format relative time in Vietnamese
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Fetch unread count on mount and periodically
  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadCount(userId);
    if (result.success) {
      setUnreadCount(result.count);
    }
  }, [userId]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const result = await getNotifications(userId, { limit: 15 });
    if (result.success) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  }, [userId]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      await fetchUnreadCount();
      if (mounted) {
        setInitialLoading(false);
      }
    };

    loadInitial();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  // Fetch when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const loadNotifications = async () => {
      if (mounted) {
        await fetchNotifications();
      }
    };
    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.$id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notification.$id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Handle delete notification
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const notification = notifications.find((n) => n.$id === notificationId);
    await deleteNotification(notificationId, userId);
    setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));

    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Get notification icon and message based on type
  const getNotificationDisplay = (notification: Notification) => {
    if (notification.type === "comment") {
      return {
        icon: (
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ),
        message: (
          <span>
            <span className="font-semibold text-secondary">
              {notification.fromUserName}
            </span>
            {" đã bình luận về "}
            <span className="font-medium text-primary">
              &ldquo;{notification.postTitle}&rdquo;
            </span>
          </span>
        ),
        preview: notification.commentContent ? (
          <p className="text-xs text-foreground/50 mt-1 line-clamp-2 italic">
            &ldquo;{notification.commentContent}&rdquo;
          </p>
        ) : null,
      };
    }

    if (notification.type === "like") {
      return {
        icon: (
          <svg
            className="w-5 h-5 text-danger"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ),
        message: (
          <span>
            <span className="font-semibold text-secondary">
              {notification.fromUserName}
            </span>
            {" đã thích bài viết "}
            <span className="font-medium text-primary">
              &ldquo;{notification.postTitle}&rdquo;
            </span>
          </span>
        ),
        preview: null,
      };
    }

    // new_post
    return {
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      message: (
        <span>
          <span className="font-semibold text-secondary">
            {notification.fromUserName}
          </span>
          {" đã đăng bài viết mới: "}
          <span className="font-medium text-primary">
            &ldquo;{notification.postTitle}&rdquo;
          </span>
        </span>
      ),
      preview: null,
    };
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-background/50 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
        aria-label="Thông báo"
      >
        {/* Bell Icon */}
        <svg
          className={`w-5 h-5 transition-colors ${
            isOpen
              ? "text-primary"
              : "text-foreground/70 group-hover:text-primary"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {!initialLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-background bg-danger rounded-full animate-pulse shadow-lg shadow-danger/50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Ping animation for new notifications */}
        {!initialLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-danger rounded-full animate-ping opacity-75"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-background/50 border-b border-border">
            <div className="flex items-center gap-2">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="font-mono text-sm font-bold text-foreground">
                Thông Báo
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/30"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-mono text-foreground/60">
                    Đang tải...
                  </span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-foreground/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-mono text-foreground/50">
                  Không có thông báo nào
                </p>
                <p className="text-xs text-foreground/30 mt-1">
                  Chúng tôi sẽ thông báo khi có hoạt động mới
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((notification) => {
                  const display = getNotificationDisplay(notification);
                  return (
                    <Link
                      key={notification.$id}
                      href={`/forum#post-${notification.postId}`}
                      onClick={() => handleMarkAsRead(notification)}
                      className={`block px-4 py-3 hover:bg-primary/5 transition-colors relative group ${
                        !notification.isRead ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.isRead
                              ? "bg-primary/20"
                              : "bg-background/50"
                          }`}
                        >
                          {display.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {display.message}
                          </p>
                          {display.preview}
                          <p className="text-xs text-foreground/40 mt-1 font-mono">
                            {formatRelativeTime(notification.$createdAt)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2 animate-pulse"></div>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(e, notification.$id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/20 rounded transition-all"
                          aria-label="Xóa thông báo"
                        >
                          <svg
                            className="w-4 h-4 text-danger"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-background/50 border-t border-border">
              <Link
                href="/forum"
                className="block text-center text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả bài viết →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
