 "use client";

import { useState } from "react";
import { Header } from "@/components/chat/Header";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );

  return (
    <AuthGuard>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex flex-1 overflow-hidden min-h-0">
          <Sidebar
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
          />
          <ChatArea selectedConversationId={selectedConversationId} />
        </main>
      </div>
    </AuthGuard>
  );
}
