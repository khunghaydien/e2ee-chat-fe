"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  SafetyOutlined,
  PlusCircleOutlined,
  SmileOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { Socket } from "socket.io-client";
import { conversationService } from "@/services/conversation.service";
import { encryptMessage } from "@/libs/e2ee/message-cipher";

interface MessageInputProps {
  conversationId: string;
  socket: Socket | null;
  disabled?: boolean;
  recipientPublicKey: string | null;
  myPrivateKey: CryptoKey | null;
}

export function MessageInput({
  conversationId,
  socket,
  disabled,
  recipientPublicKey,
  myPrivateKey,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [encrypting, setEncrypting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    setSendError(null);
    if (!content) return;
    if (!myPrivateKey) {
      setSendError("Chưa có khóa mã hóa. Nhập seed phrase phía trên.");
      return;
    }
    if (!recipientPublicKey) {
      setSendError("Chưa có public key người nhận. Không thể mã hóa.");
      return;
    }
    setEncrypting(true);
    try {
      const encrypted = await encryptMessage(
        content,
        myPrivateKey,
        recipientPublicKey
      );
      await conversationService.sendMessage(conversationId, encrypted);
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      setText("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Mã hóa thất bại";
      setSendError(msg);
    } finally {
      setEncrypting(false);
    }
  };

  const canSend = !!myPrivateKey && !!recipientPublicKey && !encrypting;
  const sendDisabled = disabled || !text.trim() || !canSend;

  return (
    <div className="p-4 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-2 px-2 text-slate-400">
          <SafetyOutlined className="text-sm" />
          <span className="text-[10px] font-medium uppercase tracking-widest">
            {t("messagesEncrypted")}
          </span>
          {!recipientPublicKey && myPrivateKey && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              ({t("sendNeedRecipientKey")})
            </span>
          )}
        </div>
        {sendError && (
          <p className="text-xs text-red-500 dark:text-red-400 px-2">{sendError}</p>
        )}
        <form
          className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-transparent focus-within:border-primary/30 transition-all"
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-primary transition-colors"
            aria-label={t("attach")}
          >
            <PlusCircleOutlined />
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none placeholder:text-slate-500 min-w-0"
            placeholder={t("typeMessagePlaceholder")}
            aria-label={t("messageInputAria")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              aria-label={t("emoji")}
            >
              <SmileOutlined className="text-xl" />
            </button>
            <button
              type="submit"
              className="h-10 w-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
              aria-label={t("sendMessage")}
              disabled={sendDisabled}
            >
              {encrypting ? (
                <span className="text-xs font-medium">...</span>
              ) : (
                <SendOutlined />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
