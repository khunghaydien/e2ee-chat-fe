"use client";

import {
  LockOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

interface ChatHeaderProps {
  title: string;
  avatar?: string;
  participantCount?: number;
  isEncrypted?: boolean;
}

export function ChatHeader({
  title,
  avatar,
  participantCount = 0,
  isEncrypted = true,
}: ChatHeaderProps) {
  const t = useTranslations("chat");
  return (
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div
          className="h-10 w-10 rounded-full bg-cover bg-center shrink-0"
          style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
          role="img"
          aria-label={t("chatHeaderAvatar")}
        />
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {isEncrypted && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                <LockOutlined className="text-[12px] text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  {t("e2eEncrypted")}
                </span>
              </div>
            )}
            {participantCount > 0 && (
              <span className="text-[10px] text-slate-400">
                {participantCount} {t("participants")}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-primary transition-colors"
          aria-label={t("call")}
        >
          <PhoneOutlined />
        </button>
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-primary transition-colors"
          aria-label={t("videoCall")}
        >
          <VideoCameraOutlined />
        </button>
        <div className="w-px h-6 bg-slate-200 dark:border-slate-800" />
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-primary transition-colors"
          aria-label={t("chatInfo")}
        >
          <InfoCircleOutlined />
        </button>
      </div>
    </div>
  );
}
