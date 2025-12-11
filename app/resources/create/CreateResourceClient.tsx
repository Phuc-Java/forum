"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
} from "@/lib/types/resources";
import { createResource } from "@/lib/actions/resources";
import { ROLES, type RoleType } from "@/lib/roles";

interface UserData {
  id: string;
  name: string;
  displayName: string;
  role: string;
}

interface CreateResourceClientProps {
  initialCategory: ResourceCategoryId;
  categories: typeof RESOURCE_CATEGORIES;
  userData: UserData; // Now required from server
}

export default function CreateResourceClient({
  initialCategory,
  categories,
  userData,
}: CreateResourceClientProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // User data now comes from server - no loading state needed
  const [uploadingFile, setUploadingFile] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategoryId>(initialCategory);
  const [tags, setTags] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<RoleType[]>([]); // Multi-select: exact match roles
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [contentSize, setContentSize] = useState(0);

  // Update content size when content changes
  const updateContentSize = () => {
    if (contentRef.current) {
      setContentSize(contentRef.current.innerHTML.length);
    }
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const icons: Record<string, string> = {
      // Documents
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      txt: "📄",
      rtf: "📄",
      // Spreadsheets
      xls: "📗",
      xlsx: "📗",
      csv: "📊",
      // Presentations
      ppt: "📙",
      pptx: "📙",
      // Archives
      zip: "🗜️",
      rar: "🗜️",
      "7z": "🗜️",
      tar: "🗜️",
      gz: "🗜️",
      // Code
      js: "💛",
      ts: "💙",
      jsx: "⚛️",
      tsx: "⚛️",
      html: "🌐",
      css: "🎨",
      json: "📋",
      py: "🐍",
      java: "☕",
      // Apps
      exe: "⚙️",
      msi: "⚙️",
      apk: "📱",
      dmg: "🍎",
      // Media
      mp3: "🎵",
      wav: "🎵",
      mp4: "🎬",
      avi: "🎬",
      mkv: "🎬",
      // Images
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      svg: "🖼️",
      webp: "🖼️",
    };
    return icons[ext] || "📁";
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Toggle role selection (multi-select for exact match)
  const toggleRole = (role: RoleType) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Handle paste image
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // Convert to base64 for now (in production, upload to storage)
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            // Insert image with float left (wrap text)
            contentRef.current?.focus();
            const imageHtml = `<img src="${base64}" alt="${file.name}" style="float: left; max-width: 50%; height: auto; margin: 0 16px 16px 0; border-radius: 8px;" />`;
            document.execCommand("insertHTML", false, imageHtml);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Insert image with float left (wrap text) by default
      contentRef.current?.focus();
      const imageHtml = `<img src="${base64}" alt="${file.name}" style="float: left; max-width: 50%; height: auto; margin: 0 16px 16px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />`;
      document.execCommand("insertHTML", false, imageHtml);
      setUploadingFile(false);
    };
    reader.onerror = () => {
      setError("Không thể đọc file ảnh");
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  // Handle file selection (for download)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const file = files[0];
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    const fileIcon = getFileIcon(fileName);
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Insert compact download button into editor
      contentRef.current?.focus();
      const downloadHtml = `<a href="${base64}" download="${fileName}" class="inline-flex items-center gap-2 px-3 py-2 my-1 bg-surface border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group" contenteditable="false"><span class="text-lg">${fileIcon}</span><span class="font-mono text-sm text-foreground/80 group-hover:text-primary">${fileName}</span><span class="text-xs text-foreground/40 px-1.5 py-0.5 bg-background rounded">${ext}</span><span class="text-xs text-foreground/50">${fileSize}</span></a>&nbsp;`;
      document.execCommand("insertHTML", false, downloadHtml);
      setUploadingFile(false);
    };
    reader.onerror = () => {
      setError("Không thể đọc file");
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  // Compress image to reduce size (for thumbnail)
  const compressImage = (
    file: File,
    maxWidth: number = 400,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with compression
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Handle thumbnail selection - with compression
  const handleThumbnailSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh cho thumbnail");
      return;
    }

    try {
      // Compress thumbnail to reduce size (max 800px width, 80% quality for better quality)
      const compressed = await compressImage(file, 800, 0.8);

      // Check if still too large (max 900KB for 1MB limit in Appwrite)
      if (compressed.length > 900000) {
        // Try more aggressive compression
        const moreCompressed = await compressImage(file, 600, 0.6);
        if (moreCompressed.length > 900000) {
          setError("Ảnh thumbnail quá lớn. Vui lòng chọn ảnh nhỏ hơn (< 1MB)");
          return;
        }
        setThumbnail(moreCompressed);
        setThumbnailPreview(moreCompressed);
      } else {
        setThumbnail(compressed);
        setThumbnailPreview(compressed);
      }
    } catch {
      setError("Không thể xử lý ảnh thumbnail");
    }

    // Reset input
    e.target.value = "";
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }

    const content = contentRef.current?.innerHTML || "";
    if (!content.trim() || content === "<br>") {
      setError("Vui lòng nhập nội dung");
      return;
    }

    // Check content length - Appwrite has limit
    // VPS 180GB: Set 'content' attribute in Appwrite to 200000000 (200 million chars = ~200MB)
    const MAX_CONTENT_LENGTH = 200000000; // 200 million chars (~200MB) - VPS mạnh
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(
        `Nội dung quá dài (${(content.length / 1000000).toFixed(
          1
        )}MB). Giới hạn: ${(MAX_CONTENT_LENGTH / 1000000).toFixed(0)}MB`
      );
      return;
    }

    setSubmitting(true);

    const result = await createResource(
      {
        title: title.trim(),
        content,
        category,
        tags: tags.trim() || undefined,
        // Store as JSON array for exact match
        // Empty array "[]" means ADMIN ONLY, undefined means no restriction
        allowedRoles: JSON.stringify(allowedRoles), // Always send JSON array (even if empty)
        thumbnail: thumbnail.trim() || undefined,
        isPublished,
      },
      userData.id,
      userData.displayName
    );

    if (result.success) {
      router.push(`/resources/${result.resourceId}`);
    } else {
      setError(result.error || "Không thể tạo bài viết");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-3">
              ✍️ Đăng Bài Mới
            </h1>
            <p className="text-foreground/60 font-mono text-sm mt-1">
              Chia sẻ kiến thức và tài nguyên với cộng đồng
            </p>
          </div>
          <Link
            href="/resources"
            className="px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-foreground/70 hover:border-primary/50 transition-colors"
          >
            ← Quay lại
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/50 rounded-xl text-danger font-mono text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
            <label className="block text-sm font-mono text-foreground/60 mb-2">
              Tiêu đề <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-3 bg-background border border-border rounded-xl font-mono text-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
              maxLength={500}
            />
            <p className="text-xs font-mono text-foreground/40 mt-2 text-right">
              {title.length}/500
            </p>
          </div>

          {/* Category & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
              <label className="block text-sm font-mono text-foreground/60 mb-3">
                Danh mục <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(categories).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as ResourceCategoryId)}
                    className={`px-4 py-3 rounded-xl font-mono text-sm text-left transition-all flex items-center gap-3 ${
                      category === cat.id
                        ? `${cat.bgColor} ${cat.borderColor} border ${cat.color}`
                        : "bg-background/50 border border-border text-foreground/70 hover:border-foreground/30"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Allowed Roles - Multi select (Exact Match) */}
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
                <label className="block text-sm font-mono text-foreground/60 mb-3">
                  🔒 Giới hạn quyền xem (Chọn chính xác)
                </label>
                <p className="text-xs font-mono text-foreground/40 mb-4">
                  Không chọn gì = Ai cũng xem được. Chọn các role được phép xem.
                  <br />
                  <strong className="text-amber-400">Lưu ý:</strong> CHỈ những
                  role được chọn mới xem được (ngoại trừ Admin luôn có quyền).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(ROLES).map((role) => {
                    const isSelected = allowedRoles.includes(role.id);
                    const isAdmin = role.id === "chi_ton";
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleRole(role.id)}
                        disabled={isAdmin} // Admin always has access
                        className={`px-4 py-3 rounded-xl font-mono text-sm text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? `${role.bgColor} ${role.borderColor} border-2 ${role.color}`
                            : isAdmin
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400/60 cursor-not-allowed"
                            : "bg-background border border-border text-foreground/60 hover:border-primary/30"
                        }`}
                      >
                        <span className="text-lg">{role.icon}</span>
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-xs opacity-60">
                            {isAdmin ? "Luôn có quyền" : `Level ${role.level}`}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="ml-auto text-lg">✓</span>
                        )}
                        {isAdmin && !isSelected && (
                          <span className="ml-auto text-xs">👑 Auto</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {allowedRoles.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-xs font-mono text-amber-400">
                      🔒 CHỈ những role sau được xem:{" "}
                      <strong>
                        {allowedRoles.map((r) => ROLES[r].name).join(", ")}
                      </strong>{" "}
                      (+ Admin)
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
                <label className="block text-sm font-mono text-foreground/60 mb-2">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, NextJS, Tutorial..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Thumbnail */}
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
                <label className="block text-sm font-mono text-foreground/60 mb-2">
                  Thumbnail (tùy chọn)
                </label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />

                {thumbnailPreview ? (
                  <div className="relative group">
                    <div
                      className="w-full h-32 rounded-xl border border-border bg-cover bg-center"
                      style={{ backgroundImage: `url(${thumbnailPreview})` }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="px-3 py-1.5 bg-primary/80 rounded-lg text-xs font-mono text-background"
                      >
                        Đổi ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail("");
                          setThumbnailPreview("");
                        }}
                        className="px-3 py-1.5 bg-danger/80 rounded-lg text-xs font-mono text-white"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <span className="text-2xl">🖼️</span>
                    <span className="text-xs font-mono text-foreground/50">
                      Click để chọn ảnh thumbnail
                    </span>
                  </button>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-mono text-foreground/60">
                    Xuất bản ngay
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isPublished ? "bg-primary" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isPublished ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-surface/60 backdrop-blur-md border border-border rounded-2xl p-6">
            <label className="block text-sm font-mono text-foreground/60 mb-3">
              Nội dung <span className="text-danger">*</span>
            </label>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Editor Toolbar - Row 1: Text Formatting */}
            <div className="flex flex-wrap items-center gap-1 mb-2 p-2 bg-background/50 border border-border/50 rounded-lg">
              {/* Text Style */}
              <button
                type="button"
                onClick={() => document.execCommand("bold")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Bold (Ctrl+B)"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("italic")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Italic (Ctrl+I)"
              >
                <span className="italic">I</span>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("underline")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Underline (Ctrl+U)"
              >
                <span className="underline">U</span>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("strikeThrough")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Strikethrough"
              >
                <span className="line-through">S</span>
              </button>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Text Color - 10 Popular Colors Bar */}
              <div className="flex items-center gap-0.5 px-1 py-1 bg-background/50 rounded-lg border border-border/30">
                <span className="text-xs text-foreground/40 px-1 font-mono">
                  A
                </span>
                {[
                  { color: "#ffffff", name: "Trắng" },
                  { color: "#ff0000", name: "Đỏ" },
                  { color: "#ff9900", name: "Cam" },
                  { color: "#ffff00", name: "Vàng" },
                  { color: "#00ff00", name: "Xanh lá" },
                  { color: "#00ffff", name: "Cyan" },
                  { color: "#0099ff", name: "Xanh dương" },
                  { color: "#9933ff", name: "Tím" },
                  { color: "#ff00ff", name: "Hồng" },
                  { color: "#888888", name: "Xám" },
                ].map(({ color, name }) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      document.execCommand("foreColor", false, color)
                    }
                    className="w-5 h-5 rounded-sm border border-white/20 hover:scale-125 hover:z-10 transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>

              {/* Highlight - Color Bar */}
              <div className="flex items-center gap-0.5 px-1 py-1 bg-background/50 rounded-lg border border-border/30">
                <span className="text-xs text-foreground/40 px-1">🖍️</span>
                {[
                  { color: "#ffff00", name: "Vàng" },
                  { color: "#00ff00", name: "Xanh lá" },
                  { color: "#00ffff", name: "Cyan" },
                  { color: "#ff99cc", name: "Hồng" },
                  { color: "#ff9900", name: "Cam" },
                  { color: "#cc99ff", name: "Tím" },
                ].map(({ color, name }) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      document.execCommand("hiliteColor", false, color)
                    }
                    className="w-5 h-5 rounded-sm border border-black/20 hover:scale-125 hover:z-10 transition-all"
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    document.execCommand("hiliteColor", false, "transparent")
                  }
                  className="w-5 h-5 rounded-sm border border-border bg-background hover:scale-125 transition-all flex items-center justify-center"
                  title="Xóa highlight"
                >
                  <span className="text-[10px] text-foreground/50">✕</span>
                </button>
              </div>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Alignment */}
              <button
                type="button"
                onClick={() => document.execCommand("justifyLeft")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Căn trái"
              >
                ≡←
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyCenter")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Căn giữa"
              >
                ≡⊙
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyRight")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Căn phải"
              >
                →≡
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("justifyFull")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Căn đều"
              >
                ≡≡
              </button>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Clear Formatting */}
              <button
                type="button"
                onClick={() => document.execCommand("removeFormat")}
                className="p-2 hover:bg-danger/20 rounded text-foreground/70 hover:text-danger transition-colors text-xs"
                title="Xóa định dạng"
              >
                ✕F
              </button>
            </div>

            {/* Editor Toolbar - Row 2: Insert & Structure */}
            <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-background/50 border border-border/50 rounded-lg">
              {/* Headings */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    document.execCommand("formatBlock", false, e.target.value);
                  }
                  e.target.value = "";
                }}
                className="px-2 py-1.5 bg-background border border-border rounded text-xs font-mono text-foreground/70 hover:border-primary/50 focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  Heading
                </option>
                <option value="h1">H1 - Tiêu đề lớn</option>
                <option value="h2">H2 - Tiêu đề</option>
                <option value="h3">H3 - Tiêu đề nhỏ</option>
                <option value="p">Đoạn văn</option>
              </select>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Lists */}
              <button
                type="button"
                onClick={() => document.execCommand("insertUnorderedList")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Danh sách dấu chấm"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("insertOrderedList")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Danh sách số"
              >
                1.
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("indent")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Thụt lề"
              >
                →|
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("outdent")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Giảm thụt lề"
              >
                |←
              </button>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Quote */}
              <button
                type="button"
                onClick={() =>
                  document.execCommand("formatBlock", false, "blockquote")
                }
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Quote"
              >
                ❝
              </button>

              {/* Horizontal Line */}
              <button
                type="button"
                onClick={() => document.execCommand("insertHorizontalRule")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Đường kẻ ngang"
              >
                ─
              </button>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Insert Media */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors disabled:opacity-50"
                title="Chèn hình ảnh"
              >
                {uploadingFile ? "⏳" : "🖼️"}
              </button>

              {/* Image with text wrap */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt(
                    "Nhập URL hình ảnh (hoặc dùng nút 🖼️ để chọn từ máy):"
                  );
                  if (url) {
                    const align = prompt(
                      "Chọn vị trí: left, right, center",
                      "left"
                    );
                    const floatStyle =
                      align === "center"
                        ? "display:block;margin:0 auto"
                        : `float:${align};margin:${
                            align === "left" ? "0 1rem 1rem 0" : "0 0 1rem 1rem"
                          }`;
                    document.execCommand(
                      "insertHTML",
                      false,
                      `<img src="${url}" alt="image" style="${floatStyle};max-width:300px;border-radius:0.5rem" />`
                    );
                  }
                }}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Chèn ảnh với text wrap"
              >
                📐
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = prompt("Nhập URL link:");
                  if (url) {
                    const text = prompt("Nhập text hiển thị:") || url;
                    document.execCommand(
                      "insertHTML",
                      false,
                      `<a href="${url}" target="_blank" class="text-primary underline">${text}</a>`
                    );
                  }
                }}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Chèn link"
              >
                🔗
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors disabled:opacity-50"
                title="Chèn file tải về"
              >
                {uploadingFile ? "⏳" : "📁"}
              </button>

              <button
                type="button"
                onClick={() => {
                  document.execCommand(
                    "insertHTML",
                    false,
                    `<pre class="bg-background/80 border border-border rounded-lg p-3 my-2 font-mono text-sm overflow-x-auto"><code>// Code here</code></pre>`
                  );
                }}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Chèn code block"
              >
                {"</>"}
              </button>

              {/* Table */}
              <button
                type="button"
                onClick={() => {
                  const rows = prompt("Số hàng:", "3");
                  const cols = prompt("Số cột:", "3");
                  if (rows && cols) {
                    let table =
                      '<table class="w-full border-collapse my-4"><tbody>';
                    for (let i = 0; i < parseInt(rows); i++) {
                      table += "<tr>";
                      for (let j = 0; j < parseInt(cols); j++) {
                        table +=
                          '<td class="border border-border p-2 min-w-[100px]">&nbsp;</td>';
                      }
                      table += "</tr>";
                    }
                    table += "</tbody></table>";
                    document.execCommand("insertHTML", false, table);
                  }
                }}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors text-xs"
                title="Chèn bảng"
              >
                ⊞
              </button>

              <div className="w-px h-6 bg-border/50 mx-1"></div>

              {/* Undo/Redo */}
              <button
                type="button"
                onClick={() => document.execCommand("undo")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Hoàn tác (Ctrl+Z)"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => document.execCommand("redo")}
                className="p-2 hover:bg-primary/20 rounded text-foreground/70 hover:text-primary transition-colors"
                title="Làm lại (Ctrl+Y)"
              >
                ↷
              </button>
            </div>

            <p className="text-xs font-mono text-foreground/40 mb-3">
              💡 Mẹo: Paste hình ảnh trực tiếp (Ctrl+V) hoặc dùng toolbar bên
              trên để thêm nội dung
            </p>
            <div
              ref={contentRef}
              contentEditable
              onPaste={handlePaste}
              onInput={updateContentSize}
              onBlur={updateContentSize}
              className="w-full min-h-[400px] px-4 py-3 bg-background border border-border rounded-xl font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 overflow-auto prose prose-invert max-w-none"
              style={{ whiteSpace: "pre-wrap" }}
            />
            {/* Content size indicator */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-mono text-foreground/40">
                {contentSize > 0 && (
                  <span
                    className={
                      contentSize > 190000000
                        ? "text-danger"
                        : contentSize > 150000000
                        ? "text-amber-400"
                        : ""
                    }
                  >
                    📊 Kích thước: {(contentSize / 1000000).toFixed(2)} MB
                    {contentSize > 150000000 && " ⚠️ Gần giới hạn!"}
                  </span>
                )}
              </p>
              <p className="text-xs font-mono text-foreground/30">
                Giới hạn: 200 MB
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/resources"
              className="px-6 py-3 bg-surface border border-border rounded-xl font-mono text-sm text-foreground/70 hover:bg-background transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-primary/20 border border-primary/50 rounded-xl font-mono text-sm text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  Đang đăng...
                </>
              ) : (
                <>
                  <span>✨</span>
                  {isPublished ? "Đăng bài" : "Lưu nháp"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
