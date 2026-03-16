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
import { Input, Typography, AutoComplete, Spin } from "antd";
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
  const [creatingForUserId, setCreatingForUserId] = useState<string | null>(
    null,
  );
  const [titlesByConvId, setTitlesByConvId] = useState<Record<string, string>>(
    {},
  );
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useConversations();
  const {
    data: usersData,
    isFetchingNextPage: isFetchingUsersNext,
    hasNextPage: hasUsersNextPage,
    fetchNextPage: fetchUsersNextPage,
  } = useUsers(debouncedSearch);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleUserClick = async (userId: string, userName: string) => {
    // đang tạo cuộc chat cho user này rồi thì bỏ qua để tránh tạo trùng
    if (creatingForUserId === userId) return;

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
      setCreatingForUserId(userId);
      const conv = await conversationService.createConversation([userId]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversationId(conv.id);
      setSearch("");
      setDebouncedSearch("");
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingForUserId((current) =>
        current === userId ? null : current,
      );
    }
  };

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const allUsers: UserItem[] =
    usersData?.pages.flatMap((page) => page.items) ?? [];
  const users = allUsers.filter((u) => u.id !== user?.id);

  const handleConversationScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const remaining = scrollHeight - (scrollTop + clientHeight);
    if (hasNextPage && !isFetchingNextPage && remaining < 300) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (!user) return;
    const missing = conversations.filter(
      (c) => !c.title && !titlesByConvId[c.id],
    );
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(
          missing.map(async (c) => {
            try {
              const participants =
                await conversationService.getParticipants(c.id);
              const other = participants.find((p) => p.id !== user.id);
              return other ? [c.id, other.userName] : null;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        setTitlesByConvId((prev) => {
          const next = { ...prev };
          for (const e of entries) {
            if (e) {
              const [id, title] = e;
              if (!next[id]) next[id] = title;
            }
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversations, titlesByConvId, user]);

  return (
    <div
      className="w-full md:w-[280px] md:flex-shrink-0 bg-chat-sidebar border-r p-4 flex flex-col gap-3"
      style={{ borderColor: "var(--chat-sidebar-border)" }}
    >
      <div className="flex flex-col gap-3 w-full">
        <AutoComplete
          style={{ width: "100%" }}
          value={search}
          onChange={(value) => setSearch(value)}
          allowClear
          options={users.map((u) => ({
            value: u.userName,
            label: u.userName,
            userId: u.id,
          }))}
          placeholder={t("searchPlaceholder")}
          popupMatchSelectWidth
          onPopupScroll={(e) => {
            const target = e.target as HTMLElement;
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
          notFoundContent={
            isFetchingUsersNext || (!usersData && Boolean(debouncedSearch)) ? (
              <div className="px-3 py-2 flex justify-center">
                <Spin size="small" />
              </div>
            ) : (
              <Typography.Text type="secondary" className="text-xs">
                {t("noUserFound")}
              </Typography.Text>
            )
          }
          onSelect={(_, option: any) => {
            if (option.userId) {
              handleUserClick(option.userId, option.value);
            }
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            aria-label={t("searchAria")}
            size="large"
          />
        </AutoComplete>
      </div>

      <div
        className="flex-1 mt-2 overflow-auto"
        onScroll={handleConversationScroll}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <VirtualList
            data={conversations}
            height={400}
            itemHeight={72}
            itemKey="id"
          >
            {(conv) => (
              <div
                key={conv.id}
                className="p-0 py-[2px] cursor-pointer"
                onClick={() => setSelectedConversationId(conv.id)}
              >
              <ChatSidebarItem
                id={conv.id}
                title={
                  titlesByConvId[conv.id] ||
                  conv.title ||
                  `Chat ${conv.id.slice(0, 8)}`
                }
                  lastMessage=""
                  time={formatTime(conv.updatedAt)}
                  isActive={selectedConversationId === conv.id}
                  isEncrypted
                />
              </div>
            )}
          </VirtualList>
        )}
      </div>
    </div>
  );
}
