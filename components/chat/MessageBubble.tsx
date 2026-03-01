"use client";

import { CheckOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

interface MessageBubbleProps {
  content: string;
  sender: string;
  avatar?: string;
  isOwn?: boolean;
  time?: string;
  read?: boolean;
}

export function MessageBubble({
  content,
  sender,
  avatar,
  isOwn,
  time,
  read,
}: MessageBubbleProps) {
  const t = useTranslations("chat");
  return (
    <div
      className={`flex items-end gap-3 max-w-2xl ${isOwn ? "flex-row-reverse self-end" : ""}`}
    >
      <div
        className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 mb-1"
        style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
        role="img"
        aria-label={`${sender} avatar`}
      />
      <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : ""}`}>
        <span
          className={`text-[10px] font-semibold text-slate-400 ${isOwn ? "mr-2" : "ml-2"}`}
        >
          {sender}
        </span>
        <div className="relative group">
          <div
            className={`p-3 rounded-2xl text-sm shadow-sm ${
              isOwn
                ? "bg-primary text-white rounded-br-none shadow-lg shadow-primary/20 glow-primary"
                : "bg-white dark:bg-slate-800 rounded-bl-none border border-slate-200 dark:border-slate-700/50"
            }`}
          >
            {content}
          </div>
          <div
            className={`absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 ${
              isOwn ? "right-0" : "left-0"
            }`}
          >
            {t("encryptedTooltip")}
          </div>
        </div>
        {isOwn && time && (
          <div className="flex items-center gap-1 mr-1">
            <span className="text-[9px] text-slate-400">{time}</span>
            <CheckOutlined className="text-[14px] text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
