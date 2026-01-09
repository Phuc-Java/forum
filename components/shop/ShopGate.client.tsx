"use client";

import React, { useEffect, useState } from "react";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { AccessDeniedOverlay } from "@/components/shop/AccessDenied";
import ShopAssistant from "@/components/shop/ShopAssistant.client";
import ShopInterface from "@/components/shop/ShopInterface";
import ProductSidebar from "@/components/shop/ProductSidebar";
import type { Product } from "@/lib/actions/shop";

const MIN_VIEW_LEVEL = 2;
const MIN_SELL_LEVEL = 4;

export default function ShopGate({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [canSell, setCanSell] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("pham_nhan");

  useEffect(() => {
    let mounted = true;

    const initPage = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const account = new Account(client);
        const databases = new Databases(client);

        let user;
        try {
          user = await account.get();
          if (!mounted) return;
          setCurrentUserId(user.$id);
        } catch (err) {
          console.warn("Chưa đăng nhập:", err);
          setLoading(false);
          return;
        }

        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", user.$id)]
        );

        if (profileRes.documents.length > 0) {
          const profile = profileRes.documents[0];
          const roleKey = (profile.role as any) || "no_le";
          // Đúng thứ tự cấp bậc: no_le(1) < pham_nhan(2) < chi_cuong_gia(3) < thanh_nhan(4) < chi_ton(5)
          const ROLE_LEVELS: Record<string, number> = {
            no_le: 1,
            pham_nhan: 2,
            chi_cuong_gia: 3,
            thanh_nhan: 4,
            chi_ton: 5,
          };
          const userLevel = ROLE_LEVELS[roleKey] || 1;
          setCurrentUserRole(roleKey);
          if (userLevel >= MIN_VIEW_LEVEL) setAccessGranted(true);
          if (userLevel >= MIN_SELL_LEVEL) setCanSell(true);
        } else {
          console.warn("Có account nhưng chưa tạo Profile -> Coi như khách");
        }
      } catch (error) {
        console.error("Lỗi hệ thống Shop (client):", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
        <p className="text-emerald-400 font-mono text-xs tracking-widest animate-pulse">
          ĐANG MỞ CỔNG TÀNG KINH CÁC...
        </p>
      </div>
    );
  }

  if (!accessGranted) {
    return <AccessDeniedOverlay minRole="Phàm Nhân" />;
  }

  return (
    <>
      <ShopInterface
        initialProducts={initialProducts}
        currentUserId={currentUserId}
        canSell={canSell}
        userRole={currentUserRole}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {currentUserId && (
        <ProductSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          userId={currentUserId}
          userRole={currentUserRole}
        />
      )}
      <ShopAssistant />
    </>
  );
}
