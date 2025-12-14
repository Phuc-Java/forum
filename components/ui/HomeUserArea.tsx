"use client";

import { useEffect, useState } from "react";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import HomeAuthButtons from "./HomeAuthButtons"; // Component nút đăng nhập cũ của bạn
import CompactGift from "../home/CompactGift"; // Component quà mới

export default function HomeUserArea() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const account = new Account(client);
        const databases = new Databases(client);

        const currUser = await account.get();
        setUser(currUser);

        // Lấy profile để check tiền và quà
        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", currUser.$id)]
        );
        if (profileRes.documents.length > 0) {
          setProfile(profileRes.documents[0]);
        }
      } catch (error) {
        // Chưa đăng nhập
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading)
    return (
      <div className="h-14 w-40 bg-surface/30 animate-pulse rounded-xl"></div>
    );

  if (user && profile) {
    return <CompactGift profile={profile} currentUserId={user.$id} />;
  }

  // Nếu chưa đăng nhập, hiện nút cũ
  return <HomeAuthButtons />;
}
