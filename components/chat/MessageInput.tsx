 "use client";

import { useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { SendOutlined } from "@ant-design/icons";
import { Input, theme, Typography } from "antd";
import { useTranslations } from "next-intl";
import type { Socket } from "socket.io-client";
import {
  conversationService,
  type ListMessagesResult,
  type MessageItem,
} from "@/services/conversation.service";
import { encryptMessage } from "@/libs/e2ee/message-cipher";
import { useAuth } from "@/hooks/useAuth";

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
  const [sendError, setSendError] = useState<string | null>(null);
  const { token } = theme.useToken();
  const { user } = useAuth();

  const appendOrUpdateOptimistic = (
    conversationId: string,
    updater: (lastPage: ListMessagesResult | null) => ListMessagesResult | null,
  ) => {
    queryClient.setQueryData<InfiniteData<ListMessagesResult>>(
      ["messages", conversationId],
      (prev) => {
        if (!prev) {
          const nextPage = updater({ items: [], nextCursor: null });
          if (!nextPage) return prev;
          return { pageParams: [null], pages: [nextPage] };
        }
        const pages = [...prev.pages];
        const lastIndex = pages.length - 1;
        const updatedLast = updater(pages[lastIndex]);
        if (!updatedLast) return prev;
        pages[lastIndex] = updatedLast;
        return { ...prev, pages };
      },
    );
  };
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

    const now = new Date().toISOString();
    const tempId = `optimistic-${Date.now()}`;

    if (user) {
      const optimistic: MessageItem & {
        optimisticStatus: "encrypting" | "sending" | "error";
        optimisticError?: string;
      } = {
        id: tempId,
        conversationId,
        senderId: user.id,
        content,
        createdAt: now,
        sender: {
          id: user.id,
          userName: user.userName,
          publicKey: "",
        },
        optimisticStatus: "encrypting",
      } as MessageItem & {
        optimisticStatus: "encrypting" | "sending" | "error";
        optimisticError?: string;
      };

      appendOrUpdateOptimistic(conversationId, (lastPage) => {
        if (!lastPage) return null;
        return {
          ...lastPage,
          items: [...lastPage.items, optimistic],
        };
      });
    }

    // Xóa input ngay khi bấm gửi, phần UI sẽ phản ánh trạng thái qua optimistic message
    setText("");

    try {
      const encrypted = await encryptMessage(
        content,
        myPrivateKey,
        recipientPublicKey,
      );
      if (user) {
        appendOrUpdateOptimistic(conversationId, (lastPage) => {
          if (!lastPage) return null;
          return {
            ...lastPage,
            items: lastPage.items.map((m) =>
              m.id === tempId
                ? {
                    ...(m as any),
                    optimisticStatus: "sending" as const,
                  }
                : m,
            ),
          };
        });
      }

      await conversationService.sendMessage(conversationId, encrypted);
      // Refetch để người gửi thấy tin thật (không còn mờ); backend có thể không emit new_message cho sender
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : t("encryptFailed");
      setSendError(msg);

      if (user) {
        appendOrUpdateOptimistic(conversationId, (lastPage) => {
          if (!lastPage) return null;
          return {
            ...lastPage,
            items: lastPage.items.map((m) =>
              m.id === tempId
                ? {
                    ...(m as any),
                    optimisticStatus: "error" as const,
                    optimisticError: msg,
                  }
                : m,
            ),
          };
        });
      }
    }
  };


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
          <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
            <SendOutlined
              style={{ color: token.colorPrimary }}
              className="cursor-pointer"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
