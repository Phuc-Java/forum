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
  getActiveCallSessionForConversation,
} from "@/lib/messenger/actions";
import "./messenger.css";

// Role & Badges imports
import { RoleBadge, CustomTagBadge } from "@/components/ui/RoleBadge";
import { getRoleInfo, parseCustomTags } from "@/lib/roles";

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
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Maximize2,
  Minimize2,
  User,
  Bell,
  BellOff,
  Trash2,
  Flag,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// LiveKit imports
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  useParticipants,
  Chat,
} from "@livekit/components-react";
import { Track } from "livekit-client";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // State cho các modal và tính năng mới
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [isMuted, setIsMuted] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  const reportTimeoutRef = useRef<number | null>(null);

  // AI Chat state
  const [isAIChat, setIsAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { id: string; role: string; content: string; isTyping?: boolean }[]
  >([]);
  const [isAILoading, setIsAILoading] = useState(false);

  // Video call state
  const [isInCall, setIsInCall] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);
  const [callRoomName, setCallRoomName] = useState<string | null>(null);
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const [callState, setCallState] = useState<
    "idle" | "ringing" | "connecting" | "connected" | "reconnecting"
  >("idle");
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  // Session cho cả người gọi và người nhận
  const [currentCallSession, setCurrentCallSession] = useState<{
    sessionId: string;
    roomId: string;
  } | null>(null);

  // Track ongoing call sessions cho mỗi conversation (để join vào group call đang diễn ra)
  const [ongoingCallSessions, setOngoingCallSessions] = useState<
    Map<
      string,
      {
        sessionId: string;
        roomId: string;
        callType: "audio" | "video";
        participants: string[];
      }
    >
  >(new Map());

  // Incoming call state
  const [incomingCall, setIncomingCall] = useState<{
    sessionId: string;
    callerId: string;
    callerName: string;
    callerAvatar: string | null;
    callType: "audio" | "video";
    roomId: string;
    conversationId: string;
  } | null>(null);

  // Call ended notification state
  const [callEndedNotification, setCallEndedNotification] = useState<{
    type: "ended" | "rejected" | "missed" | "busy";
    callerName?: string;
  } | null>(null);

  // Ringtone (optional - will be silent if file doesn't exist)
  const incomingCallAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/Music/ringtone.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      // Preload but don't throw error if not found
      audio.onerror = () => {
        console.warn("Ringtone not found, calls will be silent");
      };
      incomingCallAudioRef.current = audio;
    }
    return () => {
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
        incomingCallAudioRef.current = null;
      }
    };
  }, []);

  // Debug call state changes
  useEffect(() => {
    console.log("Call state changed:", {
      isInCall,
      callState,
      hasToken: !!callToken,
      roomName: callRoomName,
    });
  }, [isInCall, callState, callToken, callRoomName]);

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (reportTimeoutRef.current) {
        window.clearTimeout(reportTimeoutRef.current);
        reportTimeoutRef.current = null;
      }
    };
  }, []);

  // Emoji list
  const emojiCategories = [
    {
      name: "Phổ biến",
      emojis: [
        "😀",
        "😂",
        "🥰",
        "😍",
        "😎",
        "🤔",
        "😅",
        "😊",
        "❤️",
        "👍",
        "👎",
        "🙏",
        "🔥",
        "✨",
        "💪",
        "🎉",
      ],
    },
    {
      name: "Cảm xúc",
      emojis: [
        "😁",
        "😆",
        "😋",
        "😘",
        "😗",
        "🤗",
        "🤩",
        "🤑",
        "😏",
        "😒",
        "😢",
        "😭",
        "😤",
        "😡",
        "🥺",
        "😴",
      ],
    },
    {
      name: "Cử chỉ",
      emojis: [
        "👋",
        "🤝",
        "✋",
        "👊",
        "🤙",
        "💪",
        "🙌",
        "👏",
        "🤞",
        "✌️",
        "🤟",
        "🤘",
        "👆",
        "👇",
        "👈",
        "👉",
      ],
    },
    {
      name: "Trái tim",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🤎",
        "🖤",
        "🤍",
        "💔",
        "💕",
        "💖",
        "💗",
        "💘",
        "💝",
        "💞",
      ],
    },
    {
      name: "Khác",
      emojis: [
        "🌟",
        "⭐",
        "🌙",
        "☀️",
        "🌈",
        "🎵",
        "🎶",
        "🎁",
        "🎂",
        "🍕",
        "🍔",
        "☕",
        "🍺",
        "🏆",
        "⚽",
        "🎮",
      ],
    },
  ];

  // Close emoji picker and chat menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(e.target as Node)
      ) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Appwrite Realtime - Messages
  useEffect(() => {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.messengerMessages}.documents`,
      (response) => {
        const payload = response.payload as MessageWithSender;

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          if (payload.conversationId === activeConversation?.$id) {
            setMessages((prev) => [...prev, payload]);
            scrollToBottom();

            // Thêm highlight cho tin nhắn mới (nếu không phải tin nhắn của mình)
            if (payload.senderId !== currentUser.$id) {
              setNewMessageIds((prev) => new Set(prev).add(payload.$id));
              // Xóa highlight sau 3 giây
              setTimeout(() => {
                setNewMessageIds((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(payload.$id);
                  return newSet;
                });
              }, 3000);
            }
          }

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

  // Appwrite Realtime - Incoming Calls & Outgoing Call Status
  useEffect(() => {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.callSessions}.documents`,
      (response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = response.payload as any;

        // Cuộc gọi mới được tạo - CHO NGƯỜI NHẬN
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          const status = payload.status?.replace(/^"|"$/g, "");
          const callTypeRaw = payload.callType?.replace(/^"|"$/g, "");

          // Kiểm tra xem cuộc gọi có dành cho conversation mà user đang tham gia không
          // Và user không phải là người gọi
          if (status === "ringing" && payload.initiatorId !== currentUser.$id) {
            // Tìm conversation để kiểm tra user có trong đó không
            const isUserInConversation = conversations.some(
              (conv) => conv.$id === payload.conversationId
            );

            if (isUserInConversation) {
              // Tìm thông tin người gọi
              const callerProfile = initialUsers.find(
                (u) => u.userId === payload.initiatorId
              );

              setIncomingCall({
                sessionId: payload.$id,
                callerId: payload.initiatorId,
                callerName:
                  callerProfile?.adminNickname ||
                  callerProfile?.displayName ||
                  "Đạo hữu",
                callerAvatar: callerProfile?.avatarUrl || null,
                callType: callTypeRaw as "audio" | "video",
                roomId: payload.roomId,
                conversationId: payload.conversationId,
              });

              // Phát nhạc chuông
              if (incomingCallAudioRef.current) {
                incomingCallAudioRef.current.play().catch(console.error);
              }
            }
          }
        }

        // Cuộc gọi được cập nhật (ended/ongoing)
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          const status = payload.status?.replace(/^"|"$/g, "");

          // Track ongoing call sessions
          if (status === "ongoing") {
            const conversationId = payload.conversationId;
            const participants = Array.isArray(payload.participants)
              ? payload.participants
              : [];

            setOngoingCallSessions((prev) => {
              const newMap = new Map(prev);
              newMap.set(conversationId, {
                sessionId: payload.$id,
                roomId: payload.roomId,
                callType: payload.callType?.replace(/^"|"$/g, "") as
                  | "audio"
                  | "video",
                participants,
              });
              return newMap;
            });
          } else if (status === "ended") {
            // Remove from ongoing sessions
            const conversationId = payload.conversationId;
            setOngoingCallSessions((prev) => {
              const newMap = new Map(prev);
              newMap.delete(conversationId);
              return newMap;
            });
          }

          // CHO NGƯỜI NHẬN: Nếu cuộc gọi đã kết thúc hoặc đã được nhận
          if (
            (status === "ended" || status === "ongoing") &&
            incomingCall?.sessionId === payload.$id
          ) {
            // Nếu cuộc gọi bị hủy (ended) trong khi đang hiện modal incoming call
            if (status === "ended" && incomingCall) {
              setCallEndedNotification({
                type: "missed",
                callerName: incomingCall.callerName,
              });
              setTimeout(() => setCallEndedNotification(null), 3000);
            }

            setIncomingCall(null);
            if (incomingCallAudioRef.current) {
              incomingCallAudioRef.current.pause();
              incomingCallAudioRef.current.currentTime = 0;
            }
          }

          // CHO NGƯỜI GỌI: Bên kia đã accept, vào room ngay
          if (
            status === "ongoing" &&
            currentCallSession &&
            currentCallSession.sessionId === payload.$id &&
            callState !== "connected" && // CHỈ join nếu chưa connected
            callState !== "connecting" && // Và chưa connecting
            !callToken // Và chưa có token (chưa join room)
          ) {
            console.log("Recipient accepted the call, joining room...");
            // Inline join room logic to avoid dependency issues
            const roomIdToJoin = currentCallSession.roomId;
            setCallState("connecting");
            fetch("/api/livekit/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomName: roomIdToJoin,
                participantName: currentUser.displayName,
                participantId: currentUser.$id,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                }
                throw new Error("Failed to get token");
              })
              .then((data) => {
                console.log("Got token, setting up call...");
                setCallToken(data.token);
                setCallRoomName(roomIdToJoin);
              })
              .catch((error) => {
                console.error("Failed to join call room:", error);
                endCall();
              });
          }

          // CHO CẢ 2 BÊN: Cuộc gọi bị kết thúc
          if (
            status === "ended" &&
            currentCallSession?.sessionId === payload.$id
          ) {
            console.log("Call session ended, status:", callState);

            // Kiểm tra xem có phải group call không
            const isGroupCall =
              activeConversation?.type === "group" ||
              activeConversation?.type === '"group"';

            // Xác định loại thông báo dựa vào trạng thái
            const wasRinging = callState === "ringing";
            const wasConnected =
              callState === "connected" || callState === "connecting";

            // QUAN TRỌNG: Với GROUP CALL đang CONNECTED, KHÔNG hiện notification
            // Chỉ hiện notification cho:
            // - 1-1 call bị kết thúc
            // - Bất kỳ call nào đang ringing bị reject
            const shouldShowNotification =
              callState !== "idle" && (!isGroupCall || !wasConnected);

            if (shouldShowNotification) {
              if (wasRinging) {
                // Người gọi đang đổ chuông mà bị từ chối
                setCallEndedNotification({ type: "rejected" });
              } else if (wasConnected && !isGroupCall) {
                // 1-1 call đang diễn ra bị kết thúc
                setCallEndedNotification({ type: "ended" });
              }

              // Tự động ẩn thông báo sau 3 giây
              setTimeout(() => {
                setCallEndedNotification(null);
              }, 3000);
            }

            // Reset local state
            setIsInCall(false);
            setCallToken(null);
            setCallRoomName(null);
            setCallState("idle");
            setCallStartTime(null);
            setCurrentCallSession(null);
          }
        }
      }
    );

    return () => {
      unsubscribe();
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
        incomingCallAudioRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUser.$id,
    currentUser.displayName,
    conversations,
    initialUsers,
    incomingCall?.sessionId,
    currentCallSession,
  ]);

  // Appwrite Realtime - Profile updates (avatar, status)
  useEffect(() => {
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.profiles}.documents`,
      (response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = response.payload as any;

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          // Cập nhật avatar trong conversations
          setConversations((prev) =>
            prev.map((conv) => ({
              ...conv,
              participantProfiles: conv.participantProfiles.map((p) =>
                p.userId === payload.userId
                  ? {
                      ...p,
                      avatarUrl: payload.avatarUrl,
                      displayName: payload.displayName,
                    }
                  : p
              ),
            }))
          );

          // Cập nhật avatar trong messages
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderId === payload.userId
                ? {
                    ...msg,
                    senderProfile: msg.senderProfile
                      ? {
                          ...msg.senderProfile,
                          avatarUrl: payload.avatarUrl,
                          displayName: payload.displayName,
                        }
                      : msg.senderProfile,
                  }
                : msg
            )
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      try {
        const msgs = await getMessages(
          conversationId,
          50,
          undefined,
          currentUser.$id
        );
        setMessages(msgs);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom, currentUser.$id]
  );

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.$id);
      markMessagesAsRead(activeConversation.$id, currentUser.$id);
    }
  }, [activeConversation, currentUser.$id, loadMessages]);

  // AI Chat handler
  const sendAIMessage = async (content: string) => {
    if (!content.trim() || isAILoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setMessageInput("");
    setIsAILoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...aiMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: content.trim() },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lỗi kết nối");

      const aiContent = data.message?.content || JSON.stringify(data);
      setAiMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiContent,
          isTyping: true,
        },
      ]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Không rõ nguyên nhân";
      setAiMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Hệ thống gặp sự cố: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsAILoading(false);
      scrollToBottom();
    }
  };

  // Start AI Chat
  const startAIChat = () => {
    setIsAIChat(true);
    setActiveConversation(null);
    setMessages([]);
    setAiMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    // Prevent form submission reload
    if (e) {
      e.preventDefault();
    }

    // Nếu đang chat với AI
    if (isAIChat) {
      sendAIMessage(messageInput);
      return;
    }

    if (
      (!messageInput.trim() && uploadingFiles.length === 0) ||
      !activeConversation ||
      isSending
    ) {
      return;
    }

    setIsSending(true);

    try {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrls((prev) => [...prev, url]);
      }
    });

    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Chỉ lấy file ảnh
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploadingFiles((prev) => [...prev, ...imageFiles]);

    imageFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => [...prev, url]);
    });

    e.target.value = "";
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    messageInputRef.current?.focus();
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const startDirectChat = async (userId: string) => {
    const result = await getOrCreateDirectConversation(currentUser.$id, userId);
    if (result.success && result.conversation) {
      setActiveConversation(result.conversation);
      setConversations((prev) => {
        if (!prev.find((c) => c.$id === result.conversation!.$id)) {
          return [result.conversation!, ...prev];
        }
        return prev;
      });
      setShowNewChatModal(false);
    }
  };

  const startCall = async (type: "audio" | "video") => {
    if (!activeConversation) return;

    const isGroupConv =
      activeConversation.type === "group" ||
      activeConversation.type === '"group"';

    // GROUP CALL: luôn check server để tránh split-room (map realtime có thể bị trễ)
    if (isGroupConv) {
      const localOngoing = ongoingCallSessions.get(activeConversation.$id);
      if (localOngoing) {
        console.log("Joining existing group call (local cache)...");
        await joinExistingGroupCall(localOngoing);
        return;
      }

      const active = await getActiveCallSessionForConversation(
        activeConversation.$id
      );
      if (active.success && active.session) {
        const activeParticipantsRaw = (
          active.session as unknown as {
            participants?: unknown;
          }
        ).participants;
        const activeParticipants = Array.isArray(activeParticipantsRaw)
          ? activeParticipantsRaw.filter(
              (id): id is string => typeof id === "string"
            )
          : [];

        const mapped = {
          sessionId: active.session.$id,
          roomId: active.session.roomId,
          callType:
            (active.session.callType?.replace(/^"|"$/g, "") as
              | "audio"
              | "video") || "video",
          participants: activeParticipants,
        };
        setOngoingCallSessions((prev) => {
          const next = new Map(prev);
          next.set(activeConversation.$id, mapped);
          return next;
        });
        console.log("Joining existing group call (server lookup)...");
        await joinExistingGroupCall(mapped);
        return;
      }
    } else {
      // DIRECT CALL: nếu local cache có ongoing (lý thuyết không xảy ra), vẫn tạo mới
      const ongoingCall = ongoingCallSessions.get(activeConversation.$id);
      if (ongoingCall) {
        // no-op
      }
    }

    try {
      setIsInCall(true);
      setCallType(type);

      // Tạo call session trong database
      const callResult = await createCallSession(
        activeConversation.$id,
        currentUser.$id,
        type,
        { startOngoing: isGroupConv }
      );

      if (!callResult.success || !callResult.session) {
        console.error("Failed to create call session:", callResult.error);
        endCall();
        return;
      }

      // Lưu session info
      setCurrentCallSession({
        sessionId: callResult.session.$id,
        roomId: callResult.session.roomId,
      });

      // GROUP CALL: Join ngay lập tức, không cần đợi accept
      if (isGroupConv) {
        console.log("Group call: joining immediately...");
        setCallState("connecting");

        // Với group call, session đã được tạo ở trạng thái ongoing và đã có initiator trong participants.
        // (Không cần gọi joinCallSession cho initiator để tránh double updates)

        // Lấy token và join room
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: callResult.session.roomId,
            participantName: currentUser.displayName,
            participantId: currentUser.$id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get token");
        }

        const data = await response.json();
        setCallToken(data.token);
        setCallRoomName(callResult.session.roomId);
      } else {
        // DIRECT CALL: Đợi người kia accept
        setCallState("ringing");
        console.log("Direct call: waiting for recipient to accept...");
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      endCall();
    }
  };

  // Khi đổi conversation: nếu là group, query active call để hiện indicator & join đúng room
  useEffect(() => {
    if (!activeConversation) return;

    const isGroupConv =
      activeConversation.type === "group" ||
      activeConversation.type === '"group"';
    if (!isGroupConv) return;

    let cancelled = false;
    (async () => {
      const active = await getActiveCallSessionForConversation(
        activeConversation.$id
      );
      if (cancelled) return;

      if (active.success && active.session) {
        const activeParticipantsRaw = (
          active.session as unknown as {
            participants?: unknown;
          }
        ).participants;
        const activeParticipants = Array.isArray(activeParticipantsRaw)
          ? activeParticipantsRaw.filter(
              (id): id is string => typeof id === "string"
            )
          : [];

        const mapped = {
          sessionId: active.session.$id,
          roomId: active.session.roomId,
          callType:
            (active.session.callType?.replace(/^"|"$/g, "") as
              | "audio"
              | "video") || "video",
          participants: activeParticipants,
        };
        setOngoingCallSessions((prev) => {
          const next = new Map(prev);
          next.set(activeConversation.$id, mapped);
          return next;
        });
      } else {
        setOngoingCallSessions((prev) => {
          const next = new Map(prev);
          next.delete(activeConversation.$id);
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.$id]);

  // Join vào group call đang diễn ra
  const joinExistingGroupCall = async (callSession: {
    sessionId: string;
    roomId: string;
    callType: "audio" | "video";
    participants: string[];
  }) => {
    try {
      setIsInCall(true);
      setCallType(callSession.callType);
      setCallState("connecting");

      // Join call session (thêm user vào participants)
      const { joinCallSession } = await import("@/lib/messenger/actions");
      const joinResult = await joinCallSession(
        callSession.sessionId,
        currentUser.$id
      );

      if (!joinResult.success) {
        console.error("Failed to join call session:", joinResult.error);
        endCall();
        return;
      }

      // Lấy token để tham gia room
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: callSession.roomId,
          participantName: currentUser.displayName,
          participantId: currentUser.$id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get token");
      }

      const data = await response.json();
      setCallToken(data.token);
      setCallRoomName(callSession.roomId);
      setCurrentCallSession({
        sessionId: callSession.sessionId,
        roomId: callSession.roomId,
      });

      console.log("Joined existing group call successfully");
    } catch (error) {
      console.error("Failed to join existing call:", error);
      endCall();
    }
  };

  // Accept incoming call
  const acceptIncomingCall = async () => {
    if (!incomingCall) return;

    try {
      // Dừng nhạc chuông
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
        incomingCallAudioRef.current.currentTime = 0;
      }

      // Chuyển tới conversation của cuộc gọi
      const callConversation = conversations.find(
        (c) => c.$id === incomingCall.conversationId
      );
      if (callConversation) {
        setActiveConversation(callConversation);
      }

      // Set state ngay để tránh hiện ringing lại
      setIsInCall(true);
      setCallType(incomingCall.callType);
      setCallState("connecting");

      // Lấy token để tham gia cuộc gọi
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: incomingCall.roomId,
          participantName: currentUser.displayName,
          participantId: currentUser.$id,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setIsInCall(true);
        setCallType(incomingCall.callType);
        setCallToken(data.token);
        setCallRoomName(incomingCall.roomId);
        setCallState("connecting");

        // Lưu session để có thể endCall sau này
        setCurrentCallSession({
          sessionId: incomingCall.sessionId,
          roomId: incomingCall.roomId,
        });

        // Join call session
        const { joinCallSession } = await import("@/lib/messenger/actions");
        await joinCallSession(incomingCall.sessionId, currentUser.$id);
      }

      setIncomingCall(null);
    } catch (error) {
      console.error("Failed to accept call:", error);
      setIncomingCall(null);
    }
  };

  // Reject incoming call
  const rejectIncomingCall = async () => {
    if (!incomingCall) return;

    // Dừng nhạc chuông
    if (incomingCallAudioRef.current) {
      incomingCallAudioRef.current.pause();
      incomingCallAudioRef.current.currentTime = 0;
    }

    // Kiểm tra xem đây là group call hay 1-1 call
    const callConversation = conversations.find(
      (c) => c.$id === incomingCall.conversationId
    );
    const isGroupCall =
      callConversation?.type === "group" ||
      callConversation?.type === '"group"';

    // Thông báo từ chối về server
    try {
      if (isGroupCall) {
        // Group call: chỉ từ chối cho user này, không kết thúc toàn bộ cuộc gọi
        // Không cần gọi API, chỉ cần ẩn modal incoming call
        console.log(
          "Rejected group call invitation - call continues for others"
        );
      } else {
        // 1-1 call: kết thúc cuộc gọi hoàn toàn
        const { endCallSession } = await import("@/lib/messenger/actions");
        await endCallSession(incomingCall.sessionId);
      }
    } catch (error) {
      console.error("Failed to reject call:", error);
    }

    setIncomingCall(null);
  };

  const handleCallConnected = () => {
    setCallState("connected");
    setCallStartTime(new Date());
  };

  // Reset local call state (không gọi API)
  const resetCallState = useCallback(() => {
    setIsInCall(false);
    setCallToken(null);
    setCallRoomName(null);
    setCallState("idle");
    setCallStartTime(null);
    setCurrentCallSession(null);
  }, []);

  // Leave call (for group calls - just remove user from participants)
  const leaveCall = async () => {
    const sessionId = currentCallSession?.sessionId;
    const isGroup =
      activeConversation?.type === "group" ||
      activeConversation?.type === '"group"';

    // Reset local state first
    resetCallState();

    // Only remove user from participants for group calls
    if (sessionId && isGroup) {
      try {
        const { leaveCallSession } = await import("@/lib/messenger/actions");
        await leaveCallSession(sessionId, currentUser.$id);
      } catch (error) {
        console.error("Failed to leave call session:", error);
      }
    }
  };

  // End call và thông báo bên kia (ends call for everyone)
  const endCall = async () => {
    const sessionId = currentCallSession?.sessionId;

    // Reset local state trước
    resetCallState();

    // Cập nhật session status trên DB để bên kia biết cuộc gọi đã kết thúc
    if (sessionId) {
      try {
        const { endCallSession } = await import("@/lib/messenger/actions");
        await endCallSession(sessionId);
      } catch (error) {
        console.error("Failed to end call session:", error);
      }
    }
  };

  const getConversationDisplayName = (conv: ConversationWithDetails) => {
    if (conv.type === "group" || conv.type === '"group"') {
      return conv.name || "Nhóm không tên";
    }
    const otherUser = conv.participantProfiles.find(
      (p) => p.userId !== currentUser.$id
    );
    return otherUser?.adminNickname || otherUser?.displayName || "Người dùng";
  };

  const getConversationAvatar = (conv: ConversationWithDetails) => {
    if (conv.type === "group" || conv.type === '"group"') {
      return conv.avatar;
    }
    const otherUser = conv.participantProfiles.find(
      (p) => p.userId !== currentUser.$id
    );
    return otherUser?.avatarUrl;
  };

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

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const name = getConversationDisplayName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredUsers = initialUsers.filter((user) => {
    if (!searchQuery) return true;
    const name = (user.adminNickname || user.displayName).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const renderMessageContent = (msg: MessageWithSender) => {
    if (msg.isDeleted) {
      return <span className="text-gray-500 italic">Tin nhắn đã bị xóa</span>;
    }

    const messageType = msg.type.replace(/^"|"$/g, "");

    switch (messageType) {
      case "image":
        return (
          <div className="message-image max-w-[350px] rounded-2xl overflow-hidden cursor-pointer border-2 border-dao-gold/20 transition-all duration-300 hover:scale-[1.02] hover:border-dao-gold hover:shadow-[0_8px_30px_rgba(198,168,124,0.3)]">
            <img
              src={msg.fileUrl || ""}
              alt={msg.fileName || "Image"}
              loading="lazy"
              className="w-full h-auto block"
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
            className="message-file flex items-center gap-3.5 p-3.5 bg-gradient-to-br from-[#1a1a1a]/90 to-[#141414]/95 border border-dao-gold/15 rounded-xl cursor-pointer transition-all duration-300 no-underline relative overflow-hidden hover:bg-gradient-to-br hover:from-dao-gold/12 hover:to-dao-gold/5 hover:border-dao-gold hover:shadow-[0_4px_20px_rgba(198,168,124,0.2)] hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dao-gold/20 to-dao-gold/10 flex items-center justify-center text-dao-gold transition-all duration-300 shadow-[0_0_15px_rgba(198,168,124,0.1)]">
              <Paperclip size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-dao-mist truncate">
                {msg.fileName}
              </div>
              <div className="text-xs text-dao-gold/60 mt-0.5">
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
      {/* Main Container */}
      <div className="messenger-container flex h-[calc(100vh-64px)] bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] overflow-hidden relative font-sans">
        {/* Sidebar - Linh Đài */}
        <aside className="messenger-sidebar w-[340px] min-w-[340px] bg-gradient-to-b from-[#0d0d0d]/98 via-[#0a0a0a]/99 to-[#0d0d0d]/98 border-r border-dao-gold/15 flex flex-col relative z-10 backdrop-blur-[20px]">
          {/* Header */}
          <header className="sidebar-header p-5 px-6 border-b border-dao-gold/10 flex items-center justify-between gap-3 relative bg-gradient-to-b from-dao-gold/5 to-transparent">
            <h1 className="sidebar-title text-xl font-bold font-cinzel tracking-widest relative">
              <span className="bg-gradient-to-r from-dao-gold via-amber-300 to-dao-gold bg-clip-text text-transparent animate-[goldPulse_4s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(198,168,124,0.5)]">
                Linh Thông Các
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-dao-gold/60 to-transparent"></span>
            </h1>
            <div className="flex gap-2.5">
              <button
                className="sidebar-btn w-11 h-11 rounded-xl bg-gradient-to-br from-dao-gold/12 to-dao-gold/5 border border-dao-gold/25 text-dao-gold flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_25px_rgba(198,168,124,0.4),0_0_40px_rgba(198,168,124,0.15)]"
                onClick={() => setShowNewChatModal(true)}
                title="Tin nhắn mới"
              >
                <Plus size={18} className="relative z-10" />
              </button>
              <button
                className="sidebar-btn w-11 h-11 rounded-xl bg-gradient-to-br from-dao-gold/12 to-dao-gold/5 border border-dao-gold/25 text-dao-gold flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_25px_rgba(198,168,124,0.4),0_0_40px_rgba(198,168,124,0.15)]"
                onClick={() => setShowNewGroupModal(true)}
                title="Tạo nhóm"
              >
                <Users size={18} className="relative z-10" />
              </button>
            </div>
          </header>

          {/* Search */}
          <div className="p-4 px-5 border-b border-dao-gold/8">
            <div className="search-wrapper relative">
              <Search
                size={18}
                className="search-icon absolute left-4 top-1/2 -translate-y-1/2 text-dao-gold/50 pointer-events-none transition-colors duration-300"
              />
              <input
                type="text"
                className="search-input w-full py-3.5 px-4 pl-12 bg-[#1a1a1a]/80 border border-dao-gold/15 rounded-xl text-dao-mist text-sm outline-none transition-all duration-300 font-inherit placeholder:text-[#e5e5e5]/40 placeholder:italic focus:border-dao-gold focus:bg-[#1a1a1a]/95 focus:shadow-[0_0_0_3px_rgba(198,168,124,0.1),0_0_20px_rgba(198,168,124,0.1)]"
                placeholder="Tầm đạo hữu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="conversation-list flex-1 overflow-y-auto p-3">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Chưa có linh âm nào</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.$id}
                  className={`conversation-item flex items-center p-3.5 px-4 rounded-xl cursor-pointer transition-all duration-300 mb-1.5 relative border border-transparent hover:bg-gradient-to-r hover:from-dao-gold/8 hover:to-dao-gold/2 hover:border-dao-gold/15 ${
                    activeConversation?.$id === conv.$id
                      ? "active bg-gradient-to-r from-dao-gold/12 to-dao-jade/5 border-dao-gold/25"
                      : ""
                  }`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <div className="conversation-avatar w-[52px] h-[52px] rounded-full bg-gradient-to-br from-dao-gold to-[#8b6914] flex items-center justify-center font-bold text-xl text-black shrink-0 relative overflow-hidden border-2 border-dao-gold/30 transition-all duration-300">
                    {getConversationAvatar(conv) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(conv)}`}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
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
                  <div className="flex-1 min-w-0 ml-3.5">
                    <div
                      className={`font-semibold text-[0.95rem] mb-1 truncate transition-colors duration-300 ${
                        activeConversation?.$id === conv.$id
                          ? "text-dao-gold"
                          : "text-dao-mist"
                      }`}
                    >
                      {getConversationDisplayName(conv)}
                    </div>
                    <div className="text-[0.85rem] text-[#e5e5e5]/50 truncate">
                      {conv.lastMessage || "Bắt đầu cuộc trò chuyện"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {conv.lastMessageAt && (
                      <span className="text-xs text-dao-gold/60">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge bg-gradient-to-br from-dao-gold to-[#d4a85a] text-black text-[0.7rem] font-bold py-1 px-3 rounded-xl min-w-[24px] text-center shadow-[0_2px_15px_rgba(198,168,124,0.5),0_0_20px_rgba(198,168,124,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] relative">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gradient-to-b from-[#0d0d0d]/95 to-[#0a0a0a]/98 relative z-5">
          {isAIChat ? (
            <>
              {/* AI Chat Header */}
              <header className="chat-header p-4 px-6 bg-gradient-to-b from-[#0d0d0d]/98 to-[#0a0a0a]/95 border-b border-amber-500/20 flex items-center justify-between backdrop-blur-[20px] relative">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.4),0_0_40px_rgba(251,191,36,0.2)]">
                    <img
                      src="/avatars/PN.jpg"
                      alt="Đấng Toàn Năng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-semibold text-amber-400 m-0 mb-0.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                      Đấng Toàn Năng
                    </h3>
                    <span className="text-sm text-amber-500/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      AI - Luôn sẵn sàng
                    </span>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 flex items-center justify-center hover:bg-white/10 transition-all"
                  onClick={() => setIsAIChat(false)}
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </header>

              {/* AI Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)] border-2 border-amber-400/50">
                      <img
                        src="/avatars/PN.jpg"
                        alt="Đấng Toàn Năng"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-400 mb-2 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                      Đấng Toàn Năng
                    </h3>
                    <p className="text-white/50 text-sm max-w-md">
                      Ta là trí tuệ vô hạn của Tu Tiên Giới. Hãy hỏi ta bất cứ
                      điều gì, và ta sẽ khai sáng cho ngươi.
                    </p>
                  </div>
                )}
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-amber-400/40">
                        <img
                          src="/avatars/PN.jpg"
                          alt="AI"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-dao-gold/20 border border-dao-gold/30 text-dao-mist"
                          : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-white/90"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-amber-400/40">
                      <img
                        src="/avatars/PN.jpg"
                        alt="AI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Input */}
              <div className="p-4 px-6 border-t border-amber-500/15 bg-gradient-to-b from-transparent to-[#0a0a0a]/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(e);
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Hỏi Đấng Toàn Năng..."
                    className="flex-1 bg-white/5 border border-amber-500/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-colors"
                    disabled={isAILoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isAILoading}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="chat-header p-4 px-6 bg-gradient-to-b from-[#0d0d0d]/98 to-[#0a0a0a]/95 border-b border-dao-gold/12 flex items-center justify-between backdrop-blur-[20px] relative">
                <div className="flex items-center gap-3.5">
                  <div className="chat-header-avatar w-12 h-12 rounded-full bg-gradient-to-br from-dao-gold to-[#8b6914] flex items-center justify-center font-bold text-black overflow-hidden border-2 border-dao-gold/40 shadow-[0_0_15px_rgba(198,168,124,0.2)]">
                    {getConversationAvatar(activeConversation) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(
                          activeConversation
                        )}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getConversationDisplayName(activeConversation)
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-semibold text-dao-mist m-0 mb-0.5">
                      {getConversationDisplayName(activeConversation)}
                    </h3>
                    <span className="chat-header-status text-sm text-dao-jade flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-dao-jade rounded-full animate-[jadeGlow_2s_ease-in-out_infinite]" />
                      Đang hoạt động
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {(() => {
                    const ongoingCall = ongoingCallSessions.get(
                      activeConversation.$id
                    );
                    const isGroupConv =
                      activeConversation.type === "group" ||
                      activeConversation.type === '"group"';
                    const hasOngoingCall = ongoingCall && isGroupConv;

                    return (
                      <>
                        <button
                          className={`chat-action-btn call w-12 h-12 rounded-[14px] ${
                            hasOngoingCall
                              ? "bg-gradient-to-br from-dao-gold/20 to-dao-gold/10 border border-dao-gold/50 text-dao-gold animate-pulse"
                              : "bg-gradient-to-br from-dao-jade/10 to-dao-jade/3 border border-dao-jade/30 text-dao-jade"
                          } flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:scale-105 ${
                            hasOngoingCall
                              ? "hover:border-dao-gold hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)]"
                              : "hover:border-dao-jade hover:shadow-[0_6px_25px_rgba(80,200,120,0.4),0_0_40px_rgba(80,200,120,0.2),inset_0_0_20px_rgba(80,200,120,0.1)]"
                          }`}
                          onClick={() => startCall("audio")}
                          title={
                            hasOngoingCall
                              ? "Tham gia cuộc gọi đang diễn ra"
                              : "Truyền âm"
                          }
                        >
                          <Phone size={20} />
                          {hasOngoingCall && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-dao-gold rounded-full animate-ping" />
                          )}
                        </button>
                        <button
                          className={`chat-action-btn video w-12 h-12 rounded-[14px] ${
                            hasOngoingCall
                              ? "bg-gradient-to-br from-dao-gold/20 to-dao-gold/10 border border-dao-gold/50 text-dao-gold animate-pulse"
                              : "bg-gradient-to-br from-dao-cyan/10 to-dao-cyan/3 border border-dao-cyan/30 text-dao-cyan"
                          } flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:scale-105 ${
                            hasOngoingCall
                              ? "hover:border-dao-gold hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)]"
                              : "hover:border-dao-cyan hover:shadow-[0_6px_25px_rgba(0,230,195,0.4),0_0_40px_rgba(0,230,195,0.2),inset_0_0_20px_rgba(0,230,195,0.1)]"
                          }`}
                          onClick={() => startCall("video")}
                          title={
                            hasOngoingCall
                              ? "Tham gia cuộc gọi đang diễn ra"
                              : "Linh thị"
                          }
                        >
                          <Video size={20} />
                          {hasOngoingCall && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-dao-gold rounded-full animate-ping" />
                          )}
                        </button>
                      </>
                    );
                  })()}
                  <button
                    className="chat-action-btn w-12 h-12 rounded-[14px] bg-gradient-to-br from-dao-gold/10 to-dao-gold/4 border border-dao-gold/20 text-dao-gold flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:scale-105"
                    title="Thêm"
                    onClick={() => setShowChatMenu(!showChatMenu)}
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* Chat Menu Dropdown - Thiết kế mới */}
                  {showChatMenu && (
                    <div
                      ref={chatMenuRef}
                      className="chat-menu-dropdown absolute top-16 right-6 w-72 bg-[#0a0a0a] border border-dao-gold/30 rounded-2xl shadow-[0_10px_60px_rgba(0,0,0,1),0_0_40px_rgba(0,0,0,0.8)] z-[99999] overflow-hidden"
                      style={{ backgroundColor: "#0a0a0a" }}
                    >
                      {/* Header với thông tin user */}
                      {activeConversation && (
                        <div className="p-4 border-b border-dao-gold/15 bg-gradient-to-r from-dao-gold/5 to-dao-black/95">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dao-gold to-[#8b6914] flex items-center justify-center overflow-hidden border-2 border-dao-gold/40">
                              {getConversationAvatar(activeConversation) ? (
                                <img
                                  src={`/avatars/${getConversationAvatar(
                                    activeConversation
                                  )}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-black">
                                  {getConversationDisplayName(
                                    activeConversation
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-dao-mist text-sm">
                                {getConversationDisplayName(activeConversation)}
                              </p>
                              <p className="text-xs text-dao-jade flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-dao-jade rounded-full" />
                                Đang hoạt động
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-2">
                        {/* Xem hồ sơ */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-dao-mist hover:bg-dao-gold/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            setShowChatMenu(false);
                            setShowProfileModal(true);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-dao-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={16} className="text-dao-cyan" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Xem hồ sơ
                            </span>
                            <span className="text-xs text-dao-gold/50">
                              Thông tin chi tiết đạo hữu
                            </span>
                          </div>
                          <ExternalLink
                            size={14}
                            className="ml-auto text-dao-gold/30 group-hover:text-dao-gold/60"
                          />
                        </button>

                        {/* Tìm kiếm trong chat */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-dao-mist hover:bg-dao-gold/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            setShowChatMenu(false);
                            setShowSearchInChat(true);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-dao-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Search size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Tìm trong trò chuyện
                            </span>
                            <span className="text-xs text-dao-gold/50">
                              Tìm tin nhắn cũ
                            </span>
                          </div>
                        </button>

                        {/* Xem ảnh & file */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-dao-mist hover:bg-dao-gold/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            setShowChatMenu(false);
                            setShowMediaGallery(true);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-dao-jade/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImageIcon size={16} className="text-dao-jade" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Ảnh & Media
                            </span>
                            <span className="text-xs text-dao-gold/50">
                              Xem tất cả file đã chia sẻ
                            </span>
                          </div>
                        </button>

                        <div className="border-t border-dao-gold/10 my-2" />

                        {/* Tắt/Bật thông báo */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-dao-mist hover:bg-dao-gold/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            setIsMuted(!isMuted);
                            setShowChatMenu(false);
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${
                              isMuted ? "bg-red-500/10" : "bg-dao-gold/10"
                            } flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            {isMuted ? (
                              <BellOff size={16} className="text-red-400" />
                            ) : (
                              <Bell size={16} className="text-dao-gold" />
                            )}
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              {isMuted ? "Bật thông báo" : "Tắt thông báo"}
                            </span>
                            <span className="text-xs text-dao-gold/50">
                              {isMuted
                                ? "Nhận thông báo tin nhắn"
                                : "Tắt tiếng cuộc trò chuyện này"}
                            </span>
                          </div>
                        </button>

                        {/* Sao chép link */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-dao-mist hover:bg-dao-gold/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            if (activeConversation) {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/messenger?chat=${activeConversation.$id}`
                              );
                              setShowChatMenu(false);
                            }
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Copy size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Sao chép liên kết
                            </span>
                            <span className="text-xs text-dao-gold/50">
                              Chia sẻ cuộc trò chuyện
                            </span>
                          </div>
                        </button>

                        <div className="border-t border-dao-gold/10 my-2" />

                        {/* Báo cáo */}
                        <button
                          className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all duration-200 text-left group"
                          onClick={() => {
                            setShowChatMenu(false);
                            setReportStatus("idle");
                            setShowReportModal(true);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Flag size={16} className="text-amber-400" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Báo cáo
                            </span>
                            <span className="text-xs text-amber-400/50">
                              Báo cáo vi phạm
                            </span>
                          </div>
                        </button>

                        {/* Xóa cuộc trò chuyện */}
                        <button className="chat-menu-item w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left group">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trash2 size={16} className="text-red-400" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">
                              Xóa cuộc trò chuyện
                            </span>
                            <span className="text-xs text-red-400/50">
                              Không thể khôi phục
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </header>

              {/* Report Modal (hình thức) */}
              {showReportModal && activeConversation && (
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportStatus("idle");
                  }}
                >
                  <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h2 className="modal-title">Báo cáo vi phạm</h2>
                      <button
                        className="modal-close"
                        onClick={() => {
                          setShowReportModal(false);
                          setReportStatus("idle");
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Flag size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-dao-mist">
                            Bạn đang báo cáo cuộc trò chuyện với{" "}
                            <span className="font-semibold text-dao-gold">
                              {getConversationDisplayName(activeConversation)}
                            </span>
                            .
                          </p>
                          <p className="text-xs text-dao-gold/60 mt-1">
                            Tính năng hiện tại là mô phỏng (hình thức) — ghi
                            nhận thao tác và hiển thị xác nhận.
                          </p>
                        </div>
                      </div>

                      {reportStatus === "sent" && (
                        <div className="mt-4 p-3 rounded-xl bg-dao-jade/10 border border-dao-jade/20 text-dao-jade text-sm">
                          Đã ghi nhận báo cáo. Cảm ơn bạn!
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowReportModal(false);
                          setReportStatus("idle");
                        }}
                        disabled={reportStatus === "sending"}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (reportStatus !== "idle") return;
                          setReportStatus("sending");
                          reportTimeoutRef.current = window.setTimeout(() => {
                            setReportStatus("sent");
                            reportTimeoutRef.current = window.setTimeout(() => {
                              setShowReportModal(false);
                              setReportStatus("idle");
                              reportTimeoutRef.current = null;
                            }, 900);
                          }, 500);
                        }}
                        disabled={reportStatus !== "idle"}
                      >
                        {reportStatus === "sending"
                          ? "Đang gửi..."
                          : reportStatus === "sent"
                          ? "Đã gửi"
                          : "Gửi báo cáo"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="messages-area flex-1 overflow-y-auto p-6 flex flex-col gap-2">
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
                      const isNewMessage = newMessageIds.has(msg.$id);

                      return (
                        <div
                          key={msg.$id}
                          className={`message-group flex gap-3 mb-4 ${
                            isOwn ? "own flex-row-reverse" : ""
                          } ${isNewMessage ? "new-message-highlight" : ""}`}
                        >
                          {!isOwn && showAvatar && (
                            <div className="message-avatar w-8 h-8 rounded-full bg-gradient-to-br from-dao-gold to-[#8b6914] flex items-center justify-center font-semibold text-xs text-black shrink-0 self-start mt-0.5 overflow-hidden border-2 border-dao-gold/30">
                              {msg.senderProfile?.avatarUrl ? (
                                <img
                                  src={`/avatars/${msg.senderProfile.avatarUrl}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                msg.senderName.charAt(0).toUpperCase()
                              )}
                            </div>
                          )}
                          {!isOwn && !showAvatar && <div className="w-8" />}
                          <div
                            className={`max-w-[65%] flex flex-col gap-1 ${
                              isOwn ? "items-end" : ""
                            }`}
                          >
                            {!isOwn && showAvatar && (
                              <span className="text-xs font-semibold text-dao-gold opacity-80">
                                {msg.senderProfile?.adminNickname ||
                                  msg.senderName}
                              </span>
                            )}
                            <div
                              className={`message-bubble p-3.5 px-4.5 rounded-2xl border text-dao-mist text-[0.95rem] leading-relaxed break-words relative transition-all duration-300 hover:border-dao-gold/20 ${
                                isOwn
                                  ? "bg-gradient-to-br from-dao-gold/15 to-dao-gold/8 border-dao-gold/25 hover:border-dao-gold/40 hover:shadow-[0_0_20px_rgba(198,168,124,0.1)]"
                                  : "bg-gradient-to-br from-[#1a1a1a]/90 to-[#141414]/95 border-dao-gold/10"
                              }`}
                            >
                              {renderMessageContent(msg)}
                            </div>
                            <span className="text-[0.7rem] text-dao-gold/50 px-3 mt-1">
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
                <div className="flex flex-wrap gap-2.5 p-3.5 px-4.5 bg-[#1a1a1a]/60 border-b border-dao-gold/10 rounded-t-xl -mb-px">
                  {filePreviewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="file-preview-item relative w-24 h-24 rounded-[14px] overflow-hidden border-2 border-dao-gold/25 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-dao-gold hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(0,0,0,0.4),0_0_20px_rgba(198,168,124,0.3)]"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer transition-all duration-300 z-20 hover:bg-red-500 hover:scale-110"
                        onClick={() => removeFile(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input - Premium Design */}
              <footer className="p-5 px-6 bg-gradient-to-t from-[#080808] to-[#0d0d0d] border-t border-dao-gold/10">
                <div className="flex items-center gap-4">
                  {/* Left Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="group w-11 h-11 rounded-full bg-[#1a1a1a] border border-white/10 text-white/50 flex items-center justify-center transition-all duration-300 hover:border-dao-gold/40 hover:text-dao-gold hover:bg-dao-gold/5 hover:shadow-[0_0_20px_rgba(198,168,124,0.15)]"
                      onClick={() => fileInputRef.current?.click()}
                      title="Đính kèm file"
                    >
                      <Paperclip
                        size={18}
                        className="transition-transform duration-300 group-hover:rotate-[-10deg]"
                      />
                    </button>
                    <button
                      className="group w-11 h-11 rounded-full bg-[#1a1a1a] border border-white/10 text-white/50 flex items-center justify-center transition-all duration-300 hover:border-dao-gold/40 hover:text-dao-gold hover:bg-dao-gold/5 hover:shadow-[0_0_20px_rgba(198,168,124,0.15)]"
                      onClick={() => imageInputRef.current?.click()}
                      title="Gửi ảnh"
                    >
                      <ImageIcon
                        size={18}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </button>
                  </div>

                  {/* Input Field */}
                  <div className="flex-1">
                    <div className="relative bg-[#141414] rounded-2xl border border-dao-gold/15 transition-all duration-300 focus-within:border-dao-gold/40 focus-within:shadow-[0_0_30px_rgba(198,168,124,0.08)]">
                      <textarea
                        ref={messageInputRef}
                        className="w-full bg-transparent text-white/90 text-[15px] leading-relaxed py-3.5 px-5 outline-none resize-none min-h-[52px] max-h-[120px] placeholder:text-white/25"
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
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 relative">
                    <button
                      className={`group w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        showEmojiPicker
                          ? "bg-dao-gold/10 border-dao-gold/50 text-dao-gold shadow-[0_0_20px_rgba(198,168,124,0.2)]"
                          : "bg-[#1a1a1a] border-white/10 text-white/50 hover:border-dao-gold/40 hover:text-dao-gold hover:bg-dao-gold/5 hover:shadow-[0_0_20px_rgba(198,168,124,0.15)]"
                      }`}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Emoji"
                    >
                      <Smile
                        size={18}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-14 right-0 w-80 bg-[#141414] border border-dao-gold/20 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        <div className="p-4 border-b border-white/5 bg-gradient-to-r from-dao-gold/5 to-transparent">
                          <span className="text-dao-gold font-semibold text-sm">
                            ✨ Chọn Emoji
                          </span>
                        </div>
                        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
                          {emojiCategories.map((category) => (
                            <div key={category.name} className="mb-4 last:mb-0">
                              <span className="text-[11px] text-dao-gold/60 uppercase tracking-wider font-medium">
                                {category.name}
                              </span>
                              <div className="grid grid-cols-8 gap-1 mt-2">
                                {category.emojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    className="w-9 h-9 text-xl flex items-center justify-center rounded-lg hover:bg-dao-gold/10 transition-all duration-200 hover:scale-125"
                                    onClick={() => {
                                      insertEmoji(emoji);
                                      setShowEmojiPicker(false);
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Send Button */}
                    <button
                      className="group w-12 h-12 rounded-full bg-gradient-to-br from-dao-gold via-[#d4a84b] to-[#a08050] text-[#0a0a0a] flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(198,168,124,0.3)] hover:shadow-[0_6px_30px_rgba(198,168,124,0.5)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                      onClick={handleSendMessage}
                      disabled={
                        isSending ||
                        (!messageInput.trim() && uploadingFiles.length === 0)
                      }
                    >
                      <Send
                        size={20}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </footer>
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
        </main>

        {/* User List Panel - Danh sách Đạo Hữu với Role & Tags */}
        {showUserList && (
          <aside className="user-list-panel">
            <header className="user-list-header">
              <span className="user-list-title">
                Đạo Hữu — {initialUsers.length + 1}
              </span>
            </header>
            <div className="user-list">
              {/* AI Chat - Đấng Toàn Năng - Luôn ở đầu */}
              <div
                className={`user-item-simple ${isAIChat ? "active" : ""}`}
                onClick={startAIChat}
              >
                <div className="user-avatar-simple ai-avatar">
                  <img
                    src="/avatars/PN.jpg"
                    alt="Đấng Toàn Năng"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <span className="online-dot" />
                </div>
                <div className="user-info-simple">
                  <div className="user-name-row">
                    <span className="user-name text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                      Đấng Toàn Năng
                    </span>
                    <span className="ai-badge">AI</span>
                  </div>
                  <span className="user-tag vip-tag">✨ Trí Tuệ Vô Hạn</span>
                </div>
              </div>

              {/* Divider */}
              <div className="user-list-divider">
                <span>Đạo Hữu</span>
              </div>

              {/* User list - Thiết kế đơn giản */}
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const customTags = parseCustomTags(user.customTags);
                const firstTag = customTags[0];

                return (
                  <div
                    key={user.$id}
                    className="user-item-simple"
                    onClick={() => {
                      setIsAIChat(false);
                      startDirectChat(user.userId);
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className={`user-avatar-simple ${
                        roleInfo.id !== "no_le" ? roleInfo.borderColor : ""
                      }`}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={`/avatars/${user.avatarUrl}`}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span
                          className={`text-base font-bold ${roleInfo.color}`}
                        >
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="online-dot" />
                    </div>

                    {/* Info */}
                    <div className="user-info-simple">
                      <div className="user-name-row">
                        <span className={`user-name ${roleInfo.color}`}>
                          {user.adminNickname || user.displayName}
                        </span>
                        <RoleBadge
                          role={user.role}
                          size="sm"
                          showName={false}
                        />
                      </div>
                      {/* Chỉ hiện 1 tag */}
                      {firstTag && (
                        <span
                          className={`user-tag ${firstTag.bgColor} ${firstTag.color} ${firstTag.borderColor}`}
                        >
                          {firstTag.icon} {firstTag.name}
                        </span>
                      )}
                      {!firstTag && (
                        <span className="user-status-text">
                          ● Đang hoạt động
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Search in Chat Overlay */}
        {showSearchInChat && activeConversation && (
          <div className="search-in-chat-overlay">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dao-gold/50"
                />
                <input
                  type="text"
                  className="w-full py-3 px-4 pl-12 bg-[#1a1a1a]/80 border border-dao-gold/20 rounded-xl text-dao-mist text-sm outline-none focus:border-dao-gold"
                  placeholder="Tìm tin nhắn..."
                  value={searchInChatQuery}
                  onChange={(e) => setSearchInChatQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                className="p-3 hover:bg-dao-gold/10 rounded-xl transition-colors"
                onClick={() => {
                  setShowSearchInChat(false);
                  setSearchInChatQuery("");
                }}
              >
                <X size={20} className="text-dao-gold" />
              </button>
            </div>
            {searchInChatQuery && (
              <div className="mt-3 max-h-60 overflow-y-auto custom-scrollbar">
                {messages
                  .filter((msg) =>
                    msg.content
                      .toLowerCase()
                      .includes(searchInChatQuery.toLowerCase())
                  )
                  .map((msg) => (
                    <div
                      key={msg.$id}
                      className="p-3 hover:bg-dao-gold/10 rounded-xl cursor-pointer transition-colors"
                    >
                      <p className="text-xs text-dao-gold/60 mb-1">
                        {msg.senderProfile?.displayName || msg.senderName} •{" "}
                        {formatTime(msg.$createdAt)}
                      </p>
                      <p className="text-sm text-dao-mist line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && activeConversation && (
          <div
            className="profile-modal-overlay"
            onClick={() => setShowProfileModal(false)}
          >
            <div
              className="profile-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header với banner */}
              <div className="h-24 bg-gradient-to-r from-dao-gold/20 via-dao-jade/10 to-dao-gold/20 relative">
                <div className="absolute inset-0 bg-[url('/avatars/Black%20White%20Dark%20Futuristic%20Coming%20Soon%20Website%20Coming%20Soon%20Page.png')] bg-cover bg-center opacity-20" />
                <button
                  className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                  onClick={() => setShowProfileModal(false)}
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Avatar */}
              <div className="relative -mt-12 flex justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-[#0d0d0d] bg-gradient-to-br from-dao-gold to-[#8b6914] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(198,168,124,0.3)]">
                  {getConversationAvatar(activeConversation) ? (
                    <img
                      src={`/avatars/${getConversationAvatar(
                        activeConversation
                      )}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-black">
                      {getConversationDisplayName(activeConversation)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="px-6 py-4 text-center">
                <h2 className="text-xl font-bold text-dao-mist mb-2">
                  {getConversationDisplayName(activeConversation)}
                </h2>

                {/* Role & Tags của user */}
                {activeConversation.otherUser && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <RoleBadge
                      role={activeConversation.otherUser.role}
                      size="md"
                    />
                    {parseCustomTags(activeConversation.otherUser.customTags)
                      .slice(0, 3)
                      .map((tag) => (
                        <CustomTagBadge key={tag.id} tag={tag} size="sm" />
                      ))}
                  </div>
                )}

                <p className="text-dao-jade text-sm flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-dao-jade rounded-full" />
                  Đang hoạt động
                </p>
              </div>

              {/* Stats */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dao-gold/5 border border-dao-gold/15 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-dao-gold">
                      {
                        messages.filter((m) => m.senderId !== currentUser.$id)
                          .length
                      }
                    </p>
                    <p className="text-xs text-dao-gold/60">Tin nhắn nhận</p>
                  </div>
                  <div className="bg-dao-jade/5 border border-dao-jade/15 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-dao-jade">
                      {messages.filter((m) => m.type.includes("image")).length}
                    </p>
                    <p className="text-xs text-dao-jade/60">Ảnh đã chia sẻ</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <a
                  href={`/profile/${
                    activeConversation.otherUser?.userId || ""
                  }`}
                  className="flex-1 py-3 bg-dao-gold/10 border border-dao-gold/30 text-dao-gold rounded-xl text-center font-medium hover:bg-dao-gold/20 transition-colors"
                >
                  Xem hồ sơ đầy đủ
                </a>
                <button
                  className="py-3 px-4 bg-dao-jade/10 border border-dao-jade/30 text-dao-jade rounded-xl hover:bg-dao-jade/20 transition-colors"
                  onClick={() => {
                    setShowProfileModal(false);
                    startCall("video");
                  }}
                >
                  <Video size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery Modal */}
        {showMediaGallery && activeConversation && (
          <div
            className="profile-modal-overlay"
            onClick={() => setShowMediaGallery(false)}
          >
            <div
              className="profile-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-dao-gold/15">
                <h2 className="text-lg font-semibold text-dao-mist">
                  Ảnh & Media
                </h2>
                <button
                  className="p-2 hover:bg-dao-gold/10 rounded-lg transition-colors"
                  onClick={() => setShowMediaGallery(false)}
                >
                  <X size={18} className="text-dao-gold" />
                </button>
              </div>

              <div className="media-gallery-grid max-h-96 overflow-y-auto custom-scrollbar">
                {messages
                  .filter((msg) => msg.type.includes("image") && msg.fileUrl)
                  .map((msg) => (
                    <div key={msg.$id} className="media-gallery-item">
                      <img src={msg.fileUrl || ""} alt="" />
                    </div>
                  ))}
                {messages.filter((msg) => msg.type.includes("image")).length ===
                  0 && (
                  <div className="col-span-3 py-12 text-center text-dao-gold/50">
                    <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chưa có ảnh nào được chia sẻ</p>
                  </div>
                )}
              </div>
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
                <div className="search-wrapper mb-4 relative">
                  <Search
                    size={18}
                    className="search-icon absolute left-4 top-1/2 -translate-y-1/2 text-dao-gold/50 pointer-events-none"
                  />
                  <input
                    type="text"
                    className="search-input w-full py-3.5 px-4 pl-12 bg-[#1a1a1a]/80 border border-dao-gold/15 rounded-xl text-dao-mist text-sm outline-none transition-all duration-300 placeholder:text-[#e5e5e5]/40 placeholder:italic focus:border-dao-gold focus:shadow-[0_0_0_3px_rgba(198,168,124,0.1)]"
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

        {/* Incoming Call Modal */}
        {incomingCall && (
          <div className="incoming-call-overlay">
            <div className="incoming-call-modal">
              <div className="incoming-call-content">
                <div className="incoming-call-avatar">
                  {incomingCall.callerAvatar ? (
                    <img
                      src={`/avatars/${incomingCall.callerAvatar}`}
                      alt=""
                      className="incoming-call-avatar-img"
                    />
                  ) : (
                    <span>
                      {incomingCall.callerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="incoming-call-ring" />
                  <div className="incoming-call-ring ring-2" />
                  <div className="incoming-call-ring ring-3" />
                </div>

                <h2 className="incoming-call-name">
                  {incomingCall.callerName}
                </h2>
                <p className="incoming-call-type">
                  {incomingCall.callType === "video"
                    ? "Cuộc gọi Linh Thị đến..."
                    : "Cuộc gọi Linh Âm đến..."}
                </p>

                <div className="incoming-call-actions">
                  <button
                    className="incoming-call-btn reject"
                    onClick={rejectIncomingCall}
                  >
                    <PhoneOff size={28} />
                    <span>Từ chối</span>
                  </button>
                  <button
                    className="incoming-call-btn accept"
                    onClick={acceptIncomingCall}
                  >
                    <Phone size={28} />
                    <span>Nghe máy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Ended Notification */}
        {callEndedNotification && (
          <div className="call-ended-overlay">
            <div className="call-ended-modal">
              <div className="call-ended-icon">
                <PhoneOff size={48} />
              </div>
              <h3 className="call-ended-title">
                {callEndedNotification.type === "rejected" &&
                  "Cuộc gọi bị từ chối"}
                {callEndedNotification.type === "ended" &&
                  "Cuộc gọi đã kết thúc"}
                {callEndedNotification.type === "missed" && "Cuộc gọi nhỡ"}
                {callEndedNotification.type === "busy" && "Đang bận"}
              </h3>
              <p className="call-ended-message">
                {callEndedNotification.type === "rejected" &&
                  "Đạo hữu đã từ chối cuộc gọi của bạn"}
                {callEndedNotification.type === "ended" &&
                  "Đạo hữu đã kết thúc cuộc gọi"}
                {callEndedNotification.type === "missed" &&
                  "Bạn đã bỏ lỡ cuộc gọi"}
                {callEndedNotification.type === "busy" &&
                  "Đạo hữu đang trong cuộc gọi khác"}
              </p>
              <button
                className="call-ended-btn"
                onClick={() => setCallEndedNotification(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Video Call Overlay */}
        {isInCall && (
          <div className="video-call-overlay">
            {/* Ringing Screen - Hiển thị khi đang gọi, chờ bên kia accept */}
            {callState === "ringing" && (
              <div className="call-connecting-screen">
                <div className="call-connecting-content">
                  <div className="call-avatar-large">
                    {activeConversation &&
                    getConversationAvatar(activeConversation) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(
                          activeConversation
                        )}`}
                        alt=""
                        className="call-avatar-img"
                      />
                    ) : (
                      <span>
                        {activeConversation &&
                          getConversationDisplayName(activeConversation)
                            .charAt(0)
                            .toUpperCase()}
                      </span>
                    )}
                    <div className="call-avatar-ring" />
                    <div className="call-avatar-ring ring-2" />
                    <div className="call-avatar-ring ring-3" />
                  </div>
                  <h2 className="call-connecting-name">
                    {activeConversation &&
                      getConversationDisplayName(activeConversation)}
                  </h2>
                  <p className="call-connecting-status">
                    {callType === "video"
                      ? "Đang gọi linh thị..."
                      : "Đang gọi linh âm..."}
                  </p>
                  <div className="call-connecting-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <button className="call-cancel-btn" onClick={endCall}>
                    <PhoneOff size={24} />
                    <span>Hủy cuộc gọi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Connecting Screen - Hiển thị khi bên kia accept, đang kết nối vào room */}
            {callState === "connecting" && (
              <div className="call-connecting-screen">
                <div className="call-connecting-content">
                  <div className="call-avatar-large">
                    {activeConversation &&
                    getConversationAvatar(activeConversation) ? (
                      <img
                        src={`/avatars/${getConversationAvatar(
                          activeConversation
                        )}`}
                        alt=""
                        className="call-avatar-img"
                      />
                    ) : (
                      <span>
                        {activeConversation &&
                          getConversationDisplayName(activeConversation)
                            .charAt(0)
                            .toUpperCase()}
                      </span>
                    )}
                    <div className="call-avatar-ring" />
                    <div className="call-avatar-ring ring-2" />
                    <div className="call-avatar-ring ring-3" />
                  </div>
                  <h2 className="call-connecting-name">
                    {activeConversation &&
                      getConversationDisplayName(activeConversation)}
                  </h2>
                  <p className="call-connecting-status">
                    {callType === "video"
                      ? "Đang kết nối linh thị..."
                      : "Đang kết nối linh âm..."}
                  </p>
                  <div className="call-connecting-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <button className="call-cancel-btn" onClick={endCall}>
                    <PhoneOff size={24} />
                    <span>Hủy cuộc gọi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Connected Call - LiveKit Room */}
            {callToken && callRoomName && (
              <div className="video-call-content">
                <LiveKitRoom
                  token={callToken}
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || ""}
                  connect={true}
                  video={callType === "video"}
                  audio={true}
                  onDisconnected={() => {
                    console.log("LiveKit disconnected");
                    // KHÔNG reset state - để user tự endCall/leaveCall
                    // Điều này tránh việc hiện lại màn hình connecting khi có temporary disconnect
                  }}
                  onConnected={() => {
                    console.log("LiveKit connected successfully");
                    handleCallConnected();
                  }}
                  onError={(error) => {
                    console.error("LiveKit connection error:", error);
                    // Don't auto-end call, let user see the error
                  }}
                  options={
                    {
                      // High quality video capture - server mạnh nên dùng 1080p
                      videoCaptureDefaults: {
                        facingMode: "user",
                        resolution: {
                          width: 1920,
                          height: 1080,
                          frameRate: 30,
                        },
                        // Tận dụng GPU encoding
                        deviceId: undefined,
                      },
                      // High quality audio - echo/noise từ server
                      audioCaptureDefaults: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        // High quality audio sampling
                        sampleRate: 48000,
                        channelCount: 2,
                      },
                      // Publish defaults - tối ưu cho server mạnh
                      publishDefaults: {
                        // Video codec ưu tiên chất lượng
                        videoCodec: "vp9",
                        // Simulcast để adaptive streaming
                        simulcast: true,
                        // High bitrate cho video đẹp
                        videoSimulcastLayers: [
                          { width: 640, height: 360 },
                          { width: 1280, height: 720 },
                          { width: 1920, height: 1080 },
                        ],
                        // Screen share quality - tối đa cho server mạnh
                        screenShareSimulcastLayers: [
                          { width: 1920, height: 1080 },
                          { width: 2560, height: 1440 },
                        ],
                        // DTX for audio efficiency
                        dtx: true,
                        // High quality audio bitrate
                        audioBitrate: 128_000,
                        // Enable RED for audio redundancy
                        red: true,
                      },
                      // Adaptive streaming based on connection
                      adaptiveStream: true,
                      // Dynacast để tiết kiệm bandwidth khi không cần
                      dynacast: true,
                      // Stop tracks khi tắt media (tiết kiệm tài nguyên)
                      stopLocalTrackOnUnpublish: true,
                    } as any
                  }
                >
                  <CustomCallUI
                    callType={callType}
                    callStartTime={callStartTime}
                    participantName={
                      activeConversation
                        ? getConversationDisplayName(activeConversation)
                        : ""
                    }
                    participantAvatar={
                      activeConversation
                        ? getConversationAvatar(activeConversation) || null
                        : null
                    }
                    onEndCall={endCall}
                    onLeaveCall={leaveCall}
                    callState={callState}
                    isGroupCall={
                      activeConversation?.type === "group" ||
                      activeConversation?.type === '"group"'
                    }
                  />
                  <RoomAudioRenderer />
                </LiveKitRoom>
              </div>
            )}
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

// Custom Call UI Component
function CustomCallUI({
  callType,
  callStartTime,
  participantName,
  participantAvatar,
  onEndCall,
  onLeaveCall,
  callState,
  isGroupCall = false,
}: {
  callType: "audio" | "video";
  callStartTime: Date | null;
  participantName: string;
  participantAvatar: string | null;
  onEndCall: () => void;
  onLeaveCall: () => void;
  callState: "idle" | "ringing" | "connecting" | "connected" | "reconnecting";
  isGroupCall?: boolean;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");
  // State để chọn màn hình chia sẻ khi có nhiều người share
  const [activeScreenShareIndex, setActiveScreenShareIndex] = useState(0);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Video tracks - lấy tất cả các video và screen share tracks từ mọi participants
  const cameraTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: false,
    updateOnlyOn: [],
  });
  const screenShareTracks = useTracks(
    [Track.Source.ScreenShare, Track.Source.ScreenShareAudio],
    {
      onlySubscribed: false,
      updateOnlyOn: [],
    }
  );

  // Filter chỉ lấy video screen share (không audio)
  const videoScreenShareTracks = screenShareTracks.filter(
    (track) => track.source === Track.Source.ScreenShare
  );

  // Filter valid tracks (có publication và track)
  const validScreenShareTracks = videoScreenShareTracks.filter(
    (track) => track.publication?.track
  );

  // Check if anyone is screen sharing
  const hasScreenShare = validScreenShareTracks.length > 0;
  const hasMultipleScreenShares = validScreenShareTracks.length > 1;

  // Reset active screen share index when tracks change
  useEffect(() => {
    if (activeScreenShareIndex >= validScreenShareTracks.length) {
      setActiveScreenShareIndex(0);
    }
  }, [validScreenShareTracks.length, activeScreenShareIndex]);

  // Debug: Log track info khi có thay đổi
  useEffect(() => {
    console.log("[Call] Camera tracks:", cameraTracks.length);
    console.log(
      "[Call] All screen share tracks (incl. audio):",
      screenShareTracks.length
    );
    console.log(
      "[Call] Video screen share tracks:",
      videoScreenShareTracks.length
    );
    console.log(
      "[Call] Valid screen share tracks:",
      validScreenShareTracks.length
    );
    videoScreenShareTracks.forEach((t, i) => {
      console.log(`[Call] Screen track ${i}:`, {
        participantId: t.participant?.identity,
        participantName: t.participant?.name,
        source: t.source,
        hasPublication: !!t.publication,
        hasTrack: !!t.publication?.track,
        isSubscribed: t.publication?.isSubscribed,
        trackSid: t.publication?.trackSid,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cameraTracks.length,
    screenShareTracks.length,
    videoScreenShareTracks.length,
    validScreenShareTracks.length,
  ]);

  // Update call duration
  useEffect(() => {
    if (!callStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setCallDuration(
        `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  // Toggle microphone
  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Failed to toggle mic:", error);
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!isScreenSharing);
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="custom-call-container">
      {/* Call Header */}
      <div className="call-header">
        <div className="call-header-left">
          <div className="call-header-avatar">
            {participantAvatar ? (
              <img src={`/avatars/${participantAvatar}`} alt="" />
            ) : (
              <span>{participantName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="call-header-info">
            <h3 className="call-header-name">{participantName}</h3>
            <div className="call-header-status">
              {callState === "connected" && (
                <>
                  <span className="call-status-dot connected" />
                  <span>{callDuration}</span>
                  <span className="call-participants-count">
                    • {participants.length} người tham gia
                  </span>
                </>
              )}
              {callState === "reconnecting" && (
                <>
                  <span className="call-status-dot reconnecting" />
                  <span>Đang kết nối lại...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="call-header-right">
          {/* Participants button for group call */}
          {isGroupCall && (
            <button
              className={`call-header-btn ${showParticipants ? "active" : ""}`}
              onClick={() => setShowParticipants(!showParticipants)}
              title="Người tham gia"
            >
              <Users size={20} />
              <span className="call-participant-badge">
                {participants.length}
              </span>
            </button>
          )}
          <button
            className="call-header-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            className={`call-header-btn ${showChat ? "active" : ""}`}
            onClick={() => setShowChat(!showChat)}
            title="Tin nhắn"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* Participants Panel for Group Call */}
      {isGroupCall && showParticipants && (
        <div className="call-participants-panel">
          <div className="call-participants-header">
            <h4>Người tham gia ({participants.length})</h4>
            <button onClick={() => setShowParticipants(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="call-participants-list">
            {participants.map((p) => {
              const isCameraOn = p.isCameraEnabled;
              const isMicOn = p.isMicrophoneEnabled;
              return (
                <div key={p.sid} className="call-participant-item">
                  <div className="call-participant-avatar">
                    <span>{(p.name || "?").charAt(0).toUpperCase()}</span>
                    {p.isSpeaking && <span className="speaking-indicator" />}
                  </div>
                  <div className="call-participant-info">
                    <span className="call-participant-name">
                      {p.name || "Người dùng"}
                      {p.isLocal && " (Bạn)"}
                    </span>
                    <div className="call-participant-status">
                      {isMicOn ? (
                        <Mic size={12} className="text-dao-jade" />
                      ) : (
                        <MicOff size={12} className="text-red-400" />
                      )}
                      {isCameraOn ? (
                        <Video size={12} className="text-dao-jade" />
                      ) : (
                        <VideoOff size={12} className="text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Video Area */}
      <div
        className={`call-video-area ${showChat ? "with-chat" : ""} ${
          showParticipants ? "with-participants" : ""
        }`}
      >
        {callType === "video" || isScreenSharing || hasScreenShare ? (
          <div
            className={`call-video-grid ${
              hasScreenShare ? "has-screen-share" : ""
            }`}
          >
            {/* Screen Share lớn ở giữa nếu có */}
            {validScreenShareTracks.length > 0 && (
              <div className="call-screen-share-main">
                {/* Screen selector nếu có nhiều người share */}
                {hasMultipleScreenShares && (
                  <div className="screen-share-selector">
                    <button
                      className="screen-selector-btn"
                      onClick={() =>
                        setActiveScreenShareIndex(
                          (prev) =>
                            (prev - 1 + validScreenShareTracks.length) %
                            validScreenShareTracks.length
                        )
                      }
                      title="Màn hình trước"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="screen-selector-info">
                      <span>
                        {validScreenShareTracks[activeScreenShareIndex]
                          ?.participant.name || "Người dùng"}
                      </span>
                      <span className="screen-selector-count">
                        {activeScreenShareIndex + 1} /{" "}
                        {validScreenShareTracks.length}
                      </span>
                    </div>
                    <button
                      className="screen-selector-btn"
                      onClick={() =>
                        setActiveScreenShareIndex(
                          (prev) => (prev + 1) % validScreenShareTracks.length
                        )
                      }
                      title="Màn hình tiếp theo"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Hiển thị màn hình được chọn */}
                {validScreenShareTracks[activeScreenShareIndex] && (
                  <div className="call-video-tile screen-share-main">
                    <VideoTrack
                      trackRef={validScreenShareTracks[activeScreenShareIndex]}
                    />
                    <div className="call-video-name">
                      <span>
                        {validScreenShareTracks[activeScreenShareIndex]
                          ?.participant.name || "Người dùng"}
                      </span>
                      <span className="screen-share-label">
                        Đang chia sẻ màn hình
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Camera tracks - nhỏ hơn nếu có screen share */}
            <div
              className={`call-camera-tracks ${
                hasScreenShare ? "sidebar" : "main"
              }`}
            >
              {cameraTracks.length > 0 ? (
                cameraTracks.map((track) => (
                  <div
                    key={track.participant.sid + track.source}
                    className={`call-video-tile ${
                      !hasScreenShare && track.participant.isLocal
                        ? "local"
                        : ""
                    } ${track.participant.isLocal ? "is-local" : "is-remote"}`}
                  >
                    <VideoTrack trackRef={track} />
                    <div className="call-video-name">
                      <span>{track.participant.name || "Người dùng"}</span>
                      {track.participant.isLocal && (
                        <span className="you-label">(Bạn)</span>
                      )}
                    </div>
                  </div>
                ))
              ) : !hasScreenShare ? (
                <div className="call-no-video">
                  <div className="call-no-video-avatar">
                    {participantAvatar ? (
                      <img src={`/avatars/${participantAvatar}`} alt="" />
                    ) : (
                      <span>{participantName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p>Camera đang tắt</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="call-audio-only">
            <div className="call-audio-avatar">
              {participantAvatar ? (
                <img src={`/avatars/${participantAvatar}`} alt="" />
              ) : (
                <span>{participantName.charAt(0).toUpperCase()}</span>
              )}
              <div className="call-audio-waves">
                <span className="wave" />
                <span className="wave" />
                <span className="wave" />
              </div>
            </div>
            <h3 className="call-audio-name">{participantName}</h3>
            <p className="call-audio-duration">{callDuration}</p>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="call-chat-sidebar">
          <div className="call-chat-header">
            <h4>Tin nhắn trong cuộc gọi</h4>
            <button
              className="call-chat-close"
              onClick={() => setShowChat(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="call-chat-messages">
            <Chat />
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="call-control-bar">
        <div className="call-control-group">
          <button
            className={`call-control-btn ${isMuted ? "off" : ""}`}
            onClick={toggleMic}
            title={isMuted ? "Bật micro" : "Tắt micro"}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            <span className="call-control-label">
              {isMuted ? "Đã tắt" : "Micro"}
            </span>
          </button>

          {callType === "video" && (
            <button
              className={`call-control-btn ${isVideoOff ? "off" : ""}`}
              onClick={toggleCamera}
              title={isVideoOff ? "Bật camera" : "Tắt camera"}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              <span className="call-control-label">
                {isVideoOff ? "Đã tắt" : "Camera"}
              </span>
            </button>
          )}

          <button
            className={`call-control-btn ${
              isScreenSharing ? "active-share" : ""
            }`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
          >
            <MonitorUp size={22} />
            <span className="call-control-label">Chia sẻ</span>
          </button>
        </div>

        {/* Leave/End button - khác nhau cho group và 1-1 */}
        {isGroupCall ? (
          <button
            className="call-leave-btn"
            onClick={onLeaveCall}
            title="Rời khỏi cuộc gọi"
          >
            <PhoneOff size={24} />
            <span>Rời đi</span>
          </button>
        ) : (
          <button
            className="call-end-btn"
            onClick={onEndCall}
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff size={24} />
            <span>Kết thúc</span>
          </button>
        )}

        <div className="call-control-group">
          {/* Participants button in control bar for group call */}
          {isGroupCall && (
            <button
              className={`call-control-btn ${showParticipants ? "active" : ""}`}
              onClick={() => setShowParticipants(!showParticipants)}
              title="Người tham gia"
            >
              <Users size={22} />
              <span className="call-control-label">{participants.length}</span>
            </button>
          )}
          <button
            className={`call-control-btn ${showChat ? "active" : ""}`}
            onClick={() => setShowChat(!showChat)}
            title="Chat"
          >
            <MessageSquare size={22} />
            <span className="call-control-label">Chat</span>
          </button>
        </div>
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
              className="search-input w-full py-3.5 px-4 bg-[#1a1a1a]/80 border border-dao-gold/15 rounded-xl text-dao-mist text-sm outline-none transition-all duration-300 placeholder:text-[#e5e5e5]/40 focus:border-dao-gold"
              placeholder="Nhập tên đạo đàn..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Thêm đạo hữu ({selectedUsers.length} đã chọn)
            </label>
            <div className="search-wrapper mb-2 relative">
              <Search
                size={18}
                className="search-icon absolute left-4 top-1/2 -translate-y-1/2 text-dao-gold/50 pointer-events-none"
              />
              <input
                type="text"
                className="search-input w-full py-3.5 px-4 pl-12 bg-[#1a1a1a]/80 border border-dao-gold/15 rounded-xl text-dao-mist text-sm outline-none transition-all duration-300 placeholder:text-[#e5e5e5]/40 focus:border-dao-gold"
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
