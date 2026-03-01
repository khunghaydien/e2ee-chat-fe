"use client";

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
      className={`p-3 rounded-xl cursor-pointer transition-colors group ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 min-w-[2.75rem]">
          {avatar ? (
            <div
              className="rounded-full h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${avatar}')` }}
              role="img"
              aria-label={`Avatar of ${title}`}
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              {isGroup ? <TeamOutlined /> : <UserOutlined />}
            </div>
          )}
          {isActive && (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 border-2 border-white dark:border-background-dark rounded-full"
              style={{ backgroundColor: "var(--success)" }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3
              className={`text-sm truncate transition-colors ${
                isActive
                  ? "font-bold text-slate-900 dark:text-white"
                  : "font-medium text-slate-900 dark:text-slate-200 group-hover:text-primary"
              }`}
            >
              {title}
            </h3>
            <span
              className={`text-[10px] shrink-0 ml-1 ${
                isActive ? "text-primary font-bold" : "text-slate-400"
              }`}
            >
              {time}
            </span>
          </div>
          {lastMessage && (
            <div className="flex items-center gap-1">
              {isEncrypted && (
                <LockOutlined className="text-[12px] text-slate-400 shrink-0" />
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lastMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
