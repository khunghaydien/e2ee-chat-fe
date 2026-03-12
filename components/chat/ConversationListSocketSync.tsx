"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";

/**
 * Lắng nghe socket event conversation_updated (khi có tin nhắn mới hoặc conversation mới)
 * và invalidate danh sách conversation để sidebar cập nhật.
 */
export function ConversationListSocketSync() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    socket.on("conversation_updated", handler);
    return () => {
      socket.off("conversation_updated", handler);
    };
  }, [socket, queryClient]);

  return null;
}
