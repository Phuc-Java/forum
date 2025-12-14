"use client";

import { useEffect, useState } from "react";
import { Client, Account } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import {
  getCartItems,
  removeFromCart,
  getUserBalance,
  processCheckout,
} from "@/lib/actions/shop";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CartItem {
  $id: string;
  quantity: number;
  product: {
    $id: string;
    name: string;
    price: number;
    images: string;
    sellerName: string;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // --- STATE CHO UI MỚI ---
  const [showConfirm, setShowConfirm] = useState(false); // Hiện bảng xác nhận
  const [showSuccess, setShowSuccess] = useState(false); // Hiện bảng thành công

  useEffect(() => {
    const initData = async () => {
      const client = new Client()
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId);
      const account = new Account(client);

      try {
        const user = await account.get();
        setCurrentUserId(user.$id);

        const [cartRes, balanceRes] = await Promise.all([
          getCartItems(user.$id),
          getUserBalance(user.$id),
        ]);

        if (cartRes.success)
          setItems(
            cartRes.items.map((it: any) => ({
              ...(it as any),
              quantity: (it as any).quantity ?? 1,
            }))
          );
        if (balanceRes.success) setBalance(balanceRes.balance);
      } catch (error) {
        console.error("Chưa đăng nhập");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [items]);

  const handleRemove = async (cartId: string) => {
    setItems((prev) => prev.filter((item) => item.$id !== cartId));
    await removeFromCart(cartId);
  };

  // --- LOGIC XỬ LÝ MỚI ---
  const handlePreCheckout = () => {
    if (!currentUserId) return;
    if (balance < totalPrice) {
      alert(
        `Đạo hữu không đủ Linh Thạch! Cần thêm ${totalPrice - balance} 💎.`
      );
      return;
    }
    // Thay vì confirm(), ta mở Modal
    setShowConfirm(true);
  };

  const confirmPayment = async () => {
    if (!currentUserId) return;

    setIsProcessing(true);
    const res = await processCheckout(currentUserId);

    if (res.success) {
      setItems([]);
      if (typeof res.newBalance === "number") setBalance(res.newBalance);
      setShowConfirm(false); // Tắt bảng xác nhận
      setShowSuccess(true); // Hiện bảng thành công
    } else {
      alert(res.error);
      setShowConfirm(false);
    }
    setIsProcessing(false);
  };

  const getImageUrl = (jsonImages: string) => {
    try {
      const parsed = JSON.parse(jsonImages);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed[0]
        : "/placeholder.jpg";
    } catch {
      return "/placeholder.jpg";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#a855f7]"></div>
        <p className="text-purple-400 font-mono tracking-[0.2em] animate-pulse">
          ĐANG THẨM ĐỊNH LINH LỰC...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-mono relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              🎒
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest">
                Túi Trữ Vật
              </h1>
              <p className="text-gray-500 text-xs">
                Kho chứa pháp bảo chờ thanh toán
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#111] border border-emerald-500/30 px-5 py-3 rounded-full shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
            <span className="text-xs text-gray-400 uppercase font-bold">
              Số dư:
            </span>
            <span className="text-emerald-400 font-black text-xl flex items-center gap-1">
              {balance.toLocaleString()} 💎
            </span>
            <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-colors">
              +
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]">
            <div className="text-8xl mb-6 grayscale opacity-30 animate-float">
              🕸️
            </div>
            <h3 className="text-xl text-white font-bold mb-2">
              Túi trống rỗng!
            </h3>
            <p className="text-gray-500 mb-8 max-w-md text-center">
              Đạo hữu chưa thu thập pháp bảo nào. Hãy quay lại Tàng Kinh Các để
              tìm kiếm cơ duyên.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 group"
            >
              <span>🛒 Quay về Chợ</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.$id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                    className="flex gap-5 p-4 bg-[#111] border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="w-28 h-28 bg-black rounded-xl relative overflow-hidden flex-shrink-0 border border-white/10 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
                      <Image
                        src={getImageUrl(item.product.images)}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    <div className="flex-1 flex flex-col py-1 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-500 text-xs flex items-center gap-2">
                            Người bán:{" "}
                            <span className="text-gray-300">
                              {item.product.sellerName}
                            </span>
                          </p>
                        </div>
                        <p className="text-emerald-400 font-mono font-bold text-lg drop-shadow-md">
                          {item.product.price.toLocaleString()} 💎
                        </p>
                      </div>

                      <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex items-center gap-3 bg-black/50 rounded-lg px-2 py-1 border border-white/5">
                          <span className="text-xs text-gray-500 uppercase font-bold">
                            Số lượng
                          </span>
                          <span className="w-px h-3 bg-white/10"></span>
                          <span className="text-white font-mono font-bold">
                            {item.quantity}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemove(item.$id)}
                          className="text-red-500/70 hover:text-red-400 text-xs font-bold hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 group/del"
                        >
                          <span className="group-hover/del:animate-bounce">
                            🗑️
                          </span>{" "}
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-[#111]/90 backdrop-blur-xl border border-purple-500/20 p-6 rounded-3xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <span className="text-2xl">📜</span> Tổng kết giao dịch
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Tổng vật phẩm:</span>
                    <span className="text-white font-mono">{items.length}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-300 font-bold">Thành tiền:</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
                      {totalPrice.toLocaleString()} 💎
                    </span>
                  </div>

                  {balance < totalPrice && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 mt-2 flex items-center gap-2">
                      ⚠️ Thiếu {(totalPrice - balance).toLocaleString()} 💎
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePreCheckout} // Đổi thành hàm mở modal
                  disabled={isProcessing || balance < totalPrice}
                  className={`w-full py-4 rounded-xl font-black text-white text-lg tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group 
                    ${
                      balance < totalPrice
                        ? "bg-gray-800 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-1 active:scale-95 shadow-emerald-900/40"
                    }`}
                >
                  <span>THANH TOÁN</span>
                  <span className="text-xl">✨</span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-600">
                  <span>🔒 Bảo mật tuyệt đối bởi</span>
                  <span className="font-bold text-gray-500">Xóm Nhà Lá</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* 👇 2 UI MỚI: MODAL XÁC NHẬN & MODAL THÀNH CÔNG 👇 */}
      {/* ================================================= */}

      <AnimatePresence>
        {/* 1. Modal Xác Nhận (Confirmation) */}
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => !isProcessing && setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden"
            >
              {/* Trang trí nền */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none"></div>

              <div className="text-center mb-6 relative z-10">
                <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50 animate-pulse">
                  <span className="text-4xl">📜</span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                  Xác Nhận Giao Dịch
                </h3>
                <p className="text-gray-400 text-sm">
                  Đạo hữu có chắc chắn muốn chi tiêu?
                </p>
              </div>

              <div className="bg-[#111] rounded-xl p-4 mb-8 border border-white/5 relative z-10">
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span>Tổng thiệt hại:</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono text-center">
                  {totalPrice.toLocaleString()} 💎
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 font-bold transition-all"
                >
                  Suy nghĩ lại
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>⏳ Đang khắc trận...</span>
                  ) : (
                    <>
                      <span>CHỐT ĐƠN</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Modal Thành Công (Success) */}
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#050505] border border-emerald-500/50 rounded-3xl p-8 text-center shadow-[0_0_100px_rgba(16,185,129,0.3)]"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_#10b981]"
              >
                <svg
                  className="w-12 h-12 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h2 className="text-3xl font-black text-white uppercase mb-2">
                Thành Công!
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Pháp bảo đã được chuyển vào túi của đạo hữu.
              </p>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
              >
                TUYỆT VỜI
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
