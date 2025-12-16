import React from "react";
import { getProducts } from "@/lib/actions/shop";
import ShopGate from "@/components/shop/ShopGate.client";

export default async function ShopPage() {
  const productData = await getProducts("all", "newest");
  const products = productData.success ? productData.products : [];

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

        <ShopGate initialProducts={products} />
      </div>
    </main>
  );
}
