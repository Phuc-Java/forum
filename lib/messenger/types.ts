// ============ MESSENGER TYPES ============
// Types cho hệ thống tin nhắn và video call

// ============ CONVERSATION TYPES ============
// Note: Appwrite enum values có dấu nháy kép
export type ConversationType = '"direct"' | '"group"' | "direct" | "group";

export interface Conversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  type: ConversationType;
  name: string | null; // Tên nhóm (null nếu là direct)
  avatar: string | null; // Avatar nhóm
  createdBy: string; // userId người tạo
  participants: string; // JSON array of userIds
  lastMessage: string | null;
  lastMessageAt: string | null;
  isActive: boolean;
}

export interface ConversationWithDetails extends Conversation {
  participantProfiles: ParticipantProfile[];
  unreadCount: number;
  otherUser?: ParticipantProfile; // Chỉ dùng cho direct chat
}

// ============ MESSAGE TYPES ============
export type MessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "audio"
  | "system";

export interface Message {
  $id: string;
  $createdAt: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: string | null; // Stored as string in Appwrite
  replyTo: string | null; // Message ID được reply
  reactions: string | null; // JSON object { emoji: [userIds] }
  isDeleted: boolean;
  readBy: string | null; // JSON array of userIds đã đọc
}

export interface MessageWithSender extends Message {
  senderProfile?: ParticipantProfile;
  replyToMessage?: Message | null;
}

// ============ MEMBER TYPES ============
export type MemberRole = "owner" | "admin" | "member";

export interface ConversationMember {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversationId: string;
  userId: string;
  nickname: string | null; // Biệt danh trong nhóm
  memberRole: MemberRole;
  isMuted: boolean;
  isLeft: boolean;
}

export interface ConversationMemberWithProfile extends ConversationMember {
  profile: ParticipantProfile;
}

// ============ CALL TYPES ============
export type CallType = "audio" | "video" | "screen_share";
export type CallStatus = "ringing" | "ongoing" | "ended";

export interface CallSession {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversationId: string;
  callType: CallType;
  initiatorId: string;
  "participants[]": string | null; // JSON array
  status: CallStatus;
  roomId: string; // LiveKit room ID
}

export interface ActiveCall extends CallSession {
  initiatorProfile?: ParticipantProfile;
  conversation?: Conversation;
}

// ============ USER NICKNAME (Admin assigned) ============
export interface UserNickname {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  nickname: string;
  assignedBy: string;
}

// ============ PARTICIPANT PROFILE ============
export interface ParticipantProfile {
  $id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string | null;
  customTags: string | null;
  // Biệt danh do admin cấp (ưu tiên hiển thị)
  adminNickname?: string | null;
  // Online status
  isOnline?: boolean;
  lastSeen?: string;
}

// ============ REALTIME EVENTS ============
export type RealtimeEventType =
  | "message.new"
  | "message.update"
  | "message.delete"
  | "conversation.update"
  | "member.join"
  | "member.leave"
  | "call.start"
  | "call.end"
  | "typing.start"
  | "typing.stop";

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: unknown;
  timestamp: string;
}

// ============ UI STATE TYPES ============
export interface MessengerState {
  conversations: ConversationWithDetails[];
  activeConversation: ConversationWithDetails | null;
  messages: MessageWithSender[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  activeCall: ActiveCall | null;
  typingUsers: Map<string, ParticipantProfile>;
}

// ============ API REQUEST/RESPONSE TYPES ============
export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  avatar?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
}

export interface StartCallRequest {
  conversationId: string;
  callType: CallType;
}

export interface JoinCallRequest {
  callSessionId: string;
}

// ============ LIVEKIT TYPES ============
export interface LiveKitToken {
  token: string;
  roomName: string;
  participantName: string;
}
