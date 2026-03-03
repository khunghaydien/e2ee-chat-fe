"use client";

import {
  Dispatch,
  SetStateAction,
  UIEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { Layout, Input, Typography } from "antd";
import { ChatSidebarItem } from "./ChatSidebarItem";
import { useConversations } from "@/hooks/useConversations";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { conversationService } from "@/services/conversation.service";
import { useQueryClient } from "@tanstack/react-query";
import type { UserItem } from "@/services/users.service";
import VirtualList from "rc-virtual-list";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

interface SidebarProps {
  selectedConversationId: string | null;
  setSelectedConversationId: Dispatch<SetStateAction<string | null>>;
}

export function Sidebar({
  selectedConversationId,
  setSelectedConversationId,
}: SidebarProps) {
  const t = useTranslations("sidebar");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useConversations();
  const {
    data: usersData,
    isFetchingNextPage: isFetchingUsersNext,
    hasNextPage: hasUsersNextPage,
    fetchNextPage: fetchUsersNextPage,
  } = useUsers();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleUserClick = async (userId: string, userName: string) => {
    // nếu đã có cuộc chat với user này (title trùng username) thì mở lại
    const existing = conversations.find(
      (conv) =>
        typeof conv.title === "string" &&
        conv.title.toLowerCase() === userName.toLowerCase(),
    );
    if (existing) {
      setSelectedConversationId(existing.id);
      setSearch("");
      setDebouncedSearch("");
      return;
    }
    // nếu chưa có thì tạo cuộc chat mới 1-1
    try {
      const conv = await conversationService.createConversation([userId]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversationId(conv.id);
      setSearch("");
      setDebouncedSearch("");
    } catch (e) {
      console.error(e);
    }
  };

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const allUsers: UserItem[] =
    usersData?.pages.flatMap((page) => page.items) ?? [];
  const users = allUsers.filter((u) => u.id !== user?.id);

  const filteredUsers = useMemo<UserItem[]>(() => {
    if (!debouncedSearch) return [];
    const keyword = debouncedSearch.toLowerCase();
    // backend đã giới hạn số lượng (useUsers -> limit), nên chỉ cần filter
    return users.filter((u) => u.userName.toLowerCase().includes(keyword));
  }, [debouncedSearch, users]);

  const handleConversationScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const remaining = scrollHeight - (scrollTop + clientHeight);
    if (hasNextPage && !isFetchingNextPage && remaining < 300) {
      fetchNextPage();
    }
  };

  return (
    <Layout.Sider
      width={280}
      className="!bg-background p-4 flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 w-full relative">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {debouncedSearch && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-border-secondary bg-background shadow-lg max-h-72 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              <VirtualList<UserItem>
                data={filteredUsers}
                height={288} // ~ max-h-72
                itemHeight={40}
                itemKey="id"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const { scrollTop, scrollHeight, clientHeight } = target;
                  const remaining = scrollHeight - (scrollTop + clientHeight);
                  if (
                    hasUsersNextPage &&
                    !isFetchingUsersNext &&
                    remaining < 100
                  ) {
                    fetchUsersNextPage();
                  }
                }}
              >
                {(u) => (
                  <div
                    key={u.id}
                    className="cursor-pointer px-3 py-2 hover:bg-muted"
                    onClick={() => handleUserClick(u.id, u.userName)}
                  >
                    <Typography.Text>{u.userName}</Typography.Text>
                  </div>
                )}
              </VirtualList>
            ) : (
              <div className="px-3 py-2">
                <Typography.Text type="secondary" className="text-xs">
                  {t("noUserFound")}
                </Typography.Text>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="flex-1 mt-2 overflow-auto"
        onScroll={handleConversationScroll}
      >
        <VirtualList
          data={conversations}
          height={400}
          itemHeight={72}
          itemKey="id"
        >
          {(conv) => (
            <div
              key={conv.id}
              className="p-0 py-2 cursor-pointer"
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
          )}
        </VirtualList>
      </div>
    </Layout.Sider>
  );
}
