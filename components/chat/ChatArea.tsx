"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useParticipants } from "@/hooks/useParticipants";
import { importPrivateKeyFromJwk } from "@/libs/e2ee/ecdh-keys";
import { PrivateKeyStorage } from "@/libs/ultils/privateKeyStorage";

interface ChatAreaProps {
  selectedConversationId: string | null;
}

export function ChatArea({ selectedConversationId }: ChatAreaProps) {
  const t = useTranslations("chat");
  const socket = useSocket();
  const { user } = useAuth();
  const {
    data: messagesData,
    hasNextPage: hasMoreMessages,
    fetchNextPage: fetchMoreMessages,
    isFetchingNextPage,
  } = useMessages(selectedConversationId, socket, user?.id ?? null);
  const { data: participants } = useParticipants(selectedConversationId ?? null);

  const [keyError, setKeyError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [isLoadingPrivateKey, setIsLoadingPrivateKey] = useState(true);

  const otherParticipant = participants?.find((p) => p.id !== user?.id);

  const loadPrivateKey = useCallback(async () => {
    setIsLoadingPrivateKey(true);
    setKeyError(null);
    const jwk = PrivateKeyStorage.getPrivateKeyJwk();
    if (!jwk) {
      setPrivateKey(null);
      setIsLoadingPrivateKey(false);
      return;
    }
    try {
      const key = await importPrivateKeyFromJwk(jwk);
      setPrivateKey(key);
      setKeyError(null);
    } catch (e) {
      setPrivateKey(null);
      const fallback = t("invalidStoredPrivateKey");
      setKeyError(e instanceof Error && e.message ? e.message : fallback);
    } finally {
      setIsLoadingPrivateKey(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPrivateKey();
  }, [loadPrivateKey]);

  useEffect(() => {
    const handler = () => {
      void loadPrivateKey();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("private-key-updated", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("private-key-updated", handler);
      }
    };
  }, [loadPrivateKey]);

  if (!selectedConversationId) {
    return (
      <section className="flex-1 flex flex-col bg-background min-w-0 items-center justify-center text-foreground">
        <p className="text-sm">
          {t("selectConversationPlaceholder")}
        </p>
      </section>
    );
  }

  const messages = messagesData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-background">
      <MessageList
        messages={messages}
        currentUserId={user?.id ?? null}
        privateKey={privateKey}
        otherParticipantPublicKey={otherParticipant?.publicKey ?? null}
        hasMore={!!hasMoreMessages}
        loadMore={() => {
          if (hasMoreMessages && !isFetchingNextPage) {
            void fetchMoreMessages();
          }
        }}
      />
      {keyError && (
        <div className="px-4 py-2 text-xs text-red-500">
          {keyError}
        </div>
      )}
      <MessageInput
        conversationId={selectedConversationId}
        socket={socket}
        disabled={!privateKey || isLoadingPrivateKey}
        recipientPublicKey={otherParticipant?.publicKey ?? null}
        myPrivateKey={privateKey}
      />
    </section>
  );
}
