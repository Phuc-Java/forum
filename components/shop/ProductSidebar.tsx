"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createProduct } from "../../lib/actions/shop";
import { useRouter } from "next/navigation";
import { getTheme } from "@/lib/shop-theme";
import Image from "next/image";

export default function ProductSidebar({
  isOpen,
  onClose,
  userId,
  userRole = "pham_nhan",
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State form local để live preview
  const [formState, setFormState] = useState({
    name: "",
    price: 0,
    category: "tech",
  });

  const router = useRouter();
  const theme = getTheme(userRole);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("sellerId", userId);
    const res = await createProduct(formData);
    if (res.success) {
      onClose();
      router.refresh();
      setPreviewImage(null);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(`Lỗi: ${res.error}`);
    }
    setIsSubmitting(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[60] h-full w-full sm:w-[600px] bg-[#050505] shadow-[-50px_0_100px_rgba(0,0,0,0.8)] flex flex-col font-mono border-l border-emerald-500/20"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}
              ></div>
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-widest uppercase">
                  <span className="text-3xl">⚒️</span> Khởi Tạo Giao Dịch
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Lò luyện pháp bảo vạn năng
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form
                id="sell-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* PREVIEW CARD MINI */}
                <div className="bg-[#111] p-4 rounded-xl border border-white/5 mb-8">
                  <p className="text-[10px] text-gray-500 uppercase mb-2">
                    Xem trước thẻ bài
                  </p>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-900 rounded-lg overflow-hidden border border-white/10 relative">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-600">
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white line-clamp-1">
                        {formState.name || "Tên Vật Phẩm"}
                      </p>
                      <p
                        className={`text-emerald-400 font-mono font-bold mt-1`}
                      >
                        {new Intl.NumberFormat("vi-VN").format(formState.price)}{" "}
                        đ
                      </p>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 mt-2 inline-block">
                        {formState.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-2 group">
                  <label className="text-xs uppercase tracking-widest font-bold text-emerald-500">
                    Định Danh Pháp Bảo
                  </label>
                  <input
                    required
                    name="name"
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] text-lg font-bold"
                    placeholder="Nhập tên..."
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-emerald-500">
                      Giá Trị (VND)
                    </label>
                    <input
                      required
                      name="price"
                      type="number"
                      className="w-full bg-[#111] border border-white/10 rounded-xl p-4 font-mono font-bold outline-none focus:border-emerald-500 text-xl text-emerald-400"
                      placeholder="0"
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-emerald-500">
                      Loại Hình
                    </label>
                    <select
                      name="category"
                      className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-gray-300 outline-none focus:border-emerald-500 appearance-none h-[60px]"
                      onChange={(e) =>
                        setFormState({ ...formState, category: e.target.value })
                      }
                    >
                      <option value="tech">Công Nghệ</option>
                      <option value="study">Tài Liệu</option>
                      <option value="service">Dịch Vụ</option>
                      <option value="account">Acc/Key</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-emerald-500">
                    Minh Họa (Thumbnail)
                  </label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-8 transition-colors text-center">
                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                      📸
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-emerald-400">
                      Click để tải linh ảnh lên
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-emerald-500">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    required
                    name="description"
                    rows={5}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-gray-300 outline-none focus:border-emerald-500"
                    placeholder="Công năng, nguồn gốc, cách sử dụng..."
                  />
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-white/10 bg-[#0a0a0a]">
              <button
                form="sell-form"
                disabled={isSubmitting}
                type="submit"
                className={`w-full py-5 rounded-xl text-white font-black tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 bg-gradient-to-r ${theme.gradient} hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transform hover:-translate-y-1`}
              >
                {isSubmitting ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <span>🚀 KHẮC TRẬN PHÁP (ĐĂNG)</span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
