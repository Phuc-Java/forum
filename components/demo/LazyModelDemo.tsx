"use client";
import React from "react";
import ClientLazyModel from "@/components/demo/ClientLazyModel";

export default function LazyModelDemo() {
  return (
    // Bỏ translate-y-12, chỉ giữ lại container full kích thước
    <div className="w-full h-[600px] flex items-center justify-center bg-[#060010] overflow-hidden relative">
      <div className="w-full h-full">
        <ClientLazyModel />
      </div>
    </div>
  );
}
