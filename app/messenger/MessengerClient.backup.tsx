"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import {
  ConversationWithDetails,
  MessageWithSender,
  ParticipantProfile,
  MessageType,
} from "@/lib/messenger/types";
import {
  getOrCreateDirectConversation,
  getMessages,
  sendMessage,
  createGroupConversation,
  markMessagesAsRead,
  createCallSession,
} from "@/lib/messenger/actions";
import "./styles.css";

// Icons
import {
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  ImageIcon,
  Smile,
  X,
  Users,
  MessageCircle,
} from "lucide-react";

// LiveKit imports
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

interface CurrentUser {
  $id: string;
  name: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string | null;
}

interface MessengerClientProps {
  currentUser: CurrentUser;
  initialConversations: ConversationWithDetails[];
  initialUsers: ParticipantProfile[];
}

export default function MessengerClient({
  currentUser,
  initialConversations,
  initialUsers,
}: MessengerClientProps) {
  // State
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] =
    useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserList] = useState(true);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Video call state
  const [isInCall, setIsInCall] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);
  const [callRoomName, setCallRoomName] = useState<string | null>(null);
  const [callType, setCallType] = useState<"audio" | "video">("video");

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Appwrite Realtime
  useEffect(() => {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    // Subscribe to messages collection (which stores actual messages)
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.messengerMessages}.documents`,
      (response) => {
        const payload = response.payload as MessageWithSender;

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          // New message
          if (payload.conversationId === activeConversation?.$id) {
            setMessages((prev) => [...prev, payload]);
            scrollToBottom();
          }

          // Update conversation's last message
          setConversations((prev) =>
            prev.map((conv) =>
              conv.$id === payload.conversationId
                ? {
                    ...conv,
                    lastMessage:
                      payload.type.replace(/^"|"$/g, "") === "text"
                        ? payload.content
                        : `[${payload.type.replace(/^"|"$/g, "")}]`,
                    lastMessageAt: payload.$createdAt,
                  }
                : conv
            )
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.$id]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Load messages when conversation changes
  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      try {
        const msgs = await getMessages(conversationId);
        setMessages(msgs);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.$id);
      markMessagesAsRead(activeConversation.$id, currentUser.$id);
    }
  }, [activeConversation, currentUser.$id, loadMessages]);

  // Send message
  const handleSendMessage = async () => {
    if (
      (!messageInput.trim() && uploadingFiles.length === 0) ||
      !activeConversation ||
      isSending
    ) {
      return;
    }

    setIsSending(true);

    try {
      // Upload files first if any
      for (const file of uploadingFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/messenger/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          await sendMessage(currentUser.$id, currentUser.displayName, {
            conversationId: activeConversation.$id,
            type: data.fileType as MessageType,
            content: data.fileName,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
          });
        }
      }

      // Send text message
      if (messageInput.trim()) {
        await sendMessage(currentUser.$id, currentUser.displayName, {
          conversationId: activeConversation.$id,
          type: "text",
          content: messageInput.trim(),
        });
      }

      setMessageInput("");
      setUploadingFiles([]);
      setFilePreviewUrls([]);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrls((prev) => [...prev, url]);
      }
    });
  };

  // Remove file from upload queue
  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke old URL
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  // Start a direct conversation
  const startDirectChat = async (userId: string) => {
    const result = await getOrCreateDirectConversation(currentUser.$id, userId);
    if (result.success && result.conversation) {
      setActiveConversation(result.conversation);
      // Add to conversations if not exists
      setConversations((prev) => {
        if (!prev.find((c) => c.$id === result.conversation!.$id)) {
          return [result.conversation!, ...prev];
        }
        return prev;
      });
      setShowNewChatModal(false);
    }
  };

  // Start video/audio call
  const startCall = async (type: "audio" | "video") => {
    if (!activeConversation) return;

    try {
      const session = await createCallSession(
        activeConversation.$id,
        currentUser.$id,
        type
      );

      if (session.success && session.session) {
        // Get LiveKit token
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: session.session.roomId,
            participantName: currentUser.displayName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCallToken(data.token);
          setCallRoomName(session.session.roomId);
          setCallType(type);
          setIsInCall(true);
        }
      }
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  // End call
  const endCall = () => {
    setIsInCall(false);
    setCallToken(null);
    setCallRoomName(null);
  };

  // Get display name for conversation
  const getConversationDisplayName = (conv: ConversationWithDetails) => {
    if (conv.type === "group" || conv.type === '"group"') {
      return conv.name || "Nhóm không tên";
    }
    // Direct chat - show other user's name
    const otherUser = conv.participantProfiles.find(
      (p) => p.userId !== currentUser.$id
    );
    return otherUser?.adminNickname || otherUser?.displayName || "Người dùng";
  };

  // Get avatar for conversation
  const getConversationAvatar = (conv: ConversationWithDetails) => {
    if (conv.type === "group" || conv.type === '"group"') {
      return conv.avatar;
    }
    const otherUser = conv.participantProfiles.find(
      (p) => p.userId !== currentUser.$id
    );
    return otherUser?.avatarUrl;
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff < 604800000)
      return date.toLocaleDateString("vi-VN", { weekday: "short" });
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const name = getConversationDisplayName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Filter users by search
  const filteredUsers = initialUsers.filter((user) => {
    if (!searchQuery) return true;
    const name = (user.adminNickname || user.displayName).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Render message content based on type
  const renderMessageContent = (msg: MessageWithSender) => {
    if (msg.isDeleted) {
      return <span className="text-gray-500 italic">Tin nhắn đã bị xóa</span>;
    }

    // Strip dấu nháy kép nếu có (từ Appwrite enum)
    const messageType = msg.type.replace(/^"|"$/g, "");

    switch (messageType) {
      case "image":
        return (
          <div className="message-image">
            <img
              src={msg.fileUrl || ""}
              alt={msg.fileName || "Image"}
              loading="lazy"
            />
          </div>
        );
      case "video":
        return (
          <video controls className="max-w-full rounded-lg">
            <source src={msg.fileUrl || ""} />
          </video>
        );
      case "audio":
        return (
          <audio controls className="w-full">
            <source src={msg.fileUrl || ""} />
          </audio>
        );
      case "file":
        return (
          <a
            href={msg.fileUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="message-file"
          >
            <div className="message-file-icon">
              <Paperclip size={20} />
            </div>
            <div className="message-file-info">
              <div className="message-file-name">{msg.fileName}</div>
              <div className="message-file-size">
                {msg.fileSize
                  ? `${(parseInt(msg.fileSize) / 1024 / 1024).toFixed(2)} MB`
                  : ""}
              </div>
            </div>
          </a>
        );
      case "system":
        return (
          <div className="text-center text-gray-500 text-sm py-2">
            {msg.content}
          </div>
        );
      default:
        return <span>{msg.content}</span>;
    }
  };

  return (
    <div className="messenger-page">
      <div className="messenger-container">
        {/* Sidebar */}
        <div className="messenger-sidebar">
          {/* Header */}
          <div className="sidebar-header">
            <h1 className="sidebar-title">Linh Thông Các</h1>
            <div className="sidebar-actions">
              <button
                className="sidebar-btn"
                onClick={() => setShowNewChatModal(true)}
                title="Tin nhắn mới"
              >
                <Plus size={18} />
              </button>
              <button
                className="sidebar-btn"
                onClick={() => setShowNewGroupModal(true)}
                title="Tạo nhóm"
              >
                <Users size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="search-box">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tầm đạo hữu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Chưa có linh âm nào</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.$id}
                  className={`conversation-item ${
                    activeConversation?.$id === conv.$id ? "active" : ""
                  }`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {getConversationAvatar(conv) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(conv)}`}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      getConversationDisplayName(conv).charAt(0).toUpperCase()
                    )}
                    {(conv.type === "direct" || conv.type === '"direct"') && (
                      <span className="online-indicator" />
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">
                      {getConversationDisplayName(conv)}
                    </div>
                    <div className="conversation-preview">
                      {conv.lastMessage || "Bắt đầu cuộc trò chuyện"}
                    </div>
                  </div>
                  <div className="conversation-meta">
                    {conv.lastMessageAt && (
                      <span className="conversation-time">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-header-avatar">
                    {getConversationAvatar(activeConversation) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(
                          activeConversation
                        )}`}
                        alt=""
                      />
                    ) : (
                      getConversationDisplayName(activeConversation)
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="chat-header-details">
                    <h3>{getConversationDisplayName(activeConversation)}</h3>
                    <span className="chat-header-status">Đang hoạt động</span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button
                    className="chat-action-btn call"
                    onClick={() => startCall("audio")}
                    title="Truyền âm"
                    data-tooltip="Truyền âm"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    className="chat-action-btn video"
                    onClick={() => startCall("video")}
                    title="Linh thị"
                    data-tooltip="Linh thị"
                  >
                    <Video size={20} />
                  </button>
                  <button
                    className="chat-action-btn"
                    title="Thêm"
                    data-tooltip="Thêm"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">
                      <MessageCircle size={48} />
                    </div>
                    <h3>Khai Thông Linh Đạo</h3>
                    <p>Gửi linh âm đầu tiên để kết nối với đạo hữu!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isOwn = msg.senderId === currentUser.$id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].senderId !== msg.senderId;

                      return (
                        <div
                          key={msg.$id}
                          className={`message-group ${isOwn ? "own" : ""}`}
                        >
                          {!isOwn && showAvatar && (
                            <div className="message-avatar">
                              {msg.senderProfile?.avatarUrl ? (
                                <img
                                  src={`/avatars/${msg.senderProfile.avatarUrl}`}
                                  alt=""
                                />
                              ) : (
                                msg.senderName.charAt(0).toUpperCase()
                              )}
                            </div>
                          )}
                          {!isOwn && !showAvatar && <div className="w-9" />}
                          <div className="message-content-wrapper">
                            {!isOwn && showAvatar && (
                              <span className="message-sender">
                                {msg.senderProfile?.adminNickname ||
                                  msg.senderName}
                              </span>
                            )}
                            <div className="message-bubble">
                              {renderMessageContent(msg)}
                            </div>
                            <span className="message-time">
                              {formatTime(msg.$createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* File Preview Area */}
              {filePreviewUrls.length > 0 && (
                <div className="file-preview-area">
                  {filePreviewUrls.map((url, index) => (
                    <div key={index} className="file-preview-item">
                      <img src={url} alt="" />
                      <button
                        className="file-preview-remove"
                        onClick={() => removeFile(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="message-input-area">
                <div className="message-input-wrapper">
                  <div className="message-input-actions">
                    <button
                      className="input-action-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Đính kèm file"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button className="input-action-btn" title="Gửi ảnh">
                      <ImageIcon size={20} />
                    </button>
                  </div>
                  <textarea
                    ref={messageInputRef}
                    className="message-input"
                    placeholder="Truyền linh âm..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                  />
                  <div className="message-input-actions">
                    <button className="input-action-btn" title="Emoji">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={
                      isSending ||
                      (!messageInput.trim() && uploadingFiles.length === 0)
                    }
                  >
                    <Send size={20} />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">
                <MessageCircle size={48} />
              </div>
              <h3>Linh Thông Các</h3>
              <p>
                Chọn một đạo hữu từ danh sách bên trái để bắt đầu truyền linh âm
              </p>
            </div>
          )}
        </div>

        {/* User List Panel */}
        {showUserList && (
          <div className="user-list-panel">
            <div className="user-list-header">
              <span className="user-list-title">
                Đạo Hữu — {initialUsers.length}
              </span>
            </div>
            <div className="user-list">
              {filteredUsers.map((user) => (
                <div
                  key={user.$id}
                  className="user-item"
                  onClick={() => startDirectChat(user.userId)}
                >
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={`/avatars/${user.avatarUrl}`} alt="" />
                    ) : (
                      user.displayName.charAt(0).toUpperCase()
                    )}
                    <span className="online-indicator" />
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.adminNickname || user.displayName}
                    </div>
                    <div className="user-status online">Đang hoạt động</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowNewChatModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Linh Âm Mới</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowNewChatModal(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="search-wrapper mb-4">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm đạo hữu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.$id}
                      className="user-item"
                      onClick={() => startDirectChat(user.userId)}
                    >
                      <div className="user-avatar">
                        {user.avatarUrl ? (
                          <img src={`/avatars/${user.avatarUrl}`} alt="" />
                        ) : (
                          user.displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {user.adminNickname || user.displayName}
                        </div>
                        <div className="user-status">
                          {user.role || "Thành viên"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Overlay - Linh Thị Đại Điện */}
        {isInCall && callToken && callRoomName && (
          <div className="video-call-overlay">
            {/* LiveKit Room - Full screen với control bar tích hợp */}
            <div className="video-call-content">
              <LiveKitRoom
                token={callToken}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                connect={true}
                video={callType === "video"}
                audio={true}
                onDisconnected={endCall}
                options={{
                  videoCaptureDefaults: {
                    facingMode: "user",
                    resolution: { width: 1280, height: 720 },
                  },
                  audioCaptureDefaults: {
                    echoCancellation: true,
                    noiseSuppression: true,
                  },
                }}
              >
                <VideoConference />
                <RoomAudioRenderer />
              </LiveKitRoom>
            </div>
          </div>
        )}

        {/* New Group Modal */}
        {showNewGroupModal && (
          <NewGroupModal
            users={initialUsers}
            onClose={() => setShowNewGroupModal(false)}
            onCreateGroup={async (name, memberIds) => {
              const result = await createGroupConversation(
                currentUser.$id,
                name,
                memberIds
              );
              if (result.success && result.conversation) {
                setConversations((prev) => [result.conversation!, ...prev]);
                setActiveConversation(result.conversation);
                setShowNewGroupModal(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// New Group Modal Component
function NewGroupModal({
  users,
  onClose,
  onCreateGroup,
}: {
  users: ParticipantProfile[];
  onClose: () => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    return user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo Đạo Đàn</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tên Đạo Đàn
            </label>
            <input
              type="text"
              className="search-input"
              placeholder="Nhập tên đạo đàn..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Thêm đạo hữu ({selectedUsers.length} đã chọn)
            </label>
            <div className="search-wrapper mb-2">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.$id}
                  className={`user-item ${
                    selectedUsers.includes(user.userId)
                      ? "bg-indigo-500/20"
                      : ""
                  }`}
                  onClick={() => toggleUser(user.userId)}
                >
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={`/avatars/${user.avatarUrl}`} alt="" />
                    ) : (
                      user.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.displayName}</div>
                  </div>
                  {selectedUsers.includes(user.userId) && (
                    <div className="text-indigo-400">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            disabled={!groupName.trim() || selectedUsers.length === 0}
            onClick={() => onCreateGroup(groupName, selectedUsers)}
          >
            Tạo Đạo Đàn
          </button>
        </div>
      </div>
    </div>
  );
}
