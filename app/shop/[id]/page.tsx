import { getProductById } from "@/lib/actions/shop";
import Link from "next/link";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

// Định nghĩa params là Promise (Chuẩn Next.js 15)
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  // QUAN TRỌNG: Phải await params trước khi dùng
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { product, error } = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono relative overflow-hidden">
        {/* Background 404 đẹp hơn */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505]"></div>
        <div className="z-10 text-center p-8 border border-red-500/20 rounded-3xl bg-black/50 backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.2)]">
          <h1 className="text-8xl mb-2 font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 animate-pulse">
            404
          </h1>
          <div className="h-1 w-24 bg-red-500 mx-auto mb-6"></div>
          <p className="text-red-400 text-lg mb-2 font-bold uppercase tracking-widest">
            Vật phẩm thất lạc
          </p>
          <p className="text-gray-500 mb-8 max-w-md">
            Pháp bảo này có thể đã bị chủ nhân thu hồi hoặc phá hủy bởi thiên
            kiếp.
            <br />
            <span className="text-xs text-red-900 mt-2 block">
              {error ? `Lỗi: ${error}` : "Unknown Error"}
            </span>
          </p>
          <Link
            href="/shop"
            className="px-8 py-3 rounded-xl bg-red-600/10 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold uppercase tracking-wider"
          >
            ← Quay về Chợ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 pt-24 pb-10 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-6 flex items-center gap-2 text-sm font-mono text-gray-500">
          <Link
            href="/shop"
            className="hover:text-emerald-400 transition-colors"
          >
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-emerald-500/50 uppercase">
            {product.category}
          </span>
          <span>/</span>
          <span className="text-gray-300">{product.name}</span>
        </div>

        <ProductDetailClient product={product} />
      </div>
    </main>
  );
}
