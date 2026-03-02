"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  UserOutlined,
  LockOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { authService } from "@/services/auth.service";
import { useE2EE } from "@/contexts/E2EEContext";
import {
  exportPublicKeyForServer,
  exportPrivateKeyJwk,
  generateKeyPair,
  importPrivateKeyFromJwk,
} from "@/libs/e2ee/ecdh-keys";
import { CopyPrivateKeyModal } from "./CopyPrivateKeyModal";

type Mode = "signin" | "signup";

export function GatewayAuthIdentityForm() {
  const t = useTranslations("gatewayAuth");
  const router = useRouter();
  const { setPrivateKey } = useE2EE();
  const [mode, setMode] = useState<Mode>("signin");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState<{
    publicKey: string;
    privateKeyJwk: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await authService.signIn({ userName: userName.trim(), password });
        router.push("/");
        router.refresh();
      } else {
        const keyPair = await generateKeyPair();
        const publicKey = await exportPublicKeyForServer(keyPair.publicKey);
        const privateKeyJwk = await exportPrivateKeyJwk(keyPair.privateKey);
        setPendingSignUp({ publicKey, privateKeyJwk });
        setKeyModalOpen(true);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : (err as Error)?.message ?? "Auth failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyModalConfirm = async () => {
    if (!pendingSignUp) return;
    setLoading(true);
    setKeyModalOpen(false);
    try {
      await authService.signUp({
        userName: userName.trim(),
        password,
        publicKey: pendingSignUp.publicKey,
      });
      const key = await importPrivateKeyFromJwk(pendingSignUp.privateKeyJwk);
      setPrivateKey(key);
      setPendingSignUp(null);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "Sign up failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyModalCancel = () => {
    setKeyModalOpen(false);
    setPendingSignUp(null);
  };

  return (
    <div className="flex-1 p-8 sm:p-10 lg:p-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-10 h-16">
        <div className="p-3 bg-[var(--surface-muted)] rounded-xl text-[var(--text-muted)] border border-[var(--border)]">
          <UserOutlined className="text-2xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] leading-none">
            {t("step1Title")}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 font-semibold uppercase tracking-wider">
            {t("step1Subtitle")}
          </p>
        </div>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex gap-2 p-1 bg-[var(--surface-muted)] rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-primary text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            onClick={() => setMode("signin")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-primary text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            onClick={() => setMode("signup")}
          >
            Đăng ký
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[var(--text)] uppercase tracking-wide">
            Tên đăng nhập
          </label>
          <div className="relative group">
            <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors text-base" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border)] focus:ring-4 focus:ring-primary/10 focus:border-primary bg-[var(--surface-muted)]/50 transition-all placeholder:text-[var(--text-muted)] text-sm font-medium text-[var(--text)]"
              placeholder="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[var(--text)] uppercase tracking-wide">
            {t("password")}
          </label>
          <div className="relative group">
            <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors text-base" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border)] focus:ring-4 focus:ring-primary/10 focus:border-primary bg-[var(--surface-muted)]/50 transition-all placeholder:text-[var(--text-muted)] text-sm font-medium text-[var(--text)]"
              placeholder={t("passwordPlaceholder")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={1}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
        </div>
        {mode === "signup" && (
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <SafetyCertificateOutlined />
            Đăng ký sẽ tạo cặp khóa E2EE (ECDH). Public key gửi lên server. Bạn cần copy private key và lưu an toàn — ứng dụng không lưu key.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          <span>
            {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
          </span>
          <RightOutlined className="text-lg group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-2 uppercase tracking-widest"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            <SafetyCertificateOutlined className="text-base" />
            {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </form>

      <CopyPrivateKeyModal
        open={keyModalOpen}
        privateKeyJwk={pendingSignUp?.privateKeyJwk ?? ""}
        onConfirm={handleKeyModalConfirm}
        onCancel={handleKeyModalCancel}
      />
    </div>
  );
}
