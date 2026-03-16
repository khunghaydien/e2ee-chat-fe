"use client";

import { Avatar, Badge, Typography } from "antd";
import { LockOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";

export interface ChatSidebarItemProps {
  id: string;
  title: string;
  lastMessage?: string;
  time: string;
  avatar?: string | null;
  isGroup?: boolean;
  isActive?: boolean;
  isEncrypted?: boolean;
}

export function ChatSidebarItem({
  title,
  lastMessage,
  time,
  avatar,
  isGroup,
  isActive,
  isEncrypted,
}: ChatSidebarItemProps) {
  return (
    <div
      className={`w-full px-3 py-2 rounded-xl cursor-pointer transition-colors sidebar-item ${
        isActive ? "" : "bg-transparent"
      }`}
      style={{
        backgroundColor: isActive ? "var(--sidebar-item-active-bg)" : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <Badge dot={isActive} offset={[-4, 4]}>
          {avatar ? (
            <Avatar src={avatar} size={40} />
          ) : (
            <Avatar
              size={40}
              icon={isGroup ? <TeamOutlined /> : <UserOutlined />}
              style={{
                backgroundColor: "var(--avatar-bg)",
                color: "var(--avatar-text)",
              }}
            />
          )}
        </Badge>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <Typography.Text
              className={`block text-sm truncate text-foreground ${
                isActive ? "font-semibold" : ""
              }`}
            >
              {title}
            </Typography.Text>
            {lastMessage && (
              <div className="flex items-center gap-1">
                {isEncrypted && (
                  <LockOutlined className="text-xs text-foreground" />
                )}
                <Typography.Text
                  type="secondary"
                  className="text-xs truncate"
                >
                  {lastMessage}
                </Typography.Text>
              </div>
            )}
          </div>
          <Typography.Text
            className={`text-xs shrink-0 ${
              isActive ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            {time}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
