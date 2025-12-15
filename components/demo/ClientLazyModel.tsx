"use client";
import dynamic from "next/dynamic";

const LazyModel = dynamic(() => import("./LazyModelLoader.client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center text-slate-600 animate-pulse">
      Loading 3D Environment...
    </div>
  ),
});

export default function ClientLazyModel() {
  return <LazyModel />;
}
