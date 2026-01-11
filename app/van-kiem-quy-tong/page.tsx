"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import SwordTerminalLoader from "./SwordTerminalLoader";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. CHỦ ĐỘNG YÊU CẦU QUYỀN CAMERA TỪ TRANG MẸ
    const requestCameraAtParent = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);
        // Sau khi xin được quyền, đóng stream ngay để nhường camera cho iframe
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Camera bị từ chối hoặc lỗi:", err);
      }
    };

    requestCameraAtParent();

    // Khóa body
    document.body.style.overflow = "hidden";
    document.body.style.background = "#000";

    return () => {
      document.body.style.overflow = "";
      document.body.style.background = "";
    };
  }, []);

  return (
    <div id="page-wrapper">
      <AnimatePresence mode="wait">
        {isLoading && (
          <SwordTerminalLoader onFinished={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading &&
        mounted &&
        createPortal(
          <div
            id="isolated-game-layer"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              backgroundColor: "#000",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {/* QUAN TRỌNG: 
                - allow="camera *; ..." cho phép mọi nguồn trong iframe dùng camera.
                - src cần có thêm tham số tốn thời gian để đảm bảo iframe load sau khi có quyền.
            */}
              <iframe
                src="https://phuc-tien-nhan.vercel.app"
                title="van-kiem-quy-tong-isolated"
                scrolling="no"
                allow="camera *; microphone *; autoplay; fullscreen; accelerometer; gyroscope"
                style={{
                  border: "none",
                  width: "100%",
                  height: "100%",
                  display: "block",
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                }}
              />

              {/* Vignette Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 1,
                  background:
                    "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 100%)",
                  transform: "translate3d(0, 0, 0)",
                }}
              />

              {/* Thông báo nếu chưa bật camera (Tùy chọn) */}
              {!hasCameraPermission && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    color: "#ff4d4d",
                    background: "rgba(0,0,0,0.7)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  Vui lòng cho phép truy cập Camera để bắt đầu bí cảnh
                </div>
              )}
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
