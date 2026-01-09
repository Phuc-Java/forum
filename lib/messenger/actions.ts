"use server";

import { Client, Databases, Query, ID, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import {
  ConversationWithDetails,
  MessageWithSender,
  CallSession,
  ParticipantProfile,
  SendMessageRequest,
  ConversationType,
  MessageType,
} from "./types";

// ============ CLIENT HELPERS ============

async function getServerClientWithSession() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("appwrite-jwt");
  if (jwtCookie?.value) {
    client.setJWT(jwtCookie.value);
    return client;
  }

  const sessionCookie =
    cookieStore.get("appwrite-session") ||
    cookieStore.get(`a_session_${APPWRITE_CONFIG.projectId}`);

  if (sessionCookie?.value) {
    client.setSession(sessionCookie.value);
  }

  return client;
}

// ============ PROFILE HELPERS ============

async function getProfilesMap(
  databases: Databases,
  userIds: string[]
): Promise<Map<string, ParticipantProfile>> {
  const profilesMap = new Map<string, ParticipantProfile>();
  if (userIds.length === 0) return profilesMap;

  const uniqueIds = [...new Set(userIds)];

  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", uniqueIds), Query.limit(100)]
    );

    // Also fetch admin nicknames
    const nicknamesResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userNicknames,
      [Query.equal("userId", uniqueIds), Query.limit(100)]
    );

    const nicknamesMap = new Map<string, string>();
    for (const doc of nicknamesResponse.documents) {
      nicknamesMap.set(doc.userId, doc.nickname);
    }

    for (const doc of response.documents) {
      profilesMap.set(doc.userId, {
        $id: doc.$id,
        userId: doc.userId,
        displayName: doc.displayName,
        avatarUrl: doc.avatarUrl,
        role: doc.role,
        customTags: doc.customTags,
        adminNickname: nicknamesMap.get(doc.userId) || null,
      });
    }
  } catch (error) {
    console.error("getProfilesMap error:", error);
  }

  return profilesMap;
}

// ============ CONVERSATION ACTIONS ============

/**
 * Lấy danh sách conversations của user hiện tại
 * @param userId - ID của user cần lấy conversations (bắt buộc để đảm bảo bảo mật)
 */
export async function getMyConversations(
  userId?: string
): Promise<ConversationWithDetails[]> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Lấy userId từ session nếu không được truyền vào
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const account = new Account(client);
        const user = await account.get();
        currentUserId = user.$id;
      } catch {
        console.error("Cannot get current user for getMyConversations");
        return [];
      }
    }

    // Lấy conversation_members của user hiện tại (QUAN TRỌNG: filter theo userId!)
    const membersResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.conversationMembers,
      [
        Query.equal("userId", currentUserId),
        Query.equal("isLeft", false),
        Query.limit(100),
      ]
    );

    if (membersResponse.documents.length === 0) {
      return [];
    }

    const conversationIds = membersResponse.documents.map(
      (m) => m.conversationId
    );

    // Lấy conversations
    const conversationsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerConversations,
      [
        Query.equal("$id", conversationIds),
        Query.equal("isActive", true),
        Query.orderDesc("lastMessageAt"),
        Query.limit(50),
      ]
    );

    // Collect all participant userIds
    const allParticipantIds: string[] = [];
    for (const conv of conversationsResponse.documents) {
      try {
        const participants = JSON.parse(conv.participants || "[]");
        allParticipantIds.push(...participants);
      } catch {
        // Skip invalid JSON
      }
    }

    // Fetch all profiles at once
    const profilesMap = await getProfilesMap(databases, allParticipantIds);

    // Map to ConversationWithDetails
    const result: ConversationWithDetails[] =
      conversationsResponse.documents.map((doc) => {
        let participantIds: string[] = [];
        try {
          participantIds = JSON.parse(doc.participants || "[]");
        } catch {
          participantIds = [];
        }

        const participantProfiles = participantIds
          .map((id) => profilesMap.get(id))
          .filter(Boolean) as ParticipantProfile[];

        return {
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt,
          type: doc.type as ConversationType,
          name: doc.name,
          avatar: doc.avatar,
          createdBy: doc.createdBy,
          participants: doc.participants,
          lastMessage: doc.lastMessage,
          lastMessageAt: doc.lastMessageAt,
          isActive: doc.isActive,
          participantProfiles,
          unreadCount: 0, // TODO: Calculate from readBy
        };
      });

    return result;
  } catch (error) {
    console.error("getMyConversations error:", error);
    return [];
  }
}

/**
 * Lấy hoặc tạo direct conversation với user khác
 */
export async function getOrCreateDirectConversation(
  currentUserId: string,
  otherUserId: string
): Promise<{
  success: boolean;
  conversation?: ConversationWithDetails;
  error?: string;
}> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Tìm conversation direct đã tồn tại
    const existingConvs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerConversations,
      [Query.equal("type", '"direct"'), Query.limit(100)]
    );

    // Check nếu đã có conversation giữa 2 người
    for (const conv of existingConvs.documents) {
      try {
        const participants = JSON.parse(conv.participants || "[]");
        if (
          participants.length === 2 &&
          participants.includes(currentUserId) &&
          participants.includes(otherUserId)
        ) {
          // Found existing
          const profilesMap = await getProfilesMap(databases, participants);
          const participantProfiles = participants
            .map((id: string) => profilesMap.get(id))
            .filter(Boolean) as ParticipantProfile[];

          return {
            success: true,
            conversation: {
              $id: conv.$id,
              $createdAt: conv.$createdAt,
              $updatedAt: conv.$updatedAt,
              type: conv.type as ConversationType,
              name: conv.name,
              avatar: conv.avatar,
              createdBy: conv.createdBy,
              participants: conv.participants,
              lastMessage: conv.lastMessage,
              lastMessageAt: conv.lastMessageAt,
              isActive: conv.isActive,
              participantProfiles,
              unreadCount: 0,
              otherUser: profilesMap.get(otherUserId),
            },
          };
        }
      } catch {
        continue;
      }
    }

    // Tạo conversation mới
    const participants = JSON.stringify([currentUserId, otherUserId]);
    // Debug log
    console.log("Creating direct conversation with:", {
      collection: APPWRITE_CONFIG.collections.messengerConversations,
      createdBy: currentUserId,
    });

    // Gửi type với dấu nháy kép để match với Appwrite enum
    const typeValue = '"direct"';
    console.log("Type value:", typeValue, "typeof:", typeof typeValue);

    const newConv = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerConversations,
      ID.unique(),
      {
        type: typeValue,
        name: null,
        avatar: null,
        createdBy: currentUserId,
        participants,
        lastMessage: null,
        lastMessageAt: null,
        isActive: true,
      }
    );

    // Tạo members cho cả 2 người
    await Promise.all([
      databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.conversationMembers,
        ID.unique(),
        {
          conversationId: newConv.$id,
          userId: currentUserId,
          nickname: null,
          memberRole: '"owner"',
          isMuted: false,
          isLeft: false,
        }
      ),
      databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.conversationMembers,
        ID.unique(),
        {
          conversationId: newConv.$id,
          userId: otherUserId,
          nickname: null,
          memberRole: '"member"',
          isMuted: false,
          isLeft: false,
        }
      ),
    ]);

    const profilesMap = await getProfilesMap(databases, [
      currentUserId,
      otherUserId,
    ]);
    const participantProfiles = [currentUserId, otherUserId]
      .map((id) => profilesMap.get(id))
      .filter(Boolean) as ParticipantProfile[];

    return {
      success: true,
      conversation: {
        $id: newConv.$id,
        $createdAt: newConv.$createdAt,
        $updatedAt: newConv.$updatedAt,
        type: '"direct"' as ConversationType,
        name: null,
        avatar: null,
        createdBy: currentUserId,
        participants,
        lastMessage: null,
        lastMessageAt: null,
        isActive: true,
        participantProfiles,
        unreadCount: 0,
        otherUser: profilesMap.get(otherUserId),
      },
    };
  } catch (error) {
    console.error("getOrCreateDirectConversation error:", error);
    return { success: false, error: "Không thể tạo cuộc trò chuyện" };
  }
}

/**
 * Tạo group conversation
 */
export async function createGroupConversation(
  currentUserId: string,
  name: string,
  participantIds: string[]
): Promise<{
  success: boolean;
  conversation?: ConversationWithDetails;
  error?: string;
}> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Đảm bảo current user nằm trong participants
    const allParticipants = [...new Set([currentUserId, ...participantIds])];
    const participants = JSON.stringify(allParticipants);

    // Gửi type với dấu nháy kép để match với Appwrite enum
    const typeValue = '"group"';
    console.log("Creating group conversation:", {
      typeValue,
      typeof: typeof typeValue,
      name,
      participantCount: allParticipants.length,
    });

    const newConv = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerConversations,
      ID.unique(),
      {
        type: typeValue,
        name,
        avatar: null,
        createdBy: currentUserId,
        participants,
        lastMessage: null,
        lastMessageAt: null,
        isActive: true,
      }
    );

    // Tạo members
    const memberPromises = allParticipants.map((userId) =>
      databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.conversationMembers,
        ID.unique(),
        {
          conversationId: newConv.$id,
          userId,
          nickname: null,
          memberRole: userId === currentUserId ? '"owner"' : '"member"',
          isMuted: false,
          isLeft: false,
        }
      )
    );
    await Promise.all(memberPromises);

    const profilesMap = await getProfilesMap(databases, allParticipants);
    const participantProfiles = allParticipants
      .map((id) => profilesMap.get(id))
      .filter(Boolean) as ParticipantProfile[];

    return {
      success: true,
      conversation: {
        $id: newConv.$id,
        $createdAt: newConv.$createdAt,
        $updatedAt: newConv.$updatedAt,
        type: '"group"' as ConversationType,
        name,
        avatar: null,
        createdBy: currentUserId,
        participants,
        lastMessage: null,
        lastMessageAt: null,
        isActive: true,
        participantProfiles,
        unreadCount: 0,
      },
    };
  } catch (error) {
    console.error("createGroupConversation error:", error);
    return { success: false, error: "Không thể tạo nhóm" };
  }
}

// ============ MESSAGE ACTIONS ============

/**
 * Lấy messages của conversation
 * Kiểm tra quyền: chỉ member của conversation mới được xem
 */
export async function getMessages(
  conversationId: string,
  limit = 50,
  before?: string,
  userId?: string
): Promise<MessageWithSender[]> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Lấy userId từ session nếu không được truyền vào
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const account = new Account(client);
        const user = await account.get();
        currentUserId = user.$id;
      } catch {
        console.error("Cannot verify user for getMessages");
        return [];
      }
    }

    // QUAN TRỌNG: Kiểm tra user có phải là member của conversation không
    const memberCheck = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.conversationMembers,
      [
        Query.equal("conversationId", conversationId),
        Query.equal("userId", currentUserId),
        Query.equal("isLeft", false),
        Query.limit(1),
      ]
    );

    if (memberCheck.documents.length === 0) {
      console.error("User is not a member of this conversation");
      return [];
    }

    const queries = [
      Query.equal("conversationId", conversationId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (before) {
      queries.push(Query.cursorAfter(before));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerMessages,
      queries
    );

    // Get unique sender IDs
    const senderIds = [...new Set(response.documents.map((m) => m.senderId))];
    const profilesMap = await getProfilesMap(databases, senderIds);

    const messages: MessageWithSender[] = response.documents.map((doc) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      senderName: doc.senderName,
      type: doc.type as MessageType,
      content: doc.content,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      replyTo: doc.replyTo,
      reactions: doc.reactions,
      isDeleted: doc.isDeleted,
      readBy: doc.readBy,
      senderProfile: profilesMap.get(doc.senderId),
    }));

    // Reverse để hiển thị từ cũ đến mới
    return messages.reverse();
  } catch (error) {
    console.error("getMessages error:", error);
    return [];
  }
}

/**
 * Gửi tin nhắn
 */
export async function sendMessage(
  senderId: string,
  senderName: string,
  request: SendMessageRequest
): Promise<{ success: boolean; message?: MessageWithSender; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const newMessage = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerMessages,
      ID.unique(),
      {
        conversationId: request.conversationId,
        senderId,
        senderName,
        type: `"${request.type}"`,
        content: request.content,
        fileUrl: request.fileUrl || null,
        fileName: request.fileName || null,
        fileSize: request.fileSize?.toString() || null,
        replyTo: request.replyTo || null,
        reactions: null,
        isDeleted: false,
        readBy: JSON.stringify([senderId]),
      }
    );

    // Update conversation's lastMessage
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerConversations,
      request.conversationId,
      {
        lastMessage:
          request.type === "text"
            ? request.content.substring(0, 100)
            : `[${request.type}]`,
        lastMessageAt: new Date().toISOString(),
      }
    );

    return {
      success: true,
      message: {
        $id: newMessage.$id,
        $createdAt: newMessage.$createdAt,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        senderName: newMessage.senderName,
        type: newMessage.type as MessageType,
        content: newMessage.content,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
        fileSize: newMessage.fileSize,
        replyTo: newMessage.replyTo,
        reactions: newMessage.reactions,
        isDeleted: newMessage.isDeleted,
        readBy: newMessage.readBy,
      },
    };
  } catch (error) {
    console.error("sendMessage error:", error);
    return { success: false, error: "Không thể gửi tin nhắn" };
  }
}

/**
 * Đánh dấu tin nhắn đã đọc
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Lấy các tin nhắn chưa đọc
    const unreadMessages = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messengerMessages,
      [
        Query.equal("conversationId", conversationId),
        Query.notEqual("senderId", userId),
        Query.limit(100),
      ]
    );

    // Update readBy cho từng message
    const updatePromises = unreadMessages.documents.map(async (msg) => {
      try {
        const currentReadBy = JSON.parse(msg.readBy || "[]");
        if (!currentReadBy.includes(userId)) {
          currentReadBy.push(userId);
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.messengerMessages,
            msg.$id,
            { readBy: JSON.stringify(currentReadBy) }
          );
        }
      } catch {
        // Skip
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("markMessagesAsRead error:", error);
  }
}

// ============ CALL SESSION ACTIONS ============

/**
 * Tạo call session mới
 */
export async function createCallSession(
  conversationId: string,
  initiatorId: string,
  callType: "audio" | "video" | "screen_share",
  options?: { startOngoing?: boolean }
): Promise<{ success: boolean; session?: CallSession; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const roomId = `room_${conversationId}_${Date.now()}`;

    const startOngoing = options?.startOngoing === true;

    const session = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      ID.unique(),
      {
        conversationId,
        callType: `"${callType}"`,
        initiatorId,
        participants: [initiatorId],
        // Direct call: ringing (needs accept). Group call: ongoing (join immediately).
        status: startOngoing ? '"ongoing"' : '"ringing"',
        roomId,
      }
    );

    return {
      success: true,
      session: session as unknown as CallSession,
    };
  } catch (error) {
    console.error("createCallSession error:", error);
    return { success: false, error: "Không thể bắt đầu cuộc gọi" };
  }
}

/**
 * Lấy call session đang diễn ra (ongoing) của 1 conversation (nếu có)
 */
export async function getActiveCallSessionForConversation(
  conversationId: string
): Promise<{ success: boolean; session?: CallSession | null; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      [
        Query.equal("conversationId", conversationId),
        Query.equal("status", '"ongoing"'),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    );

    const doc = res.documents[0];
    return {
      success: true,
      session: doc ? (doc as unknown as CallSession) : null,
    };
  } catch (error) {
    console.error("getActiveCallSessionForConversation error:", error);
    return { success: false, error: "Không thể lấy cuộc gọi đang diễn ra" };
  }
}

/**
 * Tham gia call
 */
export async function joinCallSession(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; session?: CallSession; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const session = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      sessionId
    );

    const callParticipants = Array.isArray(session.participants)
      ? session.participants
      : [];
    if (!callParticipants.includes(userId)) {
      callParticipants.push(userId);
    }

    const updated = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      sessionId,
      {
        participants: callParticipants,
        status: '"ongoing"',
      }
    );

    return {
      success: true,
      session: updated as unknown as CallSession,
    };
  } catch (error) {
    console.error("joinCallSession error:", error);
    return { success: false, error: "Không thể tham gia cuộc gọi" };
  }
}

/**
 * Rời khỏi call (cho group calls - chỉ remove user khỏi participants)
 */
export async function leaveCallSession(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const session = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      sessionId
    );

    const callParticipants = Array.isArray(session.participants)
      ? session.participants
      : [];

    // Remove user from participants
    const updatedParticipants = callParticipants.filter((id) => id !== userId);

    // If no participants left, end the call
    if (updatedParticipants.length === 0) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.callSessions,
        sessionId,
        {
          status: '"ended"',
          participants: updatedParticipants,
        }
      );
    } else {
      // Otherwise just update participants list
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.callSessions,
        sessionId,
        { participants: updatedParticipants }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("leaveCallSession error:", error);
    return { success: false, error: "Không thể rời cuộc gọi" };
  }
}

/**
 * Kết thúc call (cho tất cả participants)
 */
export async function endCallSession(sessionId: string): Promise<void> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.callSessions,
      sessionId,
      { status: '"ended"' }
    );
  } catch (error) {
    console.error("endCallSession error:", error);
  }
}

// ============ USER NICKNAME ACTIONS (Admin only) ============

/**
 * Set nickname cho user (chỉ admin)
 */
export async function setUserNickname(
  userId: string,
  nickname: string,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    // Check if already exists
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userNicknames,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (existing.documents.length > 0) {
      // Update
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.userNicknames,
        existing.documents[0].$id,
        { nickname, assignedBy }
      );
    } else {
      // Create
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.userNicknames,
        ID.unique(),
        { userId, nickname, assignedBy }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("setUserNickname error:", error);
    return { success: false, error: "Không thể đặt biệt danh" };
  }
}

// ============ SEARCH USERS ============

/**
 * Tìm kiếm users để thêm vào conversation
 */
export async function searchUsers(
  query: string,
  excludeIds: string[] = []
): Promise<ParticipantProfile[]> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.search("displayName", query), Query.limit(20)]
    );

    // Fetch nicknames
    const userIds = response.documents.map((d) => d.userId);
    const nicknamesResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userNicknames,
      [Query.equal("userId", userIds), Query.limit(100)]
    );

    const nicknamesMap = new Map<string, string>();
    for (const doc of nicknamesResponse.documents) {
      nicknamesMap.set(doc.userId, doc.nickname);
    }

    return response.documents
      .filter((d) => !excludeIds.includes(d.userId))
      .map((doc) => ({
        $id: doc.$id,
        userId: doc.userId,
        displayName: doc.displayName,
        avatarUrl: doc.avatarUrl,
        role: doc.role,
        customTags: doc.customTags,
        adminNickname: nicknamesMap.get(doc.userId) || null,
      }));
  } catch (error) {
    console.error("searchUsers error:", error);
    return [];
  }
}

/**
 * Lấy tất cả users (for user list)
 */
export async function getAllUsers(): Promise<ParticipantProfile[]> {
  try {
    const client = await getServerClientWithSession();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.limit(100), Query.orderDesc("$createdAt")]
    );

    const userIds = response.documents.map((d) => d.userId);
    const nicknamesResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.userNicknames,
      [Query.equal("userId", userIds), Query.limit(100)]
    );

    const nicknamesMap = new Map<string, string>();
    for (const doc of nicknamesResponse.documents) {
      nicknamesMap.set(doc.userId, doc.nickname);
    }

    return response.documents.map((doc) => ({
      $id: doc.$id,
      userId: doc.userId,
      displayName: doc.displayName,
      avatarUrl: doc.avatarUrl,
      role: doc.role,
      customTags: doc.customTags,
      adminNickname: nicknamesMap.get(doc.userId) || null,
    }));
  } catch (error) {
    console.error("getAllUsers error:", error);
    return [];
  }
}
