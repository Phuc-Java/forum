"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, register, getCurrentUser } from "@/lib/appwrite/client";
import { createProfile } from "@/lib/actions/profile";

type FormMode = "login" | "register";

interface FormState {
  error?: string;
  success?: boolean;
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [state, setState] = useState<FormState>({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  // Check if already logged in
  useEffect(() => {
    const check = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push("/");
        router.refresh();
      } else {
        setChecking(false);
      }
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setState({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (mode === "login") {
      const result = await login(email, password);
      if (result.success) {
        setState({ success: true });
        // Use window.location for hard redirect to ensure session is properly recognized
        window.location.href = "/";
      } else {
        setState({ error: result.error });
        setLoading(false);
      }
    } else {
      const name = formData.get("name") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setState({ error: "Mật khẩu xác nhận không khớp" });
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setState({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
        setLoading(false);
        return;
      }

      const result = await register(email, password, name);
      if (result.success && result.user) {
        // Auto create profile for new user
        await createProfile(result.user.$id, name || email.split("@")[0]);
        setState({ success: true });
        // Use window.location for hard redirect to ensure session is properly recognized
        window.location.href = "/";
      } else {
        setState({ error: result.error });
        setLoading(false);
      }
    }
  };

  if (checking) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-foreground/50 font-mono">Đang kiểm tra...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs with animated indicator */}
      <div className="flex border-b-2 border-border relative">
        {/* Animated background indicator */}
        <span
          className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out ${
            mode === "login"
              ? "left-0 w-1/2 bg-primary shadow-[0_0_10px_rgba(0,255,159,0.8)]"
              : "left-1/2 w-1/2 bg-secondary shadow-[0_0_10px_rgba(0,212,255,0.8)]"
          }`}
        />

        <button
          type="button"
          onClick={() => {
            if (mode !== "login") {
              setSlideDirection("left");
              setIsAnimating(true);
              setMode("login");
              setState({});
              setTimeout(() => setIsAnimating(false), 300);
            }
          }}
          className={`flex-1 py-4 font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
            mode === "login"
              ? "text-primary"
              : "text-foreground/50 hover:text-foreground/70"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                mode === "login" ? "scale-110" : "scale-100"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Đăng Nhập
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (mode !== "register") {
              setSlideDirection("right");
              setIsAnimating(true);
              setMode("register");
              setState({});
              setTimeout(() => setIsAnimating(false), 300);
            }
          }}
          className={`flex-1 py-4 font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
            mode === "register"
              ? "text-secondary"
              : "text-foreground/50 hover:text-foreground/70"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                mode === "register" ? "scale-110" : "scale-100"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Đăng Ký
          </span>
        </button>
      </div>

      {/* Form with slide animation */}
      <div className="overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className={`bg-surface/50 backdrop-blur-lg border-2 border-border border-t-0 rounded-b-xl p-8 space-y-6 transition-all duration-300 ease-out ${
            isAnimating
              ? slideDirection === "right"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          {/* Title with animation */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-mono mb-2 transition-all duration-300">
              <span
                className={`transition-colors duration-300 ${
                  mode === "login" ? "text-primary" : "text-secondary"
                }`}
              >
                {">"}
              </span>
              <span className="text-foreground">
                {" "}
                {mode === "login" ? "Đăng Nhập" : "Tạo Tài Khoản"}
              </span>
            </h2>
            <p className="text-foreground/50 text-sm font-mono transition-all duration-300">
              {mode === "login"
                ? "Nhập thông tin để truy cập hệ thống"
                : "Đăng ký thành viên mới"}
            </p>
          </div>{" "}
          {/* Messages */}
          {state.success && (
            <div className="bg-primary/10 border border-primary/50 rounded-lg p-4 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-primary shrink-0 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-primary text-sm font-mono">
                Thành công! Đang chuyển hướng...
              </p>
            </div>
          )}
          {state.error && (
            <div className="bg-danger/10 border border-danger/50 rounded-lg p-4 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-danger shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-danger text-sm font-mono">{state.error}</p>
            </div>
          )}
          {/* Name Field (Register only) with slide animation */}
          <div
            className={`space-y-2 overflow-hidden transition-all duration-300 ease-out ${
              mode === "register"
                ? "max-h-24 opacity-100 transform translate-y-0"
                : "max-h-0 opacity-0 transform -translate-y-2"
            }`}
          >
            <label className="block text-sm font-mono text-accent uppercase tracking-wider">
              {">"} Tên Hiển Thị
            </label>
            <input
              name="name"
              type="text"
              required={mode === "register"}
              disabled={loading || mode !== "register"}
              placeholder="Tên của bạn"
              className="w-full bg-background/50 border-2 border-border focus:border-secondary rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 transition-all outline-none font-mono disabled:opacity-50"
            />
          </div>
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-accent uppercase tracking-wider">
              {">"} Email
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={loading}
              placeholder="email@example.com"
              className={`w-full bg-background/50 border-2 border-border focus:border-${
                mode === "login" ? "primary" : "secondary"
              } rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 transition-all outline-none font-mono disabled:opacity-50`}
            />
          </div>
          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-mono text-accent uppercase tracking-wider">
              {">"} Mật Khẩu
            </label>
            <input
              name="password"
              type="password"
              required
              disabled={loading}
              placeholder="••••••••"
              minLength={8}
              className={`w-full bg-background/50 border-2 border-border focus:border-${
                mode === "login" ? "primary" : "secondary"
              } rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 transition-all outline-none font-mono disabled:opacity-50`}
            />
          </div>
          {/* Confirm Password (Register only) with slide animation */}
          <div
            className={`space-y-2 overflow-hidden transition-all duration-300 ease-out ${
              mode === "register"
                ? "max-h-24 opacity-100 transform translate-y-0"
                : "max-h-0 opacity-0 transform -translate-y-2"
            }`}
          >
            <label className="block text-sm font-mono text-accent uppercase tracking-wider">
              {">"} Xác Nhận Mật Khẩu
            </label>
            <input
              name="confirmPassword"
              type="password"
              required={mode === "register"}
              disabled={loading || mode !== "register"}
              placeholder="Nhập lại mật khẩu"
              minLength={8}
              className="w-full bg-background/50 border-2 border-border focus:border-secondary rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 transition-all outline-none font-mono disabled:opacity-50"
            />
          </div>
          {/* Guest Login Button */}
          {mode === "login" && (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setState({});
                const result = await login("guest@gmail.com", "guest1234");
                if (result.success) {
                  setState({ success: true });
                  router.push("/");
                  router.refresh();
                } else {
                  setState({
                    error: result.error || "Không thể đăng nhập khách",
                  });
                  setLoading(false);
                }
              }}
              className="w-full py-3 rounded-lg font-mono font-medium tracking-wider text-foreground/70 bg-gray-500/20 border border-gray-500/50 hover:bg-gray-500/30 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>👤</span>
              Đăng Nhập Với Tài Khoản Khách
            </button>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-mono font-bold uppercase tracking-wider text-background transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === "login"
                ? "bg-linear-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(0,255,159,0.6)]"
                : "bg-linear-to-r from-secondary to-accent hover:shadow-[0_0_30px_rgba(0,212,255,0.6)]"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : mode === "login" ? (
                "Đăng Nhập"
              ) : (
                "Tạo Tài Khoản"
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
