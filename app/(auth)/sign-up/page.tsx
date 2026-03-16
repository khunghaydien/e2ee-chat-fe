"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { AuthForm } from "@/components/auth/AuthForm";
import { PrivateKeyModal } from "@/components/auth/PrivateKeyModal";
import { authService } from "@/services/auth.service";
import {
  exportPublicKeyForServer,
  exportPrivateKeyJwk,
  generateKeyPair,
  importPrivateKeyFromJwk,
} from "@/libs/e2ee/ecdh-keys";

export default function SignUp() {
  const router = useRouter();
  const t = useTranslations("authentication");

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
      const keyPair = await generateKeyPair();
      const publicKey = await exportPublicKeyForServer(keyPair.publicKey);
      const privateKeyJwk = await exportPrivateKeyJwk(keyPair.privateKey);
      setPendingSignUp({ publicKey, privateKeyJwk });
      setKeyModalOpen(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
          : undefined;
      setError(msg ?? t("signUpFailed"));
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
      setPendingSignUp(null);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
          : undefined;
      setError(msg ?? t("signUpFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyModalCancel = () => {
    setKeyModalOpen(false);
    setPendingSignUp(null);
    setLoading(false);
  };

  return (
    <>
      <AuthForm
        userName={userName}
        password={password}
        error={error}
        onUserNameChange={setUserName}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4 items-center justify-center">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            disabled={loading}
            className="w-full max-w-xs"
          >
            {t("signUpButton")}
          </Button>
          <Link
            href="/sign-in"
            className="w-full max-w-xs text-center !text-foreground"
          >
            <p>
              {t("haveAccountPrompt")}
              <span className="font-bold text-blue-500"> {t("signInButton")}</span>
            </p>
          </Link>
        </div>
      </AuthForm>
      <PrivateKeyModal
        open={keyModalOpen}
        privateKeyJwk={pendingSignUp?.privateKeyJwk ?? ""}
        onConfirm={handleKeyModalConfirm}
        onCancel={handleKeyModalCancel}
      />
    </>
  );
}