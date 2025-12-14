"use client";

import React, { useEffect, useState } from "react";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { AccessDeniedOverlay } from "@/components/shop/AccessDenied";
import ShopInterface from "@/components/shop/ShopInterface";
import ProductSidebar from "@/components/shop/ProductSidebar";
import { getProducts, Product } from "@/lib/actions/shop";
import { ROLE_LEVELS, RoleType } from "@/lib/roles";
import { motion } from "framer-motion";

// Widget AI Tiểu Nhị
const ShopAssistant = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111]/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-xl w-64 shadow-2xl mb-2"
        >
          <div className="text-xs text-emerald-400 font-bold mb-2 uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Tiểu Nhị AI
          </div>
          <p className="text-gray-400 text-xs mb-3 font-mono">
            Đạo hữu cần tìm pháp bảo gì? Ta có thể tư vấn giá cả thị trường.
          </p>
          <input
            type="text"
            placeholder="Hỏi gì đó..."
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
          />
        </motion.div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform group"
      >
        {open ? "✕" : <span className="group-hover:animate-spin">🤖</span>}
      </button>
    </div>
  );
};

const MIN_VIEW_LEVEL = 2;
const MIN_SELL_LEVEL = 4;

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [canSell, setCanSell] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // THÊM STATE NÀY ĐỂ LƯU ROLE
  const [currentUserRole, setCurrentUserRole] = useState<string>("pham_nhan");

  useEffect(() => {
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
          const roleKey = (profile.role as RoleType) || "no_le";
          const userLevel = ROLE_LEVELS[roleKey] || 1;

          // CẬP NHẬT STATE ROLE
          setCurrentUserRole(roleKey);

          console.log(
            `Debug Shop - User: ${profile.displayName}, Role: ${roleKey}, Level: ${userLevel}`
          );

          if (userLevel >= MIN_VIEW_LEVEL) setAccessGranted(true);
          if (userLevel >= MIN_SELL_LEVEL) setCanSell(true);
        } else {
          console.warn("Có account nhưng chưa tạo Profile -> Coi như khách");
        }

        const productData = await getProducts("all", "newest");
        if (productData.success) {
          setProducts(productData.products);
        }
      } catch (error) {
        console.error("Lỗi hệ thống Shop:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
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
    <main className="min-h-screen bg-[#050505] text-gray-200 pt-5">
      <div className="container mx-auto px-4">
        {/* Tên Trang & Slogan */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[80px] bg-emerald-500/20 blur-[80px] rounded-full" />
          <h1 className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-emerald-500 font-mono tracking-tighter mb-2">
            MARKETPLACE
          </h1>
          <p className="relative text-gray-400 text-sm max-w-md mx-auto border-b border-emerald-500/30 pb-3">
            Giao dịch tài nguyên, bí tịch của Xóm Nhà Lá.
          </p>
        </div>

        {/* Giao Diện Chính - TRUYỀN USER ROLE */}
        <ShopInterface
          initialProducts={products}
          currentUserId={currentUserId}
          canSell={canSell}
          userRole={currentUserRole} // <-- TRUYỀN ROLE VÀO ĐÂY
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Sidebar Đăng Bán - TRUYỀN USER ROLE */}
        {currentUserId && (
          <ProductSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userId={currentUserId}
            userRole={currentUserRole} // <-- TRUYỀN ROLE VÀO ĐÂY
          />
        )}
      </div>
      <ShopAssistant />
    </main>
  );
}
