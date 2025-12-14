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

// GAME 1: VÒNG QUAY NHÂN PHẨM (GIỮ NGUYÊN TỈ LỆ CŨ)
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

    if (profile.currency < cost)
      return { error: "Không đủ linh thạch để quay!" };

    // Tỉ lệ cũ:
    // 5% : Jackpot (30k)
    // 15%: Địa Phẩm (10k)
    // 30%: Huyền Phẩm (2k)
    // 50%: Linh Tinh (100)
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

    const newBalance = profile.currency - cost + reward;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      { currency: newBalance }
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
    return { success: true, reward, resultText, newBalance, type };
  } catch (error: any) {
    return { error: "Lỗi server: " + error.message };
  }
}

// GAME 2: ĐÀO MỎ (MINING) - ĐÃ SỬA TỈ LỆ 7-10
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

    // Random reward: 7 - 10
    const baseReward = Math.floor(Math.random() * 4) + 7;

    // Tỉ lệ bạo kích (Crit) 1% nhân 10 (Giữ sự bất ngờ)
    const isCritical = Math.random() < 0.01;
    const finalReward = isCritical ? baseReward * 10 : baseReward;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        currency: profile.currency + finalReward,
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
      newBalance: profile.currency + finalReward,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// GAME 3: MỞ RƯƠNG (MYSTERY BOX) - GIỮ NGUYÊN
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

    if (profile.currency < cost)
      return { error: "Cần 5,000 Linh Thạch để mua chìa khóa!" };

    // Logic Gacha: High Risk High Return (Giữ nguyên tỉ lệ cũ)
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

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        currency: profile.currency - cost + reward,
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
      newBalance: profile.currency - cost + reward,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
