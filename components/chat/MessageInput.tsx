"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  SafetyOutlined,
  PlusCircleOutlined,
  SmileOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Input, Space, Typography } from "antd";
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
      setSendError(t("missingPrivateKeyError"));
      return;
    }
    if (!recipientPublicKey) {
      setSendError(t("missingRecipientPublicKeyError"));
      return;
    }
    setEncrypting(true);
    try {
      const encrypted = await encryptMessage(
        content,
        myPrivateKey,
        recipientPublicKey,
      );
      await conversationService.sendMessage(conversationId, encrypted);
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      setText("");
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : t("encryptFailed");
      setSendError(msg);
    } finally {
      setEncrypting(false);
    }
  };

  const canSend = !!myPrivateKey && !!recipientPublicKey && !encrypting;
  const sendDisabled = disabled || !text.trim() || !canSend;

  return (
    <div className="p-6">
      {sendError && (
        <Typography.Text type="danger" className="text-xs px-1 block">
          {sendError}
        </Typography.Text>
      )}
      <form onSubmit={handleSubmit}>
        <div className="relative h-12">
          <Input
            size="large"
            placeholder={t("typeMessagePlaceholder")}
            aria-label={t("messageInputAria")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            className="pr-12 h-12"
          />
          <Button
            type="primary"
            shape="circle"
            size="large"
            htmlType="submit"
            aria-label={t("sendMessage")}
            className="!absolute right-2 top-1/2 -translate-y-1/2 z-10"
            disabled={sendDisabled}
            loading={encrypting}
            icon={!encrypting ? <SendOutlined /> : undefined}
          />
        </div>
      </form>
    </div>
  );
}
