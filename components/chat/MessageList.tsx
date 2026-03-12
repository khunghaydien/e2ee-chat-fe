"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import VirtualList, { type ListRef } from "rc-virtual-list";
import { MessageBubble } from "./MessageBubble";
import { Tooltip } from "antd";
import type { MessageItem } from "@/services/conversation.service";
import {
  decryptMessage,
  isEncryptedContent,
} from "@/libs/e2ee/message-cipher";

interface MessageListProps {
  messages: MessageItem[];
  currentUserId: string | null;
  privateKey: CryptoKey | null;
  /** Public key của người còn lại trong room (recipient khi mình gửi). Chỉ dùng để giải mã tin MÌNH ĐÃ GỬI. */
  otherParticipantPublicKey: string | null;
  hasMore?: boolean;
  loadMore?: () => void;
}

/**
 * Quy tắc E2EE 1-1 (không được lấy nhầm public key):
 * - Tin ĐẾN (người khác gửi): giải mã bằng (myPrivate, publicKeyOf(sender)) = msg.sender.publicKey.
 * - Tin ĐI (mình gửi): đã mã hóa bằng (myPrivate, publicKeyOf(recipient)) → giải mã bằng (myPrivate, recipientPublic) = otherParticipantPublicKey.
 */
function getCounterpartyPublicKeyForDecrypt(
  msg: MessageItem,
  currentUserId: string | null,
  otherParticipantPublicKey: string | null
): string | null {
  const isOwn = msg.senderId === currentUserId;
  if (isOwn) {
    return otherParticipantPublicKey;
  }
  return msg.sender?.publicKey ?? null;
}

export function MessageList({
  messages,
  currentUserId,
  privateKey,
  otherParticipantPublicKey,
  hasMore,
  loadMore,
}: MessageListProps) {
  const t = useTranslations("chat");
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const listRef = useRef<ListRef | null>(null);

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const messageIds = sorted.map((m) => m.id).join(",");
  const lastId = sorted[sorted.length - 1]?.id;
  useEffect(() => {
    let cancelled = false;

    sorted.forEach(async (msg) => {
      if (!isEncryptedContent(msg.content) || !privateKey) {
        return;
      }

      const counterpartyPublicKey = getCounterpartyPublicKeyForDecrypt(
        msg,
        currentUserId,
        otherParticipantPublicKey,
      );

      if (!counterpartyPublicKey) {
        if (!cancelled) {
          const isOwn = msg.senderId === currentUserId;
          setDecryptedMap((prev) => ({
            ...prev,
            [msg.id]: isOwn
              ? t("missingRecipientKey")
              : t("missingSenderKey"),
          }));
        }
        return;
      }

      try {
        const plain = await decryptMessage(
          msg.content,
          privateKey,
          counterpartyPublicKey,
        );
        if (!cancelled) {
          setDecryptedMap((prev) => ({ ...prev, [msg.id]: plain }));
        }
      } catch {
        if (!cancelled) {
          setDecryptedMap((prev) => ({
            ...prev,
            [msg.id]: t("cannotDecrypt"),
          }));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [messageIds, privateKey, currentUserId, otherParticipantPublicKey, t]);

  // auto-scroll to bottom when last message changes (new message or initial load)
  useEffect(() => {
    if (!listRef.current) return;
    // Scroll to very bottom of virtual list (newest message)
    listRef.current.scrollTo(Number.MAX_SAFE_INTEGER);
  }, [lastId]);

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-background"
    >
      <VirtualList<MessageItem>
        ref={listRef}
        data={sorted}
        height={window.innerHeight - 160}
        itemHeight={72}
        itemKey="id"
        onScroll={(e) => {
          if (!hasMore || !loadMore) return;
          const el = e.currentTarget;
          if (el.scrollTop < 100) {
            loadMore();
          }
        }}
        className="px-6"
      >
        {(msg, index) => {
          const optimisticStatus = (msg as any)
            .optimisticStatus as "encrypting" | "sending" | "error" | undefined;

          const displayContent =
            decryptedMap[msg.id] ??
            (isEncryptedContent(msg.content)
              ? privateKey
                ? "..."
                : t("loginOnThisDevice")
              : msg.content);
          const prev = sorted[index - 1];
          const next = sorted[index + 1];
          const showSenderLabel = !prev || prev.senderId !== msg.senderId;
          const isLastInGroup =
            !next || next.senderId !== msg.senderId;
          const showAvatar =
            msg.senderId !== currentUserId && isLastInGroup;

          return (
            <div className="flex flex-col gap-1">
              <div
                className={
                  msg.senderId === currentUserId &&
                    optimisticStatus &&
                    optimisticStatus !== "error"
                    ? "opacity-60"
                    : ""
                }
              >
                <MessageBubble
                  key={msg.id}
                  content={displayContent}
                  sender={
                    msg.senderId !== currentUserId
                      ? msg.sender?.userName ?? "?"
                      : undefined
                  }
                  isOwn={msg.senderId === currentUserId}
                  showSenderName={showSenderLabel}
                  showAvatar={showAvatar}
                />
              </div>
              {msg.senderId === currentUserId &&
                optimisticStatus === "error" && (
                  <div className="text-xs text-foreground px-1">
                    <Tooltip
                      title={
                        ((msg as any).optimisticError as string) ??
                        t("encryptFailed")
                      }
                    >
                      <span className="text-xs text-red-500 cursor-help">!</span>
                    </Tooltip>
                  </div>
                )}
            </div>
          );
        }}
      </VirtualList>
    </div>
  );
}
