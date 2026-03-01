"use client";

import { SearchOutlined, MessageOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ChatSidebarItem } from "./ChatSidebarItem";
import type { ChatSidebarItemProps } from "./ChatSidebarItem";

export function Sidebar() {
  const t = useTranslations("sidebar");
  const conversations: ChatSidebarItemProps[] = [
    {
      id: "1",
      title: t("conversation1Title"),
      lastMessage: t("conversation1LastMessage"),
      time: "14:20",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBBp6s_-vYL3rDCj2kXGejBls3TXWe-JUiyjJ2IzEbBnhF9095HYjhfQre4uR_lH4ipubSbbdMlb67DEaXiYUPb7EjRah8BREAzE43ZIplH8kzB9wRHgnJDHZq_2VRO3NN-5CNQVFe6nax5rwZu__L2TtZ85TQsVhO3GxxrxgPmhVlGBAHV1v7ryWDunQFhtalTlhrLu45LIUFCHbVFfzZYeYV8Mmpb9x5FPQ9MMiglkEsVOVnPsE8xE0oQVvrgXKBu6a_OFEhFxi4",
      isActive: true,
    },
    {
      id: "2",
      title: t("conversation2Title"),
      lastMessage: t("conversation2LastMessage"),
      time: "09:15",
      isGroup: true,
      isEncrypted: true,
    },
    {
      id: "3",
      title: t("conversation3Title"),
      lastMessage: t("conversation3LastMessage"),
      time: t("timeYesterday"),
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAnFJKtijPPF80gGZLu632bH_0Fl-jCu9akm7JzHS01ISdQk0444lEC234GWKfYWtWITvkRtlOu-z6Jdvji_E7Zpo24qMUArcZiB3KfO5RPopCZt2pZlz62kQFt5ON80zwuU-DZpxAcBFZxWr4j1KIFqUNmP46hQ0FGqGj6qALv-1WLwntoJmy-wR_ENHcMgmJOixqt5jOnECCJnjotORO2xh5lh1c9l0ZHbK2j8E-NZXnbX6JsTA4BhEYsOpYUnPYMmo3tgnxSegw",
    },
  ];

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-background-dark shrink-0">
      <div className="p-4 space-y-4">
        <div className="relative">
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none"
          />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
          />
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <MessageOutlined className="text-sm" />
          {t("newEncryptedChat")}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="px-2 pb-4">
          <div className="mb-2">
            <ChatSidebarItem {...conversations[0]} />
          </div>
          <div className="space-y-1">
            {conversations.slice(1).map((conv) => (
              <ChatSidebarItem key={conv.id} {...conv} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
