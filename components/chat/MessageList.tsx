"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageBubble } from "./MessageBubble";
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
}: MessageListProps) {
  const t = useTranslations("chat");
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const messageIds = sorted.map((m) => m.id).join(",");
  useEffect(() => {
    let cancelled = false;

    sorted.forEach(async (msg) => {
      if (!isEncryptedContent(msg.content) || !privateKey) {
        return;
      }

      const counterpartyPublicKey = getCounterpartyPublicKeyForDecrypt(
        msg,
        currentUserId,
        otherParticipantPublicKey
      );

      if (!counterpartyPublicKey) {
        if (!cancelled) {
          const isOwn = msg.senderId === currentUserId;
          setDecryptedMap((prev) => ({
            ...prev,
            [msg.id]: isOwn
              ? "[Thiếu public key người nhận]"
              : "[Thiếu public key người gửi]",
          }));
        }
        return;
      }

      try {
        const plain = await decryptMessage(
          msg.content,
          privateKey,
          counterpartyPublicKey
        );
        if (!cancelled) {
          setDecryptedMap((prev) => ({ ...prev, [msg.id]: plain }));
        }
      } catch {
        if (!cancelled) {
          setDecryptedMap((prev) => ({ ...prev, [msg.id]: "[Không thể giải mã]" }));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [messageIds, privateKey, currentUserId, otherParticipantPublicKey]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
      <div className="flex justify-center">
        <div className="bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          {t("today")}
        </div>
      </div>
      {sorted.map((msg) => {
        const displayContent =
          decryptedMap[msg.id] ??
          (isEncryptedContent(msg.content)
            ? privateKey
              ? "..."
              : "[Đăng nhập trên thiết bị này để xem]"
            : msg.content);
        return (
          <MessageBubble
            key={msg.id}
            content={displayContent}
            sender={msg.sender?.userName ?? "?"}
            isOwn={msg.senderId === currentUserId}
            time={new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        );
      })}
    </div>
  );
}
