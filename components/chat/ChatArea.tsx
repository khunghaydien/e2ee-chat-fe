"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatContext } from "@/contexts/ChatContext";
import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useE2EE } from "@/contexts/E2EEContext";
import { useParticipants } from "@/hooks/useParticipants";
import { importPrivateKeyFromJwk } from "@/libs/e2ee/ecdh-keys";
import { KeyOutlined } from "@ant-design/icons";

export function ChatArea() {
  const t = useTranslations("chat");
  const { selectedConversationId } = useChatContext();
  const socket = useSocket();
  const { user } = useAuth();
  const { privateKey, setPrivateKey } = useE2EE();
  const { data: messagesData } = useMessages(selectedConversationId, socket);
  const { data: participants } = useParticipants(selectedConversationId ?? null);

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);

  const otherParticipant = participants?.find((p) => p.id !== user?.id);

  const title = otherParticipant?.userName ?? `Chat ${selectedConversationId?.slice(0, 8) ?? ""}`;

  const handlePastePrivateKey = async () => {
    const raw = privateKeyInput.trim();
    if (!raw) return;
    setKeyError(null);
    try {
      const key = await importPrivateKeyFromJwk(raw);
      setPrivateKey(key);
      setPrivateKeyInput("");
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : "Invalid private key (JWK)");
    }
  };

  if (!selectedConversationId) {
    return (
      <section className="flex-1 flex flex-col bg-[var(--chat-area-bg)] min-w-0 items-center justify-center text-slate-500">
        <p className="text-sm">Chọn một cuộc hội thoại hoặc tạo chat mới</p>
      </section>
    );
  }

  const messages = messagesData?.items ?? [];

  return (
    <section className="flex-1 flex flex-col bg-[var(--chat-area-bg)] min-w-0">
      <ChatHeader
        title={title}
        avatar={undefined}
        participantCount={2}
        isEncrypted={true}
      />
      <MessageList
        messages={messages}
        currentUserId={user?.id ?? null}
        privateKey={privateKey}
        otherParticipantPublicKey={otherParticipant?.publicKey ?? null}
      />
      {!privateKey && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-muted)]/50">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <KeyOutlined className="text-sm" />
              <span className="text-xs font-semibold">{t("enterPrivateKeyTitle")}</span>
            </div>
            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[72px] px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm font-mono placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder={t("enterPrivateKeyPlaceholder")}
                value={privateKeyInput}
                onChange={(e) => {
                  setPrivateKeyInput(e.target.value);
                  setKeyError(null);
                }}
                aria-label={t("enterPrivateKeyPlaceholder")}
              />
              <button
                type="button"
                onClick={handlePastePrivateKey}
                disabled={!privateKeyInput.trim()}
                className="self-end h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                {t("useThisKey")}
              </button>
            </div>
            {keyError && (
              <p className="text-xs text-red-500 dark:text-red-400">{keyError}</p>
            )}
          </div>
        </div>
      )}
      <MessageInput
        conversationId={selectedConversationId}
        socket={socket}
        disabled={!privateKey}
        recipientPublicKey={otherParticipant?.publicKey ?? null}
        myPrivateKey={privateKey}
      />
    </section>
  );
}
