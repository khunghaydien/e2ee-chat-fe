"use client";

import { useTranslations } from "next-intl";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

const activeChat = {
  titleKey: "conversation1Title" as const,
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDNoMFUxqn3BrMzq49HkiLD5F3JInTEEj2_cyjg1uiVFY4HecJS80zIrk_GDky1QdzoWM28FtIM-eELeJT0p9MSiWGaHD_V5bs3y3Q7RJFiFE_xbBhZVLahzlP5JzVL3dNEeynLuXyQOyPEUAWnEKzha-VdzVWQgsxa5ry1nUo8B_Rl2oVRLIuRgLfePrHDRNKEeUdn1IocWqeSmat7Rbl3X-hdp8Y46zBzDBQiIeq_BRB4mMBvsmVn4CDFShhhCowIrCN23ahYzqA",
  participantCount: 4,
  isEncrypted: true,
};

export function ChatArea() {
  const tSidebar = useTranslations("sidebar");
  return (
    <section className="flex-1 flex flex-col bg-[var(--chat-area-bg)] min-w-0">
      <ChatHeader
        title={tSidebar(activeChat.titleKey)}
        avatar={activeChat.avatar}
        participantCount={activeChat.participantCount}
        isEncrypted={activeChat.isEncrypted}
      />
      <MessageList />
      <MessageInput />
    </section>
  );
}
