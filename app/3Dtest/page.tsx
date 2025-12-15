"use client";

import React, { useEffect, useState } from "react";
// --- APPWRITE IMPORTS ---
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// ❌ BỎ IMPORT CŨ: import { AccessDeniedOverlay } from "@/components/shop/AccessDenied";
// ✅ IMPORT MỚI: Overlay Trân Tàng dành riêng cho trang này
import { TreasureAccessDenied } from "./TreasureAccessDenied";

import { RoleType } from "@/lib/roles"; // Import type từ role.ts để type safe

// --- COMPONENTS GIAO DIỆN CHÍNH ---
import { PortfolioUI } from "@/components/ui/portfolio-ui";
import InteractiveDemoSection from "@/components/interactive-demo-section";

// --- CẤU HÌNH ROLE ĐƯỢC PHÉP (LEVEL >= 3) ---
const ALLOWED_ROLES: RoleType[] = ["chi_cuong_gia", "thanh_nhan", "chi_ton"];

export default function Page() {
  // --- 1. STATE QUẢN LÝ QUYỀN HẠN ---
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  // --- 2. LOGIC CHECK QUYỀN (GIỮ NGUYÊN) ---
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Init Appwrite
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);

        const account = new Account(client);
        const databases = new Databases(client);

        // Lấy user hiện tại
        const user = await account.get();
        if (!user) throw new Error("Chưa đăng nhập");

        // Lấy Profile để xem Role
        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", user.$id)]
        );

        if (profileRes.documents.length > 0) {
          const profile = profileRes.documents[0];
          const userRole = (profile.role as RoleType) || "no_le";

          console.log(
            `[Trân Tàng] User: ${profile.displayName} - Role: ${userRole}`
          );

          // Kiểm tra xem Role có nằm trong danh sách cho phép không
          if (ALLOWED_ROLES.includes(userRole)) {
            setAccessGranted(true);
          } else {
            setAccessGranted(false);
          }
        } else {
          // Có acc nhưng không có profile
          setAccessGranted(false);
        }
      } catch (error) {
        console.error("Lỗi xác thực Trân Tàng Các:", error);
        setAccessGranted(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  // --- 3. MÀN HÌNH LOADING (HIỆU ỨNG TU TIÊN - GIỮ NGUYÊN) ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
        <div className="relative">
          {/* Hiệu ứng vòng xoay bát quái/loading */}
          <div className="w-20 h-20 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.4)]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            🔮
          </div>
        </div>
        <p className="mt-6 text-purple-400 font-mono text-xs tracking-[0.2em] animate-pulse uppercase">
          Đang mở kết giới Trân Tàng...
        </p>
      </div>
    );
  }

  // --- 4. MÀN HÌNH TỪ CHỐI (DÙNG COMPONENT MỚI) ---
  if (!accessGranted) {
    // ✅ THAY ĐỔI Ở ĐÂY: Dùng TreasureAccessDenied thay vì AccessDeniedOverlay
    return <TreasureAccessDenied minRole="Chí Cường Giả" />;
  }

  // --- 5. NỘI DUNG CHÍNH (KHI CÓ QUYỀN - GIỮ NGUYÊN) ---
  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white relative selection:bg-purple-500/30">
        {/* LAYER 1: 3D Model Environment */}

        {/* LAYER 2: Main UI Overlay */}
        <section className="relative z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <PortfolioUI />
          </div>
        </section>

        <div className="relative z-30 bg-[#050505]">
          <InteractiveDemoSection />
        </div>

        {/* Footer Decoration */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 text-xs text-slate-500 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></span>
            System: Secure | Access Level: 3+ | Trân Tàng Các
          </div>
        </div>
      </main>
    </>
  );
}
