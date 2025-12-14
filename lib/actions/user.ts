"use server";

import { Client, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import { ROLE_LEVELS } from "../roles";

function getAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  if (process.env.APPWRITE_API_KEY) {
    client.setKey(process.env.APPWRITE_API_KEY);
  }
  return client;
}

export async function claimNewbieGift(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    // 1. Lấy profile
    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileRes.documents.length === 0)
      throw new Error("Không tìm thấy hồ sơ.");
    const profile = profileRes.documents[0];

    // 2. Check đã nhận chưa
    if (profile.hasClaimedGift) {
      return { success: false, error: "Đạo hữu đã nhận quà nhập môn rồi!" };
    }

    // 3. Tính toán phần thưởng theo Role
    const role = profile.role || "pham_nhan";
    let rewardAmount = 1000; // Mặc định (Phàm nhân/Khách)

    if (role === "chi_cuong_gia") rewardAmount = 2000;
    else if (role === "thanh_nhan") rewardAmount = 5000;
    else if (role === "chi_ton") rewardAmount = 10000; // Admin ưu đãi tí

    // 4. Update Database (Cộng tiền + Đánh dấu đã nhận)
    const newBalance = (profile.currency || 0) + rewardAmount;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        currency: newBalance,
        hasClaimedGift: true,
      }
    );

    return { success: true, reward: rewardAmount, newBalance };
  } catch (error: any) {
    console.error("Claim Gift Error:", error);
    return { success: false, error: "Lỗi hệ thống: " + error.message };
  }
}

// Hàm lấy profile nhanh để hiện trang chủ
export async function getCurrentProfile(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );
    return profileRes.documents[0] || null;
  } catch {
    return null;
  }
}
