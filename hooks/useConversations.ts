"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.listConversations({ limit: 50 }),
    staleTime: 30 * 1000,
  });
}
