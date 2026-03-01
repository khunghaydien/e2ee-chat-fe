"use client";

import {
  SafetyOutlined,
  PlusCircleOutlined,
  SmileOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

export function MessageInput() {
  const t = useTranslations("chat");
  return (
    <div className="p-4 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-2 px-2 text-slate-400">
          <SafetyOutlined className="text-sm" />
          <span className="text-[10px] font-medium uppercase tracking-widest">
            {t("messagesEncrypted")}
          </span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-transparent focus-within:border-primary/30 transition-all">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-primary transition-colors"
            aria-label={t("attach")}
          >
            <PlusCircleOutlined />
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none placeholder:text-slate-500 min-w-0"
            placeholder={t("typeMessagePlaceholder")}
            aria-label={t("messageInputAria")}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              aria-label={t("emoji")}
            >
              <SmileOutlined className="text-xl" />
            </button>
            <button
              type="button"
              className="h-10 w-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
              aria-label={t("sendMessage")}
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
