"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createProduct } from "../../lib/actions/shop";
import { useRouter } from "next/navigation";

export default function CreateProductModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("sellerId", userId);

    const res = await createProduct(formData);

    if (res.success) {
      onClose();
      router.refresh(); // Reload lại list hàng
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#111] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]"
          >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 flex items-center gap-2">
              🛒 Đăng Bán Pháp Bảo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-emerald-500 mb-1">
                  Tên Vật Phẩm
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="Ví dụ: VPS Siêu Tốc..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-emerald-500 mb-1">
                    Giá (VND/Xu)
                  </label>
                  <input
                    required
                    name="price"
                    type="number"
                    placeholder="100000"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-emerald-500 mb-1">
                    Loại
                  </label>
                  <select
                    name="category"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-gray-300 focus:border-emerald-500 outline-none"
                  >
                    <option value="tech">Công Nghệ</option>
                    <option value="study">Tài Liệu</option>
                    <option value="service">Dịch Vụ</option>
                    <option value="account">Acc/Key</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-500 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  required
                  name="description"
                  rows={3}
                  placeholder="Công năng, tác dụng..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-500 mb-1">
                  Hình ảnh (Thumbnail)
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {isSubmitting ? "Đang khắc trận pháp..." : "Đăng Bán Ngay"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
