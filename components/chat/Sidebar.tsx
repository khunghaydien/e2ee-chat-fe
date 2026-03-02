"use client";

import { useState } from "react";
import { SearchOutlined, MessageOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ChatSidebarItem } from "./ChatSidebarItem";
import { useChatContext } from "@/contexts/ChatContext";
import { useConversations } from "@/hooks/useConversations";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { conversationService } from "@/services/conversation.service";
import { useQueryClient } from "@tanstack/react-query";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function Sidebar() {
  const t = useTranslations("sidebar");
  const { selectedConversationId, setSelectedConversationId } = useChatContext();
  const { data, isLoading } = useConversations();
  const { data: usersData } = useUsers();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleNewChat = async () => {
    if (!selectedUserId) return;
    try {
      const conv = await conversationService.createConversation([selectedUserId]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversationId(conv.id);
      setShowNewChat(false);
      setSelectedUserId("");
    } catch (e) {
      console.error(e);
    }
  };

  const conversations = data?.items ?? [];
  const allUsers = usersData?.items ?? [];
  const users = allUsers.filter((u) => u.id !== user?.id);

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark shrink-0">
      <div className="p-4 space-y-4">
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowNewChat(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <MessageOutlined className="text-sm" />
          {t("newEncryptedChat")}
        </button>
      </div>
      {showNewChat && (
        <div className="px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 mb-2">Chọn user để bắt đầu chat:</p>
          <select
            className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Chọn user --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.userName}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="flex-1 py-1.5 bg-primary text-white rounded-lg text-sm"
              onClick={handleNewChat}
              disabled={!selectedUserId}
            >
              Tạo
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 border border-slate-300 rounded-lg text-sm"
              onClick={() => { setShowNewChat(false); setSelectedUserId(""); }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="px-2 pb-4">
          {isLoading ? (
            <p className="p-3 text-sm text-slate-500">Đang tải...</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <ChatSidebarItem
                    id={conv.id}
                    title={conv.title || `Chat ${conv.id.slice(0, 8)}`}
                    lastMessage=""
                    time={formatTime(conv.updatedAt)}
                    isActive={selectedConversationId === conv.id}
                    isEncrypted
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
