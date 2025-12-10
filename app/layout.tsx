import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components";

// Be Vietnam Pro - Sans-serif tiếng Việt cho body text
const beVietnamPro = localFont({
  src: [
    {
      path: "../public/font/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/font/Be_Vietnam_Pro/BeVietnamPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

// Playfair Display - Serif cho headings
const playfairDisplay = localFont({
  src: [
    {
      path: "../public/font/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../public/font/Playfair_Display/PlayfairDisplay-Italic-VariableFont_wght.ttf",
      weight: "400 900",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

// Xanh Mono - Monospace tiếng Việt cho code/terminal
const xanhMono = localFont({
  src: [
    {
      path: "../public/font/Xanh_Mono/XanhMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/Xanh_Mono/XanhMono-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xóm Nhà Lá - Cộng Đồng Cyberpunk",
  description:
    "Diễn đàn ẩn danh phong cách Cyberpunk - Kết nối, chia sẻ, bảo mật",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} ${playfairDisplay.variable} ${xanhMono.variable} antialiased scanline`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
