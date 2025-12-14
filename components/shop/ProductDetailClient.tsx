"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct } from "@/lib/actions/shop";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "@/lib/actions/shop";

export default function ProductDetailClient({ product }: { product: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    description: product.description,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sellerAvatar, setSellerAvatar] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // States for delete flow
  const [userRole, setUserRole] = useState<string>("no_le");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddingCart, setIsAddingCart] = useState(false);
  const handleBuyNow = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setIsAddingCart(true);
    const res = await addToCart(currentUserId, product.$id);
    if (res.success) {
      router.push("/shop/cart"); // Chuyển hướng sang giỏ hàng
    } else {
      alert(res.error);
    }
    setIsAddingCart(false);
  };

  const handleChat = () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    // Chuyển hướng sang trang chat với ID người bán
    router.push(`/chat?partnerId=${product.sellerId}`);
  };

  const router = useRouter();

  // --- LOGIC FETCH USER & AVATAR ---
  useEffect(() => {
    const initData = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);

        const account = new Account(client);
        const databases = new Databases(client);

        let uid: string | null = null;
        try {
          const user = await account.get();
          uid = user.$id;
          setCurrentUserId(uid);
        } catch {}

        // If we have a logged-in user, load their profile to get role
        if (uid) {
          try {
            const myProfile = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              "profiles",
              [Query.equal("userId", uid), Query.limit(1)]
            );
            if (myProfile.documents.length > 0) {
              setUserRole(myProfile.documents[0].role || "no_le");
            }
          } catch (e) {
            console.error("Error loading my profile:", e);
          }
        }

        if (product.sellerId) {
          const profileRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            "profiles",
            [Query.equal("userId", product.sellerId), Query.limit(1)]
          );
          if (profileRes.documents.length > 0) {
            const raw = profileRes.documents[0].avatarUrl;
            let avatar: string | null = null;
            if (raw && typeof raw === "string") {
              const trimmed = raw.trim();
              if (
                trimmed !== "" &&
                trimmed.toLowerCase() !== "null" &&
                trimmed.toLowerCase() !== "undefined"
              ) {
                if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
                  avatar = trimmed;
                } else {
                  avatar = `/avatars/${trimmed}`;
                }
              }
            }
            setSellerAvatar(avatar);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, [product.sellerId]);

  const isOwner = currentUserId === product.sellerId;

  const handleSave = async () => {
    if (!currentUserId) return;
    setIsSaving(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("description", formData.description);

    const res = await updateProduct(product.$id, data, currentUserId);
    if (res.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert("Lỗi: " + res.error);
    }
    setIsSaving(false);
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!currentUserId) return;
    setIsDeleting(true);
    try {
      const res = await deleteProduct(product.$id, currentUserId);
      if (res.success) {
        router.push("/shop");
        router.refresh();
      } else {
        alert("Lỗi: " + res.error);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Lỗi khi xóa sản phẩm.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Safe Image Parsing
  let images: string[] = ["/placeholder.jpg"];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
  } catch {}

  // Styling Variables
  const isHighValue = product.price > 500000;
  const accentColor = isHighValue ? "amber" : "emerald";
  const glowColor = isHighValue
    ? "shadow-amber-500/20"
    : "shadow-emerald-500/20";
  const borderColor = isHighValue
    ? "border-amber-500/50"
    : "border-emerald-500/50";
  const textColor = isHighValue ? "text-amber-400" : "text-emerald-400";
  const rarityRank = isHighValue ? "THIÊN PHẨM" : "ĐỊA PHẨM";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 animate-in fade-in zoom-in duration-700 pb-20">
      {/* --- LEFT: GALLERY (7 Cols) --- */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Main Viewer */}
        <div
          className={`relative aspect-[16/10] bg-[#0a0a0a] rounded-3xl overflow-hidden border-2 transition-all duration-500 ${borderColor} ${glowColor} shadow-2xl group`}
        >
          {/* Tech Overlays */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-20 mix-blend-overlay"></div>
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute top-4 right-4 z-20 text-[10px] font-mono text-white/50 bg-black/50 px-2 py-1 rounded border border-white/10">
            IMG_SOURCE: {activeImageIndex + 1}/{images.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Price Floating Badge */}
          <div className="absolute bottom-6 right-6 z-30">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl text-right shadow-2xl transform group-hover:-translate-y-2 transition-transform">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                Định Giá
              </p>
              <p
                className={`text-3xl font-mono font-black ${textColor} drop-shadow-md`}
              >
                {new Intl.NumberFormat("vi-VN").format(product.price)} 💎
              </p>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 px-1 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  activeImageIndex === idx
                    ? `${borderColor} scale-105 shadow-lg`
                    : "border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- RIGHT: INFO & ACTIONS (5 Cols) --- */}
      <div className="lg:col-span-5 flex flex-col h-full relative">
        {/* Header Block */}
        <div className="mb-8 border-b border-white/5 pb-8 relative">
          <div className="flex justify-between items-center mb-4">
            <div
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] border rounded-full bg-black/40 backdrop-blur-md ${borderColor} ${textColor}`}
            >
              {rarityRank} - {product.category}
            </div>
            <div className="text-gray-500 text-xs font-mono bg-white/5 px-2 py-1 rounded">
              ID: {product.$id.substring(0, 8)}...
            </div>
          </div>

          {isEditing ? (
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="text-4xl font-black text-white bg-[#111] border border-white/20 rounded-xl p-4 w-full outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          ) : (
            <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight uppercase glitch-hover drop-shadow-2xl">
              {product.name}
            </h1>
          )}

          {/* SELLER IDENTITY CARD */}
          <div className="flex items-center gap-4 mt-4 p-4 bg-[#111]/80 border border-white/5 rounded-2xl hover:bg-[#151515] transition-all cursor-pointer group hover:border-emerald-500/30">
            <div
              className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${borderColor} p-0.5`}
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
                {sellerAvatar ? (
                  <Image
                    src={sellerAvatar}
                    alt={product.sellerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl">
                    👤
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-black animate-pulse"></div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">
                Đạo Hữu Bán
              </p>
              <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                {product.sellerName}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  VERIFIED
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* RPG Stats Block */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">
                Độ Tin Cậy
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-full bg-emerald-500 rounded-full opacity-80 shadow-[0_0_8px_#10b981]"
                  ></div>
                ))}
              </div>
            </div>
            <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">
                Tình trạng kho
              </p>
              <p className="text-sm text-white font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                Sẵn sàng giao dịch
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="flex-1 min-h-[200px] mb-8 relative">
          <h3
            className={`text-xs font-bold ${textColor} uppercase tracking-widest mb-4 flex items-center gap-2`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isHighValue ? "bg-amber-500" : "bg-emerald-500"
              }`}
            ></span>
            Nội dung chi tiết
          </h3>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={10}
              className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl p-5 text-gray-300 outline-none focus:border-emerald-500 font-mono text-sm leading-relaxed"
            />
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-gray-400 font-mono leading-relaxed bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-inner h-full overflow-y-auto custom-scrollbar">
              {product.description}
            </div>
          )}
        </div>

        {/* Action Buttons (with delete flow) */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          {/* BUTTONS CHO CHỦ SỞ HỮU */}
          {isOwner ? (
            isEditing ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {isSaving ? "Đang khắc..." : "Lưu Thay Đổi"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 text-white font-bold"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 group"
              >
                <span className="group-hover:rotate-12 transition-transform">
                  ✏️
                </span>{" "}
                Chỉnh sửa vật phẩm
              </button>
            )
          ) : (
            // BUTTONS CHO KHÁCH
            // BUTTONS CHO KHÁCH
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isAddingCart}
                className={`w-full py-5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:bg-size-200 text-white rounded-xl font-black text-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group bg-[length:200%_auto] disabled:opacity-70`}
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></span>
                <span>
                  {isAddingCart
                    ? "Đang thu nạp..."
                    : "🔮 THỈNH VỀ NGAY (Giỏ Hàng)"}
                </span>
              </button>

              <button
                onClick={handleChat}
                className="w-full py-4 bg-[#0a0a0a] hover:bg-[#151515] border border-white/10 rounded-xl font-bold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 hover:border-white/30"
              >
                <span>💬</span> Truyền âm cho chủ quán
              </button>
            </div>
          )}

          {/* NÚT XÓA DÀNH RIÊNG CHO CHÍ TÔN (HOẶC CHỦ SỞ HỮU) */}
          {(userRole === "chi_ton" || isOwner) && !isEditing && (
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-all"
              >
                🗑️ HỦY DIỆT VẬT PHẨM{" "}
                {userRole === "chi_ton" && "(QUYỀN CHÍ TÔN)"}
              </button>
            </div>
          )}
        </div>

        {/* MODAL XÁC NHẬN XÓA */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f0f0f] border border-red-500/30 p-8 rounded-2xl max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50 animate-pulse">
                  ⚠️
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                  Xác nhận hủy diệt?
                </h3>
                <p className="text-gray-400 mb-8 font-mono text-sm">
                  Hành động này sẽ xóa vĩnh viễn{" "}
                  <span className="text-white font-bold">{product.name}</span>{" "}
                  khỏi Tàng Kinh Các. Không thể khôi phục!
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-bold transition-all"
                  >
                    Suy nghĩ lại
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? "Đang xóa..." : "XÓA NGAY"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
