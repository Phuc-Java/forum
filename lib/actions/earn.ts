"use server";

import { Client, Databases, ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  if (process.env.APPWRITE_API_KEY) {
    client.setKey(process.env.APPWRITE_API_KEY);
  }
  return client;
}

// Lấy lịch sử chơi game
export async function getGameHistory(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const logs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "game_logs",
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(10),
      ]
    );
    return logs.documents;
  } catch {
    return [];
  }
}

// GAME 1: VÒNG QUAY NHÂN PHẨM
export async function spinWheel(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const cost = 500;

    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );
    if (profileRes.documents.length === 0) return { error: "Lỗi hồ sơ" };
    const profile = profileRes.documents[0];

    // 🔥 FIX 1: Ép kiểu String -> Number để so sánh và tính toán
    const currentBalance = Number(profile.currency) || 0;

    if (currentBalance < cost) return { error: "Không đủ linh thạch để quay!" };

    // Tỉ lệ rơi đồ
    const rand = Math.random();
    let reward = 0;
    let resultText = "Chúc may mắn lần sau";
    let type = "common";

    if (rand < 0.05) {
      reward = 30000;
      resultText = "JACKPOT! THIÊN PHẨM!";
      type = "legendary";
    } else if (rand < 0.2) {
      reward = 10000;
      resultText = "ĐỊA PHẨM";
      type = "epic";
    } else if (rand < 0.5) {
      reward = 2000;
      resultText = "HUYỀN PHẨM";
      type = "rare";
    } else {
      reward = 100;
      resultText = "LINH TINH";
      type = "trash";
    }

    // 🔥 FIX 2: Tính toán trên Số
    const newBalance = currentBalance - cost + reward;

    // 🔥 FIX 3: Ép kiểu Number -> String để lưu vào DB
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      { currency: String(newBalance) }
    );

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "game_logs",
      ID.unique(),
      {
        userId,
        gameType: "lucky_wheel",
        betAmount: cost,
        rewardAmount: reward,
        result: resultText,
      }
    );

    revalidatePath("/earn");
    // Trả về số để UI hiển thị dễ dàng
    return { success: true, reward, resultText, newBalance, type };
  } catch (error: any) {
    return { error: "Lỗi server: " + error.message };
  }
}

// GAME 2: ĐÀO MỎ (MINING)
export async function mineSpiritStone(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId)]
    );
    const profile = profileRes.documents[0];

    // 🔥 FIX 1: Ép kiểu String -> Number
    const currentBalance = Number(profile.currency) || 0;

    // Random reward: 7 - 10
    const baseReward = Math.floor(Math.random() * 4) + 7;

    // Tỉ lệ bạo kích (Crit) 1% nhân 10
    const isCritical = Math.random() < 0.01;
    const finalReward = isCritical ? baseReward * 10 : baseReward;

    // 🔥 FIX 2: Tính toán cộng số (Tránh lỗi cộng chuỗi "1000" + 10 = "100010")
    const newBalance = currentBalance + finalReward;

    // 🔥 FIX 3: Ép kiểu Number -> String để lưu vào DB
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        currency: String(newBalance),
      }
    );

    // Chỉ lưu log nếu bạo kích để đỡ rác DB
    if (isCritical) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        "game_logs",
        ID.unique(),
        {
          userId,
          gameType: "mining",
          betAmount: 0,
          rewardAmount: finalReward,
          result: "BẠO KÍCH ĐÀO MỎ",
        }
      );
    }

    revalidatePath("/earn");
    return {
      success: true,
      reward: finalReward,
      isCritical,
      newBalance: newBalance, // Trả về số cho UI
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// GAME 3: MỞ RƯƠNG (MYSTERY BOX)
export async function openMysteryBox(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const cost = 5000;

    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId)]
    );
    const profile = profileRes.documents[0];

    // 🔥 FIX 1: Ép kiểu String -> Number
    const currentBalance = Number(profile.currency) || 0;

    if (currentBalance < cost)
      return { error: "Cần 5,000 Linh Thạch để mua chìa khóa!" };

    // Logic Gacha
    const rand = Math.random();
    let reward = 0;
    let tier = "trash"; // common

    if (rand < 0.01) {
      reward = 100000;
      tier = "legendary";
    } // 1%
    else if (rand < 0.1) {
      reward = 20000;
      tier = "epic";
    } // 9%
    else if (rand < 0.4) {
      reward = 6000;
      tier = "rare";
    } // 30%
    else {
      reward = 1000;
      tier = "trash";
    } // 60%

    // 🔥 FIX 2: Tính toán trên số
    const newBalance = currentBalance - cost + reward;

    // 🔥 FIX 3: Ép kiểu Number -> String để lưu vào DB
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        currency: String(newBalance),
      }
    );

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "game_logs",
      ID.unique(),
      {
        userId,
        gameType: "mystery_box",
        betAmount: cost,
        rewardAmount: reward,
        result: tier.toUpperCase(),
      }
    );

    revalidatePath("/earn");
    return {
      success: true,
      reward,
      tier,
      newBalance: newBalance, // Trả về số cho UI
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
