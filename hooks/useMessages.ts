"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { conversationService } from "@/services/conversation.service";
import { joinConversation } from "@/services/socket.service";
import type { MessageItem } from "@/services/conversation.service";
import type { Socket } from "socket.io-client";

export function useMessages(conversationId: string | null, socket: Socket | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      conversationService.listMessages(conversationId!, { limit: 50 }),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    if (!conversationId || !socket) return;
    joinConversation(socket, conversationId);
    const handler = (msg: MessageItem) => {
      if (msg.conversationId !== conversationId) return;
      queryClient.setQueryData<{ items: MessageItem[]; nextCursor: string | null }>(
        ["messages", conversationId],
        (prev) => {
          if (!prev) return prev;
          const exists = prev.items.some((m) => m.id === msg.id);
          if (exists) return prev;
          return {
            ...prev,
            items: [...prev.items, msg],
          };
        }
      );
    };
    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [conversationId, socket, queryClient]);

  return query;
}
