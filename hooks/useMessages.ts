"use client";

import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";
import { conversationService, type ListMessagesResult, type MessageItem } from "@/services/conversation.service";
import { joinConversation } from "@/services/socket.service";
import type { Socket } from "socket.io-client";

export function useMessages(conversationId: string | null, socket: Socket | null) {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      conversationService.listMessages(conversationId!, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: 50,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    if (!conversationId || !socket) return;
    joinConversation(socket, conversationId);
    const handler = (msg: MessageItem) => {
      if (msg.conversationId !== conversationId) return;
      queryClient.setQueryData<InfiniteData<ListMessagesResult>>(
        ["messages", conversationId],
        (prev) => {
          if (!prev) return prev;
          const pages = [...prev.pages];
          const lastPageIndex = pages.length - 1;
          const lastPage = pages[lastPageIndex];
          const exists = lastPage.items.some((m) => m.id === msg.id);
          if (exists) return prev;
          const updatedLastPage: ListMessagesResult = {
            ...lastPage,
            items: [...lastPage.items, msg],
          };
          pages[lastPageIndex] = updatedLastPage;
          return { ...prev, pages };
        },
      );
    };
    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [conversationId, socket, queryClient]);

  return query;
}
